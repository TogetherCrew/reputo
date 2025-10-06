import type { AlgorithmKey } from '../types/index.js';

/**
 * Converts snake_case algorithm key to Title Case display name
 * @param key - Algorithm key in snake_case (e.g., "user_activity")
 * @returns Title Case display name (e.g., "User Activity")
 */
export function keyToDisplayName(key: AlgorithmKey): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts Title Case name to snake_case key
 * @param name - Title Case name (e.g., "User Activity")
 * @returns snake_case key (e.g., "user_activity")
 */
export function displayNameToKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}
