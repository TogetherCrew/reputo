import type { ValidationResult } from '../types/index.js';

/**
 * Validates algorithm key format
 * Key must be snake_case, start with a letter, and be at least 2 characters long
 */
export function validateKey(key: string): ValidationResult {
  const errors: string[] = [];

  if (!key || key.length < 2) {
    errors.push('Key must be at least 2 characters long');
  }

  const pattern = /^[a-z][a-z0-9_]*$/;
  if (!pattern.test(key)) {
    errors.push(
      'Key must be snake_case, start with a letter, and contain only lowercase letters, numbers, and underscores',
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates semantic version string
 */
export function validateVersion(version: string): ValidationResult {
  const errors: string[] = [];

  if (!version) {
    errors.push('Version is required');
  }

  const pattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;
  if (!pattern.test(version)) {
    errors.push('Version must be a valid semantic version (e.g., 1.0.0, 2.1.3-beta, 3.0.0+build.123)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
