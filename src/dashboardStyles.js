const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #0f1117;
  color: #e2e8f0;
  padding: 2rem;
}
h1 { font-size: 1.8rem; margin-bottom: 0.25rem; }
.subtitle { color: #64748b; margin-bottom: 1.5rem; font-size: 0.9rem; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  background: #1e2330;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #1e2330;
}
tr:hover td { background: #1a1f2e; }
.method {
  font-weight: 700;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
}
.method-get    { color: #34d399; }
.method-post   { color: #60a5fa; }
.method-put    { color: #fbbf24; }
.method-patch  { color: #a78bfa; }
.method-delete { color: #f87171; }
.path   { font-family: monospace; color: #e2e8f0; }
.bar    { color: #38bdf8; letter-spacing: -1px; }
.count  { font-weight: 600; color: #f0abfc; }
.avg    { color: #94a3b8; }
.last   { color: #64748b; }
.empty  { text-align: center; padding: 2rem; color: #475569; }
`;

module.exports = { css };
