CREATE TYPE "public"."gender" AS ENUM('M', 'F');--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "gender" "gender" NOT NULL;