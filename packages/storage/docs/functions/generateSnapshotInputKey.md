[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / generateSnapshotInputKey

# Function: generateSnapshotInputKey()

> **generateSnapshotInputKey**(`snapshotId`, `inputName`, `ext`): `string`

Defined in: [shared/utils/keys.ts:119](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/utils/keys.ts#L119)

Generates an S3 key for a snapshot input file.

The generated key follows the pattern: `snapshots/{snapshotId}/inputs/{inputName}.{ext}`

## Parameters

### snapshotId

`string`

Unique identifier of the snapshot

### inputName

`string`

Logical input name (e.g., 'votes', 'users')

### ext

`string` = `'csv'`

File extension without the dot (defaults to 'csv')

## Returns

`string`

S3 key path

## Example

```typescript
generateSnapshotInputKey('abc123', 'votes')
// Returns: 'snapshots/abc123/inputs/votes.csv'

generateSnapshotInputKey('abc123', 'config', 'json')
// Returns: 'snapshots/abc123/inputs/config.json'
```
