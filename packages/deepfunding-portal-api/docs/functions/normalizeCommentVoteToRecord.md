[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / normalizeCommentVoteToRecord

# Function: normalizeCommentVoteToRecord()

> **normalizeCommentVoteToRecord**(`data`): [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)

Defined in: [packages/deepfunding-portal-api/src/resources/commentVotes/normalize.ts:12](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/resources/commentVotes/normalize.ts#L12)

Normalize a CommentVote API response to a database record

## Parameters

### data

[`CommentVote`](../type-aliases/CommentVote.md)

The comment vote data from the API

## Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)

The normalized comment vote record for database insertion
