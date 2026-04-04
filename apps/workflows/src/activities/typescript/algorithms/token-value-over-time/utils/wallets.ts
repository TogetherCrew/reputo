import type { WalletLotsState } from '../types.js';

export {
  buildWalletSubIdsIndex,
  getSubIds,
  getWalletsForChain,
  getWalletsForSelectedResources,
  loadSubIdInputMap as loadWalletAddressMap,
} from '../../shared/sub-id-input.js';

export function initializeWalletLots(wallets: string[]): WalletLotsState {
  return new Map(wallets.map((wallet) => [wallet, []]));
}
