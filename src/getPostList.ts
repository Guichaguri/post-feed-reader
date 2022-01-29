import axios, { Axios } from 'axios';

import { DiscoveredSource, PostContent, PostList } from './types';
import { fetchWordpressPostList } from './wordpress/fetchWordpressPostList';
import { fetchFeedPostList } from './feed/fetchFeedPostList';
import { convertHtmlToText } from './utils';

export interface FetchOptions {

  /**
   * The Axios instance for the HTTP requests
   */
  axios?: Axios;

  /**
   * Whether the HTML contents should be converted to plain text
   */
  fillTextContents?: boolean;

  /**
   * Wordpress API specific options
   */
  wordpress?: WordpressOptions;

}

export interface WordpressOptions {

  /**
   * Whether it should included embedded entities, such as the author, taxonomy and featured media
   *
   * Defaults to true
   */
  includeEmbedded?: boolean;

  /**
   * The amount of posts to list
   *
   * Defaults to 10
   */
  limit?: number;

  /**
   * The page number
   *
   * @deprecated The `page` property in the {@link DiscoveredSource} for WordPress is the preferrable alternative
   */
  page?: number;

  /**
   * Filters by a search string
   */
  search?: string;

  /**
   * Returns only posts from the given author IDs
   */
  authors?: number[];

  /**
   * Returns only posts from the given category IDs
   */
  categories?: number[];

  /**
   * Returns only posts from the given tag IDs
   */
  tags?: number[];

  /**
   * Any other additional query string parameters
   *
   * See https://developer.wordpress.org/rest-api/reference/posts/#arguments
   */
  additionalParams?: Record<string, string>;

}

/**
 * Fetches the post list from a data source
 *
 * This function can be called as frequent as the list may need to be updated.
 * The data source object can be reused throughout multiple calls.
 *
 * @param source The data source
 * @param options The options
 * @throws Error When the source couldn't be fetched or parsed
 */
export async function getPostList(source: DiscoveredSource, options: FetchOptions = {}): Promise<PostList | undefined> {
  if (source.source === 'wordpress-rest-api')
    return getWordpressPostList(source.url, options);

  if (source.source === 'feed')
    return getFeedPostList(source.url, source.type, options);

  return undefined;
}

/**
 * Fetches the Wordpress post list from the Wordpress REST API base URL
 *
 * @param wpApiBaseUrl The Wordpress REST API Base URL
 * @param options The options
 * @param page The page number, starting in 1
 * @throws Error When the source couldn't be fetched or parsed
 */
export async function getWordpressPostList(wpApiBaseUrl: string, options: FetchOptions = {}, page?: number): Promise<PostList> {
  const httpClient = options.axios ?? axios;

  const list = await fetchWordpressPostList(httpClient, wpApiBaseUrl, page ?? options.wordpress?.page ?? 1, options.wordpress);

  return postProcessPostList(list, options);
}

/**
 * Fetches the post list from a RSS, Atom or JSON Feed
 *
 * @param feedUrl The feed URL
 * @param type The feed mime type
 * @param options The options
 * @throws Error When the source couldn't be fetched or parsed
 */
export async function getFeedPostList(feedUrl: string, type?: string, options: Omit<FetchOptions, 'wordpress'> = {}): Promise<PostList> {
  const httpClient = options.axios ?? axios;

  const list = await fetchFeedPostList(httpClient, feedUrl, type);

  return postProcessPostList(list, options);
}

/**
 * Post process a parsed post list
 * @param list The post list
 * @param options The options
 */
function postProcessPostList(list: PostList, options: FetchOptions): PostList {

  // Converts HTML contents into plain text contents
  if (options.fillTextContents) {
    convertContentToText(list.description);

    list.posts.forEach(post => {
      convertContentToText(post.content);
      convertContentToText(post.summary);
    });
  }

  return list;
}

/**
 * Converts HTML contents into plain text contents
 * @param content The content object
 */
function convertContentToText(content: PostContent | undefined): void {
  if (content && !content.text && content.html) {
    content.text = convertHtmlToText(content.html);
  }
}

