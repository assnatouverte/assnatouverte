# assnatouverte-db

Ce répertoire contient les définitions de la base de données PostgreSQL.

## Informations de connexion

Afin de se connecter à la base de données, un fichier `.env` doit existé à la _racine_ du projet.
Ce fichier est automatiquement ignoré par git afin de ne pas divulguer de secrets.

Le fichier doit contenir les valeurs suivantes:

| Variable      | Description                       | Exemple                                         |
| ------------- | --------------------------------- | ----------------------------------------------- |
| `DB_HOST`     | Adresse de la base de données     | `DB_HOST=127.0.0.1` ou `DB_HOST=db.example.com` |
| `DB_PORT`     | Port de communication             | `DB_PORT=5432`                                  |
| `DB_USER`     | Utilisateur de la base de données | `DB_USER=toto`                                  |
| `DB_PASSWORD` | Mot de passe de l'utilisateur     | `DB_PASSWORD=motdepasse123`                     |
| `DB_NAME`     | Nom de la base de données         | `DB_NAME=assnatouverte`                         |

La fonction `loadEnvFile()` permet de charger les variables d'environnement depuis ce fichier.
La fonction `checkEnvVariables()` permet de vérifier que toutes les variables nécessaires sont présentes.

La fonction `createDb()` permet de se connecter à la base données en utilisant les variables d'environnement.
Elle retourne deux objets:

- `client`: la connexion à la base de données. _Elle doit obligatoirement être fermée avec `client.end()`_.
- `db`: la base de données typée qui permet d'interagir selon le schéma.

## Drizzle

Afin d'interagir facilement avec la base de données, ce projet utilise l'[ORM Drizzle](https://orm.drizzle.team/).
Le schéma de la base de données est défini dans les fichiers du dossier [`schema`](./schema).

## Migrations

Lorsque le schéma de la base de données est modifié, il est nécessaire de générer une migration, soit un script SQL pour appliquer les modifications à la base de données.

Pour générer automatiquement le code de migration se situant dans le dossier [migrations](./migrations), il suffit d'exécuter `pnpm run migrate`.
Les fichiers contenus dans ce dossier ne devraient _jamais_ être modifié à la main.

Pour appliquer les migrations à une base de données, la fonction `migrate()` est disponible.
