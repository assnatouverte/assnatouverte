import { buildConflictUpdateColumns, type Database } from "@assnatouverte/db";
import {
  type Member,
  members,
  type MemberSession,
  membersToSessions,
} from "@assnatouverte/db/members";
import { asc } from "drizzle-orm";

/** Insert all members into the database */
export async function insertMembersInDb(
  db: Database,
  data: Member[],
): Promise<void> {
  await db.insert(members)
    .values(data)
    .onConflictDoUpdate({
      target: members.id,
      set: buildConflictUpdateColumns(members),
    });
}

/** Get all members */
export async function getMembersFromDb(db: Database): Promise<Member[]> {
  return await db.select().from(members).orderBy(asc(members.id));
}

/** Insert all member to session associations into the database */
export async function insertMembersSessionsInDb(
  db: Database,
  data: MemberSession[],
): Promise<void> {
  await db.insert(membersToSessions)
    .values(data)
    .onConflictDoUpdate({
      target: [
        membersToSessions.legislature,
        membersToSessions.session,
        membersToSessions.member_id,
      ],
      set: buildConflictUpdateColumns(membersToSessions),
    });
}
