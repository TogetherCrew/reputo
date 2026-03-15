import type { WalletLotsState } from '../types.js';

const MOCK_TARGET_WALLETS = [
  '0x1d287cc25dad7ccaf76a26bc660c5f7c8e2a05bd',
  '0xa47c0bd4874f788ee9831bd1c8d1e8d439be7ac5',
  '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
  '0x031b41e504677879370e9dbcf937283a8691fa7f',
  // '0x742d35cc6634c0532925a3b844bc454e4438f44e',
  // '0x28c6c06298d514db089934071355e5743bf21d60',
  // '0x21a31ee1afc51d94c2efccaa2092ad1028285549',
  // '0x564286362092d8e7936f0549571a803b203aaced',
  // '0x66f820a414680b5bcda5eeca5dea238543f42054',
  // '0x3f5ce5fbfe3e9af3971dD833D26BA9b5C936f0bE',
  // '0xdc76cd25977e0a5ae17155770273ad58648900d3',
  // '0x0681d8db095565fe8a346fa0277bffde9c0edbbf',
  // '0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67',
  // '0x53d284357ec70ce289d6d64134dfac8e511c8a3d',
  // '0xfe9e8709d3215310075d67e3ed32a380ccf451c8',
  // '0x742d35cc6634c0532925a3b844bc454e4438f44e',
  // '0x66c68f1e0f22722c00c3a6a76d7c8c1b0f7c1f06',
  // '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
  // '0x876eabf441b2ee5b5b0554fd502a8e0600950cfa',
] as const;

export function loadTargetWallets(): string[] {
  return [...MOCK_TARGET_WALLETS];
}

export function initializeWalletLots(wallets: string[]): WalletLotsState {
  return new Map(wallets.map((wallet) => [wallet, []]));
}
