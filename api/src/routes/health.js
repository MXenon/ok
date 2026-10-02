const express = require('express');
const { getVersionInfo } = require('../version');

/**
 * @openapi
 * components:
 *   schemas:
 *     Health:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: ok
 *         name:
 *           type: string
 *           example: tasks-api
 *         version:
 *           type: string
 *           description: Version sémantique issue du tag git (ex. v1.2.0)
 *           example: v0.1.0
 *         commit:
 *           type: string
 *           description: SHA court du commit déployé
 *           example: 3f2a9c1
 *         stage:
 *           type: string
 *           example: staging
 *         lambdaVersion:
 *           type: string
 *           nullable: true
 *           description: Numéro de version publiée de la fonction Lambda
 *           example: "12"
 * /health:
 *   get:
 *     summary: État et version de l'API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: L'API est opérationnelle
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Health'
 */
function createHealthRouter() {
  const router = express.Router();
  router.get('/', (req, res) => res.json({ status: 'ok', ...getVersionInfo() }));
  return router;
}

module.exports = { createHealthRouter };
