[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotModel

# Interface: SnapshotModel

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:40](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L40)

Interface extending Mongoose Model with additional methods for Snapshot.

## Extends

- `Model`\<[`Snapshot`](Snapshot.md)\>

## Constructors

### Constructor

> **new SnapshotModel**\<`DocType`\>(`doc?`, `fields?`, `options?`): `Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:40](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L40)

#### Parameters

##### doc?

`DocType`

##### fields?

`any`

##### options?

`boolean` | `AnyObject`

#### Returns

`Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`

#### Inherited from

`Model<Snapshot>.constructor`

## Properties

### paginate()

> **paginate**: (`filter`, `options`) => `Promise`\<`unknown`\>

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:42](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L42)

Pagination method for querying snapshots

#### Parameters

##### filter

`object`

##### options

`object`

#### Returns

`Promise`\<`unknown`\>
