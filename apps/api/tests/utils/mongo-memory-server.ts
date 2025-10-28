import { MongoMemoryServer } from 'mongodb-memory-server'

let mongo: MongoMemoryServer | null = null

export async function startMongo(): Promise<string> {
    if (mongo) return mongo.getUri()
    mongo = await MongoMemoryServer.create()
    return mongo.getUri()
}

export function getMongoServer(): MongoMemoryServer {
    if (!mongo)
        throw new Error(
            'MongoMemoryServer not started. Call startMongo() first.'
        )
    return mongo
}

export async function stopMongo(): Promise<void> {
    if (!mongo) return
    await mongo.stop()
    mongo = null
}
