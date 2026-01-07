[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / MilestoneRaw

# Type Alias: MilestoneRaw

> **MilestoneRaw** = `object`

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/types.ts:13](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/milestones/types.ts#L13)

Milestone entity from API response (without proposal-level metadata)
Note: Individual milestone objects don't include proposal_id, created_at,
or updated_at - these are at the group level in the API response.

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### id

> **id**: `number`

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/types.ts:14](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/milestones/types.ts#L14)

***

### title

> **title**: `string`

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/types.ts:15](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/milestones/types.ts#L15)

***

### status

> **status**: [`MilestoneStatus`](MilestoneStatus.md)

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/types.ts:16](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/milestones/types.ts#L16)

***

### description

> **description**: `string`

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/types.ts:17](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/milestones/types.ts#L17)

***

### development\_description

> **development\_description**: `string`

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/types.ts:18](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/milestones/types.ts#L18)

***

### budget

> **budget**: `number`

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/types.ts:19](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/milestones/types.ts#L19)
