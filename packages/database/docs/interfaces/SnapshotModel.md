[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotModel

# Interface: SnapshotModel

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:58](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L58)

Interface extending Mongoose Model with additional methods for Snapshot.

## Extends

- `Model`\<[`Snapshot`](Snapshot.md)\>

## Constructors

### Constructor

> **new SnapshotModel**\<`DocType`\>(`doc?`, `fields?`, `options?`): `Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:58](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L58)

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

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:60](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L60)

Pagination method for querying snapshots

#### Parameters

##### filter

`FilterQuery`\<[`Snapshot`](Snapshot.md)\>

##### options

[`PaginateOptions`](PaginateOptions.md)

#### Returns

`Promise`\<[`PaginateResult`](PaginateResult.md)\<`Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`\>\>
