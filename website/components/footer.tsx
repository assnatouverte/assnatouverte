import { DateTime } from "luxon";

const GITHUB_URL = "https://github.com/assnatouverte/assnatouverte";
const version = Deno.env.get("DENO_DEPLOYMENT_ID") ?? "dev";
const date: DateTime = Deno.env.has("DENO_DEPLOYMENT_DATE_UNIX")
  ? DateTime.fromSeconds(Number(Deno.env.get("DENO_DEPLOYMENT_DATE_UNIX")), {
    zone: "America/Toronto",
  })
  : DateTime.now();

function Link({ href, text }) {
  return <a href={href} class="underline hover:text-gray-300">{text}</a>;
}

export default function Footer() {
  return (
    <footer class="bg-blue-200 text-sm mt-5">
      <div class="container mx-auto py-5">
        <p class="py-1">© Émile Grégoire, 2024</p>
        <p class="py-1">
          Ce logiciel est disponible sous la licence publique générale GNU
          Affero. Le code et l'utilisation de ce logiciel sont assujettis aux
          conditions détaillées (en anglais) dans le fichier{" "}
          <Link
            href="https://github.com/assnatouverte/assnatouverte/blob/main/LICENSE"
            text="LICENSE"
          />.
        </p>
        <p class="py-1">
          Les données et les textes sont la propriété de l'Assemblée nationale
          du Québec. La reproduction et la diffusion de ces données sont
          autorisées sous{" "}
          <Link
            href="https://www.assnat.qc.ca/fr/propos-site/droits-propriete-intellectuelle.html"
            text="certaines conditions"
          />{" "}
          et selon la{" "}
          <Link
            href="https://www.legisquebec.gouv.qc.ca/fr/document/lc/A-23.1"
            text="Loi sur l'Assemblée nationale"
          />.
        </p>
        <p>
          Version{" "}
          <Link
            text={version.substring(0, 7)}
            href={`${GITHUB_URL}/commit/${version}`}
          />{" "}
          ({date.setLocale("fr-CA").toFormat("f")})
        </p>
      </div>
    </footer>
  );
}
