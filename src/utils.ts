import { Element, Node } from 'domhandler';
import { DomUtils, parseDocument } from 'htmlparser2';

export function getElementByTagName(tag: string, nodes: Node[], recurse: boolean = true): Element | null {
  return DomUtils.findOne(e => e.name === tag, nodes, recurse);
}

export function getTextByTagName(tag: string, nodes: Node[] | Node, recurse: boolean = true): string {
  return DomUtils.textContent(DomUtils.getElementsByTagName(tag, nodes, recurse));
}

export function getDateByTagName(tag: string, nodes: Node[] | Node, recurse: boolean = true): Date | undefined {
  const text = getTextByTagName(tag, nodes, recurse);

  return text ? new Date(text) : undefined;
}

export function getNumberByTagName(tag: string, nodes: Node[] | Node, recurse: boolean = true): number | undefined {
  const text = getTextByTagName(tag, nodes, recurse);

  return text ? +text : undefined;
}

export function convertHtmlToText(html: string | undefined): string | undefined {
  return html ? DomUtils.textContent(parseDocument(html)).trim() : undefined;
}

/**
 * Tries to extract a JSON string from a JSONP text
 *
 * @param raw The raw JSON/JSONP text
 */
export function extractFromJsonp(raw: string): string {
  // This regex matches JSONP results, such as `onGetFeed({ ... })`
  const jsonpRegex = /^(\w+)\s+?\(({.*})\s+?\)$/sm;
  const match = jsonpRegex.exec(raw.trim());

  return match ? match[2] : raw;
}
