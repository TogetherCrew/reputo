[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / FileTooLargeError

# Class: FileTooLargeError

Defined in: shared/errors/errors.ts:33

Error thrown when a file exceeds the maximum allowed size.

Applications should catch this and return an appropriate HTTP 400 response
or handle it according to their error handling strategy.

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new FileTooLargeError**(`maxSizeBytes`): `FileTooLargeError`

Defined in: shared/errors/errors.ts:44

Creates a new FileTooLargeError instance.

#### Parameters

##### maxSizeBytes

`number`

The maximum allowed file size in bytes

#### Returns

`FileTooLargeError`

#### Overrides

[`StorageError`](StorageError.md).[`constructor`](StorageError.md#constructor)

## Properties

### maxSizeBytes

> `readonly` **maxSizeBytes**: `number`

Defined in: shared/errors/errors.ts:37

Maximum allowed file size in bytes.
