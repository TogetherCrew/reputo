[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / normalizeCommentToRecord

# Function: normalizeCommentToRecord()

> **normalizeCommentToRecord**(`data`): [`CommentRecord`](../type-aliases/CommentRecord.md)

Defined in: [packages/deepfunding-portal-api/src/resources/comments/normalize.ts:12](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/comments/normalize.ts#L12)

Normalize a Comment API response to a database record

## Parameters

### data

[`Comment`](../type-aliases/Comment.md)

The comment data from the API

## Returns

[`CommentRecord`](../type-aliases/CommentRecord.md)

The normalized comment record for database insertion
