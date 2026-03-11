const HEX_BLOCK_PATTERN = /^0x[0-9a-f]+$/i;
const HEX_BLOCK_SORT_KEY_LENGTH = 64;

export function normalizeHexBlock(block: string | number | bigint): string {
  const normalizedInput = typeof block === 'string' ? block.trim().toLowerCase() : `0x${BigInt(block).toString(16)}`;

  if (!HEX_BLOCK_PATTERN.test(normalizedInput)) {
    throw new Error(`Invalid hex block value: ${String(block)}`);
  }

  const hexDigits = normalizedInput.slice(2).replace(/^0+/, '');
  return `0x${hexDigits || '0'}`;
}

export function compareHexBlocks(left: string, right: string): number {
  const leftValue = BigInt(normalizeHexBlock(left));
  const rightValue = BigInt(normalizeHexBlock(right));

  if (leftValue === rightValue) {
    return 0;
  }

  return leftValue < rightValue ? -1 : 1;
}

export function createHexBlockSortKey(block: string): string {
  return normalizeHexBlock(block).slice(2).padStart(HEX_BLOCK_SORT_KEY_LENGTH, '0');
}
