import { parseArgs } from "@std/cli/parse-args";
import type { Database } from "@assnatouverte/db";
import { createDb, loadEnvFile } from "../db/mod.ts";
import { commands as dbCommands } from "./db/cli.ts";
import { commands as memberCommands } from "./members/cli.ts";
import { commands as sessionsCommands } from "./sessions/cli.ts";
import { commands as hansardsCommands } from "./hansards/cli.ts";

/**
 * Dictionnary of commands provided by a module
 */
export type Commands = Record<string, Command>;

/**
 * Command definition
 */
export interface Command {
  /** Description printed in the help menu (in French) */
  desc: string;
  /** Function to execute */
  exec: CommandExec;
}

/**
 * Context passed to every {@link CommandExec} function
 */
export interface CommandContext {
  db: Database;
  args: string[];
}

/**
 * Command function executed
 */
export type CommandExec = (ctx: CommandContext) => number | Promise<number>;

const commands: Record<string, Commands> = {
  "db": dbCommands,
  "membres": memberCommands,
  "sessions": sessionsCommands,
  "journaux": hansardsCommands,
};

function printHelp() {
  console.log("%c@assnatouverte/data - Aide", "font-weight: bold");
  console.log("");
  for (const module in commands) {
    console.log(module);

    for (const cmd in commands[module]) {
      console.log(`  ${cmd}: ${commands[module][cmd].desc}`);
    }
  }
}

export async function run(): Promise<number> {
  const args = parseArgs(Deno.args, {});

  if (args._.length < 2) {
    console.log("%cAucune commande spécifiée", "color: red");
    printHelp();
    return -1;
  }

  // Parse module name
  const moduleName = args._[0];
  if (!(moduleName in commands)) {
    console.log("%cModule inconnu", "color: red");
    printHelp();
    return -1;
  }
  const module = commands[moduleName];

  // Parse command name
  const commandName = args._[1];
  if (!(commandName in module)) {
    console.log("%cCommande inconnue", "color: red");
    printHelp();
    return -1;
  }
  const command = module[commandName];

  // Build context
  loadEnvFile();
  const [client, db] = createDb();
  const context = {
    db,
    args: args._.slice(2).map((arg) => arg.toString()),
  };

  // Execute command
  const result = await command.exec(context);

  // Cleanup
  client.end();

  return result;
}
