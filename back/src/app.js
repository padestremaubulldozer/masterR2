const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bpsRouter = require('./routes/bps');
const presentationsRouter = require('./routes/presentations');
const settingsRouter = require('./routes/settings');
const { errorHandler } = require('./middleware/errors');

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend static files first (no helmet — CDN scripts need open headers)
const frontDir = process.env.FRONT_DIR || path.join(__dirname, '../../front');
app.use(express.static(frontDir));

// Serve local Claude-generated presentations at /outputs/
const sessionsDir = path.join(require('os').homedir(), 'Library/Application Support/Claude/local-agent-mode-sessions');
app.use('/outputs', express.static(sessionsDir));

// Security + rate-limit on API routes only
app.use('/api', helmet({ contentSecurityPolicy: false }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 100 }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/bps', bpsRouter);
app.use('/api/presentations', presentationsRouter);
app.use('/api/settings', settingsRouter);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
