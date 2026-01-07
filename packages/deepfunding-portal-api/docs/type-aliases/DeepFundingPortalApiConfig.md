[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / DeepFundingPortalApiConfig

# Type Alias: DeepFundingPortalApiConfig

> **DeepFundingPortalApiConfig** = `object`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:16](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L16)

Configuration for the DeepFunding Portal API client

## Properties

### baseUrl

> **baseUrl**: `string`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:18](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L18)

Base URL of the API (required)

***

### apiKey

> **apiKey**: `string`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:20](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L20)

API key for authentication (required)

***

### requestTimeoutMs

> **requestTimeoutMs**: `number`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:22](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L22)

Request timeout in milliseconds (default: 45000)

***

### concurrency

> **concurrency**: `number`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:24](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L24)

Maximum concurrent requests (default: 4)

***

### retry

> **retry**: [`RetryConfig`](RetryConfig.md)

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:26](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L26)

Retry configuration

***

### defaultPageLimit

> **defaultPageLimit**: `number`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:28](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L28)

Default page limit for paginated requests (default: 500)
