[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ParsedUploadKey

# Interface: ParsedUploadKey

Defined in: [shared/types/types.ts:169](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L169)

Parsed upload key components.
Pattern: `uploads/{uuid}/{filename}.{ext}`

## Extends

- `ParsedStorageKeyBase`

## Properties

### filename

> **filename**: `string`

Defined in: [shared/types/types.ts:155](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L155)

Full filename including extension.

#### Example

```ts
'data.csv'
```

#### Inherited from

`ParsedStorageKeyBase.filename`

***

### ext

> **ext**: `string`

Defined in: [shared/types/types.ts:162](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L162)

File extension without the dot.

#### Example

```ts
'csv'
```

#### Inherited from

`ParsedStorageKeyBase.ext`

***

### type

> **type**: `"upload"`

Defined in: [shared/types/types.ts:170](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L170)

***

### uuid

> **uuid**: `string`

Defined in: [shared/types/types.ts:175](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L175)

UUID v4 identifier for the upload.
