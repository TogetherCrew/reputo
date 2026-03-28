import type { Storage } from '@reputo/storage';

import type { SelectedResourceInput, SupportedChain, WalletAddressMap, WalletLotsState } from '../types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeWalletAddresses(value: unknown, chain: SupportedChain): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Wallet JSON field "wallets.${chain}" must be an array`);
  }

  const seen = new Set<string>();
  const wallets: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string' || item.trim() === '') {
      throw new Error(`Wallet JSON field "wallets.${chain}" must only contain non-empty strings`);
    }

    const normalized = chain === 'ethereum' ? item.toLowerCase() : item;
    if (!seen.has(normalized)) {
      seen.add(normalized);
      wallets.push(normalized);
    }
  }

  return wallets;
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

  const parsed = JSON.parse(fileBuffer.toString('utf-8')) as unknown;
  if (!isRecord(parsed) || !isRecord(parsed.wallets)) {
    throw new Error('Wallet JSON must contain a top-level "wallets" object');
  }

  return {
    wallets: {
      ethereum:
        parsed.wallets.ethereum === undefined
          ? undefined
          : normalizeWalletAddresses(parsed.wallets.ethereum, 'ethereum'),
      cardano:
        parsed.wallets.cardano === undefined ? undefined : normalizeWalletAddresses(parsed.wallets.cardano, 'cardano'),
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
