import { sessions } from "@assnatouverte/db/sessions";
import { define } from "../../../utils.ts";
import { desc } from "drizzle-orm";

export const handler = define.handlers({
  async GET(ctx) {
    const result = await ctx.state.db.select().from(sessions).orderBy(desc(sessions.start));
    return Response.json(result);
  },
});
