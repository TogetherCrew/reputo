[**@reputo/deepfunding-portal-api v0.0.0**](../README.md)

***

[@reputo/deepfunding-portal-api](../globals.md) / endpoints

# Variable: endpoints

> `const` **endpoints**: `object`

Defined in: [packages/deepfunding-portal-api/src/api/endpoints.ts:4](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/deepfunding-portal-api/src/api/endpoints.ts#L4)

API endpoint path builders for the DeepFunding Portal API

## Type Declaration

### rounds()

> `readonly` **rounds**: () => `string`

Get all funding rounds

#### Returns

`string`

### pools()

> `readonly` **pools**: () => `string`

Get all funding pools

#### Returns

`string`

### proposals()

> `readonly` **proposals**: (`roundId`) => `string`

Get proposals for a specific round

#### Parameters

##### roundId

`number`

#### Returns

`string`

### users()

> `readonly` **users**: () => `string`

Get all users

#### Returns

`string`

### milestones()

> `readonly` **milestones**: () => `string`

Get all milestones

#### Returns

`string`

### reviews()

> `readonly` **reviews**: () => `string`

Get all reviews

#### Returns

`string`

### comments()

> `readonly` **comments**: () => `string`

Get all comments

#### Returns

`string`

### commentVotes()

> `readonly` **commentVotes**: () => `string`

Get all comment votes

#### Returns

`string`
