[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotOutputs

# Interface: SnapshotOutputs

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:12](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/interfaces/Snapshot.interface.ts#L12)

Algorithm execution outputs/results.

Keys are algorithm-specific (e.g., 'voting_engagement', 'csv').
Values are typically file paths or storage location references.

## Indexable

\[`key`: `string`\]: `string` \| `undefined`
