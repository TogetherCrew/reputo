[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / AlgorithmPresetModel

# Interface: AlgorithmPresetModel

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:40](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L40)

Interface extending Mongoose Model with additional methods for AlgorithmPreset.

## Extends

- `Model`\<[`AlgorithmPreset`](AlgorithmPreset.md)\>

## Constructors

### Constructor

> **new AlgorithmPresetModel**\<`DocType`\>(`doc?`, `fields?`, `options?`): `Document`\<`unknown`, \{ \}, [`AlgorithmPreset`](AlgorithmPreset.md), \{ \}, \{ \}\> & [`AlgorithmPreset`](AlgorithmPreset.md) & `object` & `object`

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:40](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L40)

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

> **paginate**: (`filter`, `options`) => `Promise`\<[`PaginateResult`](PaginateResult.md)\<`Document`\<`unknown`, \{ \}, [`AlgorithmPreset`](AlgorithmPreset.md), \{ \}, \{ \}\> & [`AlgorithmPreset`](AlgorithmPreset.md) & `object` & `object`\>\>

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:42](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L42)

Pagination method for querying presets

#### Parameters

##### filter

`FilterQuery`\<[`AlgorithmPreset`](AlgorithmPreset.md)\>

##### options

[`PaginateOptions`](PaginateOptions.md)

#### Returns

`Promise`\<[`PaginateResult`](PaginateResult.md)\<`Document`\<`unknown`, \{ \}, [`AlgorithmPreset`](AlgorithmPreset.md), \{ \}, \{ \}\> & [`AlgorithmPreset`](AlgorithmPreset.md) & `object` & `object`\>\>
