[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ParsedSnapshotKey

# Interface: ParsedSnapshotKey

Defined in: [shared/types/types.ts:182](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L182)

Parsed snapshot key components.
Pattern: `snapshots/{snapshotId}/{filename}.{ext}`

## Extends

- `ParsedStorageKeyBase`

## Properties

### filename

> **filename**: `string`

Defined in: [shared/types/types.ts:155](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L155)

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

Defined in: [shared/types/types.ts:162](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L162)

File extension without the dot.

#### Example

```ts
'csv'
```

#### Inherited from

`ParsedStorageKeyBase.ext`

***

### type

> **type**: `"snapshot"`

Defined in: [shared/types/types.ts:183](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L183)

***

### snapshotId

> **snapshotId**: `string`

Defined in: [shared/types/types.ts:188](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L188)

Unique identifier of the snapshot.
