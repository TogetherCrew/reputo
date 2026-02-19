[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / DeepFundingClient

# Type Alias: DeepFundingClient

> **DeepFundingClient** = `object`

Defined in: [packages/deepfunding-portal-api/src/api/client.ts:10](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/api/client.ts#L10)

DeepFunding Portal API client

## Properties

### config

> **config**: [`DeepFundingPortalApiConfig`](DeepFundingPortalApiConfig.md)

Defined in: [packages/deepfunding-portal-api/src/api/client.ts:12](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/api/client.ts#L12)

Full configuration

***

### limiter

> **limiter**: `ReturnType`\<*typeof* `pLimit`\>

Defined in: [packages/deepfunding-portal-api/src/api/client.ts:14](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/api/client.ts#L14)

Concurrency limiter

***

### get()

> **get**: \<`T`\>(`path`, `params?`) => `Promise`\<`T`\>

Defined in: [packages/deepfunding-portal-api/src/api/client.ts:16](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/api/client.ts#L16)

Execute a GET request with retry logic

#### Type Parameters

##### T

`T`

#### Parameters

##### path

`string`

##### params?

`Record`\<`string`, `string` \| `number`\>

#### Returns

`Promise`\<`T`\>
