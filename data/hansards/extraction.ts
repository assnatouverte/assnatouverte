import * as cheerio from "cheerio";
import { extractDate } from "../utils/date.ts";
import { buildConflictUpdateColumns, type Database } from "@assnatouverte/db";
import { members, membersToSessions } from "@assnatouverte/db/members";
import {
  type NewSpeech,
  proceedings,
  speeches,
} from "@assnatouverte/db/hansards";
import { and, eq, gte, like } from "drizzle-orm";

interface HansardMetadata {
  id: string;
  url: string;
  legislature: number;
  session: number;
  volume?: number;
  number?: number;
  date: Date;
}

function extractMetadata($: cheerio.CheerioAPI): HansardMetadata {
  // Extract URL
  const url = $("form").attr("action")!;
  const splitUrl = url.split("/");

  // Extract ID
  const id = splitUrl.slice(-2).join("-").replace(".html", "");

  // Extract legislature and session
  const sessionMatch = splitUrl[4].match(/(\d+)-(\d+)/)!;
  const legislature = Number(sessionMatch[1]!);
  const session = Number(sessionMatch[2]!);

  // Extract date, volume and number
  let header = $("h2.titre2TravauxParl + h2").text();
  header = header.trim();
  const [dateString, volString] = header.split("-", 2);
  const date = extractDate(dateString.trim().substring(3));
  const volumeMatch = volString.trim().match(/Vol\.\s(\d+)\sN°\s(\d+)/);
  const volume = volumeMatch ? Number(volumeMatch[1]!) : undefined;
  const number = volumeMatch ? Number(volumeMatch[2]!) : undefined;

  return {
    id,
    url,
    legislature,
    session,
    volume,
    number,
    date,
  };
}

