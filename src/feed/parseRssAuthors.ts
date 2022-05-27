import { PostPerson } from '../types';

/**
 * Parses <author> or <dc:creator> element contents
 *
 * @param author The <author> contents
 * @param creator The <dc:creator> contents
 */
export function parseRssAuthors(author: string | undefined, creator?: string): PostPerson[] | undefined {
  const regex = /^(.+?)(?:\s?\((.+)\))?$/m;

  let name: string | undefined;
  let uri: string | undefined;
  let email: string | undefined;

  if (creator) {
    const match = regex.exec(creator);

    if (match) {
      name = match[1];
      uri = match[2];
    } else {
      name = creator;
    }
  }

  if (author) {
    const match = regex.exec(author);

    if (match) {
      name = match[2];
      email = match[1];
    } else {
      email = author;
    }
  }

  if (!email && uri && uri.startsWith('mailto:'))
    email = uri.substring('mailto:'.length);

  if (!name && !uri && !email)
    return [];

  return [{ name, uri, email }];
}
