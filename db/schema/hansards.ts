import { relations, type SQL, sql } from "drizzle-orm";
import {
  boolean,
  customType,
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { sessions } from "./sessions.ts";
import { members } from "./members.ts";

const tsVector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const proceedings = pgTable("proceedings", {
  id: varchar("id").primaryKey(),
  legislature: smallint("legislature").notNull(),
  session: smallint("session").notNull(),
  date: date("date", { mode: "date" }).notNull(),
  url: varchar("url").notNull(),
  volume: integer("volume"),
  number: integer("number"),
  preliminary: boolean("preliminary").default(false).notNull(),
}, (t) => ({
  fk_session: foreignKey({
    columns: [t.legislature, t.session],
    foreignColumns: [sessions.legislature, sessions.session],
  }),
}));

export const proceedingsRelations = relations(proceedings, ({ one }) => ({
  session: one(sessions, {
    fields: [proceedings.legislature, proceedings.session],
    references: [sessions.legislature, sessions.session],
  }),
}));

export const speeches = pgTable("speeches", {
  proceeding_id: varchar("proceeding_id").notNull(),
  order: integer("order").notNull(),
  speaker: varchar("speaker").notNull(),
  member_id: varchar("member").references(() => members.id),
  text: text("text").notNull(),
  search: tsVector("search").generatedAlwaysAs((): SQL =>
    sql`to_tsvector('french', ${speeches.text})`
  ),
}, (t) => ({
  pk: primaryKey({ columns: [t.proceeding_id, t.order] }),
  search_idx: index("search_idx").using("gin", t.search),
}));

export type Proceeding = typeof proceedings.$inferSelect;
export type NewProceeding = typeof proceedings.$inferInsert;
export type Speech = typeof speeches.$inferSelect;
export type NewSpeech = typeof speeches.$inferInsert;
