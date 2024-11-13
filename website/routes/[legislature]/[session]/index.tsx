import { define } from "../../../utils.ts";
import { proceedings } from "@assnatouverte/db/hansards";
import { and, eq, desc } from "drizzle-orm";
import { HttpError } from "fresh";

export default define.page(async (props) => {
  const { legislature, session } = props.params;

  const proc = await props.state.db.select()
    .from(proceedings)
    .where(and(eq(proceedings.legislature, Number(legislature)), eq(proceedings.session, Number(session))))
    .orderBy(desc(proceedings.date));

  if (proc.length == 0) {
    throw new HttpError(404);
  }

  const rows = proc.map(x => 
    <tr class="even:bg-gray-100 odd:bg-white">
      <td class="p-2 text-sm text-gray-700"><a class="font-bold text-blue-500 hover:underline" href={`/${x.legislature}/${x.session}/${x.id}`}>{x.id}</a></td>
      <td class="p-2 text-sm text-gray-700">{x.volume}</td>
      <td class="p-2 text-sm text-gray-700">{x.number}</td>
      <td class="p-2 text-sm text-gray-700">{x.date.toISOString()}</td>
      <td class="p-2 text-sm text-gray-700"><a class="font-bold text-blue-500 hover:underline" href={`https://www.assnat.qc.ca${x.url}`}>{x.id}</a></td>
    </tr>
  );

  return (
    <div class="container mx-auto">
      <h1 class="my-6 text-4xl font-extrabold">Session {legislature}-{session}</h1>
      <div class="overflow-auto rounded-lg shadow">
        <table class="w-full">
          <thead class="bg-gray-200 border-b-2 border-gray-200">
            <tr>
              <th class="p-3 text-sm font-semibold  text-left">ID</th>
              <th class="p-3 text-sm font-semibold  text-left">Vol.</th>
              <th class="p-3 text-sm font-semibold  text-left">N°</th>
              <th class="p-3 text-sm font-semibold  text-left">Date</th>
              <th class="p-3 text-sm font-semibold  text-left">Lien original</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  );
});
