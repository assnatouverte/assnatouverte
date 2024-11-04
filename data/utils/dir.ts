import { resolve } from "@std/path/resolve";

export const rawDirectory = import.meta.dirname ? resolve(import.meta.dirname, "../raw") : resolve(Deno.cwd(), "raw");
