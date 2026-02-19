[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / detectKeyType

# Function: detectKeyType()

> **detectKeyType**(`key`): [`StorageKeyType`](../type-aliases/StorageKeyType.md) \| `null`

Defined in: [shared/utils/keys.ts:58](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/utils/keys.ts#L58)

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
