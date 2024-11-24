import { members } from "@assnatouverte/db/members";
import { define } from "../../utils.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const result = await ctx.state.db.select().from(members);
    return Response.json(result);
  },
});
