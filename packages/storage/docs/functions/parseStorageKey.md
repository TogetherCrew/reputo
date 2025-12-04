[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / parseStorageKey

# Function: parseStorageKey()

> **parseStorageKey**(`key`): [`ParsedStorageKey`](../type-aliases/ParsedStorageKey.md)

Defined in: [shared/utils/keys.ts:228](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/utils/keys.ts#L228)

Parses a storage key into its component parts.

Supports all key patterns:
- Uploads: `uploads/{timestamp}/{filename}.{ext}`
- Snapshot inputs: `snapshots/{snapshotId}/inputs/{inputName}.{ext}`
- Snapshot outputs: `snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`

## Parameters

### key

`string`

S3 key to parse

## Returns

[`ParsedStorageKey`](../type-aliases/ParsedStorageKey.md)

Parsed key components with type discrimination

## Throws

If the key format is invalid

## Example

```typescript
parseStorageKey('uploads/1732147200/votes.csv')
// Returns: {
//   type: 'upload',
//   filename: 'votes.csv',
//   ext: 'csv',
//   timestamp: 1732147200
// }

parseStorageKey('snapshots/abc123/inputs/votes.csv')
// Returns: {
//   type: 'snapshot-input',
//   filename: 'votes.csv',
//   ext: 'csv',
//   snapshotId: 'abc123',
//   inputName: 'votes'
// }

parseStorageKey('snapshots/abc123/outputs/voting_engagement.csv')
// Returns: {
//   type: 'snapshot-output',
//   filename: 'voting_engagement.csv',
//   ext: 'csv',
//   snapshotId: 'abc123',
//   algorithmKey: 'voting_engagement'
// }
```
