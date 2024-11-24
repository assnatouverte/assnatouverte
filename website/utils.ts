import { createDefine } from "fresh";
import type { Database } from "@assnatouverte/db";

export interface State {
  db: Database;
}

export const define = createDefine<State>();
