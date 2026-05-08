// commentsReporter.js — print a formatted table of route comments

const { getAllComments } = require('./routeComments');

const METHOD_COLORS = {
  GET: '\x1b[32m',
  POST: '\x1b[34m',
  PUT: '\x1b[33m',
  PATCH: '\x1b[35m',
  DELETE: '\x1b[31m',
};
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

function pad(str, len) {
  return String(str).padEnd(len);
}

function colorMethod(method) {
  const color = METHOD_COLORS[method.toUpperCase()] ?? '';
  return `${color}${pad(method.toUpperCase(), 7)}${RESET}`;
}

function formatCommentRow({ method, path, comment }) {
  return `  ${colorMethod(method)} ${DIM}${pad(path, 30)}${RESET} ${comment}`;
}

function printCommentsReport(comments) {
  const list = comments ?? getAllComments();

  if (list.length === 0) {
    console.log('\n  No route comments found.\n');
    return;
  }

  console.log('\n\x1b[1m  Route Comments\x1b[0m');
  console.log('  ' + '─'.repeat(60));
  for (const entry of list) {
    console.log(formatCommentRow(entry));
  }
  console.log('  ' + '─'.repeat(60) + '\n');
}

module.exports = { colorMethod, formatCommentRow, printCommentsReport };
