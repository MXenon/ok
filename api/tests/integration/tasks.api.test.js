const request = require('supertest');
const { createApp } = require('../../src/app');

describe('API /tasks', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  it('parcourt le cycle de vie complet (CRUD)', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: '  Déployer sur Lambda  ', description: 'via Jenkins' })
      .expect(201);
    expect(created.body).toMatchObject({ title: 'Déployer sur Lambda', done: false });
    expect(created.headers.location).toBe(`/tasks/${created.body.id}`);

    const { id } = created.body;
    await request(app).get(`/tasks/${id}`).expect(200, created.body);

    const patched = await request(app).patch(`/tasks/${id}`).send({ done: true }).expect(200);
    expect(patched.body.done).toBe(true);

    const list = await request(app).get('/tasks?done=true').expect(200);
    expect(list.body.map((t) => t.id)).toEqual([id]);
    await request(app).get('/tasks?done=false').expect(200, []);

    await request(app).delete(`/tasks/${id}`).expect(204);
    await request(app).get(`/tasks/${id}`).expect(404);
  });

  it('valide le corps des requêtes', async () => {
    const res = await request(app).post('/tasks').send({ done: 'non' }).expect(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining(['title est obligatoire et doit être une chaîne non vide', 'done doit être un booléen']),
    );
  });

  it('rejette un JSON mal formé', async () => {
    await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title":')
      .expect(400, { error: 'JSON invalide' });
  });

  it('rejette un filtre invalide', async () => {
    await request(app).get('/tasks?done=peut-etre').expect(400);
  });

  it('renvoie 404 pour une tâche ou une route inconnue', async () => {
    await request(app).patch('/tasks/inconnu').send({ done: true }).expect(404);
    await request(app).delete('/tasks/inconnu').expect(404);
    await request(app).get('/inconnu').expect(404, { error: 'Route introuvable' });
  });
});

describe('API système et documentation', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it('expose la version déployée sur /health', async () => {
    process.env.APP_VERSION = 'v1.2.3';
    process.env.GIT_COMMIT = 'abc1234';
    process.env.STAGE = 'staging';
    const res = await request(createApp()).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', version: 'v1.2.3', commit: 'abc1234', stage: 'staging' });
  });

  it('sert la spécification OpenAPI générée et Swagger UI', async () => {
    const app = createApp();
    const spec = await request(app).get('/openapi.json').expect(200);
    expect(spec.body.openapi).toBe('3.0.3');
    expect(Object.keys(spec.body.paths)).toEqual(expect.arrayContaining(['/tasks', '/tasks/{id}', '/health']));
    expect(Object.keys(spec.body.paths['/tasks/{id}'])).toEqual(['get', 'patch', 'delete']);

    const docs = await request(app).get('/docs/').expect(200);
    expect(docs.text).toContain('swagger-ui');
  });
});
