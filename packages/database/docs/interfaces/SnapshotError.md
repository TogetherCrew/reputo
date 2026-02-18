[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotError

# Interface: SnapshotError

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:19](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/database/src/shared/types/Snapshot.interface.ts#L19)

Error information captured when a snapshot execution fails.

## Indexable

\[`key`: `string`\]: `unknown`

Additional error context

## Properties

### message

> **message**: `string`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:21](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/database/src/shared/types/Snapshot.interface.ts#L21)

Error message describing what went wrong

***

### timestamp?

> `optional` **timestamp**: `string`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:23](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/database/src/shared/types/Snapshot.interface.ts#L23)

Timestamp when the error occurred
