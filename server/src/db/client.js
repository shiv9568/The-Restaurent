import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();
const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/foodie_dash';
const isSupabase = /supabase\.co/.test(POSTGRES_URL) || (process.env.PG_SSL?.toLowerCase() === 'true');
export const pool = new Pool({
    connectionString: POSTGRES_URL,
    // Enable SSL for Supabase connections
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    // reasonable defaults
    max: 10,
    idleTimeoutMillis: 30000,
});
pool.on('error', (err) => {
    console.error('Unexpected Postgres client error', err);
});
export async function query(text, params) {
    return pool.query(text, params);
}
export async function connectAndTest() {
    const client = await pool.connect();
    try {
        await client.query('SELECT 1');
        console.log('✅ Connected to Postgres');
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=client.js.map