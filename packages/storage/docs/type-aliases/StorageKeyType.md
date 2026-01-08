[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageKeyType

# Type Alias: StorageKeyType

> **StorageKeyType** = `"upload"` \| `"snapshot"`

Defined in: [shared/types/types.ts:13](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L13)

Types of storage keys supported by the system.

- 'upload': User-uploaded files (`uploads/{uuid}/{filename}.{ext}`)
- 'snapshot': Snapshot files (`snapshots/{snapshotId}/{filename}.{ext}`)
