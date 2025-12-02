[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / ColumnDefinition

# Interface: ColumnDefinition

Defined in: [packages/algorithm-validator/src/types.ts:16](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L16)

Definition for a CSV column with validation rules.

## Properties

### key

> **key**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:18](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L18)

The primary key/name of the column

***

### type

> **type**: [`ColumnType`](../type-aliases/ColumnType.md)

Defined in: [packages/algorithm-validator/src/types.ts:20](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L20)

The data type of the column

***

### aliases?

> `optional` **aliases**: `string`[]

Defined in: [packages/algorithm-validator/src/types.ts:22](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L22)

Alternative names/aliases for the column (for flexible matching)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:24](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L24)

Human-readable description of the column

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/algorithm-validator/src/types.ts:26](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L26)

Whether the column is required (default: true)

***

### enum?

> `optional` **enum**: `string`[]

Defined in: [packages/algorithm-validator/src/types.ts:28](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L28)

Allowed values for enum-type columns
