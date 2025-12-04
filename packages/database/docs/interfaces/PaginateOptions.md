[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / PaginateOptions

# Interface: PaginateOptions

Defined in: [packages/database/src/shared/plugins/paginate.plugin.ts:6](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/database/src/shared/plugins/paginate.plugin.ts#L6)

Options for pagination query

## Properties

### sortBy?

> `optional` **sortBy**: `string`

Defined in: [packages/database/src/shared/plugins/paginate.plugin.ts:8](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/database/src/shared/plugins/paginate.plugin.ts#L8)

Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas

***

### populate?

> `optional` **populate**: `string` \| `PopulateOptions` \| (`string` \| `PopulateOptions`)[]

Defined in: [packages/database/src/shared/plugins/paginate.plugin.ts:10](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/database/src/shared/plugins/paginate.plugin.ts#L10)

Populate data fields. Can be a string, object, or array of populate options

***

### limit?

> `optional` **limit**: `string` \| `number`

Defined in: [packages/database/src/shared/plugins/paginate.plugin.ts:12](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/database/src/shared/plugins/paginate.plugin.ts#L12)

Maximum number of results per page (default = 10)

***

### page?

> `optional` **page**: `string` \| `number`

Defined in: [packages/database/src/shared/plugins/paginate.plugin.ts:14](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/database/src/shared/plugins/paginate.plugin.ts#L14)

Current page (default = 1)

***

### skip?

> `optional` **skip**: `number`

Defined in: [packages/database/src/shared/plugins/paginate.plugin.ts:16](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/database/src/shared/plugins/paginate.plugin.ts#L16)

Number of documents to skip (calculated automatically if not provided)
