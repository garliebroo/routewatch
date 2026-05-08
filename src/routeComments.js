// routeComments.js — attach and retrieve inline comments/annotations for routes

const comments = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function setComment(method, path, comment) {
  if (!method || !path || typeof comment !== 'string') {
    throw new Error('method, path, and comment string are required');
  }
  comments.set(buildKey(method, path), comment.trim());
}

function setComments(entries) {
  if (!Array.isArray(entries)) throw new Error('entries must be an array');
  for (const { method, path, comment } of entries) {
    setComment(method, path, comment);
  }
}

function getComment(method, path) {
  return comments.get(buildKey(method, path)) ?? null;
}

function getAllComments() {
  const result = [];
  for (const [key, comment] of comments.entries()) {
    const [method, ...pathParts] = key.split(':');
    result.push({ method, path: pathParts.join(':'), comment });
  }
  return result;
}

function removeComment(method, path) {
  return comments.delete(buildKey(method, path));
}

function clearComments() {
  comments.clear();
}

module.exports = { setComment, setComments, getComment, getAllComments, removeComment, clearComments };
