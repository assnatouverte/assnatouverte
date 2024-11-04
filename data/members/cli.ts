import { resolve } from "@std/path/resolve";
import type { Commands, CommandContext } from "../cli.ts";
import { readMembersFromCsv } from "./csv.ts";
import { getMembersFromDb, insertMembersInDb } from "./db.ts";
import { getMembersFromWikidata, writeMemberWikidataToCsv } from "./wikidata.ts";
import { getMembersFromAssNat, writeMemberAssNatToCsv } from "./assnat.ts";
import { rawDirectory } from "../utils/dir.ts";

function currentDir(): string {
  if(!import.meta.dirname) {
    throw new Error("Les scripts de données doivent être exécutés depuis le dépôt cloné.");
  }

  return import.meta.dirname 
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
    desc: "Obtient les membres depuis le site web de l'Assemblée nationale du Québec",
    exec: getFromAssNat,
  },
  "wikidata": {
    desc: "Obtient les membres depuis les données Wikidata",
    exec: getFromWikidata,
  },
}

/**
 * Met à jour la base données avec les dernières données du dépôt
 */
export async function updateDb(ctx: CommandContext): Promise<number> {
  const members = await readMembersFromCsv(
    resolve(currentDir(), "members.csv"),
  );
  await insertMembersInDb(ctx.db, members);

  const dbMembers = await getMembersFromDb(ctx.db);
  console.log(`${dbMembers.length} membres dans la base de données.`);

  return 0;
}

/**
 * Obtient les membres depuis le site web de l'Assemblée nationale du Québec
 */
export async function getFromAssNat(): Promise<number> {
  const members = await getMembersFromAssNat();
  await writeMemberAssNatToCsv(members, resolve(rawDirectory, "assnat.csv"));
  console.log(`${members.length} membres sur assnat.qc.ca.`);

  return 0;
}

/**
 * Obtient les membres depuis les données Wikidata
 */
export async function getFromWikidata(): Promise<number> {
  const members = await getMembersFromWikidata();
  await writeMemberWikidataToCsv(members, resolve(rawDirectory, "wikidata.csv"));
  console.log(`${members.length} membres dans Wikidata.`);

  return 0;
}
