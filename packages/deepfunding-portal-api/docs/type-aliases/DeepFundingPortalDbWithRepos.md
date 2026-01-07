[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / DeepFundingPortalDbWithRepos

# ~~Type Alias: DeepFundingPortalDbWithRepos~~

> **DeepFundingPortalDbWithRepos** = [`DeepFundingPortalDb`](DeepFundingPortalDb.md) & `object`

Defined in: [packages/deepfunding-portal-api/src/resources/index.ts:84](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/resources/index.ts#L84)

Extended database with repositories attached

## Type Declaration

### ~~rounds~~

> **rounds**: *typeof* [`roundsRepo`](../variables/roundsRepo.md)

### ~~pools~~

> **pools**: *typeof* [`poolsRepo`](../variables/poolsRepo.md)

### ~~proposals~~

> **proposals**: *typeof* [`proposalsRepo`](../variables/proposalsRepo.md)

### ~~users~~

> **users**: *typeof* [`usersRepo`](../variables/usersRepo.md)

### ~~milestones~~

> **milestones**: *typeof* [`milestonesRepo`](../variables/milestonesRepo.md)

### ~~reviews~~

> **reviews**: *typeof* [`reviewsRepo`](../variables/reviewsRepo.md)

### ~~comments~~

> **comments**: *typeof* [`commentsRepo`](../variables/commentsRepo.md)

### ~~commentVotes~~

> **commentVotes**: *typeof* [`commentVotesRepo`](../variables/commentVotesRepo.md)

## Deprecated

Use repository functions directly with singleton pattern instead
