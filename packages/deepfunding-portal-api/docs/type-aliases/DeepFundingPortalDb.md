[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / DeepFundingPortalDb

# Type Alias: DeepFundingPortalDb

> **DeepFundingPortalDb** = `object`

Defined in: [packages/deepfunding-portal-api/src/shared/types/db.ts:17](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/db.ts#L17)

DeepFunding Portal database wrapper

Note: The drizzle type is inferred from the schema at runtime.
This type represents the structure without the full drizzle type.

## Properties

### sqlite

> **sqlite**: `Database.Database`

Defined in: [packages/deepfunding-portal-api/src/shared/types/db.ts:19](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/db.ts#L19)

Underlying SQLite database connection

***

### drizzle

> **drizzle**: `ReturnType`\<`drizzle`\>

Defined in: [packages/deepfunding-portal-api/src/shared/types/db.ts:21](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/db.ts#L21)

Drizzle ORM database instance
