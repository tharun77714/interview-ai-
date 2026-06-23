import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use standard connection string for Postgres.js
const connectionString = process.env.DATABASE_URL || '';

// Create query client. In serverless environments, this should be outside the handler
// to preserve connection pools, or use transaction-mode pooling.
const queryClient = postgres(connectionString, {
  prepare: false, // Required for some poolers
});

export const db = drizzle(queryClient, { schema });
