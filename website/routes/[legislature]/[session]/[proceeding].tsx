import { define } from "../../../utils.ts";
import { proceedings, speeches } from "@assnatouverte/db/hansards";
import { and, asc, eq } from "drizzle-orm";
import { HttpError, page } from "fresh";

export const handler = define.handlers({
  async GET(ctx) {
    const { proceeding } = ctx.params;

    const proc = await ctx.state.db.select()
      .from(proceedings)
      .where(eq(proceedings.id, proceeding));

    const allSpeeches = await ctx.state.db.select()
      .from(speeches)
      .where(and(eq(speeches.proceeding_id, proceeding)))
      .orderBy(asc(speeches.order));

    if (proc.length !== 1) {
      throw new HttpError(404);
    }

    return page({ proceeding: proc, speeches: allSpeeches });
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { proceeding, speeches } = data;
  const speechesEl = speeches.map((x) => {
    const paragraphs = x.text.split("\n").map((x) => <p class="pb-2">{x}</p>);

    return (
      <div class="my-3 p-4 border">
        <em>{x.speaker} :</em>
        {paragraphs}
      </div>
    );
  });

  return (
    <div class="container mx-auto">
      <h1>{proceeding[0].id}</h1>
      {speechesEl}
    </div>
  );
});
