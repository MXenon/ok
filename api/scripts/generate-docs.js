// Génère la documentation statique de l'API (openapi.json + page HTML Redoc) dans docs/.
const fs = require('node:fs');
const path = require('node:path');
const { buildOpenApiSpec } = require('../src/docs/openapi');

const outDir = path.join(__dirname, '..', 'docs');
const spec = buildOpenApiSpec();

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'openapi.json'), `${JSON.stringify(spec, null, 2)}\n`);
fs.writeFileSync(
  path.join(outDir, 'index.html'),
  `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${spec.info.title} ${spec.info.version}</title>
  </head>
  <body>
    <redoc spec-url="openapi.json"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>
`,
);

console.log(`Documentation générée dans ${path.relative(process.cwd(), outDir)}/ (version ${spec.info.version})`);
