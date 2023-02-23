import { Element } from 'domhandler';
import { DiscoveredFeed, DiscoveredSource, DiscoveredWordpressApi } from '../types';

const wpApiRel = 'https://api.w.org/';
const validTypes = ['application/feed+json', 'application/atom+xml', 'application/rss+xml'];
const basicTypes = ['application/json', 'application/xml', 'text/json', 'text/xml'];

/**
 * Parses <link> elements into discovered feeds
 *
 * @param links The link elements
 * @param baseUrl The base URL, if any
 */
export function parseFeedsFromLinks(links: Element[], baseUrl?: URL): DiscoveredSource[] {
  const discoveredWpApi: DiscoveredWordpressApi[] = [];
  const discoveredFeed: DiscoveredFeed[] = [];

  for (let link of links) {
    const href = link.attribs?.href;

    if (!href)
      continue;

    const type = link.attribs.type?.toLowerCase();
    const rel = link.attribs.rel?.toLowerCase();
    const url = new URL(href, baseUrl).href; // Resolves relative URLs

    if (rel === wpApiRel) {
      discoveredWpApi.push({
        source: 'wordpress-rest-api',
        url,
      });

      continue;
    }

    if (isValidLink(type, rel)) {
      const title = link.attribs.title;

      discoveredFeed.push({
        source: 'feed',
        url,
        type,
        title,
      });
    }
  }

  // Sorts by the type
  return [
    ...discoveredWpApi,
    ...discoveredFeed.sort((a, b) => validTypes.indexOf(a.type) - validTypes.indexOf(b.type)),
  ];
}

/**
 * Whether the link type and rel represent a valid RSS, Atom or JSON Feed files
 *
 * @param type The type attribute
 * @param rel The rel attribute
 */
function isValidLink(type: string | undefined, rel: string | undefined) {
  // whether it has a explicit feed mime type
  if (type && validTypes.includes(type))
    return true;

  // whether it has a explicit feed rel and a basic feed type
  if (rel && rel.includes('feed') && (!type || basicTypes.includes(type)))
    return true;

  return false;
}
