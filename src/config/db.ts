import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    // Build connection URI with database name
    let connectionUri = env.MONGO_URI;

    // If DB_NAME is specified and not already in URI, append it
    if (env.DB_NAME && !connectionUri.includes('?')) {
      connectionUri = `${connectionUri}/${env.DB_NAME}?retryWrites=true&w=majority`;
    } else if (env.DB_NAME && connectionUri.includes('?')) {
      // Replace the path before the query string
      const [baseUri, queryString] = connectionUri.split('?');
      const uriParts = baseUri.split('/');
      if (uriParts.length >= 3) {
        uriParts[uriParts.length - 1] = env.DB_NAME;
        connectionUri = `${uriParts.join('/')}?${queryString}`;
      }
    }

    const conn = await mongoose.connect(connectionUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};
