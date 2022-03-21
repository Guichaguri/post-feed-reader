import { Axios } from 'axios';
import { WordpressOptions } from '../getPostList';
import { PostList } from '../types';
import { WordpressWpApi } from './types';
import { parseWordpressBlogInfo } from './parseWordpressBlogInfo';

/**
 * Fetches the Wordpress blog information from the Wordpress REST API
 *
 * See https://developer.wordpress.org/rest-api/reference/
 *
 * @param axios The Axios instance
 * @param wpApiBase The base Wordpress REST API URL
 * @param options The options
 */
export async function fetchWordpressBlogInfo(axios: Axios, wpApiBase: string, options: WordpressOptions = {}): Promise<Partial<PostList>> {
  let params: Record<string, any> = {};

  if (options.includeEmbedded ?? true)
    params['_embed'] = true;

  const url = '/?' + new URLSearchParams(params).toString();

  const { data } = await axios.get<WordpressWpApi>(url, {
    baseURL: wpApiBase,
    responseType: 'json',
    headers: {
      Accept: 'application/json',
    },
  });

  return parseWordpressBlogInfo(data);
}
