[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotModel

# Interface: SnapshotModel

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:41](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L41)

Interface extending Mongoose Model with additional methods for Snapshot.

## Extends

- `Model`\<[`Snapshot`](Snapshot.md)\>

## Constructors

### Constructor

> **new SnapshotModel**\<`DocType`\>(`doc?`, `fields?`, `options?`): `Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:41](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L41)

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

> **paginate**: (`filter`, `options`) => `Promise`\<[`PaginateResult`](PaginateResult.md)\<`Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`\>\>

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:43](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L43)

Pagination method for querying snapshots

#### Parameters

##### filter

`FilterQuery`\<[`Snapshot`](Snapshot.md)\>

##### options

[`PaginateOptions`](PaginateOptions.md)

#### Returns

`Promise`\<[`PaginateResult`](PaginateResult.md)\<`Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`\>\>
