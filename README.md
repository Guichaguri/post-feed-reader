# post-feed-reader

[![npm](https://img.shields.io/npm/v/post-feed-reader.svg)](https://www.npmjs.com/package/post-feed-reader)
[![license](https://img.shields.io/github/license/Guichaguri/post-feed-reader)](https://github.com/Guichaguri/post-feed-reader/blob/main/LICENSE)

A library to fetch news, blog or podcast posts from any site.
It works by auto-discovering a post source, which can be an RSS/Atom/JSON feed or the Wordpress REST API, then fetches and parses the list of posts.

It's meant for NodeJS, but as it is built on Isomorphic Javascript, it can work on browsers if the website allows cross-origin requests.

Originally built for apps that need to list the posts with their own UI, but don't actually manage the blog and need automatic fallbacks when the blog does change.

# Features
- **Simple**: Two-liner usage. Just discovers and fetches the posts.
- **Supports multiple sources**: [Wordpress REST API](https://developer.wordpress.org/rest-api/reference/posts/), [RSS 2.0.1](https://www.rssboard.org/rss-2-0-11), [RSS 2.0](https://www.rssboard.org/rss-2-0), [RSS 1.0](https://web.resource.org/rss/1.0/spec), [RSS 0.91](https://www.rssboard.org/rss-0-9-1), [Atom 1.0](https://datatracker.ietf.org/doc/html/rfc4287), [JSON Feed 1.1](https://www.jsonfeed.org/version/1.1/) and [JSON Feed 1.0](https://www.jsonfeed.org/version/1/).
- **Auto-discovery**: Give any site URL and the library will try to find the data automatically.
- **Pagination**: For sources that support it, you can fetch more than a single set of posts.

# Getting Started

Install it with NPM or Yarn:

```sh
npm install post-feed-reader # or yarn add post-feed-reader
```

You first need to discover the post source, which will return an object containing a URL to the RSS/Atom/JSON Feed or the Wordpress REST API.

Then you can pass the discovered source to the `getPostList`, which will fetch and parse it.

```ts
import { discoverPostSource, getPostList } from 'post-feed-reader';

// Looks for metadata pointing to the Wordpress REST API or Atom/RSS Feeds
const source = await discoverPostSource('https://www.nytimes.com');

// Retrieves the posts from the given source
const list = await getPostList(source);

// Logs all post titles
console.log(list.posts.map(post => post.title));
```

Simple enough, eh?

## Output

See [an example](https://gist.github.com/Guichaguri/f3d67ae99aeb9ca20fd5a19fafeb1afb) of the post list based on the Mozilla blog.

## Options

```ts
const source = await discoverPostSource('https://techcrunch.com', {
  // Custom axios instance
  axios: axios.create(...),

  // Whether it will prioritize feeds over the wordpress api
  preferFeeds: false,

  // Custom data source filtering
  canUseSource: (source: DiscoveredSource) => true,

  // Whether it will try to guess wordpress api and feed urls if auto-discovery doesn't work
  tryToGuessPaths: false,
  
  // The paths that it will try to guess for both the Wordpress API or the RSS/Atom/JSON feed
  wpApiPaths: ['./wp-json', '?rest_route=/'],
  feedPaths: ['./feed', './atom', './rss', './feed.json', './feed.xml', '?feed=atom'],
});

const posts = await getPostList(source, {
  // Custom axios instance
  axios: axios.create(...),

  // Whether missing plain text contents will be filled automatically from html contents
  fillTextContents: false,

  // Wordpress REST API only options
  wordpress: {
    // Whether it will include author, taxonomy and media data from the wordpress api
    includeEmbedded: true,

    // The amount of items to return
    limit: 10,

    // The search string filter
    search: '',

    // The author id filter
    authors: [...],

    // The category id filter
    categories: [...],

    // The tag id filter
    tags: [...],

    // Any additional querystring parameter for the wordpress api you may want to include
    additionalParams: { ... },
  },
});
```

## Skip the auto-discovery

If you already have an Atom/RSS/JSON Feed or the Wordpress REST API url in hands, you can fetch the posts directly:
```ts
// RSS, Atom or JSON Feed
const feedPosts = await getFeedPostList('https://news.google.com/atom');

// Wordpress API
const wpApiPosts = await getWordpressPostList('https://blog.mozilla.org/en/wp-json/');
```

## Pagination

The post list may have pagination metadata attached. You can use it to navigate through pages. Here's an example:
```ts
const result = await getPostList(...);

if (result.pagination.next) {
  // There is a next page!
  
  const nextResult = await getPostList(result.pagination.next);
  
  // ...
}

// You can also check for result.pagination.previous, result.pagination.first and result.pagination.last
```

## Why support other sources, isn't RSS enough?

RSS is the most widely feed format used on the web, but not only it lacks information that might be trivial to your application, [the specification is a mess](https://www.xml.com/pub/a/2002/12/18/dive-into-xml.html) with many vague to implementation properties, meaning how the information is formatted differs from feed to feed.
For instance, the description can be the full post as HTML, or just an excerpt, or in plain text, or even just an HTML link to the post page.

Atom's specification is way more rigid and robust, which makes relying on the data trustworthier. It's definitely the way to go in the topic of feeds. But it still lacks some properties that can only be fetched through the Wordpress REST API.

Since [WordPress is by far the most used CMS](https://w3techs.com/technologies/details/cm-wordpress), supporting its API is a great alternative. The Wordpress REST API supports the following over RSS and Atom feeds:
- Filtering by category, tag and/or author
- Searching
- Pagination
- Featured media
- Author profile 

The JSON Feed format is also just as good as the Atom format, but at the moment very few websites produce it.

## How does the auto-discovery works?

1. Fetches the site's main page
2. Looks for [Wordpress Link headers](https://developer.wordpress.org/rest-api/using-the-rest-api/discovery/#link-header)
3. Looks for [RSS](https://www.rssboard.org/rss-autodiscovery), [Atom](https://blog.whatwg.org/feed-autodiscovery) and [JSON Feed](https://www.jsonfeed.org/version/1.1/#discovery) `<link>` metatags
4. If `tryToGuessPaths` is set to `true`, it will look for the paths to try to find a feed or the WP API.

## Most properties are optional, what am I guaranteed to have?

Nothing.

Yeah, there's no property that is required in all specs, thus we can't guarantee they will be present.

But! The most basic properties are very likely to be present, such as `guid`, `title` and `link`.

For all the other properties, it's highly recommended implementing your own fallbacks.
For instance, showing a substring of the content when the summary isn't available. 

The library will try its best to fetch the most data available.
