[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / RetryConfig

# Type Alias: RetryConfig

> **RetryConfig** = `object`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:4](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L4)

Retry configuration for HTTP requests

## Properties

### maxAttempts

> **maxAttempts**: `number`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:6](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L6)

Maximum number of retry attempts

***

### baseDelayMs

> **baseDelayMs**: `number`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:8](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L8)

Base delay in milliseconds for exponential backoff

***

### maxDelayMs

> **maxDelayMs**: `number`

Defined in: [packages/deepfunding-portal-api/src/shared/types/api-config.ts:10](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/deepfunding-portal-api/src/shared/types/api-config.ts#L10)

Maximum delay in milliseconds between retries
