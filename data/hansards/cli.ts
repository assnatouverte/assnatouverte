import { resolve } from "@std/path/resolve";
import type { CommandContext, Commands } from "../cli.ts";
import { rawDirectory } from "../utils/dir.ts";
import { downloadAllHansards } from "./hansards.ts";
import { extractHansard } from "./extraction.ts";
import { Bar, Presets } from "cli-progress";

/**
 * Commands related to hansards
 */
export const commands: Commands = {
  "assnat": {
    desc:
      "Télécharge tous les journaux de débats depuis le site web de l'Assemblée nationale du Québec",
    exec: taskGetFromAssNat,
  },
  "extract": {
    desc: "Extrait les données depuis un journal pré-téléchargé",
    exec: taskExtractTextFromHansard,
  },
};

/**
 * Obtient les journaux de débats depuis le site web de l'Assemblée nationale du Québec
 */
export async function taskGetFromAssNat(ctx: CommandContext): Promise<number> {
  if (ctx.args.length < 2) {
    console.log("%cAucune législature/session spécifiée", "color: red");
    return 1;
  }

  const legislature = parseInt(ctx.args[0]);
  const session = parseInt(ctx.args[1]);

  if (isNaN(legislature) || isNaN(session)) {
    console.log("%cLégislature/session invalide", "color: red");
    return 1;
  }

  const dir = resolve(rawDirectory, "hansards", `${legislature}-${session}`);
  Deno.mkdir(dir, { recursive: true });
  await downloadAllHansards(legislature, session, dir);

  return 0;
}

export async function taskExtractTextFromHansard(
  ctx: CommandContext,
): Promise<number> {
  if (ctx.args.length < 2) {
    console.log("%cAucune législature/session spécifiée", "color: red");
    return 1;
  }

  const legislature = parseInt(ctx.args[0]);
  const session = parseInt(ctx.args[1]);

  if (isNaN(legislature) || isNaN(session)) {
    console.log("%cLégislature/session invalide", "color: red");
    return 1;
  }

  const dir = resolve(rawDirectory, "hansards", `${legislature}-${session}`);

  // Count number of files
  let numFiles = 0;
  for await (const _ of Deno.readDir(dir)) {
    numFiles++;
  }

  const progress = new Bar({
    clearOnComplete: true,
    hideCursor: true,
    format: "{bar} | {value}/{total} ({percentage}%)",
  }, Presets.shades_classic);
  progress.start(numFiles, 0);
  //await extractHansard(resolve(dir, "20190206-234747.html"), ctx.db);
  for await (const file of Deno.readDir(dir)) {
    console.log(`Extracting ${file.name}`);
    await extractHansard(resolve(dir, file.name), ctx.db);
    progress.increment();
  }
  progress.stop();

  return 0;
}
