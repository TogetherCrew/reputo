[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageError

# Class: StorageError

Defined in: [shared/errors/errors.ts:13](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/errors/errors.ts#L13)

Base error class for all storage-related errors.
Extends the standard Error class with proper name and stack trace.

## Extends

- `Error`

## Extended by

- [`FileTooLargeError`](FileTooLargeError.md)
- [`InvalidContentTypeError`](InvalidContentTypeError.md)
- [`ObjectNotFoundError`](ObjectNotFoundError.md)
- [`HeadObjectFailedError`](HeadObjectFailedError.md)
- [`InvalidStorageKeyError`](InvalidStorageKeyError.md)

## Constructors

### Constructor

> **new StorageError**(`message`): `StorageError`

Defined in: [shared/errors/errors.ts:19](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/errors/errors.ts#L19)

Creates a new StorageError instance.

#### Parameters

##### message

`string`

Human-readable error message

#### Returns

`StorageError`

#### Overrides

`Error.constructor`
