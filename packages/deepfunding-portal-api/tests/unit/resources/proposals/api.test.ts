import { describe, expect, it } from 'vitest';
import { fetchProposals } from '../../../../src/resources/proposals/api.js';
import type { ProposalApiResponse } from '../../../../src/resources/proposals/types.js';
import { createMockClient } from '../../../utils/api-helpers.js';
import { createMockProposal } from '../../../utils/mock-helpers.js';

describe('Proposal API', () => {
  describe('fetchProposals', () => {
    it('should fetch proposals for a round', async () => {
      const proposal1 = createMockProposal({ id: 1, round_id: 10 });
      const proposal2 = createMockProposal({ id: 2, round_id: 10 });

      const mockResponse: ProposalApiResponse = {
        proposals: [proposal1, proposal2],
      };

      const client = createMockClient();
      client.mockGet.mockResolvedValue(mockResponse);

      const result = await fetchProposals(client, 10);

      expect(result.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledWith('/rounds/10/proposals', {});
    });

    it('should include poolId in params when provided', async () => {
      const mockResponse: ProposalApiResponse = {
        proposals: [],
      };

      const client = createMockClient();
      client.mockGet.mockResolvedValue(mockResponse);

      await fetchProposals(client, 10, { poolId: 20 });

      expect(client.mockGet).toHaveBeenCalledWith('/rounds/10/proposals', { pool_id: 20 });
    });

    it('should return empty array when no proposals', async () => {
      const mockResponse: ProposalApiResponse = {
        proposals: [],
      };

      const client = createMockClient();
      client.mockGet.mockResolvedValue(mockResponse);

      const result = await fetchProposals(client, 10);

      expect(result).toEqual([]);
    });
  });
});
