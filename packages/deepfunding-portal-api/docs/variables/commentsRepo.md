[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / commentsRepo

# Variable: commentsRepo

> `const` **commentsRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/comments/repository.ts:69](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/deepfunding-portal-api/src/resources/comments/repository.ts#L69)

Comments repository

## Type Declaration

### create()

> **create**: (`data`) => `void`

Create a comment in the database

#### Parameters

##### data

[`Comment`](../type-aliases/Comment.md)

#### Returns

`void`

### createMany()

> **createMany**: (`items`, `options?`) => `void`

Create multiple comments in the database with chunking and transaction support

#### Parameters

##### items

[`Comment`](../type-aliases/Comment.md)[]

Array of comments to insert

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

Optional configuration for chunk size

#### Returns

`void`

### findAll()

> **findAll**: () => [`CommentRecord`](../type-aliases/CommentRecord.md)[]

Find all comments

#### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)[]

### findByProposalId()

> **findByProposalId**: (`proposalId`) => [`CommentRecord`](../type-aliases/CommentRecord.md)[]

Find comments by proposal ID

#### Parameters

##### proposalId

`number`

#### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)[]

### findByUserId()

> **findByUserId**: (`userId`) => [`CommentRecord`](../type-aliases/CommentRecord.md)[]

Find comments by user ID

#### Parameters

##### userId

`number`

#### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)[]

### findById()

> **findById**: (`commentId`) => [`CommentRecord`](../type-aliases/CommentRecord.md) \| `undefined`

Find a comment by ID

#### Parameters

##### commentId

`number`

#### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md) \| `undefined`
