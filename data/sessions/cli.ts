import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { Command } from 'clipanion';
import { AssnatOuverteContext } from '../';
import { readSessionsFromCsv, writeSessionsToCsv } from './csv';
import { insertSessionsInDb, getSessionsFromDb } from './db';
import { getMembersFromWikidata } from './wikidata';
import { getSessionsFromAssNat } from './sessions';

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = dirname(currentFilename);
const rawDirectory = resolve(currentDirname, "raw");

export class UpdateDatabase extends Command<AssnatOuverteContext> {
    static override paths = [['sessions', 'update-db']];
    static override usage = Command.Usage({
        description: 'Met à jour la base données avec les dernières données du dépôt',
      });

    async execute() {
        const sessions = await readSessionsFromCsv(resolve(currentDirname, 'sessions.csv'));
        await insertSessionsInDb(this.context.db, sessions);

        const dbSessions = await getSessionsFromDb(this.context.db);
        console.log(`${dbSessions.length} sessions dans la base de données.`);
    }
}

export class GetAssNat extends Command<AssnatOuverteContext> {
    static override paths = [['sessions', 'assnat']];
    static override usage = Command.Usage({
        description: 'Obtient les membres depuis le site web de l\'Assemblée nationale du Québec',
      });

    async execute() {
        const sessions = await getSessionsFromAssNat();
        await writeSessionsToCsv(sessions, resolve(rawDirectory, "assnat.csv"));
        console.log(`${sessions.length} sessions sur assnat.qc.ca.`);
    }
}
