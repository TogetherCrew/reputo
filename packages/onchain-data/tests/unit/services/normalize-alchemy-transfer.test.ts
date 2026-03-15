import { describe, expect, it } from 'vitest';
import { normalizeAlchemyEthereumTransfer } from '../../../src/services/sync-asset-transfers-service.js';
import { OnchainAssets } from '../../../src/shared/index.js';
import { createMockAlchemyTransfer } from '../../utils/mock-helpers.js';

const asset = OnchainAssets.fet_ethereum;

describe('normalizeAlchemyEthereumTransfer', () => {
  it('maps Alchemy transfer to AssetTransferRecord', () => {
    const alchemyTransfer = createMockAlchemyTransfer();
    const result = normalizeAlchemyEthereumTransfer({
      chain: asset.chain,
      assetIdentifier: asset.assetIdentifier,
      transfer: alchemyTransfer,
    });

    expect(result.chain).toBe(asset.chain);
    expect(result.assetIdentifier).toBe(asset.assetIdentifier);
    expect(result.blockNumber).toBe('0x6e4d3c');
    expect(result.transactionHash).toBe(alchemyTransfer.hash);
    expect(result.logIndex).toBe(0);
    expect(result.fromAddress).toBe(alchemyTransfer.from.toLowerCase());
    expect(result.toAddress).toBe(alchemyTransfer.to?.toLowerCase() ?? null);
    expect(result.amount).toBe('100');
    expect(result.blockTimestamp).toBe(alchemyTransfer.metadata?.blockTimestamp ?? null);
  });

  it('parses log index from uniqueId', () => {
    const result = normalizeAlchemyEthereumTransfer({
      chain: asset.chain,
      assetIdentifier: asset.assetIdentifier,
      transfer: createMockAlchemyTransfer({ uniqueId: '0xhash:log:0x5' }),
    });
    expect(result.logIndex).toBe(5);
  });

  it('handles hex log index in uniqueId', () => {
    const result = normalizeAlchemyEthereumTransfer({
      chain: asset.chain,
      assetIdentifier: asset.assetIdentifier,
      transfer: createMockAlchemyTransfer({ uniqueId: '0xhash:log:0xa' }),
    });
    expect(result.logIndex).toBe(10);
  });

  it('handles null to address', () => {
    const result = normalizeAlchemyEthereumTransfer({
      chain: asset.chain,
      assetIdentifier: asset.assetIdentifier,
      transfer: createMockAlchemyTransfer({ to: null as unknown as string }),
    });
    expect(result.toAddress).toBeNull();
  });

  it('handles null value as zero amount', () => {
    const result = normalizeAlchemyEthereumTransfer({
      chain: asset.chain,
      assetIdentifier: asset.assetIdentifier,
      transfer: createMockAlchemyTransfer({ value: null }),
    });
    expect(result.amount).toBe('0');
  });

  it('builds id from chain, assetIdentifier, hash and logIndex', () => {
    const result = normalizeAlchemyEthereumTransfer({
      chain: asset.chain,
      assetIdentifier: asset.assetIdentifier,
      transfer: createMockAlchemyTransfer({
        hash: '0xabc',
        uniqueId: '0xabc:log:0x2',
      }),
    });
    expect(result.id).toBe(`${asset.chain}:${asset.assetIdentifier}:0xabc:2`);
  });
});
