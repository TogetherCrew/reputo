[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createCommentsRepo

# Function: createCommentsRepo()

> **createCommentsRepo**(`db`): `object`

Defined in: [packages/deepfunding-portal-api/src/resources/comments/repository.ts:11](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/deepfunding-portal-api/src/resources/comments/repository.ts#L11)

Create a comments repository bound to the given database instance.

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

`object`

### create()

> **create**(`data`): `void`

#### Parameters

##### data

[`Comment`](../type-aliases/Comment.md)

#### Returns

`void`

### createMany()

> **createMany**(`items`, `options?`): `void`

#### Parameters

##### items

[`Comment`](../type-aliases/Comment.md)[]

##### options?

[`CreateManyOptions`](../type-aliases/CreateManyOptions.md)

#### Returns

`void`

### findAll()

> **findAll**(): [`CommentRecord`](../type-aliases/CommentRecord.md)[]

#### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)[]

### findByProposalId()

> **findByProposalId**(`proposalId`): [`CommentRecord`](../type-aliases/CommentRecord.md)[]

#### Parameters

##### proposalId

`number`

#### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)[]

### findByUserId()

> **findByUserId**(`userId`): [`CommentRecord`](../type-aliases/CommentRecord.md)[]

#### Parameters

##### userId

`number`

#### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)[]

### findById()

> **findById**(`commentId`): [`CommentRecord`](../type-aliases/CommentRecord.md) \| `undefined`

#### Parameters

##### commentId

`number`

#### Returns

[`CommentRecord`](../type-aliases/CommentRecord.md) \| `undefined`
