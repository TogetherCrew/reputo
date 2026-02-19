[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / DeleteObjectsResult

# Interface: DeleteObjectsResult

Defined in: [shared/types/types.ts:326](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L326)

Result from a batch delete operation.

## Properties

### deleted

> **deleted**: `string`[]

Defined in: [shared/types/types.ts:330](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L330)

Keys that were successfully deleted.

***

### errors

> **errors**: `object`[]

Defined in: [shared/types/types.ts:335](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L335)

Keys that failed to delete, with error messages.

#### key

> **key**: `string`

#### message

> **message**: `string`
