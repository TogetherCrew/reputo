[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / generateSnapshotInputKey

# Function: generateSnapshotInputKey()

> **generateSnapshotInputKey**(`snapshotId`, `inputName`, `ext`): `string`

Defined in: [shared/utils/keys.ts:119](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/utils/keys.ts#L119)

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
