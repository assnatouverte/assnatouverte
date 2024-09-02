import { loadEnvFile } from '.';
import type { Config } from 'drizzle-kit';

// Load environment variables
loadEnvFile();

export default {
    schema: './schema/*.ts',
    out: './migrations',
    driver: 'pg',
    dbCredentials: {
        host: process.env['DB_HOST']!,
        port: parseInt(process.env['DB_PORT']!),
        user: process.env['DB_USER'],
        password: process.env['DB_PASSWORD'],
        database: process.env['DB_NAME']!,
  },
} satisfies Config;
