[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageKeyType

# Type Alias: StorageKeyType

> **StorageKeyType** = `"upload"` \| `"snapshot-input"` \| `"snapshot-output"`

Defined in: [shared/types/types.ts:14](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L14)

Types of storage keys supported by the system.

- 'upload': User-uploaded files (`uploads/{timestamp}/{filename}.{ext}`)
- 'snapshot-input': Snapshot input files (`snapshots/{snapshotId}/inputs/{inputName}.{ext}`)
- 'snapshot-output': Snapshot output files (`snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`)
