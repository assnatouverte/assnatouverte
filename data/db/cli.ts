import { AssnatOuverteContext } from '../';
import { Command } from 'clipanion';
import { migrate } from 'assnatouverte-db';

// Migration command
export class MigrateCommand extends Command<AssnatOuverteContext> {
    static override paths = [['migration']];
    static override usage = Command.Usage({
        description: 'Met à jour le schéma de la base de données',
      });

    async execute() {
        await migrate(this.context.db);
    }
}
