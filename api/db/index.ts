import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create PostgreSQL connection pool
const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'avella',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    };

const pool = new Pool(poolConfig);

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Export schema for use in queries
export * from './schema';
