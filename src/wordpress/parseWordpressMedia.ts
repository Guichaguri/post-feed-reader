import { WordpressMedia } from './types';
import { PostMedia } from '../types';
import { convertHtmlToText } from '../utils';

/**
 * Parses the featured media
 *
 * See https://developer.wordpress.org/rest-api/reference/media/
 *
 * @param items The media object array
 */
export function parseWordpressMedia(items: WordpressMedia[] | undefined): PostMedia[] | undefined {
  if (!items)
    return undefined;

  const media: PostMedia[] = [];

  for (const item of items) {
    const sizes = item.media_details?.sizes;
    const title = convertHtmlToText(item.title?.rendered);

    if (!sizes) {
      media.push({
        id: item.id,
        url: item.source_url,
        type: item.mime_type,
        height: item.media_details?.height,
        width: item.media_details?.width,
        title,
      });

      continue;
    }

    media.push(...Object.keys(sizes).map(name => {
      const size = sizes[name];

      return {
        id: item.id,
        url: size.source_url,
        type: size.mime_type,
        height: size.height,
        width: size.width,
        title,
      };
    }));
  }

  return media;
}
