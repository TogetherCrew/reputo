import type { S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FileTooLargeError,
  HeadObjectFailedError,
  InvalidContentTypeError,
  ObjectNotFoundError,
  type PresignedDownload,
  type PresignedUpload,
  Storage,
  type StorageMetadata,
} from '@reputo/storage';
import {
  FileTooLargeException,
  HeadObjectFailedException,
  InvalidContentTypeException,
  ObjectNotFoundException,
} from '../shared/exceptions';
import { S3_CLIENT } from './providers';

@Injectable()
export class StorageService {
  private readonly storage: Storage;

  constructor(@Inject(S3_CLIENT) s3Client: S3Client, configService: ConfigService) {
    this.storage = new Storage(
      {
        bucket: configService.get<string>('storage.bucket') as string,
        presignPutTtl: configService.get<number>('storage.presignPutTtl') as number,
        presignGetTtl: configService.get<number>('storage.presignGetTtl') as number,
        maxSizeBytes: configService.get<number>('storage.maxSizeBytes') as number,
        contentTypeAllowlist: (configService.get<string>('storage.contentTypeAllowlist') as string)
          .split(',')
          .map((s) => s.trim()),
      },
      s3Client,
    );
  }

  async presignPut(filename: string, contentType: string): Promise<PresignedUpload> {
    try {
      return await this.storage.presignPut(filename, contentType);
    } catch (error) {
      this.handleStorageError(error);
    }
  }

  async verifyUpload(key: string): Promise<{ key: string; metadata: StorageMetadata }> {
    try {
      return await this.storage.verifyUpload(key);
    } catch (error) {
      this.handleStorageError(error);
    }
  }

  async presignGet(key: string): Promise<PresignedDownload> {
    try {
      if (key.startsWith('uploads/')) {
        return await this.storage.presignGet(key);
      }

      return await this.storage.presignGetForKey(key);
    } catch (error) {
      this.handleStorageError(error);
    }
  }

  async getObjectMetadata(key: string): Promise<StorageMetadata> {
    try {
      const result = await this.storage.verifyUpload(key);
      return result.metadata;
    } catch (error) {
      this.handleStorageError(error);
    }
  }

  async getObject(key: string): Promise<Buffer> {
    try {
      return await this.storage.getObject(key);
    } catch (error) {
      this.handleStorageError(error);
    }
  }

  private handleStorageError(error: unknown): never {
    if (error instanceof FileTooLargeError) {
      throw new FileTooLargeException(error.maxSizeBytes);
    }
    if (error instanceof InvalidContentTypeError) {
      throw new InvalidContentTypeException(error.contentType, error.allowedTypes);
    }
    if (error instanceof ObjectNotFoundError) {
      throw new ObjectNotFoundException();
    }
    if (error instanceof HeadObjectFailedError) {
      throw new HeadObjectFailedException();
    }
    throw error;
  }
}
