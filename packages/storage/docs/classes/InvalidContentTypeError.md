[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / InvalidContentTypeError

# Class: InvalidContentTypeError

Defined in: shared/errors/errors.ts:57

Error thrown when a file's content type is not in the allowlist.

Applications should catch this and return an appropriate HTTP 400 response
or handle it according to their error handling strategy.

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new InvalidContentTypeError**(`contentType`, `allowedTypes`): `InvalidContentTypeError`

Defined in: shared/errors/errors.ts:74

Creates a new InvalidContentTypeError instance.

#### Parameters

##### contentType

`string`

The content type that was rejected

##### allowedTypes

`string`[]

List of allowed content types

#### Returns

`InvalidContentTypeError`

#### Overrides

[`StorageError`](StorageError.md).[`constructor`](StorageError.md#constructor)

## Properties

### contentType

> `readonly` **contentType**: `string`

Defined in: shared/errors/errors.ts:61

The content type that was rejected.

***

### allowedTypes

> `readonly` **allowedTypes**: `string`[]

Defined in: shared/errors/errors.ts:66

List of allowed content types.
