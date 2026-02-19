[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createDb

# Function: createDb()

> **createDb**(`options`): [`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

Defined in: [packages/deepfunding-portal-api/src/db/client.ts:20](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/db/client.ts#L20)

Create an independent database instance.

Each call returns a fresh connection that does **not** share state with any
other instance, making it safe for concurrent algorithm executions.

Callers are responsible for closing the instance via [closeDbInstance](closeDbInstance.md).

## Parameters

### options

[`CreateDbOptions`](../type-aliases/CreateDbOptions.md)

## Returns

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)
