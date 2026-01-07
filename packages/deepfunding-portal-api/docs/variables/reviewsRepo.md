[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / reviewsRepo

# Variable: reviewsRepo

> `const` **reviewsRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/reviews/repository.ts:69](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/reviews/repository.ts#L69)

Reviews repository

## Type Declaration

### create()

> **create**: (`data`) => `void`

Create a review in the database

#### Parameters

##### data

[`Review`](../type-aliases/Review.md)

#### Returns

`void`

### createMany()

> **createMany**: (`items`, `options?`) => `void`

Create multiple reviews in the database with chunking and transaction support

#### Parameters

##### items

[`Review`](../type-aliases/Review.md)[]

Array of reviews to insert

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

Optional configuration for chunk size

#### Returns

`void`

### findAll()

> **findAll**: () => `object`[]

Find all reviews

#### Returns

`object`[]

### findByProposalId()

> **findByProposalId**: (`proposalId`) => `object`[]

Find reviews by proposal ID

#### Parameters

##### proposalId

`number`

#### Returns

`object`[]

### findByReviewerId()

> **findByReviewerId**: (`reviewerId`) => `object`[]

Find reviews by reviewer ID

#### Parameters

##### reviewerId

`number`

#### Returns

`object`[]

### findById()

> **findById**: (`reviewId`) => \{ `reviewId`: `number`; `proposalId`: `number` \| `null`; `reviewerId`: `number` \| `null`; `reviewType`: `string`; `overallRating`: `string`; `feasibilityRating`: `string`; `viabilityRating`: `string`; `desirabilityRating`: `string`; `usefulnessRating`: `string`; `createdAt`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`

Find a review by ID

#### Parameters

##### reviewId

`number`

#### Returns

\{ `reviewId`: `number`; `proposalId`: `number` \| `null`; `reviewerId`: `number` \| `null`; `reviewType`: `string`; `overallRating`: `string`; `feasibilityRating`: `string`; `viabilityRating`: `string`; `desirabilityRating`: `string`; `usefulnessRating`: `string`; `createdAt`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`
