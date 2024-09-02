import $ from 'cheerio';
import { Bar, Presets } from 'cli-progress';
import { http } from '../utils/http';
import { Member } from 'assnatouverte-db/schema/members';

export async function getMembersFromAssNat() {
    const mainPageReq = await http.get('http://www.assnat.qc.ca/fr/membres/notices/index.html').text();
    const mainPage = $.load(mainPageReq);

    // On trouve les liens des pages à lire
    const links = mainPage('.colonneImbriquee>p:nth-of-type(3)>a').map((_, el) => el.attribs['href']).toArray();
    console.log(`${links.length} pages à lire`);

    // Barres de progressions
    const progress = new Bar({
        clearOnComplete: true,
        hideCursor: true,
        format: '{bar} | {value}/{total} ({percentage}%)',
    }, Presets.shades_classic);
    progress.start(links.length, 0);

    // Regex utilisées plus tard
    const reMemberId = /\/([a-z0-9\-\(\)]+)(\/index)?\.html/;
    const reParen = /\((.+)\)/;

    // On lit chaque page
    const allMembers: Member[] = [];
    const tasks = links.map(async (link: string) => {
        const url = `http://www.assnat.qc.ca${link}`;
        const page = $.load(await http.get(url).text());

        const membersEl = page('.colonneImbriquee>div:nth-of-type(4)>div>a').toArray(); // first collumn
        membersEl.push(...page('.colonneImbriquee>div:nth-of-type(5)>div>a').toArray()); // secpmd column
        //console.log(`Found ${membersEl.length} members`);

        for (const member of membersEl) {
            // Extract ID
            const href = member.attribs['href']!;
            const memberId = href.match(reMemberId)![1]!;

            // Extract name
            const fullName = $(member).text();
            const splittedName = fullName.split(',', 2);
            const firstName = splittedName[1]!.trim();
            let lastName = splittedName[0]!.trim();

            // Extract note
            let note: string|null = null;
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
                wikidata_id: null,
            });
        }

        // Mise à jour de la barre de progression
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
