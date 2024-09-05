import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const members = pgTable('members', {
    id: varchar('id').primaryKey(), // The assnat.qc.ca ID, found in the URL
    first_name: varchar('first_name').notNull(), // Member first name
    last_name: varchar('last_name').notNull(), // Member last name
    note: varchar('note'), // Optional note, used to differentiate members sharing the same name

    // External links
    assnat_url: varchar('assnat_url'), // Link to the assnat.qc.ca page
    wikidata_id: varchar('wikidata_id'), // Id to the Wikidata object
});

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
