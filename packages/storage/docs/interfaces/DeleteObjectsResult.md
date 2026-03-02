[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / DeleteObjectsResult

# Interface: DeleteObjectsResult

Defined in: [shared/types/types.ts:326](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L326)

Result from a batch delete operation.

## Properties

### deleted

> **deleted**: `string`[]

Defined in: [shared/types/types.ts:330](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L330)

Keys that were successfully deleted.

***

### errors

> **errors**: `object`[]

Defined in: [shared/types/types.ts:335](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L335)

Keys that failed to delete, with error messages.

#### key

> **key**: `string`

#### message

> **message**: `string`
