# assnatouverte-data

Ce répertoire contient la majorité des données utilisées, ainsi que des scripts
pour automatiser leur génération, leur validation et leur stockage.

Les données fixes sont conservées dans des fichiers CSV dans ce dépôt. Certains
scripts génèrent des données temporaires qui sont placées dans des dossiers
`raw` automatiquement ignorés par Git.

Pour exécuter les scripts, il suffit de faire
`pnpm run assnatouverte-data <script>`.

## Scripts

### Base de données

- `migration`: Met à jour le schéma de la base de données. Il est important
  d'exécuter ce script lors de la création d'une nouvelle base de données ou
  lorsque le schéma a été mis à jour. Si aucun changement n'est nécessaire, le
  script ne fait rien.

### Membres

- `members update-db`: Met à jour la base de données avec les membres du
  fichiers [members.csv](./members/members.csv). Les données sont remplacées
  sans avertissement. Les membres superflus ne sont pas supprimés de la base de
  données.
- `members assnat`: Récupère les membres à partir du site web de l'Assemblée
  nationale du Québec. Il s'agit de la source de données la plus fiable
  disponible. Les données sont enregistrées dans le fichier
  `members/raw/assnat.csv`.
- `members wikidata`: Récupère les membres à partir des données Wikidata. Les
  données sont enregistrées dans le ficheir `members/raw/wikidata.csv`.
