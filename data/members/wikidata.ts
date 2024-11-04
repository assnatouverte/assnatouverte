import { CsvStringifyStream } from "@std/csv/stringify-stream";
import { http } from "../utils/http.ts";

const WIKIDATA_QUERY = `SELECT ?idWikidata ?idWikidataText ?idAssNat ?name
WHERE
{
  ?idWikidata wdt:P3055 ?idAssNat.
  BIND(STRAFTER(STR(?idWikidata), STR(wd:)) AS ?idWikidataText).
  OPTIONAL{ ?idWikidata rdfs:label ?name FILTER(LANGMATCHES(LANG(?name), "fr")) }.
}
ORDER BY ?idAssNat`;

export interface MemberWikidata {
  id: string,
  id_wikidata: string,
  name?: string,
};

interface WikidataResponse<T> {
  results: WikidataResult<T>,
}

interface WikidataResult<T> {
  bindings: T[],
}

interface WikidataBinding<T> {
  value: T,
}

interface AssnatQueryResult {
  idAssNat: WikidataBinding<string>,
  idWikidataText: WikidataBinding<string>,
  name?: WikidataBinding<string>,
}

/** Retrieve members from a SparQL query on Wikidata */
export async function getMembersFromWikidata(): Promise<MemberWikidata[]> {
  const response = await http.get("https://query.wikidata.org/sparql", {
    searchParams: {
      query: WIKIDATA_QUERY,
      format: "json",
    },
  });
  const data = await response.json() as WikidataResponse<AssnatQueryResult>;

  return data.results.bindings.map(x => ({
    id: x.idAssNat.value,
    id_wikidata: x.idWikidataText.value,
    name: x.name?.value,
  }));
}

export async function writeMemberWikidataToCsv(members: MemberWikidata[], path: string | URL) {
  const csvMembers = members.map(x => ({
    id: x.id,
    id_wikidata: x.id_wikidata,
    name: x.name || "",
  }));

  const file = await Deno.open(path, { create: true, write: true });
  await ReadableStream.from(csvMembers)
  .pipeThrough(new CsvStringifyStream({ columns: ["id", "id_wikidata", "name"] }))
  .pipeThrough(new TextEncoderStream())
  .pipeTo(file.writable);
}
