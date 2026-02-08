[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / SnapshotModel

# Interface: SnapshotModel

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:78](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L78)

Interface extending Mongoose Model with additional methods for Snapshot.

## Extends

- `Model`\<[`Snapshot`](Snapshot.md)\>

## Constructors

### Constructor

> **new SnapshotModel**\<`DocType`\>(`doc?`, `fields?`, `options?`): `Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:78](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L78)

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

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:80](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L80)

Pagination method for querying snapshots

#### Parameters

##### filter

`FilterQuery`\<[`Snapshot`](Snapshot.md)\>

##### options

[`PaginateOptions`](PaginateOptions.md)

#### Returns

`Promise`\<[`PaginateResult`](PaginateResult.md)\<`Document`\<`unknown`, \{ \}, [`Snapshot`](Snapshot.md), \{ \}, \{ \}\> & [`Snapshot`](Snapshot.md) & `object` & `object`\>\>
