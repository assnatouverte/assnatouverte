import { CsvParseStream } from "@std/csv/parse-stream";
import { CsvStringifyStream } from "@std/csv/stringify-stream";
import type { Session } from "@assnatouverte/db/sessions";

const columns = ["legislature", "session", "start", "prorogation", "dissolution"];

/** Read CSV file to retrieve all sessions */
export async function readSessionsFromCsv(path: string | URL): Promise<Session[]> {
  const file = await Deno.open(path);
  const pipeline = file.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new CsvParseStream({
    skipFirstRow: true,
    columns,
  }));

  return (await Array.fromAsync(pipeline)).map(x => ({
      legislature: Number(x.legislature),
      session: Number(x.session),
      start: new Date(x.start),
      prorogation: x.prorogation ? new Date(x.prorogation) : null,
      dissolution: x.dissolution ? new Date(x.dissolution) : null,
    })
  )
}

/** Write sessions to CSV file */
export async function writeSessionsToCsv(sessions: Session[], path: string | URL) {
  const csvSessions = sessions.map(x => ({
    legislature: x.legislature,
    session: x.session,
    start: x.start,
    prorogation: x.prorogation,
    dissolution: x.dissolution,
  }));

  const file = await Deno.open(path, { create: true, write: true });
  await ReadableStream.from(csvSessions)
  .pipeThrough(new CsvStringifyStream({ columns }))
  .pipeThrough(new TextEncoderStream())
  .pipeTo(file.writable);
}
