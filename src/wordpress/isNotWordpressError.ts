import { WpError } from './types';

/**
 * Checks whether an object is an error
 * @param value The object
 */
export function isNotWordpressError<T>(value: T | WpError | undefined): value is T {
  if (!value)
    return false;

  if (typeof value !== 'object')
    return true;

  const wpError = value as WpError;

  return !wpError.code || !wpError.data || !wpError.data.status;
}
