[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ParsedSnapshotInputKey

# Interface: ParsedSnapshotInputKey

Defined in: [shared/types/types.ts:88](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L88)

Parsed snapshot input key components.
Pattern: `snapshots/{snapshotId}/inputs/{inputName}.{ext}`

## Extends

- `ParsedStorageKeyBase`

## Properties

### filename

> **filename**: `string`

Defined in: [shared/types/types.ts:61](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L61)

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

Defined in: [shared/types/types.ts:68](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L68)

File extension without the dot.

#### Example

```ts
'csv'
```

#### Inherited from

`ParsedStorageKeyBase.ext`

***

### type

> **type**: `"snapshot-input"`

Defined in: [shared/types/types.ts:89](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L89)

***

### snapshotId

> **snapshotId**: `string`

Defined in: [shared/types/types.ts:94](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L94)

Unique identifier of the snapshot.

***

### inputName

> **inputName**: `string`

Defined in: [shared/types/types.ts:99](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L99)

Logical input name (e.g., 'votes', 'users').
