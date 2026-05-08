/**
 * snapshots.js
 * Save and load point-in-time snapshots of route stats.
 */

const fs = require('fs');
const path = require('path');
const { getStats, reset } = require('./tracker');

const DEFAULT_DIR = path.resolve(process.cwd(), '.routewatch-snapshots');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveSnapshot(label, dir = DEFAULT_DIR) {
  ensureDir(dir);
  const stats = getStats();
  const timestamp = new Date().toISOString();
  const filename = `${label}-${timestamp.replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(dir, filename);
  const payload = { label, timestamp, stats };
  fs.writeFileSync(filepath, JSON.stringify(payload, null, 2), 'utf8');
  return filepath;
}

function loadSnapshot(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Snapshot file not found: ${filepath}`);
  }
  const raw = fs.readFileSync(filepath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse snapshot at ${filepath}: ${err.message}`);
  }
  return parsed;
}

function listSnapshots(dir = DEFAULT_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      filename: f,
      filepath: path.join(dir, f),
    }));
}

function deleteSnapshot(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Snapshot file not found: ${filepath}`);
  }
  fs.unlinkSync(filepath);
}

module.exports = { saveSnapshot, loadSnapshot, listSnapshots, deleteSnapshot };
