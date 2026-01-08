[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / generateKey

# Function: generateKey()

> **generateKey**(`type`, `id`, `filename`): `string`

Defined in: [shared/utils/keys.ts:33](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/utils/keys.ts#L33)

Generates an S3 storage key.

## Parameters

### type

Type of key to generate ('upload' or 'snapshot')

`"upload"` | `"snapshot"`

### id

`string`

Unique identifier (UUID for uploads, snapshotId for snapshots)

### filename

`string`

Filename (should include extension if needed, e.g., 'data.csv')

## Returns

`string`

S3 key path

## Example

```typescript
// Upload key with UUID
generateKey('upload', randomUUID(), 'data.csv')
// Returns: 'uploads/{uuid}/data.csv'

// Snapshot key
generateKey('snapshot', 'abc123', 'voting_engagement.csv')
// Returns: 'snapshots/abc123/voting_engagement.csv'
```
