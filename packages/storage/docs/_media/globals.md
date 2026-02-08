[**@reputo/storage v0.0.0**](README.md)

***

# @reputo/storage v0.0.0

## Classes

- [StorageError](classes/StorageError.md)
- [FileTooLargeError](classes/FileTooLargeError.md)
- [InvalidContentTypeError](classes/InvalidContentTypeError.md)
- [ObjectNotFoundError](classes/ObjectNotFoundError.md)
- [HeadObjectFailedError](classes/HeadObjectFailedError.md)
- [InvalidStorageKeyError](classes/InvalidStorageKeyError.md)
- [Storage](classes/Storage.md)

## Interfaces

- [S3ClientConfig](interfaces/S3ClientConfig.md)
- [PresignPutOptions](interfaces/PresignPutOptions.md)
- [PresignGetOptions](interfaces/PresignGetOptions.md)
- [VerifyOptions](interfaces/VerifyOptions.md)
- [GetObjectOptions](interfaces/GetObjectOptions.md)
- [PutObjectOptions](interfaces/PutObjectOptions.md)
- [ParsedUploadKey](interfaces/ParsedUploadKey.md)
- [ParsedSnapshotKey](interfaces/ParsedSnapshotKey.md)
- [~~LegacyParsedStorageKey~~](interfaces/LegacyParsedStorageKey.md)
- [StorageMetadata](interfaces/StorageMetadata.md)
- [PresignedUpload](interfaces/PresignedUpload.md)
- [PresignedDownload](interfaces/PresignedDownload.md)

## Type Aliases

- [StorageKeyType](type-aliases/StorageKeyType.md)
- [ParsedStorageKey](type-aliases/ParsedStorageKey.md)

## Functions

- [createS3Client](functions/createS3Client.md)
- [generateKey](functions/generateKey.md)
- [detectKeyType](functions/detectKeyType.md)
- [parseStorageKey](functions/parseStorageKey.md)
