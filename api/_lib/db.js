import { neon } from '@neondatabase/serverless';

let _sql;

export function getDb() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required. Set it in Vercel Environment Variables.');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}
