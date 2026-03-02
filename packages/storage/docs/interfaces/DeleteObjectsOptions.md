[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / DeleteObjectsOptions

# Interface: DeleteObjectsOptions

Defined in: [shared/types/types.ts:311](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L311)

Options for deleting multiple objects from S3.

## Properties

### bucket

> **bucket**: `string`

Defined in: [shared/types/types.ts:315](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L315)

S3 bucket name where the objects are stored.

***

### keys

> **keys**: `string`[]

Defined in: [shared/types/types.ts:320](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L320)

Array of S3 keys to delete.
