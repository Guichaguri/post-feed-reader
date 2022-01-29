/**
 * Represents a Wordpress REST API source
 */
export interface DiscoveredWordpressApi {
  source: 'wordpress-rest-api';
  url: string;
  page?: number;
}

/**
 * Represents a Atom or RSS feed source
 */
export interface DiscoveredFeed {
  source: 'feed';
  title?: string;
  url: string;
  type: string;
}

/**
 * Represents a post list source
 */
export type DiscoveredSource = DiscoveredWordpressApi | DiscoveredFeed;

export interface PostList {

  /**
   * The container metadata of the post list
   */
  container: {
    type: 'rss-feed' | 'atom-feed' | 'json-feed' | 'wordpress-rest-api';
    version?: string;
    metadata?: any;
  };

  /**
   * The feed title
   *
   * `title` from Atom 1.0, RSS 0.91, RSS 1.0 and RSS 2.0
   */
  title?: string;

  /**
   * The feed description
   *
   * `subtitle` from Atom 1.0
   * `description` from RSS 0.91, RSS 1.0 and RSS 2.0
   */
  description?: PostContent;

  /**
   * The site URL
   *
   * `link` from Atom 1.0, RSS 0.91, RSS 1.0 and RSS 2.0
   */
  url?: string;

  /**
   * The feed language code
   *
   * `xml:lang` attribute from Atom 1.0
   * `language` from RSS 0.91 and RSS 2.0
   */
  language?: string;

  /**
   * The copyright notice for the content
   *
   * `rights` from Atom 1.0
   * `copyright` from RSS 0.91 and RSS 2.0
   * `dc:rights` from RSS 1.0
   */
  copyright?: string;

  /**
   * The date that the list has been updated
   *
   * `updated` from Atom 1.0
   * `lastBuildDate` from RSS 2.0
   * `dc:date` from RSS 1.0
   */
  updatedAt?: Date;

  /**
   * The channel image
   *
   * `logo` and `icon` from Atom 1.0
   * `image` from RSS 0.91, RSS 1.0 and RSS 2.0
   */
  image?: PostMedia[];

  /**
   * The entries from the feed
   *
   * `entry` from Atom 1.0
   * `item` from RSS 0.91, RSS 1.0 and RSS 2.0
   */
  posts: PostItem[];

  /**
   * The post list pagination. Contains information to fetch the next page
   */
  pagination: PostListPagination;

}

export interface PostListPagination {

  /**
   * The next page post source
   *
   * `link` with `rel="next"` from Atom and RSS 2.0
   * `next_url` from JSON Feed 1.1
   * `page` + 1 from WP API
   */
  next?: DiscoveredSource;

  /**
   * The previous page post source
   *
   * `link` with `rel="previous"` from Atom and RSS 2.0
   * `page` - 1 from WP API
   */
  previous?: DiscoveredSource;

  /**
   * The first page post source
   *
   * `link` with `rel="first"` from Atom and RSS 2.0
   * `feed_url` from JSON Feed 1.1
   * `page` = 1 from WP API
   */
  first?: DiscoveredSource;

  /**
   * The last page post source
   *
   * `link` with `rel="last"` from Atom and RSS 2.0
   * `page` = `x-wp-totalpages` from WP API
   */
  last?: DiscoveredSource;

  /**
   * The current page number (starting in 1)
   *
   * `page` from WP API
   */
  currentPage?: number;

  /**
   * The total number of pages
   *
   * `x-wp-totalpages` from WP API
   */
  totalPages?: number;

  /**
   * The total number of posts
   *
   * `x-wp-total` from WP API
   */
  totalPosts?: number;

}

export interface PostItem {

  /**
   * The unique identification for the item
   *
   * `id` from Atom 1.0
   * `guid` from RSS 0.91, RSS 1.0 and RSS 2.0
   * `guid` from WP API
   */
  guid?: string;

  /**
   * The item title
   *
   * `title` from Atom 1.0, RSS 0.91, RSS 2.0 and WP API
   */
  title?: string;

  /**
   * The item permalink
   *
   * `link` from Atom 1.0, RSS 0.91, RSS 1.0, RSS 2.0 and WP API
   */
  link?: string;

  /**
   * The item author
   *
   * `author` from Atom 1.0, RSS 2.0 and WP API
   * `dc:creator` from RSS 1.0
   */
  authors?: PostPerson[];

