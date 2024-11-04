import { loadEnvFile } from "./mod.ts";
import type { Config } from "drizzle-kit";

// Load environment variables
loadEnvFile();

export default {
  schema: "./schema/*.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: Deno.env.get("DB_HOST")!,
    port: parseInt(Deno.env.get("DB_PORT")!),
    user: Deno.env.get("DB_USER")!,
    password: Deno.env.get("DB_PASSWORD")!,
    database: Deno.env.get("DB_NAME")!,
  },
} satisfies Config;
