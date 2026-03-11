[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createRepos

# Function: createRepos()

> **createRepos**(`db`): `object`

Defined in: [packages/deepfunding-portal-api/src/resources/index.ts:28](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/deepfunding-portal-api/src/resources/index.ts#L28)

Create all repositories bound to a specific database instance.

Use this together with import('../db/client.js').createDb to get a
fully isolated set of repos that is safe for concurrent algorithm execution.

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

`object`

### rounds

> **rounds**: `object`

#### rounds.create()

> **create**(`data`): `void`

##### Parameters

###### data

[`Round`](../type-aliases/Round.md)

##### Returns

`void`

#### rounds.createMany()

> **createMany**(`items`, `options?`): `void`

##### Parameters

###### items

[`Round`](../type-aliases/Round.md)[]

###### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

##### Returns

`void`

#### rounds.findAll()

> **findAll**(): `object`[]

##### Returns

`object`[]

#### rounds.findById()

> **findById**(`id`): \{ `id`: `number`; `name`: `string`; `slug`: `string`; `description`: `string` \| `null`; `poolIds`: `string`; `rawJson`: `string`; \} \| `undefined`

##### Parameters

###### id

`number`

##### Returns

\{ `id`: `number`; `name`: `string`; `slug`: `string`; `description`: `string` \| `null`; `poolIds`: `string`; `rawJson`: `string`; \} \| `undefined`

### pools

> **pools**: `object`

#### pools.create()

> **create**(`data`): `void`

##### Parameters

###### data

[`Pool`](../type-aliases/Pool.md)

##### Returns

`void`

#### pools.createMany()

> **createMany**(`items`, `options?`): `void`

##### Parameters

###### items

[`Pool`](../type-aliases/Pool.md)[]

###### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

##### Returns

`void`

#### pools.findAll()

> **findAll**(): `object`[]

##### Returns

`object`[]

#### pools.findById()

> **findById**(`id`): \{ `id`: `number`; `name`: `string`; `slug`: `string`; `maxFundingAmount`: `number`; `description`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`

##### Parameters

###### id

`number`

##### Returns

\{ `id`: `number`; `name`: `string`; `slug`: `string`; `maxFundingAmount`: `number`; `description`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`

### proposals

> **proposals**: `object`

#### proposals.create()

> **create**(`data`): `void`

##### Parameters

###### data

[`ProposalWithRound`](../type-aliases/ProposalWithRound.md)

##### Returns

`void`

#### proposals.createMany()

> **createMany**(`items`, `options?`): `void`

##### Parameters

###### items

[`ProposalWithRound`](../type-aliases/ProposalWithRound.md)[]

###### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

##### Returns

`void`

#### proposals.findAll()

> **findAll**(): [`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

##### Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

#### proposals.findByRoundId()

> **findByRoundId**(`roundId`): [`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

##### Parameters

###### roundId

`number`

##### Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md)[]

#### proposals.findById()

> **findById**(`id`): [`ProposalRecord`](../type-aliases/ProposalRecord.md) \| `undefined`

##### Parameters

###### id

`number`

##### Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md) \| `undefined`

### users

> **users**: `object`

#### users.create()

> **create**(`data`): `void`

##### Parameters

###### data

[`User`](../type-aliases/User.md)

##### Returns

`void`

#### users.createMany()

> **createMany**(`items`, `options?`): `void`

##### Parameters

###### items

[`User`](../type-aliases/User.md)[]

###### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

##### Returns

`void`

#### users.findAll()

> **findAll**(): [`UserRecord`](../type-aliases/UserRecord.md)[]

##### Returns

[`UserRecord`](../type-aliases/UserRecord.md)[]

#### users.findById()

> **findById**(`id`): [`UserRecord`](../type-aliases/UserRecord.md) \| `undefined`

##### Parameters

###### id

`number`

##### Returns

[`UserRecord`](../type-aliases/UserRecord.md) \| `undefined`

### milestones

> **milestones**: `object`

#### milestones.create()

> **create**(`data`): `void`

##### Parameters

###### data

[`Milestone`](../type-aliases/Milestone.md)

##### Returns

`void`

#### milestones.createMany()

> **createMany**(`items`, `options?`): `void`

##### Parameters

###### items

[`Milestone`](../type-aliases/Milestone.md)[]

###### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

##### Returns

`void`

#### milestones.findAll()

> **findAll**(): `object`[]

##### Returns

`object`[]

#### milestones.findByProposalId()

> **findByProposalId**(`proposalId`): `object`[]

##### Parameters

###### proposalId

`number`

##### Returns

`object`[]

#### milestones.findById()

> **findById**(`id`): \{ `id`: `number`; `proposalId`: `number`; `title`: `string`; `status`: `string`; `description`: `string`; `developmentDescription`: `string`; `budget`: `number`; `createdAt`: `string` \| `null`; `updatedAt`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`

##### Parameters

###### id

`number`

##### Returns

\{ `id`: `number`; `proposalId`: `number`; `title`: `string`; `status`: `string`; `description`: `string`; `developmentDescription`: `string`; `budget`: `number`; `createdAt`: `string` \| `null`; `updatedAt`: `string` \| `null`; `rawJson`: `string`; \} \| `undefined`

### reviews

> **reviews**: `object`

#### reviews.create()

> **create**(`data`): `void`

##### Parameters

###### data

[`Review`](../type-aliases/Review.md)

##### Returns

`void`

#### reviews.createMany()

> **createMany**(`items`, `options?`): `void`

##### Parameters

###### items

[`Review`](../type-aliases/Review.md)[]

###### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

##### Returns

`void`

#### reviews.findAll()

> **findAll**(): [`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

##### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

#### reviews.findByProposalId()

> **findByProposalId**(`proposalId`): [`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

##### Parameters

###### proposalId

`number`

##### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

#### reviews.findByReviewerId()

> **findByReviewerId**(`reviewerId`): [`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

##### Parameters

###### reviewerId

`number`

##### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md)[]

#### reviews.findById()

> **findById**(`reviewId`): [`ReviewRecord`](../type-aliases/ReviewRecord.md) \| `undefined`

##### Parameters

###### reviewId

`number`

##### Returns

[`ReviewRecord`](../type-aliases/ReviewRecord.md) \| `undefined`

### comments

> **comments**: `object`

#### comments.create()

> **create**(`data`): `void`

##### Parameters

###### data

[`Comment`](../type-aliases/Comment.md)

##### Returns

`void`

#### comments.createMany()

> **createMany**(`items`, `options?`): `void`

##### Parameters

###### items

[`Comment`](../type-aliases/Comment.md)[]

###### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

##### Returns

`void`

#### comments.findAll()

> **findAll**(): [`CommentRecord`](../type-aliases/CommentRecord.md)[]

##### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)[]

#### comments.findByProposalId()

> **findByProposalId**(`proposalId`): [`CommentRecord`](../type-aliases/CommentRecord.md)[]

##### Parameters

###### proposalId

`number`

##### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)[]

#### comments.findByUserId()

> **findByUserId**(`userId`): [`CommentRecord`](../type-aliases/CommentRecord.md)[]

##### Parameters

###### userId

`number`

##### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)[]

#### comments.findById()

> **findById**(`commentId`): [`CommentRecord`](../type-aliases/CommentRecord.md) \| `undefined`

##### Parameters

###### commentId

`number`

##### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md) \| `undefined`

### commentVotes

> **commentVotes**: `object`

#### commentVotes.create()

> **create**(`data`): `void`

##### Parameters

###### data

[`CommentVote`](../type-aliases/CommentVote.md)

##### Returns

`void`

#### commentVotes.createMany()

> **createMany**(`items`, `options?`): `void`

##### Parameters

###### items

[`CommentVote`](../type-aliases/CommentVote.md)[]

###### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

##### Returns

`void`

#### commentVotes.findAll()

> **findAll**(): [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

##### Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

#### commentVotes.findByCommentId()

> **findByCommentId**(`commentId`): [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

##### Parameters

###### commentId

`number`

##### Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

#### commentVotes.findByVoterId()

> **findByVoterId**(`voterId`): [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]

##### Parameters

###### voterId

`number`

##### Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)[]
