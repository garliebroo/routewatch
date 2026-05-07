// notesReporter.js — print route notes in a readable table format

const { getAllNotes } = require('./routeNotes');

const COL_KEY = 28;
const COL_NOTE = 38;
const COL_DATE = 24;

function pad(str, len) {
  const s = String(str);
  return s.length >= len ? s.slice(0, len - 1) + '…' : s.padEnd(len);
}

function formatNoteRow(key, { note, createdAt }) {
  return `  ${pad(key, COL_KEY)}  ${pad(note, COL_NOTE)}  ${pad(createdAt, COL_DATE)}`;
}

function printNotesReport(notesMap) {
  const entries = Object.entries(notesMap || getAllNotes());

  if (entries.length === 0) {
    console.log('\n  [routewatch] No route notes recorded.\n');
    return;
  }

  const header =
    `  ${pad('Route', COL_KEY)}  ${pad('Note', COL_NOTE)}  ${pad('Created At', COL_DATE)}`;
  const divider = '  ' + '-'.repeat(COL_KEY + COL_NOTE + COL_DATE + 4);

  console.log('\n  Route Notes');
  console.log(divider);
  console.log(header);
  console.log(divider);

  for (const [key, val] of entries) {
    console.log(formatNoteRow(key, val));
  }

  console.log(divider);
  console.log(`  ${entries.length} note(s) total\n`);
}

module.exports = { pad, formatNoteRow, printNotesReport };
