const serverless = require('serverless-http');
const { createApp } = require('./app');

// L'application est créée une seule fois par conteneur Lambda (réutilisée entre invocations).
const app = createApp();

module.exports.handler = serverless(app);
