import { PostItem, PostTerm, PostMedia, PostPerson } from '../types';
import { WordpressPost } from './types';
import { parseWordpressDateTime } from './parseWordpressDateTime';
import { convertHtmlToText } from '../utils';

export function parseRawWordpressPosts(data: string): PostItem[] {
  const posts = JSON.parse(data) as WordpressPost[];

  return parseWordpressPosts(posts);
}

/**
 * Parses a Wordpress post array
 *
 * See https://developer.wordpress.org/rest-api/reference/posts/
 *
 * @param posts The post array
 */
export function parseWordpressPosts(posts: WordpressPost[]): PostItem[] {
  return posts.map(post => {
    return {
      guid: convertHtmlToText(post.guid.rendered),
      title: convertHtmlToText(post.title?.rendered),
      link: post.link,
      content: {
        html: post.content?.rendered,
      },
      summary: {
        html: post.excerpt?.rendered,
      },
      authors: parseWordpressAuthors(post),
      categories: parseWordpressTerms(post, post.categories, 'category'),
      tags: parseWordpressTerms(post, post.tags, 'post_tag'),
      media: parseWordpressMedia(post),
      publishedAt: parseWordpressDateTime(post.date_gmt || post.date),
    };
  });
}

/**
 * Parses Wordpress taxonomy
 *
 * See https://developer.wordpress.org/rest-api/reference/taxonomies/
 *
 * @param post The post object
 * @param ids The taxonomy IDs
 * @param taxonomy The taxonomy type
 */
function parseWordpressTerms(post: WordpressPost, ids: number[] | undefined, taxonomy: string): PostTerm[] {
  if (!ids)
    return [];

  const terms = post._embedded ? post._embedded['wp:term'] : undefined;

  const findTerm = (id: number) => {
    if (!terms)
      return undefined;

    for (const termList of terms) {
      const term = termList.find(term => term.id === id && term.taxonomy === taxonomy);
      if (term) return term;
    }

    return undefined;
  };

  return ids.map(id => {
    const term = findTerm(id);

    return {
      id,
      name: convertHtmlToText(term?.name),
      url: term?.link,
    };
  });
}

/**
 * Parses a Wordpress author
 *
 * See https://developer.wordpress.org/rest-api/reference/users/
 *
 * @param post The post object
 */
function parseWordpressAuthors(post: WordpressPost): PostPerson[] | undefined {
  const authors = post._embedded?.author?.map(author => ({
    id: author.id,
    name: author.name,
    uri: author.link,
    images: Object.keys(author.avatar_urls).map(size => ({
      url: author.avatar_urls[size],
      height: +size,
      width: +size,
    })),
  } as PostPerson));

  return authors ?? [{ id: post.author }];
}

/**
 * Parses the featured media
 *
 * See https://developer.wordpress.org/rest-api/reference/media/
 *
 * @param post The post object
 */
function parseWordpressMedia(post: WordpressPost): PostMedia[] | undefined {
  const items = post._embedded?.['wp:featuredmedia'];

  if (!items)
    return undefined;

  const media: PostMedia[] = [];

  for (const item of items) {
    const sizes = item.media_details?.sizes;
    const title = convertHtmlToText(item.title?.rendered);

    if (!sizes) {
      media.push({
        id: item.id,
        url: item.source_url,
        type: item.mime_type,
        height: item.media_details?.height,
        width: item.media_details?.width,
        title,
      });

      continue;
    }

    media.push(...Object.keys(sizes).map(name => {
      const size = sizes[name];

      return {
        id: item.id,
        url: size.source_url,
        type: size.mime_type,
        height: size.height,
        width: size.width,
        title,
      };
    }));
  }

  return media;
}
