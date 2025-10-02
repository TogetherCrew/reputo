import { describe, expect, it } from 'vitest';
import { compareSemVer } from '../../../src/build/gen-registry';

describe('Build: Registry Generator', () => {
  describe('compareSemVer', () => {
    it('should sort versions in ascending order', () => {
      const versions = ['2.0.0', '1.0.0', '1.5.0', '1.0.1'];
      const sorted = [...versions].sort(compareSemVer);
      expect(sorted).toEqual(['1.0.0', '1.0.1', '1.5.0', '2.0.0']);
    });

    it('should handle prerelease versions', () => {
      const versions = ['1.0.0', '1.0.0-beta', '1.0.0-alpha'];
      const sorted = [...versions].sort(compareSemVer);
      expect(sorted).toEqual(['1.0.0-alpha', '1.0.0-beta', '1.0.0']);
    });

    it('should handle build metadata', () => {
      const versions = ['1.0.0+build.2', '1.0.0+build.1', '1.0.0'];
      const sorted = [...versions].sort(compareSemVer);
      // Build metadata should not affect sorting
      expect(sorted[sorted.length - 1]).toBe('1.0.0');
    });

    it('should compare major versions correctly', () => {
      expect(compareSemVer('2.0.0', '1.0.0')).toBeGreaterThan(0);
      expect(compareSemVer('1.0.0', '2.0.0')).toBeLessThan(0);
    });

    it('should compare minor versions correctly', () => {
      expect(compareSemVer('1.2.0', '1.1.0')).toBeGreaterThan(0);
      expect(compareSemVer('1.1.0', '1.2.0')).toBeLessThan(0);
    });

    it('should compare patch versions correctly', () => {
      expect(compareSemVer('1.0.2', '1.0.1')).toBeGreaterThan(0);
      expect(compareSemVer('1.0.1', '1.0.2')).toBeLessThan(0);
    });

    it('should return 0 for equal versions', () => {
      expect(compareSemVer('1.0.0', '1.0.0')).toBe(0);
    });
  });
});
