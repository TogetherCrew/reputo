[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createRoundsRepo

# Function: createRoundsRepo()

> **createRoundsRepo**(`db`): `object`

Defined in: [packages/deepfunding-portal-api/src/resources/rounds/repository.ts:11](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/deepfunding-portal-api/src/resources/rounds/repository.ts#L11)

Create a rounds repository bound to the given database instance.

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

`object`

### create()

> **create**(`data`): `void`

#### Parameters

##### data

[`Round`](../type-aliases/Round.md)

#### Returns

`void`

### createMany()

> **createMany**(`items`, `options?`): `void`

#### Parameters

##### items

[`Round`](../type-aliases/Round.md)[]

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

#### Returns

`void`

### findAll()

> **findAll**(): `object`[]

#### Returns

`object`[]

### findById()

> **findById**(`id`): \{ `id`: `number`; `name`: `string`; `slug`: `string`; `description`: `string` \| `null`; `poolIds`: `string`; `rawJson`: `string`; \} \| `undefined`

#### Parameters

##### id

`number`

#### Returns

\{ `id`: `number`; `name`: `string`; `slug`: `string`; `description`: `string` \| `null`; `poolIds`: `string`; `rawJson`: `string`; \} \| `undefined`
