import { resolve } from "@std/path/resolve";
import * as cheerio from "cheerio";
import { MultiBar, Presets } from "cli-progress";
import { http } from "../utils/http.ts";

export async function downloadAllHansards(
  legislature: number,
  session: number,
  dir: string,
) {
  const sessionString = `${legislature}-${session}`;
  const url =
    `https://www.assnat.qc.ca/fr/travaux-parlementaires/assemblee-nationale/${sessionString}/index.html`;
  const monthChoiceField =
    "ctl00$ColCentre$ContenuColonneGauche$ddlChoixMoisAnnee$MoisAnnee";

  // Load main page to list the months
  console.log(
    `Récupération de journaux de débats de la session ${sessionString}...`,
  );
  const mainPageReq = await http.get(url).text();
  const mainPage = cheerio.load(mainPageReq);

  const months = mainPage(`select[name="${monthChoiceField}"]>option`).map((
    _,
    el,
  ) => el.attribs["value"]).toArray();
  console.log(`${months.length} mois disponibles`);

  // On bâtit le formulaire à envoyer
  const form = new FormData();
  mainPage("#aspnetForm input").each((_, el) => {
    const name = el.attribs["name"]!;
    const value = el.attribs["value"]!;
    form.append(name, value);
  });

  // Barres de progressions
  const progressBars = new MultiBar({
    clearOnComplete: true,
    hideCursor: true,
    format: "{bar} | {month} | {value}/{total} ({percentage}%)",
  }, Presets.shades_classic);

  let numDebates = 0;

  const tasks = months.map(async (month: string) => {
    // On modifie le choix du mois
    form.set(monthChoiceField, month);

    // Envoie de la requête
    const newPageReq = await http.post(url, { body: form }).text();
    const $ = cheerio.load(newPageReq);

    // Mois courant
    const currentMonth = $(
      "#ctl00_ColCentre_ContenuColonneGauche_lblMoisCourant",
    ).text();

    // Extrait tous les liens vers les journaux de débats
    const links = $(
      '#ctl00_ColCentre_ContenuColonneGauche_pnlContenu a[href^="/fr/travaux-parlementaires/assemblee-nationale"]',
    ).map((_, el) => el.attribs["href"]).toArray();
    const progress = progressBars.create(links?.length, 0, {
      month: currentMonth,
    });

    const tasks = links.map(async (link: string) => {
      // Extrait l'ID du journal
      const splittedLink = link.split("/");
      const date = splittedLink[splittedLink.length - 2];
      const id = splittedLink[splittedLink.length - 1];
      const fullId = `${date}-${id}`;

      // Télécharge la page
      const response = await http.get(`https://www.assnat.qc.ca${link}`);
      const body = await response.text();
      await Deno.writeTextFile(resolve(dir, fullId), body);

      ++numDebates;
      progress.increment();
    });
    await Promise.all(tasks);
  });

  try {
    await Promise.all(tasks);
    progressBars.stop();
    console.log(`Terminé! ${numDebates} journaux téléchargés.`);
  } catch (err) {
    progressBars.stop();
    console.error(`Erreur: ${err}`);
  }
}
