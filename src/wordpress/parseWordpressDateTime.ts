
/**
 * Parses a Wordpress datetime
 *
 * @param date The datetime string
 */
export function parseWordpressDateTime(date?: string): Date | undefined {
  if (!date)
    return undefined;

  // Format: 0000-00-00T00:00:00
  const regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/m;

  if (regex.test(date)) {
    // The REST API is missing the timezone specifier, we'll add GMT manually before parsing it
    // https://core.trac.wordpress.org/ticket/41032
    return new Date(date + 'Z');
  }

  return new Date(date);
}
