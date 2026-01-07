[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ObjectNotFoundError

# Class: ObjectNotFoundError

Defined in: [shared/errors/errors.ts:89](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/errors/errors.ts#L89)

Error thrown when an object is not found in S3.

This typically indicates a 404 response from S3.
Applications should catch this and return an appropriate HTTP 404 response
or handle it according to their error handling strategy.

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new ObjectNotFoundError**(`key?`): `ObjectNotFoundError`

Defined in: [shared/errors/errors.ts:95](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/errors/errors.ts#L95)

Creates a new ObjectNotFoundError instance.

#### Parameters

##### key?

`string`

Optional S3 key that was not found

#### Returns

`ObjectNotFoundError`

#### Overrides

[`StorageError`](StorageError.md).[`constructor`](StorageError.md#constructor)
