export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Parse `page` and `limit` from query parameters.
 * Defaults: page = 1, limit = 10.  Max limit = 50.
 */
export function getPaginationOptions(
  query: Record<string, unknown>,
): PaginationOptions {
  const page = Math.max(1, parseInt(String(query.page)) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit)) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build the pagination metadata object returned in every list response.
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
