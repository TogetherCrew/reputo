import { describe, expect, it } from 'vitest';
import { fetchAllPages } from '../../../src/api/paginate.js';
import type { PaginatedFetcher } from '../../../src/shared/types/index.js';

describe('Paginate Utils', () => {
  describe('fetchAllPages', () => {
    it('should collect all pages from paginated fetcher', async () => {
      const pages: Array<{ data: number[]; pagination: unknown }> = [
        { data: [1, 2, 3], pagination: {} },
        { data: [4, 5, 6], pagination: {} },
        { data: [7, 8], pagination: {} },
      ];

      async function* fetcher(): PaginatedFetcher<number> {
        for (const page of pages) {
          yield page;
        }
      }

      const result = await fetchAllPages(fetcher());
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should handle empty results', async () => {
      async function* fetcher(): PaginatedFetcher<number> {
        yield { data: [], pagination: {} };
      }

      const result = await fetchAllPages(fetcher());
      expect(result).toEqual([]);
    });

    it('should handle single page results', async () => {
      async function* fetcher(): PaginatedFetcher<number> {
        yield { data: [1, 2, 3], pagination: {} };
      }

      const result = await fetchAllPages(fetcher());
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle objects in pages', async () => {
      const pages: Array<{ data: Array<{ id: number }>; pagination: unknown }> = [
        { data: [{ id: 1 }, { id: 2 }], pagination: {} },
        { data: [{ id: 3 }], pagination: {} },
      ];

      async function* fetcher(): PaginatedFetcher<{ id: number }> {
        for (const page of pages) {
          yield page;
        }
      }

      const result = await fetchAllPages(fetcher());
      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });
});
