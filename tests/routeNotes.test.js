const {
  setNote,
  setNotes,
  getNote,
  getAllNotes,
  removeNote,
  resetNotes
} = require('../src/routeNotes');

const { pad, formatNoteRow, printNotesReport } = require('../src/notesReporter');

beforeEach(() => resetNotes());

describe('setNote / getNote', () => {
  test('stores and retrieves a note', () => {
    setNote('GET', '/users', 'Returns all users');
    const result = getNote('GET', '/users');
    expect(result).not.toBeNull();
    expect(result.note).toBe('Returns all users');
    expect(result.createdAt).toBeDefined();
  });

  test('is case-insensitive for method', () => {
    setNote('post', '/login', 'Auth endpoint');
    expect(getNote('POST', '/login').note).toBe('Auth endpoint');
  });

  test('returns null for unknown route', () => {
    expect(getNote('DELETE', '/nothing')).toBeNull();
  });

  test('overwrites existing note', () => {
    setNote('GET', '/users', 'Old note');
    setNote('GET', '/users', 'New note');
    expect(getNote('GET', '/users').note).toBe('New note');
  });
});

describe('setNotes', () => {
  test('sets multiple notes at once', () => {
    setNotes({
      'GET /health': 'Health check',
      'POST /data': 'Accepts JSON body'
    });
    expect(getNote('GET', '/health').note).toBe('Health check');
    expect(getNote('POST', '/data').note).toBe('Accepts JSON body');
  });
});

describe('getAllNotes', () => {
  test('returns all stored notes', () => {
    setNote('GET', '/a', 'Note A');
    setNote('PUT', '/b', 'Note B');
    const all = getAllNotes();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET /a'].note).toBe('Note A');
  });

  test('returns empty object when no notes', () => {
    expect(getAllNotes()).toEqual({});
  });
});

describe('removeNote', () => {
  test('removes an existing note', () => {
    setNote('GET', '/remove-me', 'temp');
    const removed = removeNote('GET', '/remove-me');
    expect(removed).toBe(true);
    expect(getNote('GET', '/remove-me')).toBeNull();
  });

  test('returns false for non-existent note', () => {
    expect(removeNote('GET', '/ghost')).toBe(false);
  });
});

describe('notesReporter', () => {
  test('pad truncates long strings', () => {
    expect(pad('abcdefghij', 5)).toBe('abcd…');
  });

  test('pad pads short strings', () => {
    expect(pad('hi', 6)).toBe('hi    ');
  });

  test('formatNoteRow returns a string', () => {
    const row = formatNoteRow('GET /users', { note: 'All users', createdAt: '2024-01-01T00:00:00.000Z' });
    expect(typeof row).toBe('string');
    expect(row).toContain('GET /users');
    expect(row).toContain('All users');
  });

  test('printNotesReport prints notes without throwing', () => {
    setNote('GET', '/ping', 'Ping endpoint');
    expect(() => printNotesReport()).not.toThrow();
  });

  test('printNotesReport handles empty notes', () => {
    expect(() => printNotesReport({})).not.toThrow();
  });
});
