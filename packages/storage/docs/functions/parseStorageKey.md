[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / parseStorageKey

# Function: parseStorageKey()

> **parseStorageKey**(`key`): [`ParsedStorageKey`](../interfaces/ParsedStorageKey.md)

Defined in: [shared/utils/keys.ts:115](https://github.com/TogetherCrew/reputo/blob/b52b09933f6992c7fe8484f1101d0b76fee97141/packages/storage/src/shared/utils/keys.ts#L115)

Parses a storage key into its component parts.

Expects keys in the format: `uploads/{timestamp}/{filename}.{ext}`

## Parameters

### key

`string`

S3 key to parse

## Returns

[`ParsedStorageKey`](../interfaces/ParsedStorageKey.md)

Parsed key components

## Throws

If the key format is invalid

## Example

```typescript
parseStorageKey('uploads/1732147200/votes.csv')
// Returns: {
//   filename: 'votes.csv',
//   ext: 'csv',
//   timestamp: 1732147200
// }
```
