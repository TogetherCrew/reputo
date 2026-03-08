import type { AlchemyClient } from './client.js';
import type { AlchemyBlockResult } from './types.js';

/** Convert a decimal number to a 0x-prefixed hex string */
export function toHex(n: number): string {
  return `0x${n.toString(16)}`;
}

/** Parse a 0x-prefixed hex string to a number */
export function fromHex(hex: string): number {
  return Number.parseInt(hex, 16);
}

/**
 * Resolve the latest finalized block number for a chain
 * via the standard `eth_getBlockByNumber` RPC with the `"finalized"` tag.
 */
export async function getFinalizedBlockNumber(client: AlchemyClient, chain: string): Promise<number> {
  const block = await client.jsonRpc<AlchemyBlockResult>(chain, 'eth_getBlockByNumber', ['finalized', false]);
  return fromHex(block.number);
}
