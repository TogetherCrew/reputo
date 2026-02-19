[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / fetchMilestones

# Function: fetchMilestones()

> **fetchMilestones**(`client`, `options`): [`PaginatedFetcher`](../type-aliases/PaginatedFetcher.md)\<[`Milestone`](../type-aliases/Milestone.md)\>

Defined in: [packages/deepfunding-portal-api/src/resources/milestones/api.ts:14](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/resources/milestones/api.ts#L14)

Fetch milestones with pagination

Note: The API returns milestones grouped by proposal. This function flattens
the nested structure by extracting individual milestones from each group and
enriching them with proposal-level metadata (proposal_id, created_at, updated_at).

## Parameters

### client

[`DeepFundingClient`](../type-aliases/DeepFundingClient.md)

### options

[`MilestoneFetchOptions`](../type-aliases/MilestoneFetchOptions.md) = `{}`

## Returns

[`PaginatedFetcher`](../type-aliases/PaginatedFetcher.md)\<[`Milestone`](../type-aliases/Milestone.md)\>
