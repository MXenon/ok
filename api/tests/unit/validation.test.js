const { validateTask } = require('../../src/validation');

describe('validateTask', () => {
  it('accepte une tâche valide', () => {
    expect(validateTask({ title: 'A', description: 'B', done: false })).toEqual([]);
  });

  it.each([
    [null, 'Le corps de la requête doit être un objet JSON'],
    [[], 'Le corps de la requête doit être un objet JSON'],
    [{}, 'title est obligatoire et doit être une chaîne non vide'],
    [{ title: '   ' }, 'title est obligatoire et doit être une chaîne non vide'],
    [{ title: 'x'.repeat(201) }, 'title ne doit pas dépasser 200 caractères'],
    [{ title: 'A', done: 'oui' }, 'done doit être un booléen'],
    [{ title: 'A', description: 1 }, 'description doit être une chaîne'],
    [{ title: 'A', priority: 1 }, 'Champ inconnu : priority'],
  ])('rejette %j', (body, message) => {
    expect(validateTask(body)).toContain(message);
  });

  it('autorise une mise à jour partielle sans titre', () => {
    expect(validateTask({ done: true }, { partial: true })).toEqual([]);
  });

  it('refuse une mise à jour partielle vide', () => {
    expect(validateTask({}, { partial: true })).toEqual(['Au moins un champ doit être fourni']);
  });
});
