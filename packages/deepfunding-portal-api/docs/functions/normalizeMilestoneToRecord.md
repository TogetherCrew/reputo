[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / normalizeMilestoneToRecord

# Function: normalizeMilestoneToRecord()

> **normalizeMilestoneToRecord**(`data`): `Omit`\<[`MilestoneRecord`](../type-aliases/MilestoneRecord.md), `"id"`\>

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/normalize.ts:13](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/milestones/normalize.ts#L13)

Normalize a Milestone API response to a database record

## Parameters

### data

[`Milestone`](../type-aliases/Milestone.md)

The milestone data from the API

## Returns

`Omit`\<[`MilestoneRecord`](../type-aliases/MilestoneRecord.md), `"id"`\>

The normalized milestone record for database insertion

## Note

The ID is not included - the database will auto-generate it
