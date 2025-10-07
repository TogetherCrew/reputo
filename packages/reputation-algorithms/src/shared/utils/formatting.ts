/**
 * Converts snake_case algorithm key to Title Case display name
 * @param key - Algorithm key in snake_case (e.g., "user_activity")
 * @returns Title Case display name (e.g., "User Activity")
 */
export function keyToDisplayName(key: string): string {
  return key
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
