[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createPoolsRepo

# Function: createPoolsRepo()

> **createPoolsRepo**(`db`): `object`

Defined in: [packages/deepfunding-portal-api/src/resources/pools/repository.ts:11](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/deepfunding-portal-api/src/resources/pools/repository.ts#L11)

Create a pools repository bound to the given database instance.

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

`object`

### create()

> **create**(`data`): `void`

#### Parameters

##### data

[`Pool`](../type-aliases/Pool.md)

#### Returns

`void`

### createMany()

> **createMany**(`items`, `options?`): `void`

#### Parameters

##### items

[`Pool`](../type-aliases/Pool.md)[]

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

#### Returns

`void`

### findAll()

> **findAll**(): `object`[]

#### Returns

`object`[]

### findById()

> **findById**(`id`): \{ `id`: `number`; `name`: `string`; `slug`: `string`; `maxFundingAmount`: `number`; `description`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`

#### Parameters

##### id

`number`

#### Returns

\{ `id`: `number`; `name`: `string`; `slug`: `string`; `maxFundingAmount`: `number`; `description`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`
