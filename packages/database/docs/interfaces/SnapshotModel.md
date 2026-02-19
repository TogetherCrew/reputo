[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotModel

# Interface: SnapshotModel

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:83](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/database/src/shared/types/Snapshot.interface.ts#L83)

Interface extending Mongoose Model with additional methods for Snapshot.

## Extends

- `Model`\<[`Snapshot`](Snapshot.md)\>

## Constructors

### Constructor

> **new SnapshotModel**\<`DocType`\>(`doc?`, `fields?`, `options?`): `Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:83](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/database/src/shared/types/Snapshot.interface.ts#L83)

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

> **paginate**: (`filter`, `options`) => `Promise`\<[`PaginateResult`](PaginateResult.md)\<[`SnapshotDoc`](../type-aliases/SnapshotDoc.md)\>\>

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:85](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/database/src/shared/types/Snapshot.interface.ts#L85)

Pagination method for querying snapshots

#### Parameters

##### filter

`FilterQuery`\<[`Snapshot`](Snapshot.md)\>

##### options

[`PaginateOptions`](PaginateOptions.md)

#### Returns

`Promise`\<[`PaginateResult`](PaginateResult.md)\<[`SnapshotDoc`](../type-aliases/SnapshotDoc.md)\>\>
