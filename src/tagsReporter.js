// Pretty-print route tags to the console

const chalk = require('chalk');

const METHOD_COLORS = {
  GET: chalk.green,
  POST: chalk.blue,
  PUT: chalk.yellow,
  PATCH: chalk.cyan,
  DELETE: chalk.red,
};

function colorMethod(method) {
  const fn = METHOD_COLORS[method.toUpperCase()] || chalk.white;
  return fn(method.toUpperCase().padEnd(6));
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatTagRow(method, path, tagList) {
  const tagStr = tagList.map(t => chalk.magenta(`#${t}`)).join('  ');
  return `  ${colorMethod(method)}  ${pad(path, 35)}  ${tagStr}`;
}

function printTagsReport(allTags) {
  const entries = Object.entries(allTags);
  if (entries.length === 0) {
    console.log(chalk.gray('  No route tags registered.'));
    return;
  }

  console.log(chalk.bold('\n  Route Tags\n'));
  console.log(chalk.gray('  ' + '-'.repeat(65)));

  for (const [key, tagList] of entries) {
    const [method, path] = key.split(/:(.+)/);
    console.log(formatTagRow(method, path, tagList));
  }

  console.log(chalk.gray('  ' + '-'.repeat(65)));
  console.log(chalk.gray(`  ${entries.length} route(s) tagged\n`));
}

module.exports = { colorMethod, pad, formatTagRow, printTagsReport };
