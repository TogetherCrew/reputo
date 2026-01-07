[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageMetadata

# Interface: StorageMetadata

Defined in: [shared/types/types.ts:227](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L227)

Complete metadata about a stored object.
Includes both parsed key information and S3 object metadata.

## Properties

### filename

> **filename**: `string`

Defined in: [shared/types/types.ts:231](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L231)

Full filename including extension.

***

### ext

> **ext**: `string`

Defined in: [shared/types/types.ts:236](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L236)

File extension without the dot.

***

### size

> **size**: `number`

Defined in: [shared/types/types.ts:241](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L241)

Object size in bytes.

***

### contentType

> **contentType**: `string`

Defined in: [shared/types/types.ts:246](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L246)

Content type (MIME type) of the object.

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/types.ts:252](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L252)

Unix timestamp (seconds since epoch) when the metadata was retrieved.
For uploads, this is typically the current time. For snapshots, this is also the current time.
