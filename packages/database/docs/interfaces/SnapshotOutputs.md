[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotOutputs

# Interface: SnapshotOutputs

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:12](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L12)

Algorithm execution outputs/results.

Keys are algorithm-specific (e.g., 'voting_engagement', 'csv').
Values are typically file paths or storage location references.

## Indexable

\[`key`: `string`\]: `string` \| `undefined`
