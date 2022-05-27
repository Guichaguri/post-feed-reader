import { PostItem, PostList, PostMedia, PostSource, PostTerm } from '../types';
import {
  RssInJsonFeed,
  RssInJsonCategoryObject,
  RssInJsonEnclosure,
  RssInJsonImage,
  RssInJsonItem,
  RssInJsonSource,
} from './rss-in-json.types';
import { parseRssAuthors } from './parseRssAuthors';

/**
 * Parses an RSS in JSON feed into the post list object
 *
 * @param json The RSS in JSON feed
 */
export function parseRssInJsonFeed(json: RssInJsonFeed): PostList {
  const channel = json.rss.channel;

  return {
    container: {
      type: 'rss-in-json-feed',
      version: getTextValue(json.rss.version),
    },
    title: getTextValue(channel.title),
    url: getTextValue(channel.link),
    description: {
      html: getTextValue(channel.description),
    },
    copyright: getTextValue(channel.copyright),
    updatedAt: getDateValue(channel.lastBuildDate),
    language: getTextValue(channel.language),
    image: parseRssInJsonImages(channel.image),
    posts: parseRssInJsonPosts(channel.item),
    pagination: {},
  };
}

/**
 * Parses the list of posts from an RSS in JSON feed
 *
 * @param items The list of items
 */
function parseRssInJsonPosts(items: RssInJsonItem[] | undefined): PostItem[] {
  return getArrayValue(items).map(item => ({
    guid: getTextValue(item.guid),
    title: getTextValue(item.title),
    link: getTextValue(item.link),
    summary: {
      html: getTextValue(item.description),
    },
    publishedAt: getDateValue(item.pubDate),
    authors: parseRssAuthors(getTextValue(item.author)),
    categories: parseRssInJsonCategories(item.category),
    media: parseRssInJsonMedia(item.enclosure),
    source: parseRssInJsonSource(item.source),
  }));
}

/**
 * Parses the list of images from an RSS in JSON feed
 *
 * @param images The list of images
 */
function parseRssInJsonImages(images: RssInJsonImage[] | RssInJsonImage | undefined): PostMedia[] {
  const media = getArrayValue(images).map(image => ({
    url: image?.url,
    title: image?.title,
    width: image?.width,
    height: image?.height,
  }));

  return media.filter(media => !!media.url);
}

/**
 * Parses the list of categories from an RSS in JSON feed
 *
 * @param categories The list of categories
 */
function parseRssInJsonCategories(categories: Array<RssInJsonCategoryObject | string> | undefined): PostTerm[] | undefined {
  return getArrayValue(categories).map(cat => ({
    name: getTextValue(cat),
  }));
}

/**
 * Parses the list of enclosures from an RSS in JSON feed
 *
 * @param enclosures The list of enclosures
 */
function parseRssInJsonMedia(enclosures: RssInJsonEnclosure[] | RssInJsonEnclosure | undefined): PostMedia[] | undefined {
  return getArrayValue(enclosures).map(enclosure => ({
    url: enclosure.url,
    type: enclosure.type,
    length: enclosure.length,
  }));
}

/**
 * Parses the source from an RSS in JSON feed
 *
 * @param source The source object
 */
function parseRssInJsonSource(source: RssInJsonSource | undefined): PostSource | undefined {
  if (!source)
    return undefined;

  return {
    title: getTextValue(source),
    url: source.url,
  };
}

/**
 * Gets the inner text from an RSS in JSON property
 *
 * @param value The value of the property
 */
function getTextValue(value: string | { '#value': string } | undefined): string | undefined {
  if (typeof value === 'string')
    return value;

  if (typeof value === 'object' && value['#value'])
    return value['#value'].toString();

  return value?.toString();
}

/**
 * Gets a date from an RSS in JSON property
 *
 * @param value The value of the property
 */
function getDateValue(value: string | { '#value': string } | undefined): Date | undefined {
  const text = getTextValue(value);

  if (!text)
    return undefined;

  return new Date(text);
}

/**
 * Gets the array from an RSS in JSON property
 *
 * @param value The value of the property
 */
function getArrayValue<T>(value: T[] | T | undefined): T[] {
  if (!value)
    return [];

  if (!Array.isArray(value))
    return [value];

  return value;
}
