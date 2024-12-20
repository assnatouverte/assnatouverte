import { buildConflictUpdateColumns, type Database } from "@assnatouverte/db";
import { type Session, sessions } from "@assnatouverte/db/sessions";
import { asc } from "drizzle-orm";

/** Insert all sessions into the database */
export async function insertSessionsInDb(
  db: Database,
  data: Session[],
): Promise<void> {
  await db.insert(sessions)
    .values(data)
    .onConflictDoUpdate({
      target: [sessions.legislature, sessions.session],
      set: buildConflictUpdateColumns(sessions),
    });
}

/** Get all sessions */
export async function getSessionsFromDb(db: Database): Promise<Session[]> {
  return await db.select().from(sessions).orderBy(
    asc(sessions.legislature),
    asc(sessions.session),
  );
}
