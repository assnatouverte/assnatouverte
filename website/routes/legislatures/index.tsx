import { define } from "../../utils.ts";
import { sessions } from "@assnatouverte/db/sessions";
import { desc } from "drizzle-orm";
import { page } from "fresh";

export const handler = define.handlers({
  async GET(ctx) {
    const allLegislatures = await ctx.state.db.select().from(sessions).orderBy(
      desc(sessions.legislature),
      desc(sessions.session),
    );

    return page({ legislatures: allLegislatures });
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { legislatures } = data;
  const rows = legislatures.map((x) => (
    <tr>
      <td>{x.legislature}</td>
      <td>
        <a href={`/legislatures/${x.legislature}/${x.session}`}>{x.session}</a>
      </td>
      <td>{x.start.toISOString()}</td>
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>
          <th>Législature</th>
          <th>Sessions</th>
          <th>Début</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
});
