[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / createDb

# Function: createDb()

> **createDb**(`options`): [`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

Defined in: [packages/deepfunding-portal-api/src/db/client.ts:20](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/deepfunding-portal-api/src/db/client.ts#L20)

Create an independent database instance.

Each call returns a fresh connection that does **not** share state with any
other instance, making it safe for concurrent algorithm executions.

Callers are responsible for closing the instance via [closeDbInstance](closeDbInstance.md).

## Parameters

### options

[`CreateDbOptions`](../type-aliases/CreateDbOptions.md)

## Returns

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)
