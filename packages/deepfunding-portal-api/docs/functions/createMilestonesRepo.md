[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createMilestonesRepo

# Function: createMilestonesRepo()

> **createMilestonesRepo**(`db`): `object`

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/repository.ts:11](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/resources/milestones/repository.ts#L11)

Create a milestones repository bound to the given database instance.

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

`object`

### create()

> **create**(`data`): `void`

#### Parameters

##### data

[`Milestone`](../type-aliases/Milestone.md)

#### Returns

`void`

### createMany()

> **createMany**(`items`, `options?`): `void`

#### Parameters

##### items

[`Milestone`](../type-aliases/Milestone.md)[]

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

#### Returns

`void`

### findAll()

> **findAll**(): `object`[]

#### Returns

`object`[]

### findByProposalId()

> **findByProposalId**(`proposalId`): `object`[]

#### Parameters

##### proposalId

`number`

#### Returns

`object`[]

### findById()

> **findById**(`id`): \{ `id`: `number`; `proposalId`: `number`; `title`: `string`; `status`: `string`; `description`: `string`; `developmentDescription`: `string`; `budget`: `number`; `createdAt`: `string` \| `null`; `updatedAt`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`

#### Parameters

##### id

`number`

#### Returns

\{ `id`: `number`; `proposalId`: `number`; `title`: `string`; `status`: `string`; `description`: `string`; `developmentDescription`: `string`; `budget`: `number`; `createdAt`: `string` \| `null`; `updatedAt`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`
