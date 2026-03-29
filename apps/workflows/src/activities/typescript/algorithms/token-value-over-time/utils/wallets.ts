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

  const parsed = JSON.parse(fileBuffer.toString('utf-8')) as { wallets: Partial<Record<SupportedChain, string[]>> };

  return {
    wallets: {
      ethereum: parsed.wallets.ethereum ? deduplicateWallets(parsed.wallets.ethereum, 'ethereum') : undefined,
      cardano: parsed.wallets.cardano ? deduplicateWallets(parsed.wallets.cardano, 'cardano') : undefined,
    },
  };
}

export function getWalletsForSelectedResources(
  walletAddressMap: WalletAddressMap,
  selectedResources: SelectedResourceInput[],
): string[] {
  const selectedChains = new Set(selectedResources.map((r) => r.chain));
  const wallets = new Set<string>();

  for (const chain of selectedChains) {
    for (const wallet of walletAddressMap.wallets[chain] ?? []) {
      wallets.add(wallet);
    }
  }

  return [...wallets];
}

export function getWalletsForChain(walletAddressMap: WalletAddressMap, chain: SupportedChain): string[] {
  return [...(walletAddressMap.wallets[chain] ?? [])];
}

export function initializeWalletLots(wallets: string[]): WalletLotsState {
  return new Map(wallets.map((wallet) => [wallet, []]));
}
