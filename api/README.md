# Tasks API — Node.js / Express sur AWS Lambda

API REST de gestion de tâches, avec :

- **tests unitaires et d'intégration** (Jest + Supertest, y compris des appels au handler Lambda avec de vrais événements API Gateway) ;
- **intégration continue Jenkins** (`../Jenkinsfile`) : lint, tests, couverture, documentation, déploiement ;
- **déploiement automatique sur AWS Lambda** via AWS SAM (Lambda + API Gateway HTTP API) ;
- **gestion des versions par git** : SemVer, tags `vX.Y.Z`, version injectée dans la Lambda et exposée par `/health` ;
- **documentation API générée automatiquement** (OpenAPI 3 depuis les commentaires `@openapi`, Swagger UI et Redoc).

## Structure

```
api/
├── src/
│   ├── app.js              # Application Express (routes, docs, gestion d'erreurs)
│   ├── lambda.js           # Handler AWS Lambda (serverless-http)
│   ├── server.js           # Serveur local
│   ├── routes/             # Routes annotées @openapi
│   ├── store/taskStore.js  # Stockage en mémoire
│   ├── validation.js
│   ├── version.js          # Version / commit / stage déployés
│   └── docs/openapi.js     # Génération de la spec OpenAPI (swagger-jsdoc)
├── tests/
│   ├── unit/
│   └── integration/        # Supertest + invocation du handler Lambda
├── scripts/
│   ├── generate-docs.js    # docs/openapi.json + docs/index.html (Redoc)
│   ├── release.js          # Bump SemVer + commit + tag git
│   └── smoke-test.sh       # Vérification post-déploiement
├── template.yaml           # Infrastructure AWS SAM
└── samconfig.toml          # Environnements staging / production
```

## Démarrage local

```bash
cd api
npm install
npm start                   # http://localhost:3000
```

| Méthode | Route          | Description                         |
|---------|----------------|-------------------------------------|
| GET     | `/tasks`       | Lister (filtre `?done=true\|false`) |
| POST    | `/tasks`       | Créer                               |
| GET     | `/tasks/{id}`  | Lire                                |
| PATCH   | `/tasks/{id}`  | Modifier partiellement              |
| DELETE  | `/tasks/{id}`  | Supprimer                           |
| GET     | `/health`      | État + version déployée             |
| GET     | `/openapi.json`| Spécification OpenAPI 3             |
| GET     | `/docs`        | Swagger UI                          |

```bash
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Ma tâche"}'
```

> Le stockage est en mémoire : sur Lambda, les données ne survivent pas au recyclage des conteneurs.
> Pour un usage réel, remplacer `TaskStore` par une implémentation DynamoDB (même interface).

## Tests

```bash
npm run lint
npm test                    # tous les tests
npm run test:unit
npm run test:integration
npm run test:ci             # mode CI : couverture (seuils 80 % lignes / 70 % branches) + rapport JUnit
```

Les rapports sont écrits dans `reports/` (`junit.xml`, `coverage/cobertura-coverage.xml`, `coverage/lcov-report/`).

## Documentation API

La spécification est générée à partir des blocs `@openapi` présents au-dessus de chaque route : mettre à jour
la route et son commentaire suffit, aucune documentation n'est maintenue à la main.

- en direct : `/docs` (Swagger UI) et `/openapi.json`, en local comme sur Lambda ;
- en statique : `npm run docs` produit `docs/openapi.json` et `docs/index.html` (Redoc), archivés et publiés
  par Jenkins à chaque build.

## Gestion des versions (git)

- Versionnage sémantique, source de vérité : les **tags git** `vX.Y.Z`.
- Créer une release depuis `main` :

  ```bash
  npm run release:patch     # ou release:minor / release:major
  git push --follow-tags
  ```

  Le script met à jour `package.json`, crée le commit `chore(release): vX.Y.Z` et le tag annoté.
- Jenkins calcule `APP_VERSION` avec `git describe --tags --always` (`v1.2.0` sur un tag,
  `v1.2.0-3-g3f2a9c1` entre deux tags) et l'injecte dans la Lambda avec le SHA du commit.
- Chaque déploiement publie une **version Lambda immuable** (description `vX.Y.Z (sha)`) et déplace l'alias
  `live`. Un rollback consiste à redéployer un tag précédent, ou à repointer l'alias :
  `aws lambda update-alias --function-name tasks-api-production --name live --function-version <N>`.

## Pipeline Jenkins

| Étape               | Quand                    | Action                                                    |
|---------------------|--------------------------|-----------------------------------------------------------|
| Version             | toujours                 | `git describe` → nom du build                             |
| Install / Lint      | toujours                 | `npm ci`, `eslint`                                        |
| Tests               | toujours                 | Jest + rapport JUnit + couverture archivée                |
| Documentation API   | toujours                 | `npm run docs`, artefacts + HTML Publisher                |
| Build Lambda        | `main` ou tag            | `sam validate --lint`, `sam build`                        |
| Deploy staging      | branche `main`           | `sam deploy --config-env staging` + smoke test            |
| Deploy production   | tag `vX.Y.Z`             | validation manuelle, `sam deploy --config-env production` + smoke test |

### Mise en place

1. Créer un job **Multibranch Pipeline** pointant sur ce dépôt (le `Jenkinsfile` est à la racine) et activer
   la découverte des **tags** dans les sources de branches.
2. Ajouter un webhook GitHub → Jenkins (`/github-webhook/`) pour déclencher les builds à chaque push.
3. Plugins : Pipeline, Git, JUnit, AWS Credentials (recommandés : HTML Publisher, Coverage).
4. Créer un credential **AWS Credentials** d'identifiant `aws-deploy` (droits CloudFormation, Lambda,
   API Gateway, IAM `PassRole`/`CreateRole`, S3 pour les artefacts SAM, CloudWatch Logs).
5. Outils sur l'agent : Node.js 22, AWS SAM CLI, AWS CLI, curl.

La région par défaut est `eu-west-3` (Paris) ; la modifier dans `samconfig.toml` et dans le `Jenkinsfile`.

## Déploiement manuel (optionnel)

```bash
sam build
sam deploy --config-env staging \
  --parameter-overrides Stage=staging AppVersion=$(git describe --tags --always) GitCommit=$(git rev-parse --short HEAD)
```
