const ALLOWED_FIELDS = ['title', 'description', 'done'];

// Retourne la liste des erreurs de validation (vide si le corps est valide).
function validateTask(body, { partial = false } = {}) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Le corps de la requête doit être un objet JSON'];
  }

  for (const key of Object.keys(body)) {
    if (!ALLOWED_FIELDS.includes(key)) errors.push(`Champ inconnu : ${key}`);
  }

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push('title est obligatoire et doit être une chaîne non vide');
    } else if (body.title.length > 200) {
      errors.push('title ne doit pas dépasser 200 caractères');
    }
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description doit être une chaîne');
  }
  if (body.done !== undefined && typeof body.done !== 'boolean') {
    errors.push('done doit être un booléen');
  }
  if (partial && errors.length === 0 && Object.keys(body).length === 0) {
    errors.push('Au moins un champ doit être fourni');
  }
  return errors;
}

module.exports = { validateTask };
