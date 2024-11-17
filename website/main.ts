import { App, fsRoutes, staticFiles } from "fresh";
import { type State } from "./utils.ts";
import { createDb, loadEnvFile } from "@assnatouverte/db";

// Create app
export const app = new App<State>();

// Create database only if running the app
if (!Deno.args.includes("build")) {
  // Load environment variables
  loadEnvFile();
  const [_conn, db] = createDb();

  // Middleware to set the database
  app.use((ctx) => {
    ctx.state.db = db;
    return ctx.next();
  });
}

// Host static files
app.use(staticFiles());

// Build routes
await fsRoutes(app, {
  dir: "./",
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

// Start listening (if run as main)
if (import.meta.main) {
  await app.listen();
}
