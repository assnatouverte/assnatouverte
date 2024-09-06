import { Session } from 'assnatouverte-db/schema/sessions';
import { createReadStream, createWriteStream, PathLike } from 'fs';
import { stringify } from 'csv-stringify';
import { parse } from 'csv-parse';

/** Read CSV file to retrieve all sessions */
export async function readSessionsFromCsv(path: PathLike): Promise<Session[]> {
    const parser = createReadStream(path).pipe(parse({ delimiter: ',', from_line: 2 }));
    
    const sessions: Session[] = [];
    for await (const line of parser) {
        const session = {
            legislature: Number(line[0]),
            session: Number(line[1]),
            start: line[2] ? new Date(line[2]) : null,
            prorogation: line[3] ? new Date(line[3]) : null,
            dissolution: line[4] ? new Date(line[4]) : null,
        } as Session;
        sessions.push(session);
    }
    return sessions;
}

/** Write sessions to CSV file */
export async function writeSessionsToCsv(sessions: Session[], path: PathLike) {
    const file = createWriteStream(path);

    const columns = {
        legislature: 'legislature',
        session: 'session',
        start: 'start',
        prorogation: 'prorogation',
        dissolution: 'dissolution',
    };
    const stringifier = stringify({ header: true, columns });
    stringifier.pipe(file);

    sessions.forEach((value) => {
        stringifier.write(value);
    });
    stringifier.end();
}
