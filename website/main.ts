import { App, fsRoutes, staticFiles } from "fresh";
import { type State } from "./utils.ts";

// Create app
export const app = new App<State>();

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
