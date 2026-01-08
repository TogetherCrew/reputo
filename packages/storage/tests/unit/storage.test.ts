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

  const testBucket = 'test-bucket';
  const testContentTypeAllowlist = ['text/csv', 'application/json', 'text/plain'];
  const testMaxSizeBytes = 1048576; // 1 MB

  beforeEach(() => {
    // Create a mock S3Client
    mockS3Client = {
      send: vi.fn(),
    } as unknown as S3Client;

    // Reset all mocks
    vi.clearAllMocks();

    // Create Storage instance with S3Client
    storage = new Storage(mockS3Client);
  });

  describe('presignPut', () => {
    it('should generate a presigned upload URL', async () => {
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url';
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      const result = await storage.presignPut({
        bucket: testBucket,
        filename: 'votes.csv',
        contentType: 'text/csv',
        ttl: 3600,
        maxSizeBytes: testMaxSizeBytes,
        contentTypeAllowlist: testContentTypeAllowlist,
      });

      expect(result.url).toBe(mockUrl);
      expect(result.expiresIn).toBe(3600);
      expect(result.key).toMatch(/^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/votes\.csv$/);
      expect(getSignedUrl).toHaveBeenCalledWith(mockS3Client, expect.any(Object), { expiresIn: 3600 });
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      await expect(
        storage.presignPut({
          bucket: testBucket,
          filename: 'document.pdf',
          contentType: 'application/pdf',
          ttl: 3600,
          maxSizeBytes: testMaxSizeBytes,
          contentTypeAllowlist: testContentTypeAllowlist,
        }),
      ).rejects.toThrow(InvalidContentTypeError);
    });

    it('should use filename as-is in the generated key', async () => {
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url';
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      const result = await storage.presignPut({
        bucket: testBucket,
        filename: 'My Data File!.csv',
        contentType: 'text/csv',
        ttl: 3600,
        maxSizeBytes: testMaxSizeBytes,
        contentTypeAllowlist: testContentTypeAllowlist,
      });

      expect(result.key).toMatch(/My Data File!\.csv$/);
    });
  });

  describe('verify', () => {
    it('should verify a valid upload and return metadata', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/votes.csv`;
      const mockHead = {
        ContentLength: 1024,
        ContentType: 'text/csv',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      const result = await storage.verify({
        bucket: testBucket,
        key,
        maxSizeBytes: testMaxSizeBytes,
        contentTypeAllowlist: testContentTypeAllowlist,
      });

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

      await expect(
        storage.verify({
          bucket: testBucket,
          key,
          maxSizeBytes: testMaxSizeBytes,
          contentTypeAllowlist: testContentTypeAllowlist,
        }),
      ).rejects.toThrow(FileTooLargeError);
    });

    it('should throw InvalidContentTypeError for disallowed content type', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/document.pdf`;
      const mockHead = {
        ContentLength: 1024,
        ContentType: 'application/pdf',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      await expect(
        storage.verify({
          bucket: testBucket,
          key,
          maxSizeBytes: testMaxSizeBytes,
          contentTypeAllowlist: testContentTypeAllowlist,
        }),
      ).rejects.toThrow(InvalidContentTypeError);
    });

    it('should throw ObjectNotFoundError if object does not exist', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/missing.csv`;
      const error = new Error('Not Found');
      Object.assign(error, { name: 'NotFound' });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(
        storage.verify({
          bucket: testBucket,
          key,
          maxSizeBytes: testMaxSizeBytes,
          contentTypeAllowlist: testContentTypeAllowlist,
        }),
      ).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw HeadObjectFailedError for other S3 errors', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/votes.csv`;
      const error = new Error('Internal Server Error');

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(
        storage.verify({
          bucket: testBucket,
          key,
          maxSizeBytes: testMaxSizeBytes,
          contentTypeAllowlist: testContentTypeAllowlist,
        }),
      ).rejects.toThrow(HeadObjectFailedError);
    });

    it('should use default content type if not provided by S3', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/data.bin`;
      const mockHead = {
        ContentLength: 512,
        // No ContentType provided
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockHead);

      const result = await storage.verify({
        bucket: testBucket,
        key,
        maxSizeBytes: testMaxSizeBytes,
        contentTypeAllowlist: ['application/octet-stream'],
      });

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

      const result = await storage.presignGet({
        bucket: testBucket,
        key,
        ttl: 900,
      });

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

      await expect(
        storage.presignGet({
          bucket: testBucket,
          key,
          ttl: 900,
        }),
      ).rejects.toThrow(ObjectNotFoundError);
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

      const result = await storage.getObject({
        bucket: testBucket,
        key,
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString('utf-8')).toBe('name,score\nAlice,100\nBob,95\n');
    });

    it('should throw ObjectNotFoundError if object does not exist', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/missing.csv`;
      const error = new Error('No Such Key');
      Object.assign(error, { name: 'NoSuchKey' });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(
        storage.getObject({
          bucket: testBucket,
          key,
        }),
      ).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw ObjectNotFoundError for 404 status code', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/missing.csv`;
      const error = new Error('Not Found');
      Object.assign(error, { $metadata: { httpStatusCode: 404 } });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(
        storage.getObject({
          bucket: testBucket,
          key,
        }),
      ).rejects.toThrow(ObjectNotFoundError);
    });

    it('should propagate other errors', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/votes.csv`;
      const error = new Error('Internal Server Error');

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(
        storage.getObject({
          bucket: testBucket,
          key,
        }),
      ).rejects.toThrow('Internal Server Error');
    });
  });

  describe('putObject', () => {
    it('should write a Buffer to S3', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/data.csv`;
      const buffer = Buffer.from('test data');

      vi.mocked(mockS3Client.send).mockResolvedValue({});

      const result = await storage.putObject({
        bucket: testBucket,
        key,
        body: buffer,
        contentType: 'text/csv',
        contentTypeAllowlist: testContentTypeAllowlist,
      });

      expect(result).toBe(key);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should write a string to S3', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/data.json`;
      const data = '{"name":"test"}';

      vi.mocked(mockS3Client.send).mockResolvedValue({});

      const result = await storage.putObject({
        bucket: testBucket,
        key,
        body: data,
        contentType: 'application/json',
        contentTypeAllowlist: testContentTypeAllowlist,
      });

      expect(result).toBe(key);
      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should write without content type when not provided', async () => {
      const key = 'snapshots/abc123/data.bin';
      const buffer = Buffer.from('binary data');

      vi.mocked(mockS3Client.send).mockResolvedValue({});

      const result = await storage.putObject({
        bucket: testBucket,
        key,
        body: buffer,
      });

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

      await expect(
        storage.putObject({
          bucket: testBucket,
          key,
          body: buffer,
          contentType: 'application/pdf',
          contentTypeAllowlist: testContentTypeAllowlist,
        }),
      ).rejects.toThrow(InvalidContentTypeError);

      expect(mockS3Client.send).not.toHaveBeenCalled();
    });

    it('should write Uint8Array to S3', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const key = `uploads/${uuid}/data.bin`;
      const uint8Array = new Uint8Array([1, 2, 3, 4, 5]);

      vi.mocked(mockS3Client.send).mockResolvedValue({});

      const result = await storage.putObject({
        bucket: testBucket,
        key,
        body: uint8Array,
        contentType: 'text/plain',
        contentTypeAllowlist: testContentTypeAllowlist,
      });

      expect(result).toBe(key);
      expect(mockS3Client.send).toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should accept S3Client via constructor', () => {
      const customStorage = new Storage(mockS3Client);
      expect(customStorage).toBeInstanceOf(Storage);
    });

    it('should use injected S3Client instance', async () => {
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url';
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      await storage.presignPut({
        bucket: testBucket,
        filename: 'test.csv',
        contentType: 'text/csv',
        ttl: 3600,
        maxSizeBytes: testMaxSizeBytes,
        contentTypeAllowlist: testContentTypeAllowlist,
      });

      expect(getSignedUrl).toHaveBeenCalledWith(mockS3Client, expect.any(Object), expect.any(Object));
    });
  });
});
