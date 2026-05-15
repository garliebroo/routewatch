// routeQuota.js — define and track request quotas per route

const quotas = new Map();
const usage = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()} ${path}`;
}

function setQuota(method, path, limit, windowMs = 60000) {
  const key = buildKey(method, path);
  quotas.set(key, { limit, windowMs, setAt: Date.now() });
}

function setQuotaBulk(entries) {
  for (const { method, path, limit, windowMs } of entries) {
    setQuota(method, path, limit, windowMs);
  }
}

function recordUsage(method, path) {
  const key = buildKey(method, path);
  const quota = quotas.get(key);
  if (!quota) return null;

  const now = Date.now();
  let entry = usage.get(key);

  if (!entry || now - entry.windowStart >= quota.windowMs) {
    entry = { count: 0, windowStart: now };
  }

  entry.count += 1;
  usage.set(key, entry);

  return {
    key,
    count: entry.count,
    limit: quota.limit,
    exceeded: entry.count > quota.limit,
    remaining: Math.max(0, quota.limit - entry.count),
  };
}

function getQuotaStatus(method, path) {
  const key = buildKey(method, path);
  const quota = quotas.get(key);
  if (!quota) return null;
  const entry = usage.get(key) || { count: 0, windowStart: Date.now() };
  return {
    key,
    limit: quota.limit,
    windowMs: quota.windowMs,
    count: entry.count,
    exceeded: entry.count > quota.limit,
    remaining: Math.max(0, quota.limit - entry.count),
  };
}

function getAllQuotaStatuses() {
  return Array.from(quotas.keys()).map((key) => {
    const [method, ...rest] = key.split(' ');
    return getQuotaStatus(method, rest.join(' '));
  });
}

function reset() {
  quotas.clear();
  usage.clear();
}

module.exports = { buildKey, setQuota, setQuotaBulk, recordUsage, getQuotaStatus, getAllQuotaStatuses, reset };
