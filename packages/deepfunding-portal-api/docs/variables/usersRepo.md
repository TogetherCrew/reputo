[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / usersRepo

# Variable: usersRepo

> `const` **usersRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/users/repository.ts:53](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/users/repository.ts#L53)

Users repository

## Type Declaration

### create()

> **create**: (`data`) => `void`

Create a user in the database

#### Parameters

##### data

[`User`](../type-aliases/User.md)

#### Returns

`void`

### createMany()

> **createMany**: (`items`, `options?`) => `void`

Create multiple users in the database with chunking and transaction support

#### Parameters

##### items

[`User`](../type-aliases/User.md)[]

Array of users to insert

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

Optional configuration for chunk size

#### Returns

`void`

### findAll()

> **findAll**: () => `object`[]

Find all users

#### Returns

`object`[]

### findById()

> **findById**: (`id`) => \{ `id`: `number`; `collectionId`: `string`; `userName`: `string`; `email`: `string`; `totalProposals`: `number`; `rawJson`: `string`; \} \| `undefined`

Find a user by ID

#### Parameters

##### id

`number`

#### Returns

\{ `id`: `number`; `collectionId`: `string`; `userName`: `string`; `email`: `string`; `totalProposals`: `number`; `rawJson`: `string`; \} \| `undefined`
