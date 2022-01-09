import { AxiosResponseHeaders } from 'axios';
import parseLinkHeader from 'parse-link-header';
import { DiscoveredWordpressApi } from '../types';

const wpApiRel = 'https://api.w.org/';

/**
 * Discovers the Wordpress API base URL
 *
 * See https://developer.wordpress.org/rest-api/using-the-rest-api/discovery/
 *
 * @param headers The response headers
 */
export function discoverWordpressApiFromHeader(headers: AxiosResponseHeaders): DiscoveredWordpressApi[] {
  const links = parseLinkHeader(headers['link']);

  if (!links)
    return [];

  const endpoint = links[wpApiRel];

  if (!endpoint)
    return [];

  return [{
    source: 'wordpress-rest-api',
    url: endpoint.url,
  }];
}
