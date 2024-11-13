import { App, fsRoutes, staticFiles } from "fresh";
import { type State } from "./utils.ts";
import { createDb, loadEnvFile } from "@assnatouverte/db";

// Load environment variables
loadEnvFile();
const [conn, db] = createDb();

// Create app
export const app = new App<State>();

// Middleware to set the database
app.use((ctx) => {
  ctx.state.db = db;
  return ctx.next();
})

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
