import { resolve } from "@std/path/resolve";
import type { CommandContext, Commands } from "../cli.ts";
import { readSessionsFromCsv, writeSessionsToCsv } from "./csv.ts";
import { getSessionsFromDb, insertSessionsInDb } from "./db.ts";
import { getSessionsFromAssNat } from "./assnat.ts";
import { rawDirectory } from "../utils/dir.ts";

function currentDir(): string {
  if (!import.meta.dirname) {
    throw new Error(
      "Les scripts de données doivent être exécutés depuis le dépôt cloné.",
    );
  }

  return import.meta.dirname;
}

/**
 * Commands related to members
 */
export const commands: Commands = {
  "update-db": {
    desc: "Met à jour la base données avec les dernières données du dépôt",
    exec: updateDb,
  },
  "assnat": {
    desc:
      "Obtient les session depuis le site web de l'Assemblée nationale du Québec",
    exec: getFromAssNat,
  },
};

/**
 * Met à jour la base données avec les dernières données du dépôt
 */
export async function updateDb(ctx: CommandContext): Promise<number> {
  const sessions = await readSessionsFromCsv(
    resolve(currentDir(), "sessions.csv"),
  );
  await insertSessionsInDb(ctx.db, sessions);

  const dbSessions = await getSessionsFromDb(ctx.db);
  console.log(`${dbSessions.length} sessions dans la base de données.`);

  return 0;
}

/**
 * Obtient les sessions depuis le site web de l'Assemblée nationale du Québec
 */
export async function getFromAssNat(): Promise<number> {
  const sessions = await getSessionsFromAssNat();
  await writeSessionsToCsv(sessions, resolve(rawDirectory, "sessions.csv"));
  console.log(`${sessions.length} sessions sur assnat.qc.ca.`);

  return 0;
}
