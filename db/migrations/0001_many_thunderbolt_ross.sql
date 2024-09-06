CREATE TABLE IF NOT EXISTS "sessions" (
	"legislature" smallint NOT NULL,
	"session" smallint NOT NULL,
	"start" date NOT NULL,
	"prorogation" date,
	"dissolution" date,
	CONSTRAINT "sessions_legislature_session_pk" PRIMARY KEY("legislature","session")
);
