[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / normalizeProposalToRecord

# Function: normalizeProposalToRecord()

> **normalizeProposalToRecord**(`data`): [`ProposalRecord`](../type-aliases/ProposalRecord.md)

Defined in: [packages/deepfunding-portal-api/src/resources/proposals/normalize.ts:12](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/proposals/normalize.ts#L12)

Normalize a Proposal API response to a database record

## Parameters

### data

[`ProposalWithRound`](../type-aliases/ProposalWithRound.md)

The proposal data from the API with round context

## Returns

[`ProposalRecord`](../type-aliases/ProposalRecord.md)

The normalized proposal record for database insertion
