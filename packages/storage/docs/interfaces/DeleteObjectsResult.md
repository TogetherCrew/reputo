[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / DeleteObjectsResult

# Interface: DeleteObjectsResult

Defined in: [shared/types/types.ts:326](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/storage/src/shared/types/types.ts#L326)

Result from a batch delete operation.

## Properties

### deleted

> **deleted**: `string`[]

Defined in: [shared/types/types.ts:330](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/storage/src/shared/types/types.ts#L330)

Keys that were successfully deleted.

***

### errors

> **errors**: `object`[]

Defined in: [shared/types/types.ts:335](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/storage/src/shared/types/types.ts#L335)

Keys that failed to delete, with error messages.

#### key

> **key**: `string`

#### message

> **message**: `string`
