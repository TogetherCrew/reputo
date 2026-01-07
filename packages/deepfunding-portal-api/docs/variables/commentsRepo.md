[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / commentsRepo

# Variable: commentsRepo

> `const` **commentsRepo**: `object`

Defined in: [packages/deepfunding-portal-api/src/resources/comments/repository.ts:69](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/comments/repository.ts#L69)

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

> **findAll**: () => `object`[]

Find all comments

#### Returns

`object`[]

### findByProposalId()

> **findByProposalId**: (`proposalId`) => `object`[]

Find comments by proposal ID

#### Parameters

##### proposalId

`number`

#### Returns

`object`[]

### findByUserId()

> **findByUserId**: (`userId`) => `object`[]

Find comments by user ID

#### Parameters

##### userId

`number`

#### Returns

`object`[]

### findById()

> **findById**: (`commentId`) => \{ `commentId`: `number`; `parentId`: `number`; `isReply`: `boolean`; `userId`: `number`; `proposalId`: `number`; `content`: `string`; `commentVotes`: `string`; `createdAt`: `string`; `updatedAt`: `string`; `rawJson`: `string`; \} \| `undefined`

Find a comment by ID

#### Parameters

##### commentId

`number`

#### Returns

\{ `commentId`: `number`; `parentId`: `number`; `isReply`: `boolean`; `userId`: `number`; `proposalId`: `number`; `content`: `string`; `commentVotes`: `string`; `createdAt`: `string`; `updatedAt`: `string`; `rawJson`: `string`; \} \| `undefined`
