import { date, pgTable, primaryKey, smallint } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  legislature: smallint("legislature").notNull(), // Legislature number, starting at 1
  session: smallint("session").notNull(), // Session number, resets at 1 for every legislature
  start: date("start", { mode: "date" }).notNull(), // Start date of the session
  prorogation: date("prorogation", { mode: "date" }), // Prorogation date, marks the end of a session
  dissolution: date("dissolution", { mode: "date" }), // Dissolution date, marks the end of a legislature
}, (t) => {
  return {
    pk: primaryKey({ columns: [t.legislature, t.session] }),
  };
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
