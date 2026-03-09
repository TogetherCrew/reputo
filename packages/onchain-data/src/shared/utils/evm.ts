/**
 * Canonicalize an EVM address to lowercase so the same address
 * cannot produce multiple identities due to mixed-case formatting.
 */
export function canonicalizeEvmAddress(address: string): string {
  return address.toLowerCase();
}
