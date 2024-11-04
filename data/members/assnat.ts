import * as cheerio from "cheerio";
import { Bar, Presets } from "cli-progress";
import { http } from "../utils/http.ts";
import { CsvStringifyStream } from "@std/csv/stringify-stream";

/**
 * Member extracted from the official AssNat website
 */
export interface MemberAssNat {
  id: string,
  first_name: string,
  last_name: string,
  note?: string,
  assnat_url: string,
}

/**
 * Extract all members from the official AssNat website
 * 
 * It also prints a progress bar to the console.
 */
export async function getMembersFromAssNat(): Promise<MemberAssNat[]> {
  const mainPageReq = await http.get(
    "http://www.assnat.qc.ca/fr/membres/notices/index.html",
  ).text();
  const mainPage = cheerio.load(mainPageReq);

  // Find links to download
  const links = mainPage(".colonneImbriquee>p:nth-of-type(3)>a").map((_, el) =>
    el.attribs["href"]
  ).toArray();
  console.log(`${links.length} pages à lire`);

  // Setup progress bar
  const progress = new Bar({
    clearOnComplete: true,
    hideCursor: true,
    format: "{bar} | {value}/{total} ({percentage}%)",
  }, Presets.shades_classic);
  progress.start(links.length, 0);

  // Regex used later
  const reMemberId = /\/([a-z0-9\-\(\)]+)(\/index)?\.html/;
  const reParen = /\((.+)\)/;

  // Read each page
  const allMembers: MemberAssNat[] = [];
  const tasks = links.map(async (link: string) => {
    const url = `http://www.assnat.qc.ca${link}`;
    const $ = cheerio.load(await http.get(url).text());

    const membersEl = $(".colonneImbriquee>div:nth-of-type(4)>div>a").toArray(); // first collumn
    membersEl.push(
      ...$(".colonneImbriquee>div:nth-of-type(5)>div>a").toArray(),
    ); // second column

    for (const member of membersEl) {
      // Extract ID
      const href = member.attribs["href"]!;
      const memberId = href.match(reMemberId)![1]!;

      // Extract name
      const fullName = $(member).text();
      const splittedName = fullName.split(",", 2);
      const firstName = splittedName[1]!.trim();
      let lastName = splittedName[0]!.trim();

      // Extract note
      let note: string | undefined = undefined;
      const parenMatch = reParen.exec(lastName);
      if (parenMatch) {
        note = parenMatch[1]!;

        // Fix last name
        lastName = lastName.substring(0, parenMatch.index).trim();
      }

      allMembers.push({
        id: memberId,
        first_name: firstName,
        last_name: lastName,
        note,
        assnat_url: href,
      });
    }

    // Update progress bar
    progress.increment();
  });

  try {
    await Promise.all(tasks);
    progress.stop();
    return allMembers;
  } catch (err) {
    progress.stop();
    throw err;
  }
}

export async function writeMemberAssNatToCsv(members: MemberAssNat[], path: string | URL) {
  const csvMembers = members.map(x => ({
    id: x.id,
    first_name: x.first_name,
    last_name: x.last_name,
    note: x.note || "",
    assnat_url: x.assnat_url,
  }));

  const file = await Deno.open(path, { create: true, write: true });
  await ReadableStream.from(csvMembers)
  .pipeThrough(new CsvStringifyStream({ columns: ["id", "first_name", "last_name", "note", "assnat_url"] }))
  .pipeThrough(new TextEncoderStream())
  .pipeTo(file.writable);
}