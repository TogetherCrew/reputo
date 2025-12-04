[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / generateSnapshotOutputKey

# Function: generateSnapshotOutputKey()

> **generateSnapshotOutputKey**(`snapshotId`, `algorithmKey`, `ext`): `string`

Defined in: [shared/utils/keys.ts:142](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/utils/keys.ts#L142)

Generates an S3 key for a snapshot output file.

The generated key follows the pattern: `snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`

## Parameters

### snapshotId

`string`

Unique identifier of the snapshot

### algorithmKey

`string`

Algorithm key that produces this output (e.g., 'voting_engagement')

### ext

`string` = `'csv'`

File extension without the dot (defaults to 'csv')

## Returns

`string`

S3 key path

## Example

```typescript
generateSnapshotOutputKey('abc123', 'voting_engagement')
// Returns: 'snapshots/abc123/outputs/voting_engagement.csv'

generateSnapshotOutputKey('abc123', 'results', 'json')
// Returns: 'snapshots/abc123/outputs/results.json'
```
