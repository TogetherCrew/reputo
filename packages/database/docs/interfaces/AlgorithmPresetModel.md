[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / AlgorithmPresetModel

# Interface: AlgorithmPresetModel

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:45](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L45)

Interface extending Mongoose Model with additional methods for AlgorithmPreset.

## Extends

- `Model`\<[`AlgorithmPreset`](AlgorithmPreset.md)\>

## Constructors

### Constructor

> **new AlgorithmPresetModel**\<`DocType`\>(`doc?`, `fields?`, `options?`): `Document`\<`unknown`, \{ \}, [`AlgorithmPreset`](AlgorithmPreset.md), \{ \}, \{ \}\> & [`AlgorithmPreset`](AlgorithmPreset.md) & `object` & `object`

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:45](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L45)

#### Parameters

##### doc?

`DocType`

##### fields?

`any`

##### options?

`boolean` | `AnyObject`

#### Returns

`Document`\<`unknown`, \{ \}, [`AlgorithmPreset`](AlgorithmPreset.md), \{ \}, \{ \}\> & [`AlgorithmPreset`](AlgorithmPreset.md) & `object` & `object`

#### Inherited from

`Model<AlgorithmPreset>.constructor`

## Properties

### paginate()

> **paginate**: (`filter`, `options`) => `Promise`\<[`PaginateResult`](PaginateResult.md)\<[`AlgorithmPresetDoc`](../type-aliases/AlgorithmPresetDoc.md)\>\>

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:47](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L47)

Pagination method for querying presets

#### Parameters

##### filter

`FilterQuery`\<[`AlgorithmPreset`](AlgorithmPreset.md)\>

##### options

[`PaginateOptions`](PaginateOptions.md)

#### Returns

`Promise`\<[`PaginateResult`](PaginateResult.md)\<[`AlgorithmPresetDoc`](../type-aliases/AlgorithmPresetDoc.md)\>\>
