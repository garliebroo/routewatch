// routeNotes.js — attach developer notes/annotations to specific routes

const notes = new Map();

/**
 * Attach a note to a route (identified by "METHOD /path")
 */
function setNote(method, path, note) {
  const key = `${method.toUpperCase()} ${path}`;
  notes.set(key, {
    note,
    createdAt: new Date().toISOString()
  });
}

/**
 * Attach multiple notes at once via an object map
 * e.g. { 'GET /users': 'Public endpoint', 'POST /login': 'Rate limited' }
 */
function setNotes(map) {
  for (const [key, note] of Object.entries(map)) {
    const [method, ...rest] = key.split(' ');
    setNote(method, rest.join(' '), note);
  }
}

/**
 * Retrieve the note for a given route, or null if none exists
 */
function getNote(method, path) {
  const key = `${method.toUpperCase()} ${path}`;
  return notes.get(key) || null;
}

/**
 * Return all notes as a plain object
 */
function getAllNotes() {
  const result = {};
  for (const [key, val] of notes.entries()) {
    result[key] = val;
  }
  return result;
}

/**
 * Remove the note for a specific route
 */
function removeNote(method, path) {
  const key = `${method.toUpperCase()} ${path}`;
  return notes.delete(key);
}

/**
 * Clear all notes
 */
function resetNotes() {
  notes.clear();
}

module.exports = { setNote, setNotes, getNote, getAllNotes, removeNote, resetNotes };
