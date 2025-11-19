[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ObjectNotFoundError

# Class: ObjectNotFoundError

Defined in: shared/errors/operation.error.ts:28

Error thrown when an object is not found in S3.

This typically indicates a 404 response from S3.
Consuming applications should catch this and decide how to represent
the missing object (e.g., as a 404 HTTP response or a failed workflow step).

## Example

```typescript
try {
  await storage.getObject('non-existent-key');
} catch (error) {
  if (error instanceof ObjectNotFoundError) {
    console.log('Object not found in S3');
  }
}
```

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new ObjectNotFoundError**(`key?`): `ObjectNotFoundError`

Defined in: shared/errors/operation.error.ts:39

Creates a new ObjectNotFoundError instance.

#### Parameters

##### key?

`string`

Optional S3 key that was not found

#### Returns

`ObjectNotFoundError`

#### Overrides

[`StorageError`](StorageError.md).[`constructor`](StorageError.md#constructor)

## Properties

### key

> `readonly` **key**: `string` \| `undefined`

Defined in: shared/errors/operation.error.ts:32

The S3 key that was not found.
