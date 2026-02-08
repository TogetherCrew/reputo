[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / disconnect

# Function: disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [packages/database/src/connection.ts:44](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/connection.ts#L44)

Disconnects from MongoDB.

Closes all connections in the Mongoose connection pool. This should be called
when shutting down the application to ensure a clean disconnect.

## Returns

`Promise`\<`void`\>

Promise that resolves when the disconnection is complete

## Throws

If the disconnection fails

## Example

```ts
import { disconnect } from '@reputo/database'

await disconnect()
```
