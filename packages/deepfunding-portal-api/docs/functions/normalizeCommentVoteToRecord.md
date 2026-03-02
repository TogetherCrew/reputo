[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / normalizeCommentVoteToRecord

# Function: normalizeCommentVoteToRecord()

> **normalizeCommentVoteToRecord**(`data`): [`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)

Defined in: [packages/deepfunding-portal-api/src/resources/commentVotes/normalize.ts:12](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/deepfunding-portal-api/src/resources/commentVotes/normalize.ts#L12)

Normalize a CommentVote API response to a database record

## Parameters

### data

[`CommentVote`](../type-aliases/CommentVote.md)

The comment vote data from the API

## Returns

[`CommentVoteRecord`](../type-aliases/CommentVoteRecord.md)

The normalized comment vote record for database insertion
