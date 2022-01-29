import { parseDocument, DomUtils } from 'htmlparser2';
import { Document } from 'domhandler';
import { DiscoveredFeed } from '../types';
import { getElementByTagName } from '../utils';
import { parseFeedsFromLinks } from './parseFeedsFromLinks';

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

  const base = getElementByTagName('base', html.children, true);
  const baseUrl = new URL(base?.attribs.href ?? url, url);

  return parseFeedsFromLinks(links, baseUrl);
}
