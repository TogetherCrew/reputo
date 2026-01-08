[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / milestonesRepo

# Variable: milestonesRepo

> `const` **milestonesRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/repository.ts:61](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/deepfunding-portal-api/src/resources/milestones/repository.ts#L61)

Milestones repository

## Type Declaration

### create()

> **create**: (`data`) => `void`

Create a milestone in the database

#### Parameters

##### data

[`Milestone`](../type-aliases/Milestone.md)

#### Returns

`void`

### createMany()

> **createMany**: (`items`, `options?`) => `void`

Create multiple milestones in the database with chunking and transaction support

#### Parameters

##### items

[`Milestone`](../type-aliases/Milestone.md)[]

Array of milestones to insert

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

Optional configuration for chunk size

#### Returns

`void`

### findAll()

> **findAll**: () => `object`[]

Find all milestones

#### Returns

`object`[]

### findByProposalId()

> **findByProposalId**: (`proposalId`) => `object`[]

Find milestones by proposal ID

#### Parameters

##### proposalId

`number`

#### Returns

`object`[]

### findById()

> **findById**: (`id`) => \{ `id`: `number`; `proposalId`: `number`; `title`: `string`; `status`: `string`; `description`: `string`; `developmentDescription`: `string`; `budget`: `number`; `createdAt`: `string` \| `null`; `updatedAt`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`

Find a milestone by ID

#### Parameters

##### id

`number`

#### Returns

\{ `id`: `number`; `proposalId`: `number`; `title`: `string`; `status`: `string`; `description`: `string`; `developmentDescription`: `string`; `budget`: `number`; `createdAt`: `string` \| `null`; `updatedAt`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`
