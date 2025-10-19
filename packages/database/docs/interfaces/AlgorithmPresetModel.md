[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / AlgorithmPresetModel

# Interface: AlgorithmPresetModel

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:42](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L42)

Interface extending Mongoose Model with additional methods for AlgorithmPreset.

## Extends

- `Model`\<[`AlgorithmPreset`](AlgorithmPreset.md)\>

## Constructors

### Constructor

> **new AlgorithmPresetModel**\<`DocType`\>(`doc?`, `fields?`, `options?`): `Document`\<`unknown`, \{ \}, [`AlgorithmPreset`](AlgorithmPreset.md), \{ \}, \{ \}\> & [`AlgorithmPreset`](AlgorithmPreset.md) & `object` & `object`

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:42](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L42)

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

> **paginate**: (`filter`, `options`) => `Promise`\<`unknown`\>

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:44](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L44)

Pagination method for querying presets

#### Parameters

##### filter

`object`

##### options

`object`

#### Returns

`Promise`\<`unknown`\>
