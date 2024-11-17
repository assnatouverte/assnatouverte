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
export async function taskGetFromAssNat(): Promise<number> {
  const legislature = 42;
  const session = 1;

  const dir = resolve(rawDirectory, "hansards", `${legislature}-${session}`);
  Deno.mkdir(dir, { recursive: true });
  await downloadAllHansards(legislature, session, dir);

  return 0;
}

export async function taskExtractTextFromHansard(
  ctx: CommandContext,
): Promise<number> {
  const legislature = 42;
  const session = 1;

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
