import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the provided connection URI.
 *
 * @param uri - MongoDB connection URI (e.g., 'mongodb://localhost:27017/reputo')
 * @returns Promise that resolves when the connection is established
 * @throws {Error} If the connection fails
 *
 * @example
 * ```ts
 * import { connect } from '@reputo/database'
 *
 * await connect('mongodb://localhost:27017/reputo')
 * ```
 */
export async function connect(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Failed to connect to MongoDB: ${msg}`);
    throw new Error(`Failed to connect to MongoDB: ${msg}`);
  }
}

/**
 * Disconnects from MongoDB.
 *
 * Closes all connections in the Mongoose connection pool. This should be called
 * when shutting down the application to ensure a clean disconnect.
 *
 * @returns Promise that resolves when the disconnection is complete
 * @throws {Error} If the disconnection fails
 *
 * @example
 * ```ts
 * import { disconnect } from '@reputo/database'
 *
 * await disconnect()
 * ```
 */
export async function disconnect(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Failed to disconnect from MongoDB: ${msg}`);
    throw new Error(`Failed to disconnect from MongoDB: ${msg}`);
  }
}
