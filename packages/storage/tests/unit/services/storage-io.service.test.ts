import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StorageIOConfig } from '../../../src/config/index.js';
import type { StorageProvider } from '../../../src/providers/storage.provider.js';
import { StorageIOService } from '../../../src/services/storage-io.service.js';
import { InvalidContentTypeError } from '../../../src/shared/errors/index.js';

describe('StorageIOService', () => {
  let service: StorageIOService;
  let mockProvider: StorageProvider;
  let config: StorageIOConfig;

  beforeEach(() => {
    mockProvider = {
      getMetadata: vi.fn(),
      createUploadUrl: vi.fn(),
      createDownloadUrl: vi.fn(),
      read: vi.fn(),
      write: vi.fn(),
    };

    config = {
      uploadTtlSeconds: 3600,
      downloadTtlSeconds: 900,
      maxFileSizeBytes: 1048576,
      allowedContentTypes: ['text/csv', 'application/json', 'text/plain'],
    };

    service = new StorageIOService(mockProvider, config);
    vi.clearAllMocks();
  });

  describe('generateUploadUrl', () => {
    it('should generate upload URL with valid content type', async () => {
      const mockUrl = 'https://bucket.s3.amazonaws.com/upload-url';
      vi.mocked(mockProvider.createUploadUrl).mockResolvedValue(mockUrl);

      const result = await service.generateUploadUrl('votes.csv', 'text/csv');

      expect(result.url).toBe(mockUrl);
      expect(result.expiresIn).toBe(3600);
      expect(result.key).toMatch(/^uploads\/\d+\/votes\.csv$/);
      expect(mockProvider.createUploadUrl).toHaveBeenCalledWith(
        expect.stringMatching(/^uploads\/\d+\/votes\.csv$/),
        'text/csv',
        3600,
      );
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      await expect(service.generateUploadUrl('file.pdf', 'application/pdf')).rejects.toThrow(InvalidContentTypeError);
      expect(mockProvider.createUploadUrl).not.toHaveBeenCalled();
    });

    it('should sanitize filename in generated key', async () => {
      const mockUrl = 'https://bucket.s3.amazonaws.com/upload-url';
      vi.mocked(mockProvider.createUploadUrl).mockResolvedValue(mockUrl);

      const result = await service.generateUploadUrl('My Data File!.csv', 'text/csv');

      expect(result.key).toMatch(/My-Data-File\.csv$/);
    });
  });

  describe('generateDownloadUrl', () => {
    it('should generate download URL with metadata', async () => {
      const mockUrl = 'https://bucket.s3.amazonaws.com/download-url';
      vi.mocked(mockProvider.getMetadata).mockResolvedValue({
        size: 2048,
        contentType: 'text/csv',
        lastModified: undefined,
        etag: undefined,
      });
      vi.mocked(mockProvider.createDownloadUrl).mockResolvedValue(mockUrl);

      const result = await service.generateDownloadUrl('uploads/1704067200/votes.csv');

      expect(result.url).toBe(mockUrl);
      expect(result.expiresIn).toBe(900);
      expect(result.metadata).toEqual({
        filename: 'votes.csv',
        ext: 'csv',
        size: 2048,
        contentType: 'text/csv',
        timestamp: 1704067200,
      });
    });

    it('should throw error when provider fails', async () => {
      const { ObjectNotFoundError } = await import('../../../src/shared/errors/index.js');
      vi.mocked(mockProvider.getMetadata).mockRejectedValue(new ObjectNotFoundError('key'));

      await expect(service.generateDownloadUrl('missing-key')).rejects.toThrow(ObjectNotFoundError);
    });
  });

  describe('readObject', () => {
    it('should read object from provider', async () => {
      const mockBuffer = Buffer.from('test data');
      vi.mocked(mockProvider.read).mockResolvedValue(mockBuffer);

      const result = await service.readObject('uploads/123/file.csv');

      expect(result).toBe(mockBuffer);
      expect(mockProvider.read).toHaveBeenCalledWith('uploads/123/file.csv');
    });
  });

  describe('writeObject', () => {
    it('should write object with valid content type', async () => {
      vi.mocked(mockProvider.write).mockResolvedValue();

      const result = await service.writeObject('uploads/123/file.csv', Buffer.from('data'), 'text/csv');

      expect(result).toBe('uploads/123/file.csv');
      expect(mockProvider.write).toHaveBeenCalledWith('uploads/123/file.csv', Buffer.from('data'), 'text/csv');
    });

    it('should write object without content type', async () => {
      vi.mocked(mockProvider.write).mockResolvedValue();

      const result = await service.writeObject('uploads/123/file.bin', Buffer.from('data'));

      expect(result).toBe('uploads/123/file.bin');
      expect(mockProvider.write).toHaveBeenCalledWith('uploads/123/file.bin', Buffer.from('data'), undefined);
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      await expect(service.writeObject('file.pdf', Buffer.from('data'), 'application/pdf')).rejects.toThrow(
        InvalidContentTypeError,
      );
      expect(mockProvider.write).not.toHaveBeenCalled();
    });
  });
});
