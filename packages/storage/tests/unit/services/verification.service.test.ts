import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VerificationConfig } from '../../../src/config/index.js';
import type { StorageProvider } from '../../../src/providers/storage.provider.js';
import { VerificationService } from '../../../src/services/verification.service.js';
import {
  FileTooLargeError,
  HeadObjectFailedError,
  InvalidContentTypeError,
  ObjectNotFoundError,
} from '../../../src/shared/errors/index.js';

describe('VerificationService', () => {
  let service: VerificationService;
  let mockProvider: StorageProvider;
  let config: VerificationConfig;

  beforeEach(() => {
    mockProvider = {
      getMetadata: vi.fn(),
      createUploadUrl: vi.fn(),
      createDownloadUrl: vi.fn(),
      read: vi.fn(),
      write: vi.fn(),
    };

    config = {
      maxFileSizeBytes: 1048576,
      allowedContentTypes: ['text/csv', 'application/json', 'text/plain'],
    };

    service = new VerificationService(mockProvider, config);
    vi.clearAllMocks();
  });

  describe('verifyUpload', () => {
    it('should verify valid upload and return metadata', async () => {
      vi.mocked(mockProvider.getMetadata).mockResolvedValue({
        size: 1024,
        contentType: 'text/csv',
        lastModified: undefined,
        etag: undefined,
      });

      const result = await service.verifyUpload('uploads/1704067200/votes.csv');

      expect(result.key).toBe('uploads/1704067200/votes.csv');
      expect(result.metadata).toEqual({
        filename: 'votes.csv',
        ext: 'csv',
        size: 1024,
        contentType: 'text/csv',
        timestamp: 1704067200,
      });
    });

    it('should throw FileTooLargeError if file exceeds max size', async () => {
      vi.mocked(mockProvider.getMetadata).mockResolvedValue({
        size: 2097152,
        contentType: 'text/csv',
        lastModified: undefined,
        etag: undefined,
      });

      await expect(service.verifyUpload('uploads/1704067200/large.csv')).rejects.toThrow(FileTooLargeError);
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      vi.mocked(mockProvider.getMetadata).mockResolvedValue({
        size: 1024,
        contentType: 'application/pdf',
        lastModified: undefined,
        etag: undefined,
      });

      await expect(service.verifyUpload('uploads/1704067200/document.pdf')).rejects.toThrow(InvalidContentTypeError);
    });

    it('should throw ObjectNotFoundError when provider returns error', async () => {
      vi.mocked(mockProvider.getMetadata).mockRejectedValue(new ObjectNotFoundError('key'));

      await expect(service.verifyUpload('missing-key')).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw HeadObjectFailedError for provider errors', async () => {
      vi.mocked(mockProvider.getMetadata).mockRejectedValue(new HeadObjectFailedError('key'));

      await expect(service.verifyUpload('key')).rejects.toThrow(HeadObjectFailedError);
    });

    it('should use default content type when not provided', async () => {
      vi.mocked(mockProvider.getMetadata).mockResolvedValue({
        size: 512,
        contentType: 'application/octet-stream',
        lastModified: undefined,
        etag: undefined,
      });

      const storageWithBinary = new VerificationService(mockProvider, {
        maxFileSizeBytes: 1048576,
        allowedContentTypes: ['application/octet-stream'],
      });

      const result = await storageWithBinary.verifyUpload('uploads/1704067200/data.bin');

      expect(result.metadata.contentType).toBe('application/octet-stream');
    });
  });
});
