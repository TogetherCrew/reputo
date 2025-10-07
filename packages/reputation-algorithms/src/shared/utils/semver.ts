/**
 * Parsed semantic version interface
 */
export interface ParsedSemVer {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly prerelease: string;
  readonly build: string;
}

/**
 * Parses a semantic version string into its components
 * @param version - Semantic version string (e.g., "1.2.3-beta+build")
 * @returns Parsed version components
 * @throws Error if version format is invalid
 */
function parseSemVer(version: string): ParsedSemVer {
  const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-.]+))?(?:\+([0-9A-Za-z-.]+))?$/;
  const match = version.match(regex);

  if (!match) {
    throw new Error(`Invalid semantic version: ${version}`);
  }

  return {
    major: Number.parseInt(match[1] || '0', 10),
    minor: Number.parseInt(match[2] || '0', 10),
    patch: Number.parseInt(match[3] || '0', 10),
    prerelease: match[4] || '',
    build: match[5] || '',
  };
}

/**
 * Compares two semantic version strings
 * @param a - First version string
 * @param b - Second version string
 * @returns Negative if a < b, positive if a > b, 0 if equal
 */
export function compareSemVer(a: string, b: string): number {
  const aParsed = parseSemVer(a);
  const bParsed = parseSemVer(b);

  if (aParsed.major !== bParsed.major) return aParsed.major - bParsed.major;
  if (aParsed.minor !== bParsed.minor) return aParsed.minor - bParsed.minor;
  if (aParsed.patch !== bParsed.patch) return aParsed.patch - bParsed.patch;

  if (aParsed.prerelease && !bParsed.prerelease) return -1;
  if (!aParsed.prerelease && bParsed.prerelease) return 1;

  if (aParsed.prerelease !== bParsed.prerelease) {
    return aParsed.prerelease < bParsed.prerelease ? -1 : 1;
  }

  return 0;
}
