[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / detectKeyType

# Function: detectKeyType()

> **detectKeyType**(`key`): [`StorageKeyType`](../type-aliases/StorageKeyType.md) \| `null`

Defined in: [shared/utils/keys.ts:58](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/utils/keys.ts#L58)

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
detectKeyType('uploads/{uuid}/votes.csv')
// Returns: 'upload'

detectKeyType('snapshots/abc123/voting_engagement.csv')
// Returns: 'snapshot'

detectKeyType('unknown/path/file.txt')
// Returns: null
```
