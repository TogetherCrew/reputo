[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageError

# Class: StorageError

Defined in: [shared/errors/errors.ts:13](https://github.com/TogetherCrew/reputo/blob/a6f073cc8d9883039b44c79167c065391c6b81c1/packages/storage/src/shared/errors/errors.ts#L13)

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

Defined in: [shared/errors/errors.ts:19](https://github.com/TogetherCrew/reputo/blob/a6f073cc8d9883039b44c79167c065391c6b81c1/packages/storage/src/shared/errors/errors.ts#L19)

Creates a new StorageError instance.

#### Parameters

##### message

`string`

Human-readable error message

#### Returns

`StorageError`

#### Overrides

`Error.constructor`
