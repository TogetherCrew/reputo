[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / InvalidStorageKeyError

# Class: InvalidStorageKeyError

Defined in: shared/errors/validation.error.ts:105

Error thrown when a storage key has an invalid format.

This indicates the key doesn't match the expected structure
(e.g., 'uploads/{timestamp}/{filename}.{ext}').

## Example

```typescript
try {
  parseStorageKey('invalid-key');
} catch (error) {
  if (error instanceof InvalidStorageKeyError) {
    console.log(`Invalid key: ${error.key}`);
  }
}
```

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new InvalidStorageKeyError**(`key`, `reason?`): `InvalidStorageKeyError`

Defined in: shared/errors/validation.error.ts:117

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

Defined in: shared/errors/validation.error.ts:109

The invalid key that was provided.
