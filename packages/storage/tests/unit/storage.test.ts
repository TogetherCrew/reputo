import type { S3Client } from '@aws-sdk/client-s3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FileTooLargeError,
  HeadObjectFailedError,
  InvalidContentTypeError,
  ObjectNotFoundError,
} from '../../src/shared/errors/index.js';
import { Storage } from '../../src/storage.js';

vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');

describe('Storage', () => {
  let storage: Storage;
  let mockS3Client: S3Client;

  beforeEach(() => {
    mockS3Client = {
      send: vi.fn(),
    } as unknown as S3Client;

    vi.clearAllMocks();

    storage = new Storage(
      {
        bucket: 'test-bucket',
        presignPutTtl: 3600,
        presignGetTtl: 900,
        maxSizeBytes: 1048576,
        contentTypeAllowlist: ['text/csv', 'application/json', 'text/plain'],
      },
      mockS3Client,
    );
  });

  describe('presignPut', () => {
    it('should delegate to StorageIOService', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url';
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      const result = await storage.presignPut('votes.csv', 'text/csv');

      expect(result.url).toBe(mockUrl);
      expect(result.expiresIn).toBe(3600);
      expect(result.key).toMatch(/^uploads\/\d+\/votes\.csv$/);
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      await expect(storage.presignPut('document.pdf', 'application/pdf')).rejects.toThrow(InvalidContentTypeError);
    });
  });

  describe('verifyUpload', () => {
    it('should delegate to VerificationService', async () => {
      const key = 'uploads/1704067200/votes.csv';
      const mockHead = {
        ContentLength: 1024,
        ContentType: 'text/csv',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      const result = await storage.verifyUpload(key);

      expect(result.key).toBe(key);
      expect(result.metadata).toEqual({
        filename: 'votes.csv',
        ext: 'csv',
        size: 1024,
        contentType: 'text/csv',
        timestamp: 1704067200,
      });
    });

    it('should throw FileTooLargeError if file exceeds max size', async () => {
      const key = 'uploads/1704067200/large.csv';
      const mockHead = {
        ContentLength: 2097152,
        ContentType: 'text/csv',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      await expect(storage.verifyUpload(key)).rejects.toThrow(FileTooLargeError);
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      const key = 'uploads/1704067200/document.pdf';
      const mockHead = {
        ContentLength: 1024,
        ContentType: 'application/pdf',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      await expect(storage.verifyUpload(key)).rejects.toThrow(InvalidContentTypeError);
    });

    it('should throw ObjectNotFoundError if object does not exist', async () => {
      const key = 'uploads/1704067200/missing.csv';
      const error = new Error('Not Found');
      Object.assign(error, { name: 'NotFound' });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(storage.verifyUpload(key)).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw HeadObjectFailedError for other S3 errors', async () => {
      const key = 'uploads/1704067200/votes.csv';
      const error = new Error('Internal Server Error');

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(storage.verifyUpload(key)).rejects.toThrow(HeadObjectFailedError);
    });
  });

  describe('presignGet', () => {
    it('should delegate to StorageIOService', async () => {
      const key = 'uploads/1704067200/votes.csv';
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/download-url';
      const mockHead = {
        ContentLength: 2048,
        ContentType: 'text/csv',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      const result = await storage.presignGet(key);

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

    it('should throw ObjectNotFoundError if object does not exist', async () => {
      const key = 'uploads/1704067200/missing.csv';
      const error = new Error('Not Found');
      Object.assign(error, {
        name: 'NotFound',
        $metadata: { httpStatusCode: 404 },
      });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(storage.presignGet(key)).rejects.toThrow(ObjectNotFoundError);
    });
  });

  describe('getObject', () => {
    it('should delegate to StorageIOService', async () => {
      const key = 'uploads/1704067200/votes.csv';
      const mockBody = {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from('name,score\n');
          yield Buffer.from('Alice,100\n');
        },
      };

      vi.mocked(mockS3Client.send).mockResolvedValue({ Body: mockBody });

      const result = await storage.getObject(key);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString('utf-8')).toBe('name,score\nAlice,100\n');
    });

    it('should throw ObjectNotFoundError if object does not exist', async () => {
      const key = 'uploads/1704067200/missing.csv';
      const error = new Error('No Such Key');
      Object.assign(error, { name: 'NoSuchKey' });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(storage.getObject(key)).rejects.toThrow(ObjectNotFoundError);
    });
  });

  describe('putObject', () => {
    it('should delegate to StorageIOService', async () => {
      const key = 'uploads/1704067200/data.csv';
      const buffer = Buffer.from('test data');

      vi.mocked(mockS3Client.send).mockResolvedValue({});

      const result = await storage.putObject(key, buffer, 'text/csv');

      expect(result).toBe(key);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      const key = 'uploads/1704067200/document.pdf';
      const buffer = Buffer.from('pdf content');

      await expect(storage.putObject(key, buffer, 'application/pdf')).rejects.toThrow(InvalidContentTypeError);

      expect(mockS3Client.send).not.toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should accept and apply storage configuration', () => {
      const customStorage = new Storage(
        {
          bucket: 'custom-bucket',
          presignPutTtl: 7200,
          presignGetTtl: 1800,
          maxSizeBytes: 52428800,
          contentTypeAllowlist: ['image/png', 'image/jpeg'],
        },
        mockS3Client,
      );

      expect(customStorage).toBeInstanceOf(Storage);
    });
  });
});
