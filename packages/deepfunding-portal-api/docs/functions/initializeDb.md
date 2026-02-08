[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / initializeDb

# Function: initializeDb()

> **initializeDb**(`options`): [`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

Defined in: [packages/deepfunding-portal-api/src/db/client.ts:41](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/deepfunding-portal-api/src/db/client.ts#L41)

Initialize the singleton database instance

## Parameters

### options

[`CreateDbOptions`](../type-aliases/CreateDbOptions.md)

Database creation options

## Returns

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Throws

If the file exists and overwrite is not true
