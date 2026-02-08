[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / poolsRepo

# Variable: poolsRepo

> `const` **poolsRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/pools/repository.ts:53](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/deepfunding-portal-api/src/resources/pools/repository.ts#L53)

Pools repository

## Type Declaration

### create()

> **create**: (`data`) => `void`

Create a pool in the database

#### Parameters

##### data

[`Pool`](../type-aliases/Pool.md)

#### Returns

`void`

### createMany()

> **createMany**: (`items`, `options?`) => `void`

Create multiple pools in the database with chunking and transaction support

#### Parameters

##### items

[`Pool`](../type-aliases/Pool.md)[]

Array of pools to insert

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

Optional configuration for chunk size

#### Returns

`void`

### findAll()

> **findAll**: () => `object`[]

Find all pools

#### Returns

`object`[]

### findById()

> **findById**: (`id`) => \{ `id`: `number`; `name`: `string`; `slug`: `string`; `maxFundingAmount`: `number`; `description`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`

Find a pool by ID

#### Parameters

##### id

`number`

#### Returns

\{ `id`: `number`; `name`: `string`; `slug`: `string`; `maxFundingAmount`: `number`; `description`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`
