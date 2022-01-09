import { Element } from 'domhandler';
import { PostItem, PostTerm, PostList, PostMedia, PostPerson, PostSource } from '../types';
import { DomUtils } from 'htmlparser2';
import { getDateByTagName, getElementByTagName, getNumberByTagName, getTextByTagName } from '../utils';

/**
 * Parses a RSS feed
 *
 * Supported versions: RSS 0.91, 1.0, 2.0 and 2.0.1
 * See https://www.xml.com/pub/a/2002/12/18/dive-into-xml.html
 * See https://www.rssboard.org/rss-specification
 * See https://web.resource.org/rss/1.0/spec
 * See https://www.rssboard.org/rss-0-9-1
 *
 * @param rss The root RSS element
 */
export function parseRssFeed(rss: Element): PostList {
  const version = rss.name === 'rdf:RDF' && !rss.attribs.version ? '1.0' : rss.attribs.version;

  const channel = getElementByTagName('channel', rss.children)?.children || [];

  const images = DomUtils.getElementsByTagName('image', channel, false);

  return {
    container: {
      type: 'rss-feed',
      version: version,
    },
    title: getTextByTagName('title', channel, false),
    url: getTextByTagName('link', channel, false),
    description: {
      html: getTextByTagName('description', channel, false),
    },
    copyright: getTextByTagName('copyright', channel, false) || getTextByTagName('dc:rights', channel, false),
    updatedAt: getDateByTagName('lastBuildDate', channel, false) || getDateByTagName('dc:date', channel, false),
    language: getTextByTagName('language', channel, false),
    image: parseRssImages(images),
    posts: parseRssPosts(rss),
  };
}

/**
 * Parses RSS post items
 *
 * @param rss The root RSS tag
 */
export function parseRssPosts(rss: Element): PostItem[] {
  const items = DomUtils.getElementsByTagName('item', rss.children);

  return items.map(item => {
    const children = item.children;

    const categories = DomUtils.getElementsByTagName('category', children);
    const enclosures = DomUtils.findAll(e => e.name === 'enclosure' || e.name === 'media:content', children);

    return {
      guid: getTextByTagName('guid', children),
      title: getTextByTagName('title', children),
      link: getTextByTagName('link', children),
      publishedAt: getDateByTagName('pubDate', children) || getDateByTagName('dc:date', children),
      authors: parseRssAuthors(getTextByTagName('author', children), getTextByTagName('dc:creator', children)),
      categories: parseRssCategories(categories),
      media: parseRssMedia(enclosures),
      source: parseRssSource(getElementByTagName('source', children)),
      content: {
        html: getTextByTagName('description', children),
      },
    };
  });
}

/**
 * Parses <image> elements
 *
 * @param images The elements
 */
function parseRssImages(images: Element[]): PostMedia[] {
  const postImages: PostMedia[] = images.map(image => {
    const resource = DomUtils.getAttributeValue(image, 'rdf:resource');

    if (resource) {
      return { url: resource };
    }

    return {
      url: getTextByTagName('url', image),
      title: getTextByTagName('title', image),
      /*link: getTextByTagName('link', image),*/
      width: getNumberByTagName('width', image),
      height: getNumberByTagName('height', image),
    };
  });

  return postImages.filter(image => !!image.url);
}

/**
 * Parses <category> elements
 *
 * @param categories The elements
 */
function parseRssCategories(categories: Element[]): PostTerm[] {
  return categories.map(cat => ({ name: DomUtils.textContent(cat) }));
}

/**
 * Parses <enclosure> or <media:content> elements
 *
 * @param enclosures The elements
 */
function parseRssMedia(enclosures: Element[]): PostMedia[] {
  const postMedia: PostMedia[] = enclosures.map(media => {
    const length = media.attribs.fileSize || media.attribs.length;

    return {
      url: media.attribs.url,
      length: length ? +length : undefined,
      type: media.attribs.type,
    };
  });

  return postMedia.filter(media => !!media.url);
}

/**
 * Parses <source> element
 *
 * @param source The element
 */
function parseRssSource(source: Element | null): PostSource | undefined {
  if (!source)
    return undefined;

  return {
    url: source.attribs.url,
    title: DomUtils.textContent(source),
  };
}

/**
 * Parses <author> or <dc:creator> element contents
 *
 * @param author The <author> contents
 * @param creator The <dc:creator> contents
 */
function parseRssAuthors(author: string, creator: string): PostPerson[] | undefined {
  const regex = /^(.+?)(?:\s?\((.+)\))?$/m;

  let name: string | undefined;
  let uri: string | undefined;
  let email: string | undefined;

  if (creator) {
    const match = regex.exec(creator);

    if (match) {
      name = match[1];
      uri = match[2];
    } else {
      name = creator;
    }
  }

  if (author) {
    const match = regex.exec(author);

    if (match) {
      name = match[2];
      email = match[1];
    } else {
      email = author;
    }
  }

  if (!email && uri && uri.startsWith('mailto:'))
    email = uri.substring('mailto:'.length);

  return [{ name, uri, email }];
}
