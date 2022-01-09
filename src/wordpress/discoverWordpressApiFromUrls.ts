import { Axios } from 'axios';
import { DiscoveredWordpressApi } from '../types';

const defaultApiPaths = [
  './wp-json',
  '?rest_route=/'
];

/**
 * Discovers Wordpress API URLs by requesting and checking its response
 *
 * @param axios The axios instance
 * @param baseUrl The base URL
 * @param paths The paths to test
 */
export async function discoverWordpressApiFromUrls(axios: Axios, baseUrl: string, paths?: string[]): Promise<DiscoveredWordpressApi[]> {
  const pathsToCheck = paths ?? defaultApiPaths;

  const apis = await Promise.all(pathsToCheck.map(path =>
    discoverWordpressApiUrl(axios, new URL(path, baseUrl).href).catch(() => undefined)
  ));

  return apis.filter(api => api && api.url) as DiscoveredWordpressApi[];
}

/**
 * Test a URL by trying to request and check the response
 *
 * @param axios The axios instance
 * @param url The URL to test
 */
async function discoverWordpressApiUrl(axios: Axios, url: string): Promise<DiscoveredWordpressApi | undefined> {
  const { data, status, request } = await axios.get<any>(url, {
    responseType: 'json',
    headers: {
      Accept: 'application/json',
    },
    validateStatus: undefined,
  });

  if (status >= 400)
    return undefined;

  if (!data || typeof data !== 'object' || !data.name)
    return undefined;

  return {
    source: 'wordpress-rest-api',
    url: request.responseURL || url,
  };
}
