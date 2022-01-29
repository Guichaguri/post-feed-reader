import { Element } from 'domhandler';
import { DiscoveredFeed } from '../types';

const validTypes = ['application/feed+json', 'application/atom+xml', 'application/rss+xml'];
const basicTypes = ['application/json', 'application/xml', 'text/json', 'text/xml'];

/**
 * Parses <link> elements into discovered feeds
 *
 * @param links The link elements
 * @param baseUrl The base URL, if any
 */
export function parseFeedsFromLinks(links: Element[], baseUrl?: URL): DiscoveredFeed[] {
  const discovered: DiscoveredFeed[] = [];

  for (let link of links) {
    const url = link.attribs?.href;

    if (!url)
      continue;

    const type = link.attribs.type?.toLowerCase();
    const rel = link.attribs.rel?.toLowerCase();

    if (!isValidLink(type, rel))
      continue;

    const title = link.attribs.title;

    discovered.push({
      source: 'feed',
      url: new URL(url, baseUrl).href, // Resolves relative URLs
      type,
      title,
    });
  }

  // Sorts by the type
  return discovered.sort((a, b) => validTypes.indexOf(a.type) - validTypes.indexOf(b.type));
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
