CREATE TABLE IF NOT EXISTS "members" (
	"id" varchar PRIMARY KEY NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"note" varchar,
	"assnat_url" varchar,
	"wikidata_id" varchar
);
