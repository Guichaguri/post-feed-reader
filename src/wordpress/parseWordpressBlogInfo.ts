import { WordpressWpApi } from './types';
import { PostList } from '../types';
import { parseWordpressMedia } from './parseWordpressMedia';

export function parseWordpressBlogInfo(data: WordpressWpApi): Partial<PostList> {
  return {
    title: data.name,
    url: data.home || data.url,
    description: {
      text: data.description,
    },
    image: parseWordpressMedia(data._embedded?.['wp:featuredmedia']),
  };
}
