import { define } from "../../../utils.ts";
import { sessions } from "@assnatouverte/db/sessions";
import { eq } from "drizzle-orm";
import { HttpError, page } from "fresh";

export const handler = define.handlers({
  async GET(ctx) {
    const { legislature } = ctx.params;
    console.log(legislature);

    const allSessions = await ctx.state.db.select().from(sessions).where(
      eq(sessions.legislature, Number(legislature)),
    );

    if (allSessions.length == 0) {
      throw new HttpError(404);
    }

    return page({ sessions: allSessions });
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { sessions } = data;
  const rows = sessions.map((x) => (
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
