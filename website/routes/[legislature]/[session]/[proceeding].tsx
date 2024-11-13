import { define } from "../../../utils.ts";
import { proceedings, speeches } from "@assnatouverte/db/hansards";
import { and, eq, asc } from "drizzle-orm";
import { HttpError } from "fresh";

export default define.page(async (props) => {
  const { legislature, session, proceeding } = props.params;

  const proc = await props.state.db.select()
    .from(proceedings)
    .where(eq(proceedings.id, proceeding));

  const allSpeeches = await props.state.db.select()
    .from(speeches)
    .where(and(eq(speeches.proceeding_id, proceeding)))
    .orderBy(asc(speeches.order));

  if (proc.length !== 1) {
    throw new HttpError(404);
  }

  const speechesEl = allSpeeches.map(x => {
    const paragraphs = x.text.split("\n").map(x => 
        <p class="pb-2">{x}</p>
    )

    return (
        <div class="my-3 p-4 border">
            <em>{x.speaker} :</em>
            {paragraphs}
        </div>
    )
  });

  return (
    <div class="container mx-auto">
        <h1>{proc[0].id}</h1>
        {speechesEl}
    </div>
  );
});
