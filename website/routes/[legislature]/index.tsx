import { define } from "../../utils.ts";
import { sessions } from "@assnatouverte/db/sessions";
import { eq } from "drizzle-orm";
import { HttpError } from "fresh";

export default define.page(async (props) => {
  const { legislature } = props.params;
  console.log(legislature);

  const allSessions = await props.state.db.select().from(sessions).where(eq(sessions.legislature, Number(legislature)));

  if (allSessions.length == 0) {
    throw new HttpError(404);
  }

  const rows = allSessions.map(x => 
    <tr>
      <td>{x.legislature}</td>
      <td><a href={`/${x.legislature}/${x.session}`}>{x.session}</a></td>
      <td>{x.start.toISOString()}</td>
    </tr>
  )

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
