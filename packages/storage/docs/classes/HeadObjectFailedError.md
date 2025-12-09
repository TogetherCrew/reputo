[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / HeadObjectFailedError

# Class: HeadObjectFailedError

Defined in: [shared/errors/errors.ts:109](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/storage/src/shared/errors/errors.ts#L109)

Error thrown when a HEAD request to S3 fails for reasons other than 404.

This typically indicates a transient S3 error or permission issue.
Applications should catch this and return an appropriate HTTP 500 response
or handle it according to their error handling strategy.

## Extends

- [`StorageError`](StorageError.md)

## Constructors

### Constructor

> **new HeadObjectFailedError**(`key?`): `HeadObjectFailedError`

Defined in: [shared/errors/errors.ts:115](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/storage/src/shared/errors/errors.ts#L115)

Creates a new HeadObjectFailedError instance.

#### Parameters

##### key?

`string`

Optional S3 key for which the HEAD request failed

#### Returns

`HeadObjectFailedError`

#### Overrides

[`StorageError`](StorageError.md).[`constructor`](StorageError.md#constructor)
