CREATE TABLE IF NOT EXISTS "members_sessions" (
	"legislature" smallint NOT NULL,
	"session" smallint NOT NULL,
	"member_id" varchar NOT NULL,
	CONSTRAINT "members_sessions_legislature_session_member_id_pk" PRIMARY KEY("legislature","session","member_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_legislature_session_sessions_legislature_session_fk" FOREIGN KEY ("legislature","session") REFERENCES "public"."sessions"("legislature","session") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
