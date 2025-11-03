import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { S3Client } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { StorageService } from '../../../src/storage/storage.service'
import {
    FileTooLargeException,
    HeadObjectFailedException,
    InvalidContentTypeException,
    ObjectNotFoundException,
} from '../../../src/shared/exceptions'
import type { S3Error } from '../../../src/shared/interfaces'

vi.mock('@aws-sdk/client-s3', () => ({
    S3Client: vi.fn(),
    PutObjectCommand: vi.fn(),
    GetObjectCommand: vi.fn(),
    HeadObjectCommand: vi.fn(),
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: vi.fn(),
}))

describe('StorageService', () => {
    let service: StorageService
    let mockS3Client: S3Client
    let mockConfigService: ConfigService

    beforeEach(async () => {
        vi.clearAllMocks()

        mockS3Client = {
            send: vi.fn(),
        } as unknown as S3Client

        mockConfigService = {
            get: vi.fn((key: string) => {
                const config: Record<string, string | number> = {
                    'storage.bucket': 'test-bucket',
                    'storage.presignPutTtl': 3600,
                    'storage.presignGetTtl': 900,
                    'storage.maxSizeBytes': 10485760,
                    'storage.contentTypeAllowlist': 'text/csv,text/plain',
                }
                return config[key]
            }),
        } as unknown as ConfigService

        service = new StorageService(mockS3Client, mockConfigService)
    })

    describe('presignPut', () => {
        it('should generate presigned upload URL with valid content type', async () => {
            const contentType = 'text/csv'
            const mockUrl = 'https://s3.amazonaws.com/presigned-put-url'

            const { getSignedUrl } = await import(
                '@aws-sdk/s3-request-presigner'
            )
            vi.mocked(getSignedUrl).mockResolvedValue(mockUrl)

            const result = await service.presignPut(contentType)

            expect(result).toHaveProperty('key')
            expect(result).toHaveProperty('url')
            expect(result).toHaveProperty('expiresIn')
            expect(result.url).toBe(mockUrl)
            expect(result.expiresIn).toBe(3600)
            expect(result.key).toMatch(/\.csv$/)
            expect(getSignedUrl).toHaveBeenCalledOnce()
        })

        it('should generate presigned upload URL for text/plain', async () => {
            const contentType = 'text/plain'
            const mockUrl = 'https://s3.amazonaws.com/presigned-put-url-txt'

            const { getSignedUrl } = await import(
                '@aws-sdk/s3-request-presigner'
            )
            vi.mocked(getSignedUrl).mockResolvedValue(mockUrl)

            const result = await service.presignPut(contentType)

            expect(result.url).toBe(mockUrl)
            expect(result.expiresIn).toBe(3600)
            expect(result.key).toMatch(/\.txt$/)
        })

        it('should throw InvalidContentTypeException for disallowed content type', async () => {
            const contentType = 'application/pdf'

            const promise = service.presignPut(contentType)

            await expect(promise).rejects.toBeInstanceOf(
                InvalidContentTypeException
            )
            await expect(promise).rejects.toThrow(/contentType not allowed/i)
        })

        it('should throw InvalidContentTypeException for empty content type', async () => {
            const contentType = ''

            const promise = service.presignPut(contentType)

            await expect(promise).rejects.toBeInstanceOf(
                InvalidContentTypeException
            )
        })
    })

    describe('verifyUpload', () => {
        it('should return metadata when object exists and is valid', async () => {
            const key = 'uploads/2025/11/03/test-file.csv'
            const mockHeadResponse = {
                ContentLength: 5242880,
                ContentType: 'text/csv',
            }

            mockS3Client.send = vi.fn().mockResolvedValue(mockHeadResponse)

            const result = await service.verifyUpload(key)

            expect(mockS3Client.send).toHaveBeenCalledOnce()
            expect(result).toEqual({
                key,
                size: 5242880,
                contentType: 'text/csv',
            })
        })

        it('should handle text/plain content type', async () => {
            const key = 'uploads/2025/11/03/test-file.txt'
            const mockHeadResponse = {
                ContentLength: 1024,
                ContentType: 'text/plain',
            }

            mockS3Client.send = vi.fn().mockResolvedValue(mockHeadResponse)

            const result = await service.verifyUpload(key)

            expect(result).toEqual({
                key,
                size: 1024,
                contentType: 'text/plain',
            })
        })

        it('should throw ObjectNotFoundException when object does not exist (404)', async () => {
            const key = 'uploads/2025/11/03/non-existent.csv'
            const mockError: S3Error = {
                name: 'NotFound',
                message: 'Not Found',
                $metadata: {
                    httpStatusCode: 404,
                },
            }

            mockS3Client.send = vi.fn().mockRejectedValue(mockError)

            const promise = service.verifyUpload(key)

            await expect(promise).rejects.toBeInstanceOf(
                ObjectNotFoundException
            )
            await expect(promise).rejects.toThrow(/object not found/i)
        })

        it('should throw ObjectNotFoundException when error name is NotFound', async () => {
            const key = 'uploads/2025/11/03/missing.csv'
            const mockError: S3Error = {
                name: 'NotFound',
                message: 'The specified key does not exist',
            }

            mockS3Client.send = vi.fn().mockRejectedValue(mockError)

            const promise = service.verifyUpload(key)

            await expect(promise).rejects.toBeInstanceOf(
                ObjectNotFoundException
            )
        })

        it('should throw FileTooLargeException when file exceeds maxSizeBytes', async () => {
            const key = 'uploads/2025/11/03/large-file.csv'
            const mockHeadResponse = {
                ContentLength: 20971520,
                ContentType: 'text/csv',
            }

            mockS3Client.send = vi.fn().mockResolvedValue(mockHeadResponse)

            const promise = service.verifyUpload(key)

            await expect(promise).rejects.toBeInstanceOf(FileTooLargeException)
            await expect(promise).rejects.toThrow(/file too large/i)
        })

        it('should throw InvalidContentTypeException when content type not allowed', async () => {
            const key = 'uploads/2025/11/03/file.pdf'
            const mockHeadResponse = {
                ContentLength: 1024,
                ContentType: 'application/pdf',
            }

            mockS3Client.send = vi.fn().mockResolvedValue(mockHeadResponse)

            const promise = service.verifyUpload(key)

            await expect(promise).rejects.toBeInstanceOf(
                InvalidContentTypeException
            )
            await expect(promise).rejects.toThrow(/contentType not allowed/i)
        })

        it('should throw HeadObjectFailedException on other S3 errors', async () => {
            const key = 'uploads/2025/11/03/error-file.csv'
            const mockError = {
                name: 'InternalError',
                message: 'Internal Server Error',
                $metadata: {
                    httpStatusCode: 500,
                },
            }

            mockS3Client.send = vi.fn().mockRejectedValue(mockError)

            const promise = service.verifyUpload(key)

            await expect(promise).rejects.toBeInstanceOf(
                HeadObjectFailedException
            )
            await expect(promise).rejects.toThrow(
                /Failed to check object metadata/i
            )
        })

        it('should default to 0 size when ContentLength is undefined', async () => {
            const key = 'uploads/2025/11/03/file.csv'
            const mockHeadResponse = {
                ContentType: 'text/csv',
            }

            mockS3Client.send = vi.fn().mockResolvedValue(mockHeadResponse)

            const result = await service.verifyUpload(key)

            expect(result.size).toBe(0)
        })

        it('should default to application/octet-stream when ContentType is undefined', async () => {
            const key = 'uploads/2025/11/03/file.csv'
            const mockHeadResponse = {
                ContentLength: 1024,
            }

            mockS3Client.send = vi.fn().mockResolvedValue(mockHeadResponse)

            const promise = service.verifyUpload(key)

            await expect(promise).rejects.toBeInstanceOf(
                InvalidContentTypeException
            )
        })
    })

    describe('presignGet', () => {
        it('should generate presigned download URL when object exists', async () => {
            const key = 'uploads/2025/11/03/file.csv'
            const mockHeadResponse = {
                ContentLength: 1024,
                ContentType: 'text/csv',
            }
            const mockUrl = 'https://s3.amazonaws.com/presigned-get-url'

            mockS3Client.send = vi.fn().mockResolvedValue(mockHeadResponse)

            const { getSignedUrl } = await import(
                '@aws-sdk/s3-request-presigner'
            )
            vi.mocked(getSignedUrl).mockResolvedValue(mockUrl)

            const result = await service.presignGet(key)

            expect(mockS3Client.send).toHaveBeenCalledOnce()
            expect(result).toEqual({
                url: mockUrl,
                expiresIn: 900,
            })
            expect(getSignedUrl).toHaveBeenCalledOnce()
        })

        it('should verify object exists before generating download URL', async () => {
            const key = 'uploads/2025/11/03/verified-file.txt'
            const mockHeadResponse = {
                ContentLength: 2048,
                ContentType: 'text/plain',
            }
            const mockUrl = 'https://s3.amazonaws.com/presigned-get-url-2'

            mockS3Client.send = vi.fn().mockResolvedValue(mockHeadResponse)

            const { getSignedUrl } = await import(
                '@aws-sdk/s3-request-presigner'
            )
            vi.mocked(getSignedUrl).mockResolvedValue(mockUrl)

            const result = await service.presignGet(key)

            expect(result.url).toBe(mockUrl)
            expect(result.expiresIn).toBe(900)
        })

        it('should throw ObjectNotFoundException when object does not exist (404)', async () => {
            const key = 'uploads/2025/11/03/missing-file.csv'
            const mockError: S3Error = {
                name: 'NotFound',
                message: 'Not Found',
                $metadata: {
                    httpStatusCode: 404,
                },
            }

            mockS3Client.send = vi.fn().mockRejectedValue(mockError)

            const promise = service.presignGet(key)

            await expect(promise).rejects.toBeInstanceOf(
                ObjectNotFoundException
            )
            await expect(promise).rejects.toThrow(/object not found/i)
        })

        it('should throw ObjectNotFoundException when error name is NotFound', async () => {
            const key = 'uploads/2025/11/03/not-found.csv'
            const mockError: S3Error = {
                name: 'NotFound',
            }

            mockS3Client.send = vi.fn().mockRejectedValue(mockError)

            const promise = service.presignGet(key)

            await expect(promise).rejects.toBeInstanceOf(
                ObjectNotFoundException
            )
        })

        it('should throw HeadObjectFailedException on other S3 errors', async () => {
            const key = 'uploads/2025/11/03/error-file.csv'
            const mockError = {
                name: 'ServiceUnavailable',
                message: 'Service is temporarily unavailable',
                $metadata: {
                    httpStatusCode: 503,
                },
            }

            mockS3Client.send = vi.fn().mockRejectedValue(mockError)

            const promise = service.presignGet(key)

            await expect(promise).rejects.toBeInstanceOf(
                HeadObjectFailedException
            )
            await expect(promise).rejects.toThrow(
                /Failed to check object metadata/i
            )
        })

        it('should throw HeadObjectFailedException on network errors', async () => {
            const key = 'uploads/2025/11/03/network-error.csv'
            const mockError = new Error('Network timeout')

            mockS3Client.send = vi.fn().mockRejectedValue(mockError)

            const promise = service.presignGet(key)

            await expect(promise).rejects.toBeInstanceOf(
                HeadObjectFailedException
            )
        })
    })
})

