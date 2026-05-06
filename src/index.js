const { routewatch, resolveRoutePath } = require('./middleware');
const { record, getStats, reset } = require('./tracker');
const { printReport, colorMethod, formatBar } = require('./reporter');
const { startDashboard, buildHtml } = require('./dashboard');

module.exports = {
  // Core middleware
  routewatch,
  resolveRoutePath,

  // Tracker utilities
  record,
  getStats,
  reset,

  // Reporter utilities
  printReport,
  colorMethod,
  formatBar,

  // Dashboard
  startDashboard,
  buildHtml,
};
