import { Element } from 'domhandler';
import { DiscoveredFeed, PostListPagination } from '../types';
import { parseFeedsFromLinks } from './parseFeedsFromLinks';

/**
 * Parses <link> elements and tries to find pagination info
 *
 * @param links The link elements
 */
export function parseAtomPagination(links: Element[]): PostListPagination {
  return {
    next: findFeedLink(links, 'next'),
    previous: findFeedLink(links, 'previous'),
    first: findFeedLink(links, 'first'),
    last: findFeedLink(links, 'last'),
  };
}

/**
 * Finds a discovered feed by a list of links and a specific rel
 *
 * @param links The link elements
 * @param rel The rel
 */
function findFeedLink(links: Element[], rel: 'first' | 'last' | 'previous' | 'next'): DiscoveredFeed | undefined {
  const validFeeds = parseFeedsFromLinks(links.filter(link => link.attribs.rel === rel));

  if (validFeeds.length === 0)
    return undefined;

  return validFeeds[0];
}
