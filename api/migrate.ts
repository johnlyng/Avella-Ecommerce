import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'avella',
    };

const pool = new Pool(poolConfig);
const db = drizzle(pool);

async function main() {
    console.log('Running migrations...');
    // Use absolute path or relative to execution context
    // Since we run from api/, ./db/migrations is correct
    await migrate(db, { migrationsFolder: path.join(__dirname, 'db/migrations') });
    console.log('Migrations completed!');
    await pool.end();
}

main().catch((err) => {
    console.error('Migration failed!');
    console.error(err);
    process.exit(1);
});
