[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / FileTooLargeError

# Class: FileTooLargeError

Defined in: shared/errors/validation.error.ts:27

Error thrown when a file exceeds the maximum allowed size.

This error should be caught by consuming applications and treated
as a user-facing validation error (e.g., 400 Bad Request in HTTP APIs).

## Example

```typescript
try {
  await storage.verifyUpload(key);
} catch (error) {
  if (error instanceof FileTooLargeError) {
    console.log(`File too large. Max: ${error.maxSizeBytes} bytes`);
  }
}
```

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new FileTooLargeError**(`maxSizeBytes`): `FileTooLargeError`

Defined in: shared/errors/validation.error.ts:38

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

Defined in: shared/errors/validation.error.ts:31

Maximum allowed file size in bytes.
