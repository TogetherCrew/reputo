[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createReviewsRepo

# Function: createReviewsRepo()

> **createReviewsRepo**(`db`): `object`

Defined in: [packages/deepfunding-portal-api/src/resources/reviews/repository.ts:11](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/resources/reviews/repository.ts#L11)

Create a reviews repository bound to the given database instance.

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

`object`

### create()

> **create**(`data`): `void`

#### Parameters

##### data

[`Review`](../type-aliases/Review.md)

#### Returns

`void`

### createMany()

> **createMany**(`items`, `options?`): `void`

#### Parameters

##### items

[`Review`](../type-aliases/Review.md)[]

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

#### Returns

`void`

### findAll()

> **findAll**(): [`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

#### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

### findByProposalId()

> **findByProposalId**(`proposalId`): [`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

#### Parameters

##### proposalId

`number`

#### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

### findByReviewerId()

> **findByReviewerId**(`reviewerId`): [`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

#### Parameters

##### reviewerId

`number`

#### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

### findById()

> **findById**(`reviewId`): [`ReviewRecord`](../type-aliases/ReviewRecord.md) \| `undefined`

#### Parameters

##### reviewId

`number`

#### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md) \| `undefined`
