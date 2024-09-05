import { Member } from 'assnatouverte-db/schema/members';
import { http } from '../utils/http';

const WIKIDATA_QUERY = `SELECT ?idWikidata ?idWikidataText ?idAssNat ?nom
WHERE
{
  ?idWikidata wdt:P3055 ?idAssNat.
  BIND(STRAFTER(STR(?idWikidata), STR(wd:)) AS ?idWikidataText).
  OPTIONAL{ ?idWikidata rdfs:label ?nom FILTER(LANGMATCHES(LANG(?nom), "fr")) }.
}
ORDER BY ?idAssNat`;

/** Retrieve members from a SparQL query on Wikidata */
export async function getMembersFromWikidata(): Promise<Member[]> {
    const response = await http.get('https://query.wikidata.org/sparql', {
        searchParams: {
            query: WIKIDATA_QUERY,
            format: 'json',
        },
    });
    const data = await response.json();

    const members: Member[] = [];
    for (const result of data['results']['bindings']) {
        const id = result['idAssNat'].value as string;
        const wikidata_id = result['idWikidataText'].value as string;
        const name = result['nom']?.value as string;

        members.push({
            id,
            wikidata_id,
            first_name: '',
            last_name: '',
            assnat_url: '',
            note: '',
        });
    }
    
    return members;
}
