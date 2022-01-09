import { Axios } from 'axios';
import { PostList } from '../types';
import { WordpressPost } from './types';
import { parseWordpressPosts } from './parseWordpressPosts';
import { WordpressOptions } from '../getPostList';

/**
 * Fetches the Wordpress post list from the Wordpress REST API
 *
 * See https://developer.wordpress.org/rest-api/reference/
 *
 * @param axios The Axios instance
 * @param wpApiBase The base Wordpress REST API URL
 * @param options The options
 */
export async function fetchWordpressPostList(axios: Axios, wpApiBase: string, options: WordpressOptions = {}): Promise<PostList> {
  let params: Record<string, any> = {};

  if (options.includeEmbedded ?? true)
    params['_embed'] = true;

  if (options.limit)
    params['limit'] = options.limit;

  if (options.page)
    params['page'] = options.page;

  if (options.search)
    params['search'] = options.search;

  if (options.authors)
    params['author'] = options.authors;

  if (options.categories)
    params['categories'] = options.categories;

  if (options.tags)
    params['tags'] = options.tags;

  if (options.additionalParams)
    params = { ...params, ...options.additionalParams };

  const url = '/wp/v2/posts?' + new URLSearchParams(params).toString();

  const { data } = await axios.get<WordpressPost[]>(url, {
    baseURL: wpApiBase,
    responseType: 'json',
    headers: {
      Accept: 'application/json',
    },
  });

  return {
    container: {
      type: 'wordpress-rest-api',
      version: 'v2',
      metadata: {
        params: params,
      }
    },
    posts: parseWordpressPosts(data),
  };
}
