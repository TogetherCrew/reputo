[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageKeyType

# Type Alias: StorageKeyType

> **StorageKeyType** = `"upload"` \| `"snapshot"`

Defined in: [shared/types/types.ts:13](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L13)

Types of storage keys supported by the system.

- 'upload': User-uploaded files (`uploads/{uuid}/{filename}.{ext}`)
- 'snapshot': Snapshot files (`snapshots/{snapshotId}/{filename}.{ext}`)
