import type { S3Client } from '@aws-sdk/client-s3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { S3Provider } from '../../../src/providers/index.js';
import { HeadObjectFailedError, ObjectNotFoundError } from '../../../src/shared/errors/index.js';

vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');

describe('S3Provider', () => {
  let provider: S3Provider;
  let mockS3Client: S3Client;

  beforeEach(() => {
    mockS3Client = {
      send: vi.fn(),
    } as unknown as S3Client;

    vi.clearAllMocks();

    provider = new S3Provider({
      client: mockS3Client,
      bucket: 'test-bucket',
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for existing object', async () => {
      const mockResponse = {
        ContentLength: 1024,
        ContentType: 'text/csv',
        LastModified: new Date('2024-01-01'),
        ETag: '"abc123"',
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockResponse);

      const result = await provider.getMetadata('uploads/123/file.csv');

      expect(result).toEqual({
        size: 1024,
        contentType: 'text/csv',
        lastModified: mockResponse.LastModified,
        etag: '"abc123"',
      });
    });

    it('should use default content type when not provided', async () => {
      const mockResponse = {
        ContentLength: 512,
      };

      vi.mocked(mockS3Client.send).mockResolvedValue(mockResponse);

      const result = await provider.getMetadata('uploads/123/file.bin');

      expect(result.contentType).toBe('application/octet-stream');
    });

    it('should throw ObjectNotFoundError for 404 errors', async () => {
      const error = new Error('Not Found');
      Object.assign(error, { name: 'NotFound' });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(provider.getMetadata('missing-key')).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw ObjectNotFoundError for NoSuchKey errors', async () => {
      const error = new Error('No Such Key');
      Object.assign(error, { name: 'NoSuchKey' });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(provider.getMetadata('missing-key')).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw ObjectNotFoundError for 404 status code', async () => {
      const error = new Error('Not Found');
      Object.assign(error, { $metadata: { httpStatusCode: 404 } });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(provider.getMetadata('missing-key')).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw HeadObjectFailedError for other errors', async () => {
      const error = new Error('Access Denied');
      Object.assign(error, { $metadata: { httpStatusCode: 403 } });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(provider.getMetadata('key')).rejects.toThrow(HeadObjectFailedError);
    });
  });

  describe('createUploadUrl', () => {
    it('should generate presigned upload URL', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/upload-url';
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      const result = await provider.createUploadUrl('uploads/123/file.csv', 'text/csv', 3600);

      expect(result).toBe(mockUrl);
      expect(getSignedUrl).toHaveBeenCalled();
    });
  });

  describe('createDownloadUrl', () => {
    it('should generate presigned download URL', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/download-url';
      vi.mocked(getSignedUrl).mockResolvedValue(mockUrl);

      const result = await provider.createDownloadUrl('uploads/123/file.csv', 900);

      expect(result).toBe(mockUrl);
      expect(getSignedUrl).toHaveBeenCalled();
    });
  });

  describe('read', () => {
    it('should read object and return Buffer', async () => {
      const mockBody = {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from('chunk1');
          yield Buffer.from('chunk2');
        },
      };

      vi.mocked(mockS3Client.send).mockResolvedValue({ Body: mockBody });

      const result = await provider.read('uploads/123/file.csv');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('chunk1chunk2');
    });

    it('should throw ObjectNotFoundError for missing object', async () => {
      const error = new Error('No Such Key');
      Object.assign(error, { name: 'NoSuchKey' });

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(provider.read('missing-key')).rejects.toThrow(ObjectNotFoundError);
    });

    it('should throw HeadObjectFailedError for other errors', async () => {
      const error = new Error('Network Error');

      vi.mocked(mockS3Client.send).mockRejectedValue(error);

      await expect(provider.read('key')).rejects.toThrow(HeadObjectFailedError);
    });
  });

  describe('write', () => {
    it('should write object to S3', async () => {
      vi.mocked(mockS3Client.send).mockResolvedValue({});

      await provider.write('uploads/123/file.csv', Buffer.from('data'), 'text/csv');

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should write without content type', async () => {
      vi.mocked(mockS3Client.send).mockResolvedValue({});

      await provider.write('uploads/123/file.bin', Buffer.from('data'));

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });
  });
});
