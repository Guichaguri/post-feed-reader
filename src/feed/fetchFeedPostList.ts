import { Axios } from 'axios';
import { PostList } from '../types';
import { parseRawFeed } from './parseRawFeed';

const mimeTypes = [
  'application/xml',
  'application/rss+xml',
  'application/atom+xml',
  'application/feed+json',
  'application/json',
];

/**
 * Fetches and parses a RSS, Atom or JSON Feed.
 *
 * @param axios The axios instance
 * @param feedUrl The URL
 * @param type The type
 */
export async function fetchFeedPostList(axios: Axios, feedUrl: string, type?: string): Promise<PostList> {
  const { data, headers } = await axios.get<string>(feedUrl, {
    responseType: 'text',
    transformResponse: data => data, // Workaround for https://github.com/axios/axios/issues/907
    headers: {
      Accept: mimeTypes.join(', '),
    },
  });

  if (!data)
    throw new Error('No data received.');

  return parseRawFeed(data, type || headers['content-type']);
}
