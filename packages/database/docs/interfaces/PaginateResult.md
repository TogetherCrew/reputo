[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / PaginateResult

# Interface: PaginateResult\<T\>

Defined in: [packages/database/src/plugins/paginate.plugin.ts:22](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/plugins/paginate.plugin.ts#L22)

Result of a paginated query

## Type Parameters

### T

`T`

## Properties

### results

> **results**: `T`[]

Defined in: [packages/database/src/plugins/paginate.plugin.ts:24](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/plugins/paginate.plugin.ts#L24)

Results found

***

### page

> **page**: `number`

Defined in: [packages/database/src/plugins/paginate.plugin.ts:26](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/plugins/paginate.plugin.ts#L26)

Current page

***

### limit

> **limit**: `number`

Defined in: [packages/database/src/plugins/paginate.plugin.ts:28](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/plugins/paginate.plugin.ts#L28)

Maximum number of results per page

***

### totalPages

> **totalPages**: `number`

Defined in: [packages/database/src/plugins/paginate.plugin.ts:30](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/plugins/paginate.plugin.ts#L30)

Total number of pages

***

### totalResults

> **totalResults**: `number`

Defined in: [packages/database/src/plugins/paginate.plugin.ts:32](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/database/src/plugins/paginate.plugin.ts#L32)

Total number of documents
