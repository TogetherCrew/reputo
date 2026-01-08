[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / commentVotesRepo

# Variable: commentVotesRepo

> `const` **commentVotesRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/commentVotes/repository.ts:61](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/deepfunding-portal-api/src/resources/commentVotes/repository.ts#L61)

Comment votes repository

## Type Declaration

### create()

> **create**: (`data`) => `void`

Create a comment vote in the database

#### Parameters

##### data

[`CommentVote`](../type-aliases/CommentVote.md)

#### Returns

`void`

### createMany()

> **createMany**: (`items`, `options?`) => `void`

Create multiple comment votes in the database with chunking and transaction support

#### Parameters

##### items

[`CommentVote`](../type-aliases/CommentVote.md)[]

Array of comment votes to insert

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

Optional configuration for chunk size

#### Returns

`void`

### findAll()

> **findAll**: () => [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

Find all comment votes

#### Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

### findByCommentId()

> **findByCommentId**: (`commentId`) => [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

Find comment votes by comment ID

#### Parameters

##### commentId

`number`

#### Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

### findByVoterId()

> **findByVoterId**: (`voterId`) => [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

Find comment votes by voter ID

#### Parameters

##### voterId

`number`

#### Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]
