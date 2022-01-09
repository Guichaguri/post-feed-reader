import { parseDocument, DomUtils } from 'htmlparser2';
import { Document } from 'domhandler';
import { DiscoveredFeed } from '../types';
import { getElementByTagName } from '../utils';

const validTypes = ['application/feed+json', 'application/atom+xml', 'application/rss+xml'];
const basicTypes = ['application/json', 'application/xml', 'text/json', 'text/xml'];

export function discoverFeedsFromRawHtml(url: string, html: string): DiscoveredFeed[] {
  return discoverFeedsFromHtml(url, parseDocument(html));
}

/**
 * Discovers feed documents using the link auto-discovery process
 * https://www.rssboard.org/rss-autodiscovery
 * https://www.jsonfeed.org/version/1.1/#discovery
 *
 * @param url The page URL
 * @param html The HTML DOM
 */
export function discoverFeedsFromHtml(url: string, html: Document): DiscoveredFeed[] {
  const links = DomUtils.getElementsByTagName('link', html, true, 100);
  const discovered: DiscoveredFeed[] = [];

  const base = getElementByTagName('base', html.children, true);
  const baseUrl = new URL(base?.attribs.href ?? url, url);

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
