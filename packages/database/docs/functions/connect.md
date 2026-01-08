[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / connect

# Function: connect()

> **connect**(`uri`): `Promise`\<`void`\>

Defined in: [packages/database/src/connection.ts:17](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/connection.ts#L17)

Connects to MongoDB using the provided connection URI.

## Parameters

### uri

`string`

MongoDB connection URI (e.g., 'mongodb://localhost:27017/reputo')

## Returns

`Promise`\<`void`\>

Promise that resolves when the connection is established

## Throws

If the connection fails

## Example

```ts
import { connect } from '@reputo/database'

await connect('mongodb://localhost:27017/reputo')
```
