[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / VerificationConfig

# Interface: VerificationConfig

Defined in: config/verification.config.ts:12

Configuration for upload verification operations.

This config controls how uploaded files are validated.

## Properties

### maxFileSizeBytes

> **maxFileSizeBytes**: `number`

Defined in: config/verification.config.ts:19

Maximum allowed file size in bytes.
Files exceeding this size will be rejected during verification.

#### Example

```ts
104857600 // 100 MB
```

***

### allowedContentTypes

> **allowedContentTypes**: `string`[]

Defined in: config/verification.config.ts:27

Allowed content types (MIME types) for uploads.
Only files with these content types will pass verification.

#### Example

```ts
['text/csv', 'application/json', 'text/plain']
```
