import { sessions } from "@assnatouverte/db/sessions";
import { define } from "../../../utils.ts";
import { desc, eq } from "drizzle-orm";

export const handler = define.handlers({
  async GET(ctx) {
    const legislatureNum = parseInt(ctx.params.legislature);
    if(isNaN(legislatureNum)) {
        return new Response(JSON.stringify({message: "not a number"}), {status: 400})
    }
    const result = await ctx.state.db.select().from(sessions).where(eq(sessions.legislature, legislatureNum)).orderBy(desc(sessions.start));
    return Response.json(result);
  },
});
