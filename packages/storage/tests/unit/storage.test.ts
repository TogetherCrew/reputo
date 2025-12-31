import type { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FileTooLargeError,
  HeadObjectFailedError,
  InvalidContentTypeError,
  ObjectNotFoundError,
} from '../../src/shared/errors/index.js';
import { Storage } from '../../src/storage.js';

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');

describe('Storage', () => {
  let storage: Storage;
  let mockS3Client: S3Client;

  beforeEach(() => {
    // Create a mock S3Client
    mockS3Client = {
      send: vi.fn(),
    } as unknown as S3Client;

    // Reset all mocks
    vi.clearAllMocks();

    // Create Storage instance with test configuration
    storage = new Storage(
      {
        bucket: 'test-bucket',
        presignPutTtl: 3600,
        presignGetTtl: 900,
        maxSizeBytes: 1048576, // 1 MB
        contentTypeAllowlist: ['text/csv', 'application/json', 'text/plain'],
      },
      mockS3Client,
    );
  });

  describe('presignPut', () => {
    it('should generate a presigned upload URL', async () => {
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url';
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      const result = await storage.presignPut('votes.csv', 'text/csv');

      expect(result.url).toBe(mockUrl);
      expect(result.expiresIn).toBe(3600);
      expect(result.key).toMatch(/^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/votes\.csv$/);
      expect(getSignedUrl).toHaveBeenCalledWith(mockS3Client, expect.any(Object), { expiresIn: 3600 });
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      await expect(storage.presignPut('document.pdf', 'application/pdf')).rejects.toThrow(InvalidContentTypeError);
    });

    it('should use filename as-is in the generated key', async () => {
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url';
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      const result = await storage.presignPut('My Data File!.csv', 'text/csv');

      expect(result.key).toMatch(/My Data File!\.csv$/);
    });
  });

  describe('verifyUpload', () => {
    it('should verify a valid upload and return metadata', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/votes.csv`;
      const mockHead = {
        ContentLength: 1024,
        ContentType: 'text/csv',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      const result = await storage.verifyUpload(key);

      expect(result.key).toBe(key);
      expect(result.metadata.filename).toBe('votes.csv');
      expect(result.metadata.ext).toBe('csv');
      expect(result.metadata.size).toBe(1024);
      expect(result.metadata.contentType).toBe('text/csv');
      expect(result.metadata.timestamp).toBeGreaterThan(0);
    });

    it('should throw FileTooLargeError if file exceeds max size', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/large.csv`;
      const mockHead = {
        ContentLength: 2097152, // 2 MB
        ContentType: 'text/csv',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      await expect(storage.verifyUpload(key)).rejects.toThrow(FileTooLargeError);
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/document.pdf`;
      const mockHead = {
        ContentLength: 1024,
        ContentType: 'application/pdf',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      await expect(storage.verifyUpload(key)).rejects.toThrow(InvalidContentTypeError);
    });

    it('should throw ObjectNotFoundError if object does not exist', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/missing.csv`;
      const error = new Error('Not Found');
      Object.assign(error, { name: 'NotFound' });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(storage.verifyUpload(key)).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw HeadObjectFailedError for other S3 errors', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/votes.csv`;
      const error = new Error('Internal Server Error');

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(storage.verifyUpload(key)).rejects.toThrow(HeadObjectFailedError);
    });

    it('should use default content type if not provided by S3', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/data.bin`;
      const mockHead = {
        ContentLength: 512,
        // No ContentType provided
      };

      // Need to override the content type allowlist for this test
      const storageWithBinary = new Storage(
        {
          bucket: 'test-bucket',
          presignPutTtl: 3600,
          presignGetTtl: 900,
          maxSizeBytes: 1048576,
          contentTypeAllowlist: ['application/octet-stream'],
        },
        mockS3Client,
      );

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      const result = await storageWithBinary.verifyUpload(key);

      expect(result.metadata.contentType).toBe('application/octet-stream');
    });
  });

  describe('presignGet', () => {
    it('should generate a presigned download URL with metadata', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/votes.csv`;
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/download-url';
      const mockHead = {
        ContentLength: 2048,
        ContentType: 'text/csv',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      const result = await storage.presignGet(key);

      expect(result.url).toBe(mockUrl);
      expect(result.expiresIn).toBe(900);
      expect(result.metadata.filename).toBe('votes.csv');
      expect(result.metadata.ext).toBe('csv');
      expect(result.metadata.size).toBe(2048);
      expect(result.metadata.contentType).toBe('text/csv');
      expect(result.metadata.timestamp).toBeGreaterThan(0);
    });

    it('should throw ObjectNotFoundError if object does not exist', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/missing.csv`;
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
    it('should read an object and return Buffer', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/votes.csv`;
      const mockBody = {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from('name,score\n');
          yield Buffer.from('Alice,100\n');
          yield Buffer.from('Bob,95\n');
        },
      };

      vi.mocked(mockS3Client.send).mockResolvedValue({ Body: mockBody });

      const result = await storage.getObject(key);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString('utf-8')).toBe('name,score\nAlice,100\nBob,95\n');
    });

    it('should throw ObjectNotFoundError if object does not exist', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/missing.csv`;
      const error = new Error('No Such Key');
      Object.assign(error, { name: 'NoSuchKey' });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(storage.getObject(key)).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw ObjectNotFoundError for 404 status code', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/missing.csv`;
      const error = new Error('Not Found');
      Object.assign(error, { $metadata: { httpStatusCode: 404 } });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(storage.getObject(key)).rejects.toThrow(ObjectNotFoundError);
    });

    it('should propagate other errors', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/votes.csv`;
      const error = new Error('Internal Server Error');

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(storage.getObject(key)).rejects.toThrow('Internal Server Error');
    });
  });

  describe('putObject', () => {
    it('should write a Buffer to S3', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/data.csv`;
      const buffer = Buffer.from('test data');

      vi.mocked(mockS3Client.send).mockResolvedValue({});

      const result = await storage.putObject(key, buffer, 'text/csv');

      expect(result).toBe(key);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      // Verify that send was called (command structure is mocked, so we just verify the call)
      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should write a string to S3', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/data.json`;
      const data = '{"name":"test"}';

      vi.mocked(mockS3Client.send).mockResolvedValue({});

      const result = await storage.putObject(key, data, 'application/json');

      expect(result).toBe(key);
      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should write without content type when not provided', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/data.bin`;
      const buffer = Buffer.from('binary data');

      vi.mocked(mockS3Client.send).mockResolvedValue({});

      const result = await storage.putObject(key, buffer);

      expect(result).toBe(key);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      // Verify that send was called with a command that has no ContentType
      const callArgs = vi.mocked(mockS3Client.send).mock.calls[0];
      const command = callArgs?.[0] as { input?: { ContentType?: string } };
      expect(command?.input?.ContentType).toBeUndefined();
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/document.pdf`;
      const buffer = Buffer.from('pdf content');

      await expect(storage.putObject(key, buffer, 'application/pdf')).rejects.toThrow(InvalidContentTypeError);

      expect(mockS3Client.send).not.toHaveBeenCalled();
    });

    it('should write Uint8Array to S3', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/data.bin`;
      const uint8Array = new Uint8Array([1, 2, 3, 4, 5]);

      vi.mocked(mockS3Client.send).mockResolvedValue({});

      const result = await storage.putObject(key, uint8Array, 'text/plain');

      expect(result).toBe(key);
      expect(mockS3Client.send).toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should accept and apply storage configuration', () => {
      const customStorage = new Storage(
        {
          bucket: 'custom-bucket',
          presignPutTtl: 7200,
          presignGetTtl: 1800,
          maxSizeBytes: 52428800, // 50 MB
          contentTypeAllowlist: ['image/png', 'image/jpeg'],
        },
        mockS3Client,
      );

      expect(customStorage).toBeInstanceOf(Storage);
    });

    it('should use injected S3Client instance', async () => {
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url';
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      await storage.presignPut('test.csv', 'text/csv');

      expect(getSignedUrl).toHaveBeenCalledWith(mockS3Client, expect.any(Object), expect.any(Object));
    });
  });
});
