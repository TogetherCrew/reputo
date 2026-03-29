const HEX_BLOCK_PATTERN = /^0x[0-9a-f]+$/i;

export function normalizeHexBlock(block: string | number | bigint): string {
  const normalizedValue = typeof block === 'string' ? block.trim().toLowerCase() : BigInt(block).toString(16);
  const normalizedInput = normalizedValue.startsWith('0x') ? normalizedValue : `0x${normalizedValue}`;

  if (!HEX_BLOCK_PATTERN.test(normalizedInput)) {
    throw new Error(`Invalid hex block value: ${String(block)}`);
  }

  const hexDigits = normalizedInput.slice(2).replace(/^0+/, '');
  return `0x${hexDigits || '0'}`;
}

export function compareHexBlocks(left: string | number | bigint, right: string | number | bigint): number {
  const leftValue = BigInt(normalizeHexBlock(left));
  const rightValue = BigInt(normalizeHexBlock(right));

  if (leftValue === rightValue) {
    return 0;
  }

  return leftValue < rightValue ? -1 : 1;
}
