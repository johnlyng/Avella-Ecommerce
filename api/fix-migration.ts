import * as dotenv from 'dotenv';
dotenv.config();
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Dropping partially created tables to fix migration state...');
    try {
        await db.execute(sql`DROP TABLE IF EXISTS "addresses" CASCADE;`);
        console.log('Dropped addresses.');
        await db.execute(sql`DROP TABLE IF EXISTS "inventory_levels" CASCADE;`);
        console.log('Dropped inventory_levels.');
    } catch (e) {
        console.error('Error dropping tables:', e);
    }
    console.log('Cleanup complete.');
    process.exit(0);
}

main().catch(console.error);
