import { define } from "../../utils.ts";
import { sql } from "drizzle-orm";

export const handler = define.handlers({
  async GET(ctx) {
    const x = await ctx.state.db.execute(
      sql`select * from pg_stat_activity where application_name like 'assnatouverte'`,
    );
    return Response.json(x);
  },
});
