import drizzle from '@/drizzle';
import { schema } from '@/drizzle/schema'; 


let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  db = drizzle(connectionString, { schema });
  return db;
}

export type DATABASE_TYPES = ReturnType<typeof getDb>;