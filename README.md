# routewatch

Lightweight Express middleware for logging and visualizing API route usage in development.

## Installation

```bash
npm install routewatch
```

## Usage

```javascript
const express = require('express');
const routewatch = require('routewatch');

const app = express();

// Add routewatch before your routes
app.use(routewatch());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

Once your server is running, routewatch will log incoming requests to the console and track usage stats for each route. By default, it only activates when `NODE_ENV` is set to `development`.

### Options

```javascript
app.use(routewatch({
  verbose: true,       // Log full request details
  color: true,         // Colorized console output
  dashboard: false     // Enable in-terminal usage dashboard
}));
```

### Example Output

```
[routewatch] GET /api/users 200 12ms
[routewatch] POST /api/users 201 34ms
[routewatch] GET /api/users/:id 404 5ms
```

## Why routewatch?

- Zero configuration required
- No production overhead — disabled outside of development automatically
- Helps identify unused or over-hit routes during development

## License

MIT © routewatch contributors