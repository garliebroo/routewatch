/**
 * routeCircuitBreaker.js
 * Tracks consecutive errors per route and trips a circuit breaker
 * when a threshold is exceeded, marking the route as degraded.
 */

const circuits = new Map();

const DEFAULTS = {
  threshold: 5,
  resetAfterMs: 30000,
};

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function getCircuit(key) {
  if (!circuits.has(key)) {
    circuits.set(key, {
      state: 'closed',
      consecutiveErrors: 0,
      trippedAt: null,
    });
  }
  return circuits.get(key);
}

function recordResult(method, path, isError, options = {}) {
  const { threshold = DEFAULTS.threshold, resetAfterMs = DEFAULTS.resetAfterMs } = options;
  const key = buildKey(method, path);
  const circuit = getCircuit(key);

  if (circuit.state === 'open') {
    const elapsed = Date.now() - circuit.trippedAt;
    if (elapsed >= resetAfterMs) {
      circuit.state = 'half-open';
      circuit.consecutiveErrors = 0;
    }
  }

  if (isError) {
    circuit.consecutiveErrors += 1;
    if (circuit.consecutiveErrors >= threshold && circuit.state !== 'open') {
      circuit.state = 'open';
      circuit.trippedAt = Date.now();
    }
  } else {
    circuit.consecutiveErrors = 0;
    circuit.state = 'closed';
  }
}

function getCircuitState(method, path) {
  const key = buildKey(method, path);
  return circuits.has(key) ? { ...circuits.get(key) } : null;
}

function getAllCircuits() {
  const result = {};
  for (const [key, value] of circuits.entries()) {
    result[key] = { ...value };
  }
  return result;
}

function isOpen(method, path) {
  const state = getCircuitState(method, path);
  return state ? state.state === 'open' : false;
}

function reset() {
  circuits.clear();
}

module.exports = { buildKey, recordResult, getCircuitState, getAllCircuits, isOpen, reset };
