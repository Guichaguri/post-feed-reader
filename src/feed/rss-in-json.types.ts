/**
 * These types were based on a JSON Schema created by Dan MacTough
 * https://github.com/danmactough/rss-in-json-schema-validator/blob/5e7e5dfe6000d1d905cda854dbb0100e027668ec/schema.js
 */

export interface RssInJsonFeed {
  rss: RssInJsonRss;
}

export interface RssInJsonRss {
  channel: RssInJsonChannel;
  /**
   * the version of RSS the feed uses
   */
  version: string;
}

export interface RssInJsonChannel {
  /**
   * one or more categories that the channel belongs to
   */
  category?: Array<RssInJsonCategoryObject | string>;
  /**
   * copyright notice for content in the channel
   */
  copyright?: string;
  /**
   * phrase or sentence describing the channel
   */
  description: string;
  /**
   * a URL that points to the documentation for the format used in the RSS file
   */
  docs?: string;
  /**
   * a string indicating the program used to generate the channel
   */
  generator?: string;
  /**
   * a GIF, JPEG or PNG image that can be displayed with the channel
   */
  image?: RssInJsonImage;
  item?: RssInJsonItem[];
  /**
   * the language the channel is written in
   */
  language?: string;
  /**
   * the last time the content of the channel changed, in RFC 822 format
   */
  lastBuildDate?: string;
  /**
   * the URL to the HTML website corresponding to the channel
   */
  link: string;
  /**
   * email address for person responsible for editorial content
   */
  managingEditor?: string;
  /**
   * the publication date for the content in the channel, in RFC 822 format
   */
  pubDate?: string;
  /**
   * the PICS rating for the channel
   */
  rating?: string;
  /**
   * the name of the channel
   */
  title: string;
  /**
   * ttl stands for time to live; a number of minutes that indicates how long a channel can be
   * cached before refreshing from the source
   */
  ttl?: number;
  /**
   * email address for person responsible for technical issues relating to channel
   */
  webMaster?: string;
}

export interface RssInJsonCategoryObject {
  "#value": string;
  /**
   * a string that identifies a categorization taxonomy
   */
  domain: string;
}

/**
 * a GIF, JPEG or PNG image that can be displayed with the channel
 */
export interface RssInJsonImage {
  /**
   * text that is included in the TITLE attribute of the link formed around the image in the
   * HTML rendering
   */
  description?: string;
  height?: number;
  /**
   * is the URL of the site, and when the channel is rendered, the image is a link to the site
   */
  link: string;
  /**
   * describes the image and is used in the ALT attribute of the HTML <img> tag when the
   * channel is rendered in HTML
   */
  title: string;
  /**
   * the URL of a GIF, JPEG or PNG image that represents the channel
   */
  url: string;
  width?: number;
}

export interface RssInJsonItem {
  /**
   * email address of the author of the item
   */
  author?: string;
  /**
   * includes the item in one or more categories
   */
  category?: Array<RssInJsonCategoryObject | string>;
  /**
   * URL of a page for comments relating to the item
   */
  comments?: string;
  /**
   * the item synopsis
   */
  description?: string;
  /**
   * describes a media object that is attached to the item
   */
  enclosure?: RssInJsonEnclosure;
  guid?: RssInJsonGUIDObject | string;
  /**
   * the URL of the item
   */
  link?: string;
  /**
   * when the item was published, in RFC 822 format
   */
  pubDate?: string;
  source?:  RssInJsonSource;
  /**
   * the title of the item
   */
  title?: string;
}

/**
 * describes a media object that is attached to the item
 */
export interface RssInJsonEnclosure {
  /**
   * how big it is in bytes
   */
  length: number;
  /**
   * a standard MIME type
   */
  type: string;
  /**
   * where the enclosure is located
   */
  url: string;
}

export interface RssInJsonGUIDObject {
  /**
   * a string that uniquely identifies the item
   */
  "#value": string;
  /**
   * whether the reader may assume that the guid is a permalink to the item
   */
  isPermalink?: boolean;
}

export interface RssInJsonSource {
  /**
   * the name of the RSS channel that the item came from, derived from its <title>
   */
  "#value": string;
  /**
   * link to the XMLization of the source
   */
  url: string;
}
