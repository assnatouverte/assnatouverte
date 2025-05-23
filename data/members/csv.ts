import { CsvParseStream } from "@std/csv/parse-stream";
import { CsvStringifyStream } from "@std/csv/stringify-stream";
import type { Gender, Member, MemberSession } from "@assnatouverte/db/members";

const columns = [
  "id",
  "first_name",
  "last_name",
  "note",
  "assnat_url",
  "wikidata_id",
  "gender",
];

/** Read CSV file to retrieve all members */
export async function readMembersFromCsv(
  path: string | URL,
): Promise<Member[]> {
  const file = await Deno.open(path);
  const pipeline = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(
      new CsvParseStream({
        skipFirstRow: true,
        columns,
      }),
    );

  return (await Array.fromAsync(pipeline)).map((x) => ({
    id: x.id,
    first_name: x.first_name,
    last_name: x.last_name,
    note: x.note || null,
    gender: x.gender as Gender,
    assnat_url: x.assnat_url as Gender,
    wikidata_id: x.wikidata_id || null,
  }));
}

/** Write members to CSV file */
export async function writeMembersToCsv(members: Member[], path: string | URL) {
  const csvMembers = members.map((x) => ({
    id: x.id,
    first_name: x.first_name,
    last_name: x.last_name,
    note: x.note || "",
    gender: x.gender,
    assnat_url: x.assnat_url,
    wikidata_id: x.wikidata_id || "",
  }));

  const file = await Deno.open(path, { create: true, write: true });
  await ReadableStream.from(csvMembers)
    .pipeThrough(new CsvStringifyStream({ columns }))
    .pipeThrough(new TextEncoderStream())
    .pipeTo(file.writable);
}

/** Read CSV file to retrieve all members to sessions association */
export async function readMembersSessionsFromCsv(
  path: string | URL,
): Promise<MemberSession[]> {
  const file = await Deno.open(path);
  const pipeline = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(
      new CsvParseStream({
        skipFirstRow: true,
        columns: ["legislature", "session", "member_id"],
      }),
    );

  return (await Array.fromAsync(pipeline)).map((x) => ({
    legislature: Number(x.legislature),
    session: Number(x.session),
    member_id: x.member_id,
  }));
}
