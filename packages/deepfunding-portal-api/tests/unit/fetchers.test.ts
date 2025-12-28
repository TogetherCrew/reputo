import { describe, expect, it } from 'vitest';
import { fetchAllPages } from '../../src/api/paginate.js';
import type { PaginatedFetcher } from '../../src/shared/types/fetchers.js';

describe('fetchAllPages', () => {
  it('should collect all pages into a single array', async () => {
    async function* mockFetcher(): PaginatedFetcher<{ id: number }> {
      yield {
        data: [{ id: 1 }, { id: 2 }],
        pagination: {
          total_records: 5,
          current_page: 1,
          total_pages: 3,
          next_page: 2,
          prev_page: null,
        },
      };
      yield {
        data: [{ id: 3 }, { id: 4 }],
        pagination: {
          total_records: 5,
          current_page: 2,
          total_pages: 3,
          next_page: 3,
          prev_page: 1,
        },
      };
      yield {
        data: [{ id: 5 }],
        pagination: {
          total_records: 5,
          current_page: 3,
          total_pages: 3,
          next_page: null,
          prev_page: 2,
        },
      };
    }

    const result = await fetchAllPages(mockFetcher());

    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
  });

  it('should handle empty results', async () => {
    async function* emptyFetcher(): PaginatedFetcher<{ id: number }> {
      yield {
        data: [],
        pagination: {
          total_records: 0,
          current_page: 1,
          total_pages: 0,
          next_page: null,
          prev_page: null,
        },
      };
    }

    const result = await fetchAllPages(emptyFetcher());

    expect(result).toEqual([]);
  });

  it('should handle single page results', async () => {
    async function* singlePageFetcher(): PaginatedFetcher<string> {
      yield {
        data: ['a', 'b', 'c'],
        pagination: {
          total_records: 3,
          current_page: 1,
          total_pages: 1,
          next_page: null,
          prev_page: null,
        },
      };
    }

    const result = await fetchAllPages(singlePageFetcher());

    expect(result).toEqual(['a', 'b', 'c']);
  });
});
