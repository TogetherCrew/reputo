[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createUsersRepo

# Function: createUsersRepo()

> **createUsersRepo**(`db`): `object`

Defined in: [packages/deepfunding-portal-api/src/resources/users/repository.ts:11](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/resources/users/repository.ts#L11)

Create a users repository bound to the given database instance.

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

`object`

### create()

> **create**(`data`): `void`

#### Parameters

##### data

[`User`](../type-aliases/User.md)

#### Returns

`void`

### createMany()

> **createMany**(`items`, `options?`): `void`

#### Parameters

##### items

[`User`](../type-aliases/User.md)[]

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

#### Returns

`void`

### findAll()

> **findAll**(): [`UserRecord`](../type-aliases/UserRecord.md)[]

#### Returns

[`UserRecord`](../type-aliases/UserRecord.md)[]

### findById()

> **findById**(`id`): [`UserRecord`](../type-aliases/UserRecord.md) \| `undefined`

#### Parameters

##### id

`number`

#### Returns

[`UserRecord`](../type-aliases/UserRecord.md) \| `undefined`
