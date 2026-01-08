[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createNewDeepFundingDb

# ~~Function: createNewDeepFundingDb()~~

> **createNewDeepFundingDb**(`options`): [`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

Defined in: [packages/deepfunding-portal-api/src/db/client.ts:71](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/deepfunding-portal-api/src/db/client.ts#L71)

Create a new DeepFunding Portal database

## Parameters

### options

[`CreateDbOptions`](../type-aliases/CreateDbOptions.md)

## Returns

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Deprecated

Use initializeDb() instead for singleton pattern

## Throws

If the file exists and overwrite is not true
