[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotOutputs

# Interface: SnapshotOutputs

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:12](https://github.com/TogetherCrew/reputo/blob/a6f073cc8d9883039b44c79167c065391c6b81c1/packages/database/src/shared/types/Snapshot.interface.ts#L12)

Algorithm execution outputs/results.

Keys are algorithm-specific (e.g., 'voting_engagement', 'csv').
Values are typically file paths or storage location references.

## Indexable

\[`key`: `string`\]: `string` \| `undefined`
