# Assnat Ouverte

La démocratie québécoise accessible et transparente.

[![License](https://img.shields.io/github/license/assnatouverte/assnatouverte?style=flat-square)](./LICENSE)

Assnat Ouverte est un projet libre qui vise à améliorer l'accessibilité et la
transparence du travail des députés à l'Assemblée nationale du Québec.

- **Jeu de données :** Bâtir un jeu de données complet et exact des travaux de
  l'Assemblée nationale du Québec
- **Visualisation :** Offrir une interface conviviale pour suivre les travaux et
  explorer les données
- **Recherche :** Rechercher efficacement parmi les travaux en mettant à profit
  l'indexation des données
- **Imputabilité :** Associer les textes des journaux de débats aux députés qui
  les ont prononcés
- **Histoire :** Examiner le passé pour comprendre l'évolution historique du
  Québec
- **Données ouvertes :** Fournir des API permettant à d'autres développeurs ou
  chercheurs d'utiliser les données

## Organisation

- [`db`](./db) contient les définitions du schéma de la base de données ainsi
  que certaines fonctions utilitaires.
- [`data`](./data) contient les données brutes qui sont insérées dans la base de
  données ainsi que des scripts pour aider l'extraction et la validation de ces
  données.

## Utilisation de la langue française

Dans un souci de cohésion et d'arrimage avec les outils utilisés, l'anglais et
le français sont utilisés pour ce projet. Les règles suivantes encadrent
l'utilisation des deux langues.

En anglais :

- Le code source
- L'arborescence des fichiers dans le dépôt
- Les schémas de la base de données relationnelle
- Les API, notamment les routes et les schémas de données
- La licence d'utilisation

En français :

- La documentation, incluant celle dans le dépôt
- Les messages de _commit_
- Les descriptions des bogues et des PR
- Les données stockées dans la base de données
- Les interfaces utilisateurs tel que le site web
- Tous les documents et les présentations d'Assnat Ouverte

## Licence d'utilisation

Copyright ©️ Émile Grégoire, 2024

Ce logiciel est disponible sous la licence publique générale GNU Affero. Le code
et l'utilisation de ce logiciel sont assujettis aux conditions détaillées (en
anglais) dans le fichier [LICENSE](./LICENSE).
