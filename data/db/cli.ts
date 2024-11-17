import type { CommandContext, Commands } from "../cli.ts";
import { migrate } from "@assnatouverte/db";

/**
 * Commands related to the database
 */
export const commands: Commands = {
  "migrate": {
    desc: "Met à jour le schéma de la base de données",
    exec: migration,
  },
};

/**
 * Met à jour la base données avec les dernières données du dépôt
 */
export async function migration(ctx: CommandContext): Promise<number> {
  await migrate(ctx.db);

  return 0;
}
