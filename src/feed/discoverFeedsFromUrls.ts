import { Axios } from 'axios';
import { parseRawFeed } from './parseRawFeed';
import { DiscoveredFeed } from '../types';

const defaultFeedPaths = [
  './feed',
  './atom',
  './rss',
  './feed.json',
  './feed.xml',
  '?feed=atom',
];

const mimeTypes = [
  'application/xml',
  'application/rss+xml',
  'application/atom+xml',
  'application/feed+json',
  'application/json',
];

/**
 * Discovers feeds by requesting specific paths and checking its responses
 *
 * @param axios The axios instance
 * @param baseUrl The base server URL
 * @param paths The path list to test upon
 */
export async function discoverFeedsFromUrls(axios: Axios, baseUrl: string, paths?: string[]): Promise<DiscoveredFeed[]> {
  const pathsToCheck = paths ?? defaultFeedPaths;

  const feeds = await Promise.all(pathsToCheck.map(path =>
    discoverFeedUrl(axios, new URL(path, baseUrl).href).catch(() => undefined)
  ));

  return feeds.filter(feed => feed && feed.url) as DiscoveredFeed[];
}

/**
 * Requests specific paths and checks its responses
 *
 * @param axios The axios instance
 * @param url The URL to test
 */
async function discoverFeedUrl(axios: Axios, url: string): Promise<DiscoveredFeed | undefined> {
  const { data, status, headers, request } = await axios.get<string>(url, {
    responseType: 'text',
    transformResponse: data => data, // Workaround for https://github.com/axios/axios/issues/907
    headers: {
      Accept: mimeTypes.join(', '),
    },
    validateStatus: null,
  });

  if (status >= 400 || !data)
    return undefined;

  const type = headers['content-type'];
  const list = parseRawFeed(data, type);

  if (!list)
    return undefined;

  return {
    source: 'feed',
    url: request.responseURL || url,
    type: type,
    title: list.title,
  };
}
