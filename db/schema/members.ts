import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, foreignKey, varchar, smallint } from 'drizzle-orm/pg-core';
import { sessions } from './sessions.ts';

// deno-lint-ignore no-slow-types
export const members = pgTable("members", {
  id: varchar("id").primaryKey(), // The assnat.qc.ca ID, found in the URL
  first_name: varchar("first_name").notNull(), // Member first name
  last_name: varchar("last_name").notNull(), // Member last name
  note: varchar("note"), // Optional note, used to differentiate members sharing the same name

  // External links
  assnat_url: varchar("assnat_url"), // Link to the assnat.qc.ca page
  wikidata_id: varchar("wikidata_id"), // Id to the Wikidata object
});

export const membersRelations = relations(members, ({many}) => ({
  membersToSessions: many(membersToSessions),
}));

// JOIN table to associate members to sessions
export const membersToSessions = pgTable('members_sessions', {
  legislature: smallint("legislature").notNull(),
  session: smallint("session").notNull(),
  member_id: varchar("member_id").notNull().references(() => members.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.legislature, t.session, t.member_id]}),
  fk: foreignKey({ columns: [t.legislature, t.session], foreignColumns: [sessions.legislature, sessions.session]})
}));

export const membersToSessionsRelations = relations(membersToSessions, ({ one }) => ({
  session: one(sessions, {
    fields: [membersToSessions.legislature, membersToSessions.session],
    references: [sessions.legislature, sessions.session],
  }),
  member: one(members, {
    fields: [membersToSessions.member_id],
    references: [members.id],
  }),
}));

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type MemberSession = typeof membersToSessions.$inferSelect;
export type NewMemberSession = typeof membersToSessions.$inferInsert;
