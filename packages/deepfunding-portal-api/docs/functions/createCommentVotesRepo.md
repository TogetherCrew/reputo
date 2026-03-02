[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createCommentVotesRepo

# Function: createCommentVotesRepo()

> **createCommentVotesRepo**(`db`): `object`

Defined in: [packages/deepfunding-portal-api/src/resources/commentVotes/repository.ts:11](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/deepfunding-portal-api/src/resources/commentVotes/repository.ts#L11)

Create a comment-votes repository bound to the given database instance.

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

`object`

### create()

> **create**(`data`): `void`

#### Parameters

##### data

[`CommentVote`](../type-aliases/CommentVote.md)

#### Returns

`void`

### createMany()

> **createMany**(`items`, `options?`): `void`

#### Parameters

##### items

[`CommentVote`](../type-aliases/CommentVote.md)[]

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

#### Returns

`void`

### findAll()

> **findAll**(): [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

#### Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

### findByCommentId()

> **findByCommentId**(`commentId`): [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

#### Parameters

##### commentId

`number`

#### Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

### findByVoterId()

> **findByVoterId**(`voterId`): [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

#### Parameters

##### voterId

`number`

#### Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]
