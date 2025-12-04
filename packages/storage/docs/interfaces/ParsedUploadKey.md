[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ParsedUploadKey

# Interface: ParsedUploadKey

Defined in: [shared/types/types.ts:75](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L75)

Parsed upload key components.
Pattern: `uploads/{timestamp}/{filename}.{ext}`

## Extends

- `ParsedStorageKeyBase`

## Properties

### filename

> **filename**: `string`

Defined in: [shared/types/types.ts:61](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L61)

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

Defined in: [shared/types/types.ts:68](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L68)

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

Defined in: [shared/types/types.ts:76](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L76)

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/types.ts:81](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L81)

Unix timestamp (seconds since epoch) when the key was generated.
