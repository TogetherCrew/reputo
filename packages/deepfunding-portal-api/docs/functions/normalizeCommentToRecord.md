[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / normalizeCommentToRecord

# Function: normalizeCommentToRecord()

> **normalizeCommentToRecord**(`data`): [`CommentRecord`](../type-aliases/CommentRecord.md)

Defined in: [packages/deepfunding-portal-api/src/resources/comments/normalize.ts:12](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/deepfunding-portal-api/src/resources/comments/normalize.ts#L12)

Normalize a Comment API response to a database record

## Parameters

### data

[`Comment`](../type-aliases/Comment.md)

The comment data from the API

## Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)

The normalized comment record for database insertion
