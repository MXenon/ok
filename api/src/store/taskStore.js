const { randomUUID } = require('node:crypto');

// Stockage en mémoire : suffisant pour la démo et les tests.
// Sur Lambda, les données vivent le temps d'un conteneur ; remplacer par DynamoDB pour la persistance.
class TaskStore {
  constructor() {
    this.tasks = new Map();
  }

  list({ done } = {}) {
    const all = [...this.tasks.values()];
    return done === undefined ? all : all.filter((t) => t.done === done);
  }

  get(id) {
    return this.tasks.get(id) || null;
  }

  create({ title, description = '', done = false }) {
    const now = new Date().toISOString();
    const task = { id: randomUUID(), title, description, done, createdAt: now, updatedAt: now };
    this.tasks.set(task.id, task);
    return task;
  }

  update(id, changes) {
    const existing = this.tasks.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...changes, id, updatedAt: new Date().toISOString() };
    this.tasks.set(id, updated);
    return updated;
  }

  remove(id) {
    return this.tasks.delete(id);
  }

  clear() {
    this.tasks.clear();
  }
}

module.exports = { TaskStore };
