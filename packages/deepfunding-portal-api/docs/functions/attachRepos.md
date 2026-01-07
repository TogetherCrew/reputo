[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / attachRepos

# ~~Function: attachRepos()~~

> **attachRepos**(`db`): [`DeepFundingPortalDbWithRepos`](../type-aliases/DeepFundingPortalDbWithRepos.md)

Defined in: [packages/deepfunding-portal-api/src/resources/index.ts:100](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/index.ts#L100)

Attach repositories to a database instance

## Parameters

### db

[`DeepFundingPortalDb`](../type-aliases/DeepFundingPortalDb.md)

## Returns

[`DeepFundingPortalDbWithRepos`](../type-aliases/DeepFundingPortalDbWithRepos.md)

## Deprecated

Use repository functions directly with singleton pattern instead. Initialize database with initializeDb() from db module.
