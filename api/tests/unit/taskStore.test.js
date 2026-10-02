const { TaskStore } = require('../../src/store/taskStore');

describe('TaskStore', () => {
  let store;

  beforeEach(() => {
    store = new TaskStore();
  });

  it('crée une tâche avec des valeurs par défaut', () => {
    const task = store.create({ title: 'A' });
    expect(task).toMatchObject({ title: 'A', description: '', done: false });
    expect(task.id).toEqual(expect.any(String));
    expect(store.get(task.id)).toEqual(task);
  });

  it('filtre par état', () => {
    store.create({ title: 'A' });
    store.create({ title: 'B', done: true });
    expect(store.list()).toHaveLength(2);
    expect(store.list({ done: true }).map((t) => t.title)).toEqual(['B']);
    expect(store.list({ done: false }).map((t) => t.title)).toEqual(['A']);
  });

  it("met à jour sans modifier l'identifiant", () => {
    const task = store.create({ title: 'A' });
    const updated = store.update(task.id, { done: true, id: 'autre' });
    expect(updated.id).toBe(task.id);
    expect(updated.done).toBe(true);
    expect(store.update('inconnu', { done: true })).toBeNull();
  });

  it('supprime une tâche', () => {
    const task = store.create({ title: 'A' });
    expect(store.remove(task.id)).toBe(true);
    expect(store.remove(task.id)).toBe(false);
    expect(store.get(task.id)).toBeNull();
  });
});
