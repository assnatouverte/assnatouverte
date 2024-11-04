import { resolve } from "@std/path/resolve";
import { loadSync } from "@std/dotenv";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate as drizzleMigrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { Table } from "drizzle-orm/table";
import { getTableColumns, type SQL, sql } from "drizzle-orm";

/** Environment variable names used */
const ENV_DB_HOST = "DB_HOST";
const ENV_DB_PORT = "DB_PORT";
const ENV_DB_USER = "DB_USER";
const ENV_DB_PASSWORD = "DB_PASSWORD";
const ENV_DB_NAME = "DB_NAME";

export type Database = PostgresJsDatabase;

/** Load environment file from root directory */
export function loadEnvFile() {
  const envPath = resolve(Deno.cwd(), ".env");
  loadSync({ envPath, export: true });
  checkEnvVariables();
}

/** Check that all environment variables needed for database connection are set */
export function checkEnvVariables() {
  for (
    const envName of [
      ENV_DB_HOST,
      ENV_DB_PORT,
      ENV_DB_USER,
      ENV_DB_PASSWORD,
      ENV_DB_NAME,
    ]
  ) {
    if (!Deno.env.has(envName)) {
      throw new Error(`La variable d'environement ${envName} est manquante`);
    }
  }
}

/** Create a Drizzle database connection from environment variables. */
export function createDb(): [postgres.Sql, Database] {
  checkEnvVariables();
  const client = postgres({
    host: Deno.env.get(ENV_DB_HOST)!,
    port: parseInt(Deno.env.get(ENV_DB_PORT)!),
    user: Deno.env.get(ENV_DB_USER)!,
    password: Deno.env.get(ENV_DB_PASSWORD)!,
    database: Deno.env.get(ENV_DB_NAME)!,
    ssl: "prefer",
  });
  const db = drizzle(client);
  return [client, db];
}

/** Perform all migrations to update the database schema to the latest */
export async function migrate(db: PostgresJsDatabase) {
  const migrationsFolder = resolve(import.meta.dirname || Deno.cwd(), "./migrations");
  await drizzleMigrate(db, {
    migrationsFolder,
    migrationsTable: "migrations",
    migrationsSchema: "public",
  });
}

/** Build the `set` argument of a `onConflictDoUpdate` to update all the columns */
export function buildConflictUpdateColumns<T extends Table>(
  table: T,
): Record<string, SQL> {
  const columns = getTableColumns(table)!;
  return Object.entries(columns).reduce((acc, [key, column]) => {
    acc[key] = sql.raw(`excluded.${column.name}`);
    return acc;
  }, {} as Record<string, SQL>);
}
