import { MongoMemoryReplSet } from 'mongodb-memory-server';

let mongo: MongoMemoryReplSet | null = null;

export async function startMongo(): Promise<string> {
  if (mongo) return mongo.getUri();
  mongo = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
    },
  });
  return mongo.getUri();
}

export function getMongoServer(): MongoMemoryReplSet {
  if (!mongo) throw new Error('MongoMemoryServer not started. Call startMongo() first.');
  return mongo;
}

export async function stopMongo(): Promise<void> {
  if (!mongo) return;
  await mongo.stop();
  mongo = null;
}
