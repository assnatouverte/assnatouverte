CREATE TABLE IF NOT EXISTS "proceedings" (
	"id" varchar PRIMARY KEY NOT NULL,
	"legislature" smallint NOT NULL,
	"session" smallint NOT NULL,
	"date" date NOT NULL,
	"url" varchar NOT NULL,
	"volume" integer,
	"number" integer,
	"preliminary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "speeches" (
	"proceeding_id" varchar NOT NULL,
	"order" integer NOT NULL,
	"speaker" varchar NOT NULL,
	"member" varchar,
	"text" text NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (to_tsvector('french', "speeches"."text")) STORED,
	CONSTRAINT "speeches_proceeding_id_order_pk" PRIMARY KEY("proceeding_id","order")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "proceedings" ADD CONSTRAINT "proceedings_legislature_session_sessions_legislature_session_fk" FOREIGN KEY ("legislature","session") REFERENCES "public"."sessions"("legislature","session") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "speeches" ADD CONSTRAINT "speeches_member_members_id_fk" FOREIGN KEY ("member") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_idx" ON "speeches" USING gin ("search");