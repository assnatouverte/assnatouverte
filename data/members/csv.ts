import { Member } from 'assnatouverte-db/schema/members';
import { createReadStream, createWriteStream, PathLike } from 'fs';
import { stringify } from 'csv-stringify';
import { parse } from 'csv-parse';

/** Read CSV file to retrieve all members */
export async function readMembersFromCsv(path: PathLike): Promise<Member[]> {
    const parser = createReadStream(path).pipe(parse({ delimiter: ',', from_line: 2 }));
    
    const members: Member[] = [];
    for await (const line of parser) {
        const member = {
            id: line[0],
            first_name: line[1],
            last_name: line[2],
            note: line[3],
            assnat_url: line[4],
            wikidata_id: line[5],
        } as Member;
        members.push(member);
    }
    return members;
}

/** Write members to CSV file */
export async function writeMembersToCsv(members: Member[], path: PathLike) {
    const file = createWriteStream(path);

    const columns = {
        id: 'id',
        first_name: 'prenom',
        last_name: 'nom',
        note: 'note',
        assnat_url: 'assnat_url',
        wikidata_id: 'wikidata_id',
    };
    const stringifier = stringify({ header: true, columns });
    stringifier.pipe(file);

    members.forEach((value) => {
        stringifier.write(value);
    });
    stringifier.end();
}
