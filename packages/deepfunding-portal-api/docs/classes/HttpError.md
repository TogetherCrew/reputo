[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / HttpError

# Class: HttpError

Defined in: [packages/deepfunding-portal-api/src/shared/errors/index.ts:4](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/shared/errors/index.ts#L4)

HTTP error with status code

## Extends

- `Error`

## Constructors

### Constructor

> **new HttpError**(`statusCode`, `statusText`, `body?`): `HttpError`

Defined in: [packages/deepfunding-portal-api/src/shared/errors/index.ts:5](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/shared/errors/index.ts#L5)

#### Parameters

##### statusCode

`number`

##### statusText

`string`

##### body?

`string`

#### Returns

`HttpError`

#### Overrides

`Error.constructor`

## Properties

### statusCode

> `readonly` **statusCode**: `number`

Defined in: [packages/deepfunding-portal-api/src/shared/errors/index.ts:6](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/shared/errors/index.ts#L6)

***

### statusText

> `readonly` **statusText**: `string`

Defined in: [packages/deepfunding-portal-api/src/shared/errors/index.ts:7](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/shared/errors/index.ts#L7)

***

### body?

> `readonly` `optional` **body**: `string`

Defined in: [packages/deepfunding-portal-api/src/shared/errors/index.ts:8](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/shared/errors/index.ts#L8)
