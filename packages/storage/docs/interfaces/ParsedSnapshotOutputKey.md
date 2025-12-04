[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ParsedSnapshotOutputKey

# Interface: ParsedSnapshotOutputKey

Defined in: [shared/types/types.ts:106](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L106)

Parsed snapshot output key components.
Pattern: `snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`

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

> **type**: `"snapshot-output"`

Defined in: [shared/types/types.ts:107](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L107)

***

### snapshotId

> **snapshotId**: `string`

Defined in: [shared/types/types.ts:112](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L112)

Unique identifier of the snapshot.

***

### algorithmKey

> **algorithmKey**: `string`

Defined in: [shared/types/types.ts:117](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L117)

Algorithm key that produced this output (e.g., 'voting_engagement').
