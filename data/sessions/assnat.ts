import * as cheerio from "cheerio";
import { http } from "../utils/http.ts";
import { extractDateStr } from "../utils/date.ts";
import type { Session } from "@assnatouverte/db/sessions";

/** Extract sessions from the AssNat website */
export async function getSessionsFromAssNat(): Promise<Session[]> {
  const mainPageReq = await http.get(
    "http://www.assnat.qc.ca/fr/patrimoine/datesessions.html",
  ).text();
  const $ = cheerio.load(mainPageReq);

  // Find table
  const rows = $(
    ".tableauLegisSessionsDepuis1867>tbody>tr:nth-of-type(n+3)",
  ).toArray();
  console.log(`${rows.length} rangées trouvées.`);

  const sessions: Session[] = [];

  // Extract sessions
  let currentLegislature = 0;
  for (const row of rows) {
    const r = $(row);

    // Update current legislature
    const legislatureIdStr = r.find("td:nth-of-type(1)").text().trim();
    if (legislatureIdStr) {
      const legislatureId = Number(legislatureIdStr.replace(/[re]/g, ""));
      currentLegislature = legislatureId;
    }

    // Extract the session (and ignore extra lines)
    const sessionIdStr = r.find("td:nth-of-type(2)").text().trim();
    if (!sessionIdStr) {
      continue;
    }
    const sessionId = Number(sessionIdStr.replace(/[re]/g, ""));

    // Extract the dates
    let startDate = undefined;
    const startDateStr = r.find("td:nth-of-type(3)").text().trim();
    if (startDateStr) {
      startDate = extractDateStr(startDateStr);
    }

    let prorogationDate = undefined;
    const prorogationDateStr = r.find("td:nth-of-type(4)").text().trim();
    if (prorogationDateStr) {
      prorogationDate = extractDateStr(prorogationDateStr);
    }

    let dissolutionDate = undefined;
    const dissolutionDateStr = r.find("td:nth-of-type(5)").text().trim();
    if (dissolutionDateStr) {
      dissolutionDate = extractDateStr(dissolutionDateStr);
    }

    sessions.push({
      legislature: currentLegislature,
      session: sessionId,
      start: startDate,
      prorogation: prorogationDate,
      dissolution: dissolutionDate,
    });
  }

  return sessions;
}
