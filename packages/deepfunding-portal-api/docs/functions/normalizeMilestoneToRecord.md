[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / normalizeMilestoneToRecord

# Function: normalizeMilestoneToRecord()

> **normalizeMilestoneToRecord**(`data`): `Omit`\<[`MilestoneRecord`](../type-aliases/MilestoneRecord.md), `"id"`\>

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/normalize.ts:13](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/deepfunding-portal-api/src/resources/milestones/normalize.ts#L13)

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
