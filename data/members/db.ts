import { Database, buildConflictUpdateColumns } from 'assnatouverte-db';
import { members, Member } from 'assnatouverte-db/schema/members';
import { asc } from 'drizzle-orm';

/** Insert all members into the database */
export async function insertMembersInDb(db: Database, data: Member[]): Promise<void> {
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
