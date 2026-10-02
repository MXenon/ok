const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { TaskStore } = require('./store/taskStore');
const { createTasksRouter } = require('./routes/tasks');
const { createHealthRouter } = require('./routes/health');
const { buildOpenApiSpec } = require('./docs/openapi');

function createApp({ store = new TaskStore() } = {}) {
  const app = express();
  const spec = buildOpenApiSpec();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.use('/health', createHealthRouter());
  app.use('/tasks', createTasksRouter(store));

  app.get('/openapi.json', (req, res) => res.json(spec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

  app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'JSON invalide' });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Corps de requête trop volumineux' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur interne' });
  });

  return app;
}

module.exports = { createApp };
