
export interface WordpressRenderedContent {
  rendered: string,
  protected?: boolean,
}

export interface WordpressApiLink {
  href: string;
  embeddable?: boolean;
  taxonomy?: string;
}

export interface WordpressPost {
  id: number;
  slug: string;
  guid: WordpressRenderedContent;
  title: WordpressRenderedContent;
  content?: WordpressRenderedContent;
  excerpt: WordpressRenderedContent;
  author: number;
  featured_media?: number;
  link: string;
  type: string;
  format?: 'standard' | 'aside' | 'chat' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio';
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  comment_status?: 'open' | 'closed';
  ping_status?: 'open' | 'closed';
  date: string;
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  meta?: any[],
  sticky?: boolean;
  categories?: number[],
  tags?: number[],

  yoast_head_json?: WordpressYoastHead;

  _embedded?: {
    author?: (WordpressAuthor | WpError)[],
    'wp:featuredmedia'?: WordpressMedia[],
    'wp:term'?: WordpressTerm[][],
  },

  _links: {
    self: WordpressApiLink[];
    author: WordpressApiLink[];
    replies: WordpressApiLink[];
    'wp:featuredmedia': WordpressApiLink[];
    'wp:attachment': WordpressApiLink[];
    'wp:term': WordpressApiLink[];
  }
}

export interface WordpressYoastHead {
  title: string;
  description: string;
  canonical: string;
  og_locale: string;
  og_image: {
    url: string;
    type: string;
    width: number;
    height: number;
  }[];
}

export interface WordpressAuthor {
  id: number;
  slug: string;
  link: string;
  name: string;
  url: string;
  description: string;
  avatar_urls: Record<string, string>;

  yoast_head_json?: WordpressYoastHead;
}

export interface WordpressMedia {
  id: number;
  slug: string;
  link: string;
  title: WordpressRenderedContent;
  caption: WordpressRenderedContent;
  alt_text: string;
  source_url: string;
  mime_type: string;
  media_type: 'image' | 'file';
  date: string;
  media_details: {
    file: string;
    width: number;
    height: number;
    image_meta: any;
    sizes: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
  };

  yoast_head_json?: WordpressYoastHead;
}

export interface WordpressTerm {
  id: number;
  slug: string;
  name: string;
  link: string;
  taxonomy: 'category' | 'post_tag' | string;

  yoast_head_json?: WordpressYoastHead;
}

export interface WordpressWpApi {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
  namespaces: string[];
  authentication: any;
  routes: Record<string, any>;
  site_logo?: number | false;
  site_icon?: number | false;

  _embedded?: {
    'wp:featuredmedia'?: WordpressMedia[],
  },
}

export interface WpError {
  code: string;
  message: string;
  data: { status: number };
}