  /**
   * The date and time the item was published at
   *
   * `published` or `updated` from Atom 1.0
   * `pubDate` from RSS 2.0
   * `dc:date` from RSS 1.0
   * `date_gmt` or `date` from WP API
   */
  publishedAt?: Date;

  /**
   * The date and time the item was updated at
   */
  updatedAt?: Date;

  /**
   * The item category list
   *
   * `category` from Atom 1.0 and RSS 2.0
   * `categories` from WP API
   */
  categories?: PostTerm[];

  /**
   * The item tag list
   *
   * `tags` from WP API
   */
  tags?: PostTerm[];

  /**
   * The item content
   *
   * `content` from Atom 1.0 and WP API
   * `description` from RSS 0.91, RSS 1.0 and RSS 2.0
   */
  content?: PostContent;

  /**
   * The item summary or excerpt
   *
   * `summary` from Atom 1.0
   * `excerpt` from WP API
   */
  summary?: PostContent;

  /**
   * The item media
   *
   * `content` from Atom 1.0
   * `media:content` from RSS 1.0
   * `enclosure` from RSS 2.0
   * `featured_media` from WP API
   */
  media?: PostMedia[];

  /**
   * The item source
   *
   * `source` from Atom 1.0 and RSS 2.0
   */
  source?: PostSource;
}

export interface PostContent {
  /**
   * The HTML content, if available
   *
   * `content`, `summary` and `subtitle` with `type` === `html` from Atom 1.0
   * `description` from RSS 0.91, RSS 1.0 and RSS 2.0
   * `rendered` from WP API
   */
  html?: string;

  /**
   * The plain text content, if available
   *
   * `content`, `summary` and `subtitle` with `type` === `text` from Atom 1.0
   */
  text?: string;
}

export interface PostMedia {
  /**
   * The media identification
   *
   * `id` from WP API
   */
  id?: string | number;

  /**
   * The media source URL
   *
   * `icon`, `logo` from Atom 1.0
   * `url` attribute from Atom 1.0, RSS 0.91 and RSS 2.0
   * `rdf:resource` from RSS 1.0
   */
  url: string;

  /**
   * The file size in bytes
   *
   * `length` from RSS 2.0
   * `fileSize` from RSS 2.0 (Media RSS Spec)
   */
  length?: number;

  /**
   * The file MIME type
   *
   * `type` attribute from Atom 1.0, RSS 2.0
   * `mime_type` from WP API
   */
  type?: string;

  /**
   * The item title (or alt text)
   *
   * `title` from RSS 0.91 and RSS 2.0
   */
  title?: string;

  /**
   * The image width in pixels
   *
   * `width` from RSS 0.91, RSS 2.0 and WP API
   */
  width?: number;

  /**
   * The image height in pixels
   *
   * `height` from RSS 0.91, RSS 2.0 and WP API
   */
  height?: number;
}

export interface PostPerson {
  /**
   * The person identification
   *
   * `author` from WP API
   */
  id?: string | number;

  /**
   * The person name
   *
   * `name` from Atom 1.0 and WP API
   * A substring of `dc:creator` from RSS 1.0
   * A substring of `author` from RSS 2.0
   */
  name?: string;

  /**
   * The person email address
   *
   * `email` from Atom 1.0
   * A substring of `dc:creator` from RSS 1.0
   * A substring of `author` from RSS 2.0
   */
  email?: string;

  /**
   * The person URI. Can be the profile, website or mailto: link
   *
   * `uri` from Atom 1.0
   * A substring of `dc:creator` from RSS 1.0
   * `link` from WP API
   */
  uri?: string;

  /**
   * The person profile images
   */
  images?: PostMedia[];
}

export interface PostTerm {
  /**
   * The identification
   *
   * `id` from WP API
   */
  id?: string | number;

  /**
   * The term name
   *
   * `label` or `term` attributes from Atom 1.0
   * `category` from RSS 2.0
   * `name` from WP API
   */
  name?: string;

  /**
   * The term URL
   *
   * `link` from WP API
   */
  url?: string;
}

export interface PostSource {
  /**
   * The source URL
   *
   * `link` from Atom 1.0
   * `url` attribute from RSS 2.0
   */
  url?: string;

  /**
   * The source title
   *
   * `title` from Atom 1.0
   * `source` from RSS 2.0
   */
  title?: string;
}
