import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from 'dotenv';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate as drizzleMigrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { Table } from 'drizzle-orm/table';
import { SQL, getTableColumns, sql } from 'drizzle-orm';

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = dirname(currentFilename);

/** Environment variable names used */
const ENV_DB_HOST = 'DB_HOST';
const ENV_DB_PORT = 'DB_PORT';
const ENV_DB_USER = 'DB_USER';
const ENV_DB_PASSWORD = 'DB_PASSWORD';
const ENV_DB_NAME = 'DB_NAME';

export type Database = PostgresJsDatabase;

/** Load environment file from root directory */
export function loadEnvFile() {
    const envPath = resolve(currentDirname, "../.env");
    config({ path: envPath });
    checkEnvVariables();
}

/** Check that all environment variables needed for database connection are set */
export function checkEnvVariables() {
    for (const envName of [ENV_DB_HOST, ENV_DB_PORT, ENV_DB_USER, ENV_DB_PASSWORD, ENV_DB_NAME]) {
        if (!(envName in process.env)) {
            throw new Error(`La variable d'environement ${envName} est manquante`);
        }
    }
}

/** Create a Drizzle database connection from environment variables. */
export function createDb(): [postgres.Sql, Database] {
    checkEnvVariables();
    const client = postgres({
        host: process.env[ENV_DB_HOST]!,
        port: parseInt(process.env[ENV_DB_PORT]!),
        user: process.env[ENV_DB_USER]!,
        password: process.env[ENV_DB_PASSWORD]!,
        database: process.env[ENV_DB_NAME]!,
        ssl: 'prefer',
    });
    const db = drizzle(client);
    return [ client, db ];
}

/** Perform all migrations to update the database schema to the latest */
export async function migrate(db: PostgresJsDatabase) {
    const migrationsFolder = resolve(currentDirname, 'migrations');
    await drizzleMigrate(db, { migrationsFolder, migrationsTable: 'migrations', migrationsSchema: 'public' });
}

/** Build the `set` argument of a `onConflictDoUpdate` to update all the columns */
export function buildConflictUpdateColumns<T extends Table>(table: T): Record<string, SQL> {
    const columns = getTableColumns(table)!;
    return Object.entries(columns).reduce((acc, [key, column]) => {
        acc[key] = sql.raw(`excluded.${column.name}`);
        return acc;
    }, {} as Record<string, SQL>);
};
