[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / normalizeReviewToRecord

# Function: normalizeReviewToRecord()

> **normalizeReviewToRecord**(`data`): `Omit`\<[`ReviewRecord`](../type-aliases/ReviewRecord.md), `"reviewId"`\>

Defined in: [packages/deepfunding-portal-api/src/resources/reviews/normalize.ts:13](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/reviews/normalize.ts#L13)

Normalize a Review API response to a database record

## Parameters

### data

[`Review`](../type-aliases/Review.md)

The review data from the API

## Returns

`Omit`\<[`ReviewRecord`](../type-aliases/ReviewRecord.md), `"reviewId"`\>

The normalized review record for database insertion

## Note

The reviewId is not included - the database will auto-generate it
