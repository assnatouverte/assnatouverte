import { define } from "../utils.ts";
import { proceedings, speeches } from "@assnatouverte/db/hansards";
import { sql, getTableColumns, eq, desc } from "drizzle-orm";
import { page } from "fresh";

export const handler = define.handlers({
    async GET(ctx) {
      const url = new URL(ctx.req.url);
      const query = url.searchParams.get("q") || "";

      /*const results = ctx.state.db.execute(
        sql`select speeches.order, ts_headline('french', text, query, 'MaxFragments=3') from speeches, to_tsquery('french', 'climat') query where search @@ query order by speeches.order;`.from()*/
      const matchQuery = sql`to_tsquery('french', ${query})`
      const results = await ctx.state.db.select({
        ...getTableColumns(speeches),
        ...getTableColumns(proceedings),
        extract: sql`ts_headline('french', text, ${matchQuery})`,
        rank: sql`ts_rank(search, ${matchQuery})`
      })
        .from(speeches)
        .innerJoin(proceedings, eq(proceedings.id, speeches.proceeding_id))
        .where(sql`${speeches.search} @@ ${matchQuery}`)
        .orderBy((t) => desc(t.rank))
        .limit(100);
    
      return page({ results, query });
    },
});

export default define.page<typeof handler>(({data}) => {
  const { results, query } = data;

  return (
    <div class="container mx-auto">
      <h1 class="my-6 text-4xl font-extrabold">Search</h1>
      <form class="max-w-lg mx-auto">
        <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input type="text" name="q" value={query} class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" placeholder="Mots-clés..." required />
            <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2">Recherche</button>
        </div>
      </form>
      <div>
        {results.map(({extract, rank}) => <p>[{rank}] {extract}</p>)}
      </div>
    </div>
  );
});
