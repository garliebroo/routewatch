const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSnapshot, loadSnapshot, listSnapshots, deleteSnapshot } = require('../src/snapshots');
const { record, reset } = require('../src/tracker');

let tmpDir;

beforeEach(() => {
  reset();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-snap-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('saveSnapshot', () => {
  it('creates a JSON file in the given directory', () => {
    record('GET', '/users', 200, 45);
    const filepath = saveSnapshot('test', tmpDir);
    expect(fs.existsSync(filepath)).toBe(true);
    expect(filepath.endsWith('.json')).toBe(true);
  });

  it('saved file contains label, timestamp, and stats', () => {
    record('POST', '/items', 201, 80);
    const filepath = saveSnapshot('my-snap', tmpDir);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    expect(data.label).toBe('my-snap');
    expect(data.timestamp).toBeDefined();
    expect(data.stats).toBeDefined();
    expect(data.stats['POST /items']).toBeDefined();
  });

  it('creates the directory if it does not exist', () => {
    const newDir = path.join(tmpDir, 'nested', 'dir');
    saveSnapshot('auto-create', newDir);
    expect(fs.existsSync(newDir)).toBe(true);
  });
});

describe('loadSnapshot', () => {
  it('loads and parses a saved snapshot', () => {
    record('GET', '/health', 200, 10);
    const filepath = saveSnapshot('load-test', tmpDir);
    const data = loadSnapshot(filepath);
    expect(data.label).toBe('load-test');
    expect(data.stats['GET /health']).toBeDefined();
  });

  it('throws if file does not exist', () => {
    expect(() => loadSnapshot('/nonexistent/path.json')).toThrow('Snapshot file not found');
  });
});

describe('listSnapshots', () => {
  it('returns empty array when directory does not exist', () => {
    const missing = path.join(tmpDir, 'no-such-dir');
    expect(listSnapshots(missing)).toEqual([]);
  });

  it('lists all snapshot files', () => {
    saveSnapshot('a', tmpDir);
    saveSnapshot('b', tmpDir);
    const list = listSnapshots(tmpDir);
    expect(list.length).toBe(2);
    list.forEach(item => {
      expect(item.filename).toBeDefined();
      expect(item.filepath).toBeDefined();
    });
  });
});

describe('deleteSnapshot', () => {
  it('removes the snapshot file', () => {
    const filepath = saveSnapshot('del-test', tmpDir);
    deleteSnapshot(filepath);
    expect(fs.existsSync(filepath)).toBe(false);
  });

  it('throws if file does not exist', () => {
    expect(() => deleteSnapshot('/no/file.json')).toThrow('Snapshot file not found');
  });
});
