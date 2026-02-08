[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / proposalsRepo

# Variable: proposalsRepo

> `const` **proposalsRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/proposals/repository.ts:61](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/deepfunding-portal-api/src/resources/proposals/repository.ts#L61)

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

> **findAll**: () => [`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

Find all proposals

#### Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

### findByRoundId()

> **findByRoundId**: (`roundId`) => [`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

Find proposals by round ID

#### Parameters

##### roundId

`number`

#### Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

### findById()

> **findById**: (`id`) => [`ProposalRecord`](../type-aliases/ProposalRecord.md) \| `undefined`

Find a proposal by ID

#### Parameters

##### id

`number`

#### Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md) \| `undefined`
