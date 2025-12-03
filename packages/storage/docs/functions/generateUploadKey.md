[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / generateUploadKey

# Function: generateUploadKey()

> **generateUploadKey**(`filename`, `contentType`, `now`): `string`

Defined in: [shared/utils/keys.ts:88](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/utils/keys.ts#L88)

Generates an S3 key for uploading a file.

The generated key follows the pattern: `uploads/{timestamp}/{sanitized-filename}.{ext}`
- timestamp: Unix timestamp in seconds
- sanitized-filename: Cleaned version of the original filename
- ext: File extension derived from content type

## Parameters

### filename

`string`

Original filename (e.g., 'my data.csv')

### contentType

`string`

MIME type (e.g., 'text/csv')

### now

`Date` = `...`

Optional Date object for timestamp generation (defaults to current time)

## Returns

`string`

S3 key path

## Example

```typescript
generateUploadKey('votes.csv', 'text/csv')
// Returns: 'uploads/1732147200/votes.csv'

generateUploadKey('My Data File.csv', 'text/csv', new Date('2024-01-01'))
// Returns: 'uploads/1704067200/My-Data-File.csv'
```
