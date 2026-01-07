[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / proposalsRepo

# Variable: proposalsRepo

> `const` **proposalsRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/proposals/repository.ts:61](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/proposals/repository.ts#L61)

Proposals repository

## Type Declaration

### create()

> **create**: (`data`) => `void`

Create a proposal in the database

#### Parameters

##### data

[`ProposalWithRound`](../type-aliases/ProposalWithRound.md)

#### Returns

`void`

### createMany()

> **createMany**: (`items`, `options?`) => `void`

Create multiple proposals in the database with chunking and transaction support

#### Parameters

##### items

[`ProposalWithRound`](../type-aliases/ProposalWithRound.md)[]

Array of proposals to insert

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

Optional configuration for chunk size

#### Returns

`void`

### findAll()

> **findAll**: () => `object`[]

Find all proposals

#### Returns

`object`[]

### findByRoundId()

> **findByRoundId**: (`roundId`) => `object`[]

Find proposals by round ID

#### Parameters

##### roundId

`number`

#### Returns

`object`[]

### findById()

> **findById**: (`id`) => \{ `id`: `number`; `roundId`: `number`; `poolId`: `number`; `proposerId`: `number`; `title`: `string`; `content`: `string`; `link`: `string`; `featureImage`: `string`; `requestedAmount`: `string`; `awardedAmount`: `string`; `isAwarded`: `boolean`; `isCompleted`: `boolean`; `createdAt`: `string`; `updatedAt`: `string` \| `null`; `teamMembers`: `string`; `rawJson`: `string`; \} \| `undefined`

Find a proposal by ID

#### Parameters

##### id

`number`

#### Returns

\{ `id`: `number`; `roundId`: `number`; `poolId`: `number`; `proposerId`: `number`; `title`: `string`; `content`: `string`; `link`: `string`; `featureImage`: `string`; `requestedAmount`: `string`; `awardedAmount`: `string`; `isAwarded`: `boolean`; `isCompleted`: `boolean`; `createdAt`: `string`; `updatedAt`: `string` \| `null`; `teamMembers`: `string`; `rawJson`: `string`; \} \| `undefined`
