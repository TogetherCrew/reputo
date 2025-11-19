[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / InvalidContentTypeError

# Class: InvalidContentTypeError

Defined in: shared/errors/validation.error.ts:63

Error thrown when a file's content type is not in the allowlist.

This error should be caught by consuming applications and treated
as a user-facing validation error (e.g., 400 Bad Request in HTTP APIs).

## Example

```typescript
try {
  await storage.presignPut('file.exe', 'application/x-msdownload');
} catch (error) {
  if (error instanceof InvalidContentTypeError) {
    console.log(`Invalid type: ${error.contentType}`);
    console.log(`Allowed: ${error.allowedTypes.join(', ')}`);
  }
}
```

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new InvalidContentTypeError**(`contentType`, `allowedTypes`): `InvalidContentTypeError`

Defined in: shared/errors/validation.error.ts:80

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

Defined in: shared/errors/validation.error.ts:67

The content type that was rejected.

***

### allowedTypes

> `readonly` **allowedTypes**: readonly `string`[]

Defined in: shared/errors/validation.error.ts:72

List of allowed content types.
