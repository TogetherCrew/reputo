[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / detectKeyType

# Function: detectKeyType()

> **detectKeyType**(`key`): [`StorageKeyType`](../type-aliases/StorageKeyType.md) \| `null`

Defined in: [shared/utils/keys.ts:167](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/utils/keys.ts#L167)

Detects the type of a storage key based on its path prefix.

## Parameters

### key

`string`

S3 key to analyze

## Returns

[`StorageKeyType`](../type-aliases/StorageKeyType.md) \| `null`

The detected key type, or null if the pattern is unrecognized

## Example

```typescript
detectKeyType('uploads/1732147200/votes.csv')
// Returns: 'upload'

detectKeyType('snapshots/abc123/inputs/votes.csv')
// Returns: 'snapshot-input'

detectKeyType('snapshots/abc123/outputs/voting_engagement.csv')
// Returns: 'snapshot-output'

detectKeyType('unknown/path/file.txt')
// Returns: null
```
