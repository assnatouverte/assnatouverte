import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { Command } from 'clipanion';
import { AssnatOuverteContext } from '../';
import { readMembersFromCsv, writeMembersToCsv } from './csv';
import { insertMembersInDb, getMembersFromDb } from './db';
import { getMembersFromWikidata } from './wikidata';
import { getMembersFromAssNat } from './members';

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = dirname(currentFilename);
const rawDirectory = resolve(currentDirname, "raw");

export class UpdateDatabase extends Command<AssnatOuverteContext> {
    static override paths = [['members', 'update-db']];
    static override usage = Command.Usage({
        description: 'Met à jour la base données avec les dernières données du dépôt',
      });

    async execute() {
        const members = await readMembersFromCsv(resolve(currentDirname, 'members.csv'));
        await insertMembersInDb(this.context.db, members);

        const dbMembers = await getMembersFromDb(this.context.db);
        console.log(`${dbMembers.length} membres dans la base de données.`);
    }
}

export class GetAssNat extends Command<AssnatOuverteContext> {
    static override paths = [['members', 'assnat']];
    static override usage = Command.Usage({
        description: 'Obtient les membres depuis le site web de l\'Assemblée nationale du Québec',
      });

    async execute() {
        const members = await getMembersFromAssNat();
        await writeMembersToCsv(members, resolve(rawDirectory, "assnat.csv"));
        console.log(`${members.length} membres sur assnat.qc.ca.`);
    }
}

export class GetWikidata extends Command<AssnatOuverteContext> {
    static override paths = [['members', 'wikidata']];
    static override usage = Command.Usage({
        description: 'Obtient les membres depuis les données Wikidata',
      });

    async execute() {
        const members = await getMembersFromWikidata();
        await writeMembersToCsv(members, resolve(rawDirectory, "wikidata.csv"));
        console.log(`${members.length} membres dans Wikidata.`);
    }
}
