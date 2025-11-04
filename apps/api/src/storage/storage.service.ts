import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateUploadKey, parseStorageKey } from '../shared';
import {
  FileTooLargeException,
  HeadObjectFailedException,
  InvalidContentTypeException,
  ObjectNotFoundException,
  StorageConfigurationException,
} from '../shared/exceptions';
import { PresignedDownload, PresignedUpload, S3Error, StorageMetadata } from '../shared/interfaces';
import { S3_CLIENT } from './providers';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly presignPutTtl: number;
  private readonly presignGetTtl: number;
  private readonly maxSizeBytes: number;
  private readonly contentTypeAllowlist: Set<string>;

  constructor(
    @Inject(S3_CLIENT) s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = s3Client;
    this.bucket = this.configService.get<string>('storage.bucket') as string;
    this.presignPutTtl = this.configService.get<number>('storage.presignPutTtl') as number;
    this.presignGetTtl = this.configService.get<number>('storage.presignGetTtl') as number;
    this.maxSizeBytes = this.configService.get<number>('storage.maxSizeBytes') as number;

    const allowlistString = this.configService.get<string>('storage.contentTypeAllowlist') as string;
    this.contentTypeAllowlist = new Set(allowlistString.split(',').map((s) => s.trim()));
  }

  async presignPut(filename: string, contentType: string): Promise<PresignedUpload> {
    this.validateContentType(contentType);

    const key = generateUploadKey(filename, contentType);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.presignPutTtl,
    });

    return { key, url, expiresIn: this.presignPutTtl };
  }

  async verifyUpload(key: string): Promise<StorageMetadata> {
    const head = await this.getObjectMetadata(key);

    const size = head.ContentLength ?? 0;
    const contentType = head.ContentType ?? 'application/octet-stream';

    this.validateFileSize(size);
    this.validateContentType(contentType);

    const { filename, ext, timestamp } = parseStorageKey(key);

    return {
      key,
      metadata: {
        filename,
        ext,
        size,
        contentType,
        timestamp,
      },
    };
  }

  async presignGet(key: string): Promise<PresignedDownload> {
    const head = await this.getObjectMetadata(key);

    const size = head.ContentLength ?? 0;
    const contentType = head.ContentType ?? 'application/octet-stream';
    const { filename, ext, timestamp } = parseStorageKey(key);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.presignGetTtl,
    });

    return {
      url,
      expiresIn: this.presignGetTtl,
      metadata: {
        filename,
        ext,
        size,
        contentType,
        timestamp,
      },
    };
  }

  private validateFileSize(size: number): void {
    if (size > this.maxSizeBytes) {
      throw new FileTooLargeException(this.maxSizeBytes);
    }
  }

  private validateContentType(contentType: string): void {
    if (!this.contentTypeAllowlist.has(contentType)) {
      throw new InvalidContentTypeException(contentType, [...this.contentTypeAllowlist]);
    }
  }

  private async getObjectMetadata(key: string) {
    try {
      return await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error: unknown) {
      const s3Error = error as S3Error;

      if (s3Error.name === 'NotFound' || s3Error.$metadata?.httpStatusCode === 404) {
        throw new ObjectNotFoundException();
      }

      throw new HeadObjectFailedException();
    }
  }
}
