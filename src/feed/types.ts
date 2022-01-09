/**
 * Represents a JSON Feed object
 */
export interface JsonFeed {
  version: string;
  title: string;
  home_page_url?: string;
  feed_url?: string;
  description?: string;
  next_url?: string;
  icon?: string;
  favicon?: string;
  author?: JsonFeedAuthor; // Deprecated, JSON Feed 1.0 compatibility
  authors?: JsonFeedAuthor[];
  language?: string;
  expired?: boolean;
  hubs?: any;
  items: JsonFeedItem[];
}

export interface JsonFeedAuthor {
  name?: string;
  url?: string;
  avatar?: string;
}

export interface JsonFeedItem {
  id: string;
  url?: string;
  external_url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  summary?: string;
  image?: string;
  banner_image?: string;
  date_published?: string;
  date_modified?: string;
  author?: JsonFeedAuthor; // Deprecated, JSON Feed 1.0 compatibility
  authors?: JsonFeedAuthor[];
  tags?: string[];
  language?: string[];
  attachments?: JsonFeedAttachment[];
}

export interface JsonFeedAttachment {
  url: string;
  mime_type: string;
  title?: string;
  size_in_bytes?: number;
  duration_in_seconds?: number;
}
