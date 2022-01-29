import { DiscoveredWordpressApi, PostListPagination } from '../types';

/**
 * Parses the WordPress pagination info
 *
 * @param wpApiBase The base WP API URL
 * @param currentPage The current page number
 * @param headers The headers the request has returned
 */
export function parseWordpressPagination(wpApiBase: string, currentPage: number, headers: Record<string, string>): PostListPagination {
  const totalPages = +headers['x-wp-totalpages'];
  const totalPosts = +headers['x-wp-total'];

  const createPageSource = (page: number): DiscoveredWordpressApi => ({
    source: 'wordpress-rest-api',
    url: wpApiBase,
    page,
  });

  return {
    currentPage: currentPage,
    totalPages: totalPages,
    totalPosts: totalPosts,
    next: currentPage < totalPages ? createPageSource(currentPage + 1) : undefined,
    previous: currentPage > 1 ? createPageSource(currentPage - 1) : undefined,
    first: createPageSource(1),
    last: createPageSource(totalPages),
  };
}
