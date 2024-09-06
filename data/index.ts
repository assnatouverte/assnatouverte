import { Cli, Builtins, BaseContext } from 'clipanion';
import { loadEnvFile, createDb, Database } from 'assnatouverte-db';

import * as DatabaseCli from './db/cli';
import * as MembersCli from './members/cli';
import * as SessionsCli from './sessions/cli';

// Context defition
export interface AssnatOuverteContext extends BaseContext {
    db: Database,
}

// Create the CLI
const cli = new Cli<AssnatOuverteContext>({
    binaryLabel: 'assnatouverte-data',
    binaryName: 'assnatouverte-data'
});

// Database
cli.register(DatabaseCli.MigrateCommand);

// Members
cli.register(MembersCli.UpdateDatabase);
cli.register(MembersCli.GetAssNat);
cli.register(MembersCli.GetWikidata);

// Sessions
cli.register(SessionsCli.UpdateDatabase);
cli.register(SessionsCli.GetAssNat);

// Help
cli.register(Builtins.HelpCommand);

// Create the database connection
loadEnvFile();
const [client, db] = createDb();

// Run the CLI
try {
    // Extract command line parameters
    const [_node, _app, ...args] = process.argv;

    // Run the CLI
    await cli.runExit(args, { db });
}
finally {
    // Close the connection
    client.end();
}