export async function extractHansard(path: string, db: Database) {
  await db.transaction(async (tx) => {
    // Load hansard
    const $ = cheerio.load(await Deno.readTextFile(path));

    const metadata = extractMetadata($);

    // Add the new proceeding to the database
    await tx.insert(proceedings).values({
      id: metadata.id,
      url: metadata.url,
      legislature: metadata.legislature,
      session: metadata.session,
      volume: metadata.volume,
      number: metadata.number,
      date: metadata.date,
      preliminary: false,
    }).onConflictDoUpdate({
      target: proceedings.id,
      set: buildConflictUpdateColumns(proceedings),
    });

    const paragraphs = $("contenu p");

    enum ParagraphType {
      Title = "TITLE",
      Note = "NOTE",
      Time = "TIME",
      Text = "TEXT",
      Unknown = "UNKNOWN",
    }

    const speakers: Record<string, string> = {};
    const speakersNotFound: Record<string, number> = {};
    const speakersAmbiguous: Record<string, number> = {};
    let numRequests = 0;
    let currentSpeaker: string | undefined = undefined;
    let currentSpeakerId: string | undefined = undefined;
    let currentSpeech: string[] = [];
    let currentOrder = 0;
    const allSpeeches: NewSpeech[] = [];

    for (const paragraph of paragraphs) {
      const para = $(paragraph);

      // Nettoyage du texte
      let text = para.text();
      text = text.trim(); // Enlève les espaces avant et après
      text = text.replace(/\r?\n|\r/g, ""); // Enlève les retours à la ligne
      text = text.replace(/\s+/g, " "); // Enlève les doubles espaces et les tabulations

      if (text.length == 0) {
        continue;
      }

      // Identification du type de paragraphe
      let paraType = ParagraphType.Unknown;
      const align = para.attr("align");
      //const textAlign = para.css('text-align');
      const weight = para.css("font-weight");
      if (weight === "bold" || align === "center") {
        paraType = ParagraphType.Title;

        // Save to DB
        if (currentSpeech.length > 0) {
          allSpeeches.push({
            proceeding_id: metadata.id,
            order: currentOrder++,
            speaker: currentSpeaker!,
            member_id: currentSpeakerId,
            text: currentSpeech.join("\n"),
          });
          //await saveSpeechToDatabase(tx, metadata.id, currentOrder++, currentSpeech, currentSpeaker!, currentSpeakerId);
          currentSpeech = [];
        }
      } else {
        if (text.startsWith("(") && text.endsWith(")")) {
          paraType = ParagraphType.Note;
          text = text.replace("(", "").replace(")", "");
        } else if (text.startsWith("•") && text.endsWith("•")) {
          paraType = ParagraphType.Time;
          text = text.replace("• (", "").replace(") •", "");
        } else {
          paraType = ParagraphType.Text;
        }
      }

      // Extract the current speaker
      const personIdentifier = para.find("b:nth-child(-n+4)");
      if (personIdentifier.length > 0 && paraType === ParagraphType.Text) {
        // Cleanup
        let personIdText = personIdentifier.map((_, el) => $(el).text()).get()
          .join(" ");
        personIdText = personIdText.replace(/\s+/g, " ");
        personIdText = personIdText.trim();

        // Remove identifier from text
        text = text.replace(personIdText, "");
        text = text.trim();

        // Remove the ':'
        personIdText = personIdText.replace(/:/g, "");
        personIdText = personIdText.trim();

        // Try to find the person in the database
        let speakerId = speakers[personIdText];
        if (!(personIdText in speakers)) {
          const lastNameMatch = personIdText.match(
            /(?:M\.|Mme)\s([\wà-üÀ-Ü\s\-]+)/,
          );
          if (lastNameMatch) {
            const lastName = lastNameMatch[1]!;

            // Query database
            numRequests++;
            const result = await db.select().from(members).innerJoin(
              membersToSessions,
              eq(members.id, membersToSessions.member_id),
            ).where(
              and(
                eq(membersToSessions.legislature, metadata.legislature),
                eq(membersToSessions.session, metadata.session),
                like(members.last_name, lastName),
              ),
            );

            if (result.length == 1) {
              // Found a unique member fitting the criteria, great!
              speakerId = result[0].members.id;
            } else if (result.length == 0) {
              // Nobody found...
              speakersNotFound[personIdText] =
                speakersNotFound[personIdText] + 1 || 1;
            } else {
              // Multiple possible members...
              speakersAmbiguous[personIdText] =
                speakersAmbiguous[personIdText] + 1 || 1;
            }

            // Save it in cache
            speakers[personIdText] = speakerId;
          }
        }

        if (currentSpeech.length > 0) {
          allSpeeches.push({
            proceeding_id: metadata.id,
            order: currentOrder++,
            speaker: currentSpeaker!,
            member_id: currentSpeakerId,
            text: currentSpeech.join("\n"),
          });
          //await saveSpeechToDatabase(tx, metadata.id, currentOrder++, currentSpeech, currentSpeaker!, currentSpeakerId);
          currentSpeech = [];
        }

        currentSpeaker = personIdText;
        currentSpeakerId = speakerId;
      }

      // Append text
      if (paraType == ParagraphType.Text) {
        currentSpeech.push(text);
      }

      // Print to console
      /*switch (paraType) {
                case ParagraphType.Title:
                    console.log(`%c${text}`, "color: green; text-decoration: underline;");
                    break;
                case ParagraphType.Note:
                    console.log(`%c${text}`, "color: gray; font-style: italic;");
                    break;
                case ParagraphType.Time:
                    console.log(`🕰️  %c${text}`, "color: yellow;");
                    break;
                case ParagraphType.Text:
                    console.log(`%c${personIdText} [${speakerId}]`, "color: blue;");
                    console.log(text);
                    break;
                default:
                    console.log(`${paraType}: ${text}`);
            }*/
    }

    // Save last instance of text
    if (currentSpeech.length > 0) {
      allSpeeches.push({
        proceeding_id: metadata.id,
        order: currentOrder++,
        speaker: currentSpeaker!,
        member_id: currentSpeakerId,
        text: currentSpeech.join("\n"),
      });
      //await saveSpeechToDatabase(tx, metadata.id, currentOrder++, currentSpeech, currentSpeaker!, currentSpeakerId);
    }

    // Insert all the speeches in one batch
    // It uses more memory locally but it's much faster than doing multiple inserts
    await tx.insert(speeches).values(allSpeeches).onConflictDoUpdate({
      target: [speeches.proceeding_id, speeches.order],
      set: buildConflictUpdateColumns(speeches, ["search"]),
    });

    // Delete old speech
    await tx.delete(speeches).where(
      and(
        eq(speeches.proceeding_id, metadata.id),
        gte(speeches.order, currentOrder),
      ),
    );

    console.log(speakers);
    console.log("Not found:");
    console.log(speakersNotFound);
    console.log("Ambiguous:");
    console.log(speakersAmbiguous);
    console.log(`Num requests: ${numRequests}`);
  });
}
