[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createProposalsRepo

# Function: createProposalsRepo()

> **createProposalsRepo**(`db`): `object`

Defined in: [packages/deepfunding-portal-api/src/resources/proposals/repository.ts:11](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/deepfunding-portal-api/src/resources/proposals/repository.ts#L11)

Create a proposals repository bound to the given database instance.

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

`object`

### create()

> **create**(`data`): `void`

#### Parameters

##### data

[`ProposalWithRound`](../type-aliases/ProposalWithRound.md)

#### Returns

`void`

### createMany()

> **createMany**(`items`, `options?`): `void`

#### Parameters

##### items

[`ProposalWithRound`](../type-aliases/ProposalWithRound.md)[]

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

#### Returns

`void`

### findAll()

> **findAll**(): [`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

#### Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

### findByRoundId()

> **findByRoundId**(`roundId`): [`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

#### Parameters

##### roundId

`number`

#### Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

### findById()

> **findById**(`id`): [`ProposalRecord`](../type-aliases/ProposalRecord.md) \| `undefined`

#### Parameters

##### id

`number`

#### Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md) \| `undefined`
