import { Element } from 'domhandler';
import { PostContent, PostItem, PostTerm, PostList, PostMedia, PostPerson, PostSource, DiscoveredFeed } from '../types';
import { DomUtils } from 'htmlparser2';
import { getDateByTagName, getElementByTagName, getTextByTagName } from '../utils';
import { parseAtomPagination } from './parseAtomPagination';

/**
 * Parses an Atom feed
 *
 * See https://datatracker.ietf.org/doc/html/rfc4287
 *
 * @param atom The root feed element
 */
export function parseAtomFeed(atom: Element): PostList {
  const children = atom.children;

  const version = atom.attribs.xmlns === 'http://www.w3.org/2005/Atom' ? '1.0' : undefined;

  const lang = DomUtils.getAttributeValue(atom, 'xml:lang');
  const subtitle = DomUtils.getElementsByTagName('subtitle', children, false);
  const links = DomUtils.getElementsByTagName('link', children, false);

  const images = DomUtils.getElementsByTagName(e => e === 'icon' || e === 'logo', children, false);

  return {
    container: {
      type: 'atom-feed',
      version: version,
    },
    pagination: parseAtomPagination(links),
    title: getTextByTagName('title', children, false),
    description: parseAtomContent(subtitle),
    copyright: getTextByTagName('rights', children, false),
    updatedAt: getDateByTagName('updated', children, false),
    url: getAtomLinkUrl(links),
    language: lang,
    image: images.map(img => ({ url: DomUtils.textContent(img) })),
    posts: parseAtomPosts(atom),
  };
}

/**
 * Parses Atom entries
 *
 * @param atom The root feed element
 */
function parseAtomPosts(atom: Element): PostItem[] {
  const entries = DomUtils.getElementsByTagName('entry', atom.children);

  return entries.map(entry => {
    const children = entry.children;

    const links = DomUtils.getElementsByTagName('link', children);

    const authors = DomUtils.getElementsByTagName('author', children);

    const content = DomUtils.getElementsByTagName('content', children);
    const summary = DomUtils.getElementsByTagName('summary', children);

    const source = getElementByTagName('source', children);

    const categories = DomUtils.getElementsByTagName('category', children);

    const updatedDate = getDateByTagName('updated', children);

    return {
      guid: getTextByTagName('id', children),
      title: getTextByTagName('title', children),
      link: getAtomLinkUrl(links),
      authors: parseAtomAuthors(authors),
      publishedAt: getDateByTagName('published', children) || updatedDate,
      updatedAt: updatedDate,
      content: parseAtomContent(content),
      summary: parseAtomContent(summary),
      media: parseAtomMedia(content),
      source: parseAtomSource(source),
      categories: parseAtomCategories(categories),
    };
  });
}

/**
 * Parses Atom categories
 *
 * @param categories The <category> elements
 */
function parseAtomCategories(categories: Element[]): PostTerm[] {
  return categories.map(cat => ({ name: cat.attribs.label || cat.attribs.term })).filter(cat => cat.name);
}

/**
 * Parses Atom person elements
 *
 * @param authors The <author> elements
 */
function parseAtomAuthors(authors: Element[]): PostPerson[] | undefined {
  return authors.map(author => ({
    name: getTextByTagName('name', author),
    email: getTextByTagName('email', author),
    uri: getTextByTagName('uri', author),
  }));
}

/**
 * Parses Atom content elements
 *
 * @param contents The <content>, <summary> or <subtitle> elements
 */
function parseAtomContent(contents: Element[]): PostContent {
  const html = contents.find(e => e.attribs.type === 'html');
  const text = contents.find(e => e.attribs.type === 'text' || !e.attribs.type);

  return {
    html: html ? DomUtils.textContent(html) : undefined,
    text: text ? DomUtils.textContent(text) : undefined,
  };
}

/**
 * Parses Atom media elements
 *
 * @param contents The <content> elements
 */
function parseAtomMedia(contents: Element[]): PostMedia[] {
  const media = contents.filter(e => !!e.attribs.src);

  return media.map(e => {
    return {
      url: e.attribs.src,
      type: e.attribs.type,
    };
  });
}

/**
 * Parses Atom source element
 *
 * @param source The <source> element
 */
function parseAtomSource(source: Element | null): PostSource | undefined {
  if (!source)
    return undefined;

  const links = DomUtils.getElementsByTagName('link', source);

  return {
    title: getTextByTagName('title', source),
    url: getAtomLinkUrl(links),
  };
}

/**
 * Gets the Atom link URL
 *
 * @param links The <link> elements
 */
function getAtomLinkUrl(links: Element[]): string | undefined {
  if (links.length === 0)
    return undefined;

  const link = links.find(link => link.attribs.type === 'text/html') || links[0];

  return link.attribs.href;
}
