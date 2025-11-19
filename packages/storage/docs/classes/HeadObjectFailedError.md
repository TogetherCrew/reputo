[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / HeadObjectFailedError

# Class: HeadObjectFailedError

Defined in: shared/errors/operation.error.ts:66

Error thrown when a HEAD request to S3 fails for reasons other than 404.

This typically indicates a transient S3 error or permission issue.
Consuming applications should catch this and map it to an appropriate
internal error, retry mechanism, or failure state for their environment.

## Example

```typescript
try {
  await storage.presignGet(key);
} catch (error) {
  if (error instanceof HeadObjectFailedError) {
    console.log('Failed to retrieve object metadata');
    // Implement retry logic or error reporting
  }
}
```

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new HeadObjectFailedError**(`key?`): `HeadObjectFailedError`

Defined in: shared/errors/operation.error.ts:77

Creates a new HeadObjectFailedError instance.

#### Parameters

##### key?

`string`

Optional S3 key for which the HEAD request failed

#### Returns

`HeadObjectFailedError`

#### Overrides

[`StorageError`](StorageError.md).[`constructor`](StorageError.md#constructor)

## Properties

### key

> `readonly` **key**: `string` \| `undefined`

Defined in: shared/errors/operation.error.ts:70

The S3 key for which the HEAD request failed.
