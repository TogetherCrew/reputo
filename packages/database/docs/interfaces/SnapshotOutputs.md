[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotOutputs

# Interface: SnapshotOutputs

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:12](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/database/src/shared/types/Snapshot.interface.ts#L12)

Algorithm execution outputs/results.

Keys are algorithm-specific (e.g., 'voting_engagement', 'csv').
Values are typically file paths or storage location references.

## Indexable

\[`key`: `string`\]: `string` \| `undefined`
