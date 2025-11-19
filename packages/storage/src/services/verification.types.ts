/**
 * @reputo/storage/services/verification.types
 *
 * Type definitions for upload verification.
 */

import type { ObjectMetadata } from './storage-io.types.js';

/**
 * Result from verifying an uploaded file.
 */
export interface VerificationResult {
  /**
   * Storage key of the verified object.
   */
  key: string;

  /**
   * Complete metadata about the verified object.
   */
  metadata: ObjectMetadata;
}
