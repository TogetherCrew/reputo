[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / InvalidStorageKeyError

# Class: InvalidStorageKeyError

Defined in: [shared/errors/errors.ts:128](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/errors/errors.ts#L128)

Error thrown when a storage key has an invalid format.

This indicates the key doesn't match the expected structure
(e.g., 'uploads/{timestamp}/{filename}.{ext}').

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new InvalidStorageKeyError**(`key`, `reason?`): `InvalidStorageKeyError`

Defined in: [shared/errors/errors.ts:140](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/errors/errors.ts#L140)

Creates a new InvalidStorageKeyError instance.

#### Parameters

##### key

`string`

The invalid storage key

##### reason?

`string`

Optional reason why the key is invalid

#### Returns

`InvalidStorageKeyError`

#### Overrides

[`StorageError`](StorageError.md).[`constructor`](StorageError.md#constructor)

## Properties

### key

> `readonly` **key**: `string`

Defined in: [shared/errors/errors.ts:132](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/errors/errors.ts#L132)

The invalid key that was provided.
