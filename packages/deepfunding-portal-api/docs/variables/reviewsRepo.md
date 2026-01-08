[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / reviewsRepo

# Variable: reviewsRepo

> `const` **reviewsRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/reviews/repository.ts:69](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/deepfunding-portal-api/src/resources/reviews/repository.ts#L69)

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

> **findAll**: () => [`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

Find all reviews

#### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

### findByProposalId()

> **findByProposalId**: (`proposalId`) => [`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

Find reviews by proposal ID

#### Parameters

##### proposalId

`number`

#### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

### findByReviewerId()

> **findByReviewerId**: (`reviewerId`) => [`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

Find reviews by reviewer ID

#### Parameters

##### reviewerId

`number`

#### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

### findById()

> **findById**: (`reviewId`) => [`ReviewRecord`](../type-aliases/ReviewRecord.md) \| `undefined`

Find a review by ID

#### Parameters

##### reviewId

`number`

#### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md) \| `undefined`
