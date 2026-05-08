// Route tagging registry — attach searchable labels to routes

const tags = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function setTag(method, path, tagList) {
  const key = buildKey(method, path);
  tags.set(key, Array.isArray(tagList) ? [...tagList] : [tagList]);
}

function setTags(entries) {
  for (const { method, path, tags: tagList } of entries) {
    setTag(method, path, tagList);
  }
}

function getTag(method, path) {
  return tags.get(buildKey(method, path)) || [];
}

function getAllTags() {
  const result = {};
  for (const [key, tagList] of tags.entries()) {
    result[key] = tagList;
  }
  return result;
}

function removeTag(method, path) {
  return tags.delete(buildKey(method, path));
}

function findByTag(tag) {
  const matches = [];
  for (const [key, tagList] of tags.entries()) {
    if (tagList.includes(tag)) {
      const [method, path] = key.split(/:(.+)/);
      matches.push({ method, path, tags: tagList });
    }
  }
  return matches;
}

function reset() {
  tags.clear();
}

module.exports = { setTag, setTags, getTag, getAllTags, removeTag, findByTag, reset };
