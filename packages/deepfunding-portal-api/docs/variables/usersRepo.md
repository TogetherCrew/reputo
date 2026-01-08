[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / usersRepo

# Variable: usersRepo

> `const` **usersRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/users/repository.ts:53](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/deepfunding-portal-api/src/resources/users/repository.ts#L53)

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

> **findAll**: () => [`UserRecord`](../type-aliases/UserRecord.md)[]

Find all users

#### Returns

[`UserRecord`](../type-aliases/UserRecord.md)[]

### findById()

> **findById**: (`id`) => [`UserRecord`](../type-aliases/UserRecord.md) \| `undefined`

Find a user by ID

#### Parameters

##### id

`number`

#### Returns

[`UserRecord`](../type-aliases/UserRecord.md) \| `undefined`
