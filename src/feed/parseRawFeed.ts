import { DomUtils, parseDocument } from 'htmlparser2';

import { PostList } from '../types';
import { parseAtomFeed } from './parseAtomFeed';
import { parseRssFeed } from './parseRssFeed';
import { parseJsonFeed } from './parseJsonFeed';
import { JsonFeed } from './types';
import { RssInJsonFeed } from './rss-in-json.types';
import { parseRssInJsonFeed } from './parseRssInJsonFeed';
import { extractFromJsonp } from '../utils';

const rootTags = ['rss', 'feed', 'rdf:RDF'];

/**
 * Parses a raw XML feed
 *
 * @param rawFeed The raw feed data
 * @param type The feed mime type
 */
export function parseRawFeed(rawFeed: string, type?: string): PostList {
  const mightBeJson = type?.includes('json') ||
    (rawFeed.startsWith('{') && rawFeed.endsWith('}'));

  const mightBeXml = type?.includes('xml') ||
    (rawFeed.includes('<?xml') || rawFeed.includes('xmlns'));

  if (mightBeJson)
    return parseRawJsonFeed(rawFeed);

  if (mightBeXml)
    return parseRawXmlFeed(rawFeed);

  throw new Error('Unknown feed type');
}

/**
 * Parses a JSON feed
 *
 * @param rawFeed The raw feed text
 */
function parseRawJsonFeed(rawFeed: string): PostList {
  rawFeed = extractFromJsonp(rawFeed);

  const feed = JSON.parse(rawFeed) as JsonFeed | RssInJsonFeed;

  if ('version' in feed && feed.version.includes('jsonfeed.org'))
    return parseJsonFeed(feed);

  if ('rss' in feed)
    return parseRssInJsonFeed(feed);

  throw new Error("Couldn't identify the type of the feed");
}

/**
 * Parses a XML feed
 *
 * @param rawFeed The raw feed text
 */
function parseRawXmlFeed(rawFeed: string): PostList {
  const document = parseDocument(rawFeed, { xmlMode: true });
  const root = DomUtils.findOne((e) => rootTags.includes(e.name.toLowerCase()), document.children);

  if (!root)
    throw new Error("The root feed element was not found");

  if (root.name.toLowerCase() === 'feed') {
    return parseAtomFeed(root);
  } else {
    return parseRssFeed(root);
  }
}
