/**
 * @reputo/storage/services/verification
 *
 * Service for verifying uploaded files.
 */

import type { VerificationConfig } from '../config/index.js';
import type { StorageProvider } from '../providers/storage.provider.js';
import { parseStorageKey } from '../shared/utils/keys.js';
import { validateContentType, validateFileSize } from '../shared/validators/index.js';
import type { VerificationResult } from './verification.types.js';

/**
 * Service for verifying uploaded files.
 *
 * Validates that uploaded files meet size and content-type requirements.
 */
export class VerificationService {
  /**
   * Creates a new VerificationService instance.
   *
   * @param provider - Storage provider implementation
   * @param config - Verification configuration
   */
  constructor(
    private readonly provider: StorageProvider,
    private readonly config: VerificationConfig,
  ) {}

  /**
   * Verifies that an uploaded file meets size and content-type requirements.
   *
   * @param key - Storage key of the uploaded object
   * @returns Verification result with metadata
   * @throws {ObjectNotFoundError} If the object doesn't exist
   * @throws {HeadObjectFailedError} If metadata retrieval fails
   * @throws {FileTooLargeError} If file exceeds max size
   * @throws {InvalidContentTypeError} If content type is not allowed
   */
  async verifyUpload(key: string): Promise<VerificationResult> {
    const providerMeta = await this.provider.getMetadata(key);

    validateFileSize(providerMeta.size, this.config.maxFileSizeBytes);
    validateContentType(providerMeta.contentType, this.config.allowedContentTypes);

    const { filename, ext, timestamp } = parseStorageKey(key);

    return {
      key,
      metadata: {
        filename,
        ext,
        size: providerMeta.size,
        contentType: providerMeta.contentType,
        timestamp,
      },
    };
  }
}
