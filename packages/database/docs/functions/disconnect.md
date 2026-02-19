[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / disconnect

# Function: disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [packages/database/src/connection.ts:44](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/database/src/connection.ts#L44)

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
