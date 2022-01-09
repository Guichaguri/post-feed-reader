import { PostItem, PostList, PostMedia, PostPerson } from '../types';
import { JsonFeed, JsonFeedAuthor, JsonFeedItem } from './types';

/**
 * Parses a JSON Feed
 *
 * See https://www.jsonfeed.org/version/1.1/
 *
 * @param feed The feed object
 */
export function parseJsonFeed(feed: JsonFeed): PostList {
  const authors = parseJsonFeedAuthors(feed.authors, feed.author);

  return {
    container: {
      type: 'json-feed',
      version: feed.version,
      metadata: {
        nextUrl: feed.next_url,
      },
    },
    title: feed.title,
    description: {
      text: feed.description,
    },
    url: feed.home_page_url,
    language: feed.language,
    image: parseJsonFeedImages(feed),
    posts: parseJsonFeedItems(feed.items, authors),
  }
}

/**
 * Parses the feed images
 *
 * @param feed The feed object
 */
function parseJsonFeedImages(feed: JsonFeed): PostMedia[] {
  let images: PostMedia[] = [];

  if (feed.icon)
    images.push({ url: feed.icon, id: 'icon' });

  if (feed.favicon && feed.favicon !== feed.icon)
    images.push({ url: feed.favicon, id: 'favicon' });

  return images;
}

/**
 * Parses the authors list
 *
 * @param authors The JSON Feed 1.1 author list
 * @param author The JSON Feed 1.0 author object
 */
function parseJsonFeedAuthors(authors: JsonFeedAuthor[] | undefined, author?: JsonFeedAuthor): PostPerson[] | undefined {
  if (!authors && author) {
    authors = [author];
  }

  if (!authors)
    return undefined;

  return authors.map(author => ({
    name: author.name,
    uri: author.url,
    images: author.avatar ? [{ url: author.avatar }] : undefined,
  }));
}

/**
 * Parses the post items
 *
 * @param items The list of items
 * @param topLevelAuthors The top-level author list
 */
function parseJsonFeedItems(items: JsonFeedItem[], topLevelAuthors?: PostPerson[]): PostItem[] {
  return items.map(item => {
    return {
      guid: item.id,
      title: item.title,
      link: item.url,
      content: {
        html: item.content_html,
        text: item.content_text,
      },
      summary: {
        text: item.summary,
      },
      source: item.external_url ? { url: item.external_url } : undefined,
      authors: parseJsonFeedAuthors(item.authors, item.author) || topLevelAuthors,
      media: parseJsonFeedMedia(item),
      publishedAt: item.date_published ? new Date(item.date_published) : undefined,
      updatedAt: item.date_modified ? new Date(item.date_modified) : undefined,
      categories: item.tags ? item.tags.map(tag => ({ name: tag })) : undefined,
    };
  });
}

/**
 * Parses the media items
 *
 * @param item The feed item
 */
function parseJsonFeedMedia(item: JsonFeedItem): PostMedia[] {
  let media: PostMedia[] = [];

  if (item.image)
    media.push({ url: item.image, id: 'image' });

  if (item.banner_image && item.banner_image !== item.image)
    media.push({ url: item.banner_image, id: 'banner_image' });

  if (item.attachments) {
    media = [
      ...media,
      ...item.attachments.map(attachment => ({
        url: attachment.url,
        type: attachment.mime_type,
        title: attachment.title,
        length: attachment.size_in_bytes,
      })),
    ];
  }

  return media;
}
