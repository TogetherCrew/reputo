import type { Storage } from '@reputo/storage';

import type { SelectedResourceInput, SupportedChain, WalletAddressMap, WalletLotsState } from '../types.js';

function deduplicateWallets(wallets: string[], chain: SupportedChain): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const wallet of wallets) {
    const normalized = chain === 'ethereum' ? wallet.toLowerCase() : wallet;
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  return result;
}

export async function loadWalletAddressMap(input: {
  storage: Storage;
  bucket: string;
  key: string;
}): Promise<WalletAddressMap> {
  const fileBuffer = await input.storage.getObject({
    bucket: input.bucket,
    key: input.key,
  });

  const parsed = JSON.parse(fileBuffer.toString('utf-8')) as Record<string, Partial<Record<SupportedChain, string[]>>>;
  const subIds: WalletAddressMap['subIds'] = {};

  for (const [subId, chainMap] of Object.entries(parsed)) {
    subIds[subId] = {
      ethereum: chainMap.ethereum ? deduplicateWallets(chainMap.ethereum, 'ethereum') : undefined,
      cardano: chainMap.cardano ? deduplicateWallets(chainMap.cardano, 'cardano') : undefined,
    };
  }

  return {
    subIds,
  };
}

export function getWalletsForSelectedResources(
  walletAddressMap: WalletAddressMap,
  selectedResources: SelectedResourceInput[],
): string[] {
  const selectedChains = new Set(selectedResources.map((r) => r.chain));
  const wallets = new Set<string>();

  for (const chainMap of Object.values(walletAddressMap.subIds)) {
    for (const chain of selectedChains) {
      for (const wallet of chainMap[chain] ?? []) {
        wallets.add(wallet);
      }
    }
  }

  return [...wallets];
}

export function getWalletsForChain(walletAddressMap: WalletAddressMap, chain: SupportedChain): string[] {
  const wallets = new Set<string>();
  for (const chainMap of Object.values(walletAddressMap.subIds)) {
    for (const wallet of chainMap[chain] ?? []) {
      wallets.add(wallet);
    }
  }
  return [...wallets];
}

export function getSubIds(walletAddressMap: WalletAddressMap): string[] {
  return Object.keys(walletAddressMap.subIds).sort((a, b) => a.localeCompare(b));
}

export function buildWalletSubIdsIndex(walletAddressMap: WalletAddressMap): Map<string, string[]> {
  const index = new Map<string, string[]>();

  for (const [subId, chainMap] of Object.entries(walletAddressMap.subIds)) {
    for (const chain of ['ethereum', 'cardano'] as const) {
      for (const wallet of chainMap[chain] ?? []) {
        const subIds = index.get(wallet) ?? [];
        subIds.push(subId);
        index.set(wallet, subIds);
      }
    }
  }

  for (const subIds of index.values()) {
    subIds.sort((a, b) => a.localeCompare(b));
  }

  return index;
}

export function initializeWalletLots(wallets: string[]): WalletLotsState {
  return new Map(wallets.map((wallet) => [wallet, []]));
}
