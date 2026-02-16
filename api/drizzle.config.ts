import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
    schema: './db/schema.ts',
    out: './db/migrations',
    dialect: 'postgresql',
    dbCredentials: process.env.DATABASE_URL
        ? {
            url: process.env.DATABASE_URL
        }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'avella'
        }
} satisfies Config;
