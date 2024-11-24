import { resolve } from "@std/path/resolve";
import type { CommandContext, Commands } from "../cli.ts";
import { readMembersFromCsv, readMembersSessionsFromCsv } from "./csv.ts";
import { insertMembersInDb, insertMembersSessionsInDb } from "./db.ts";
import {
  getMembersFromWikidata,
  writeMemberWikidataToCsv,
} from "./wikidata.ts";
import {
  getMembersFromAssNat,
  getMembersSessionsFromAssNat,
  writeMemberAssNatToCsv,
  writeMembersSessionsAssNatToCsv,
} from "./assnat.ts";
import { rawDirectory } from "../utils/dir.ts";
import { members, membersToSessions } from "@assnatouverte/db/members";

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
  "maj-membres-db": {
    desc: "Met à jour la base données avec les membres du fichier CSV",
    exec: taskUpdateMembersDb,
  },
  "assnat": {
    desc:
      "Obtient les membres depuis le site web de l'Assemblée nationale du Québec",
    exec: taskGetFromAssNat,
  },
  "wikidata": {
    desc: "Obtient les membres depuis les données Wikidata",
    exec: taskGetFromWikidata,
  },
  "assnat-sessions": {
    desc:
      "Obtient les associations entre les membres et les sessions parlementaires depuis le site web de l'Assemblée nationale du Québec",
    exec: taskGetMembersSessionsFromAssNat,
  },
  "maj-membres-sessions-db": {
    desc:
      "Met à jour la base données avec les association entre les membres et les sessions parlementaires du fichier CSV",
    exec: taskUpdateMembersSessionsDb,
  },
};

/**
 * Met à jour la base données avec les dernières données du dépôt
 */
export async function taskUpdateMembersDb(
  ctx: CommandContext,
): Promise<number> {
  const csvMembers = await readMembersFromCsv(
    resolve(currentDir(), "members.csv"),
  );
  await insertMembersInDb(ctx.db, csvMembers);

  const numMembers = await ctx.db.$count(members);
  console.log(`${numMembers} membres dans la base de données.`);

  return 0;
}

/**
 * Obtient les membres depuis le site web de l'Assemblée nationale du Québec
 */
export async function taskGetFromAssNat(): Promise<number> {
  const members = await getMembersFromAssNat();
  await writeMemberAssNatToCsv(members, resolve(rawDirectory, "assnat.csv"));
  console.log(`${members.length} membres sur assnat.qc.ca.`);

  return 0;
}

/**
 * Obtient les membres depuis les données Wikidata
 */
export async function taskGetFromWikidata(): Promise<number> {
  const members = await getMembersFromWikidata();
  await writeMemberWikidataToCsv(
    members,
    resolve(rawDirectory, "wikidata.csv"),
  );
  console.log(`${members.length} membres dans Wikidata.`);

  return 0;
}

/**
 * Associe les membres aux sessions parlementaires
 */
export async function taskGetMembersSessionsFromAssNat(
  ctx: CommandContext,
): Promise<number> {
  const associations = await getMembersSessionsFromAssNat(ctx.db);
  await writeMembersSessionsAssNatToCsv(
    associations,
    resolve(rawDirectory, "members_sessions.csv"),
  );
  console.log(
    `${associations.length} associations membre/session retrouvées sur assnat.qc.ca.`,
  );

  return 0;
}

/**
 * Met à jour la base données avec les dernières données du dépôt
 */
export async function taskUpdateMembersSessionsDb(
  ctx: CommandContext,
): Promise<number> {
  const members = await readMembersSessionsFromCsv(
    resolve(currentDir(), "members_sessions.csv"),
  );
  await insertMembersSessionsInDb(ctx.db, members);

  const numMembersSessions = await ctx.db.$count(membersToSessions);
  console.log(
    `${numMembersSessions} associations membre/session dans la base de données.`,
  );

  return 0;
}
