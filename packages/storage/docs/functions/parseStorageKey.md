[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / parseStorageKey

# Function: parseStorageKey()

> **parseStorageKey**(`key`): [`ParsedStorageKey`](../type-aliases/ParsedStorageKey.md)

Defined in: [shared/utils/keys.ts:100](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/utils/keys.ts#L100)

Parses a storage key into its component parts.

Supports key patterns:
- Uploads: `uploads/{uuid}/{filename}.{ext}`
- Snapshots: `snapshots/{snapshotId}/{filename}.{ext}`

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
parseStorageKey('uploads/{uuid}/votes.csv')
// Returns: {
//   type: 'upload',
//   filename: 'votes.csv',
//   ext: 'csv',
//   uuid: '{uuid}'
// }

parseStorageKey('snapshots/abc123/voting_engagement.csv')
// Returns: {
//   type: 'snapshot',
//   filename: 'voting_engagement.csv',
//   ext: 'csv',
//   snapshotId: 'abc123'
// }
```
