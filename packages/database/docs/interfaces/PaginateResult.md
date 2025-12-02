[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / PaginateResult

# Interface: PaginateResult\<T\>

Defined in: packages/database/src/shared/plugins/paginate.plugin.ts:22

Result of a paginated query

## Type Parameters

### T

`T`

## Properties

### results

> **results**: `T`[]

Defined in: packages/database/src/shared/plugins/paginate.plugin.ts:24

Results found

***

### page

> **page**: `number`

Defined in: packages/database/src/shared/plugins/paginate.plugin.ts:26

Current page

***

### limit

> **limit**: `number`

Defined in: packages/database/src/shared/plugins/paginate.plugin.ts:28

Maximum number of results per page

***

### totalPages

> **totalPages**: `number`

Defined in: packages/database/src/shared/plugins/paginate.plugin.ts:30

Total number of pages

***

### totalResults

> **totalResults**: `number`

Defined in: packages/database/src/shared/plugins/paginate.plugin.ts:32

Total number of documents
