const express = require('express');
const { validateTask } = require('../validation');

/**
 * @openapi
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required: [id, title, done, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           maxLength: 200
 *           example: Écrire la documentation
 *         description:
 *           type: string
 *           example: Générer l'OpenAPI depuis les commentaires JSDoc
 *         done:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TaskInput:
 *       type: object
 *       required: [title]
 *       additionalProperties: false
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *         done:
 *           type: boolean
 *     TaskPatch:
 *       type: object
 *       minProperties: 1
 *       additionalProperties: false
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *         done:
 *           type: boolean
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             type: string
 *   parameters:
 *     TaskId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *   responses:
 *     NotFound:
 *       description: Tâche introuvable
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     ValidationError:
 *       description: Requête invalide
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */
function createTasksRouter(store) {
  const router = express.Router();

  /**
   * @openapi
   * /tasks:
   *   get:
   *     summary: Lister les tâches
   *     tags: [Tasks]
   *     parameters:
   *       - in: query
   *         name: done
   *         schema:
   *           type: boolean
   *         description: Filtrer selon l'état de la tâche
   *     responses:
   *       200:
   *         description: Liste des tâches
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Task'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.get('/', (req, res) => {
    const { done } = req.query;
    if (done !== undefined && done !== 'true' && done !== 'false') {
      return res.status(400).json({ error: 'Paramètre invalide', details: ['done doit valoir true ou false'] });
    }
    res.json(store.list({ done: done === undefined ? undefined : done === 'true' }));
  });

  /**
   * @openapi
   * /tasks:
   *   post:
   *     summary: Créer une tâche
   *     tags: [Tasks]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskInput'
   *     responses:
   *       201:
   *         description: Tâche créée
   *         headers:
   *           Location:
   *             schema:
   *               type: string
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', (req, res) => {
    const errors = validateTask(req.body);
    if (errors.length) return res.status(400).json({ error: 'Requête invalide', details: errors });
    const task = store.create({ ...req.body, title: req.body.title.trim() });
    res.status(201).location(`${req.baseUrl}/${task.id}`).json(task);
  });

  /**
   * @openapi
   * /tasks/{id}:
   *   get:
   *     summary: Récupérer une tâche
   *     tags: [Tasks]
   *     parameters:
   *       - $ref: '#/components/parameters/TaskId'
   *     responses:
   *       200:
   *         description: La tâche demandée
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', (req, res) => {
    const task = store.get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche introuvable' });
    res.json(task);
  });

  /**
   * @openapi
   * /tasks/{id}:
   *   patch:
   *     summary: Modifier partiellement une tâche
   *     tags: [Tasks]
   *     parameters:
   *       - $ref: '#/components/parameters/TaskId'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskPatch'
   *     responses:
   *       200:
   *         description: Tâche mise à jour
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.patch('/:id', (req, res) => {
    const errors = validateTask(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ error: 'Requête invalide', details: errors });
    const changes = { ...req.body };
    if (changes.title !== undefined) changes.title = changes.title.trim();
    const task = store.update(req.params.id, changes);
    if (!task) return res.status(404).json({ error: 'Tâche introuvable' });
    res.json(task);
  });

  /**
   * @openapi
   * /tasks/{id}:
   *   delete:
   *     summary: Supprimer une tâche
   *     tags: [Tasks]
   *     parameters:
   *       - $ref: '#/components/parameters/TaskId'
   *     responses:
   *       204:
   *         description: Tâche supprimée
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.delete('/:id', (req, res) => {
    if (!store.remove(req.params.id)) return res.status(404).json({ error: 'Tâche introuvable' });
    res.status(204).end();
  });

  return router;
}

module.exports = { createTasksRouter };
