[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / roundsRepo

# Variable: roundsRepo

> `const` **roundsRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/rounds/repository.ts:53](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/rounds/repository.ts#L53)

Rounds repository

## Type Declaration

### create()

> **create**: (`data`) => `void`

Create a round in the database

#### Parameters

##### data

[`Round`](../type-aliases/Round.md)

#### Returns

`void`

### createMany()

> **createMany**: (`items`, `options?`) => `void`

Create multiple rounds in the database with chunking and transaction support

#### Parameters

##### items

[`Round`](../type-aliases/Round.md)[]

Array of rounds to insert

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

Optional configuration for chunk size

#### Returns

`void`

### findAll()

> **findAll**: () => `object`[]

Find all rounds

#### Returns

`object`[]

### findById()

> **findById**: (`id`) => \{ `id`: `number`; `name`: `string`; `slug`: `string`; `description`: `string` \| `null`; `poolIds`: `string`; `rawJson`: `string`; \} \| `undefined`

Find a round by ID

#### Parameters

##### id

`number`

#### Returns

\{ `id`: `number`; `name`: `string`; `slug`: `string`; `description`: `string` \| `null`; `poolIds`: `string`; `rawJson`: `string`; \} \| `undefined`
