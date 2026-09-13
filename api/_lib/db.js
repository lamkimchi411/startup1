import { neon } from '@neondatabase/serverless';

let _sql;

export function getDb() {
  if (!_sql) {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is missing in Vercel. Please set DATABASE_URL in Vercel Project Settings -> Environment Variables.');
    }
    _sql = neon(dbUrl);
  }
  return _sql;
}
