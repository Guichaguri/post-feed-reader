import { DiscoveredSource } from './types';
import axios, { Axios } from 'axios';

import { discoverFeedsFromRawHtml } from './feed/discoverFeedsFromHtml';
import { discoverWordpressApiFromUrls } from './wordpress/discoverWordpressApiFromUrls';
import { discoverFeedsFromUrls } from './feed/discoverFeedsFromUrls';
import { discoverWordpressApiFromHeader } from './wordpress/discoverWordpressApiFromHeader';

export interface DiscoveryOptions {

  /**
   * The Axios instance for the HTTP requests
   */
  axios?: Axios;

  /**
   * Whether it will prioritize Atom and RSS feeds over the Wordpress REST API
   *
   * Defaults to false
   */
  preferFeeds?: boolean;

  /**
   * Whether the source can be used. By default, all sources can be used.
   *
   * @param source The found source
   */
  canUseSource?: (source: DiscoveredSource) => boolean;

  /**
   * Whether a few paths should be tested in case no metadata can be auto-discovered
   * in order to try to find a valid data source
   *
   * Defaults to false
   */
  tryToGuessPaths?: boolean;

  /**
   * The RSS and Atom feed paths that are going to be tested.
   *
   * Only used when `tryToGuessPaths` is set to true.
   *
   * Defaults to ['./feed', './atom', './rss', './feed.json', './feed.xml', '?feed=atom']
   */
  feedPaths?: string[];

  /**
   * The Wordpress API paths that are going to be tested.
   *
   * Only used when `tryToGuessPaths` is set to true.
   *
   * Defaults to ['./wp-json', '?rest_route=/']
   */
  wpApiPaths?: string[];

}

/**
 * Looks through a site metadata in order to find a data source such as a Feed RSS.
 *
 * It's recommended to call this function once, as blog data sources rarely change.
 *
 * @param url The site URL
 * @param options The discovery options
 * @throws Error When no post source is available
 */
export async function discoverPostSource(url: string, options: DiscoveryOptions = {}): Promise<DiscoveredSource> {
  const httpClient = options.axios ?? axios;
  const canUseSource = options.canUseSource ?? ((_: DiscoveredSource) => true);
  const preferFeeds = options.preferFeeds ?? false;
  const guessUrls = options.tryToGuessPaths ?? false;

  const { data, headers } = await httpClient.get<string>(url, { responseType: 'text' });

  const steps: (() => Promise<DiscoveredSource[]>)[] = [];

  // Adds to the list of steps the wordpress and feed auto-discovery
  pushItems(
    steps,
    preferFeeds,
    async () => discoverWordpressApiFromHeader(headers),
    async () => discoverFeedsFromRawHtml(url, data)
  );

  if (guessUrls) {
    // Adds to the list of steps the discovery of WP API and feed URLs by guessing
    pushItems(
      steps,
      preferFeeds,
      () => discoverWordpressApiFromUrls(httpClient, url, options.wpApiPaths),
      () => discoverFeedsFromUrls(httpClient, url, options.feedPaths)
    );
  }

  // Tries step by step, until it finds a usable source
  for (const step of steps) {
    const sources = await step();
    const source = sources.find(s => s && canUseSource(s));

    if (source)
      return source;
  }

  throw new Error('No post source available');
}

/**
 * Push multiple items into an array
 * @param array The array
 * @param reverse Whether the items will be pushed in the reverse order
 * @param items The items to push
 */
function pushItems<T>(array: T[], reverse: boolean, ...items: T[]) {
  if (reverse) {
    array.push(...items.reverse());
  } else {
    array.push(...items);
  }
}
