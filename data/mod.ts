import { run } from "./cli.ts";

if (import.meta.main) {
  const result = await run();
  Deno.exit(result);
}
