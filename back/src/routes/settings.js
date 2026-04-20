const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/settings
router.get('/', async (_req, res, next) => {
  try {
    const mcpRows = await db('mcp_settings').select('*').orderBy('id');
    const mcps = {};
    for (const r of mcpRows) {
      mcps[r.tool_id] = r.enabled;
    }
    res.json({ mcps });
  } catch (err) { next(err); }
});

// PUT /api/settings
router.put('/', async (req, res, next) => {
  try {
    const { mcps } = req.body;

    if (mcps && typeof mcps === 'object') {
      for (const [toolId, enabled] of Object.entries(mcps)) {
        await db('mcp_settings')
          .where('tool_id', toolId)
          .update({ enabled: !!enabled });
      }
    }

    // Return updated state
    const mcpRows = await db('mcp_settings').select('*').orderBy('id');
    const result = {};
    for (const r of mcpRows) {
      result[r.tool_id] = r.enabled;
    }
    res.json({ mcps: result });
  } catch (err) { next(err); }
});

// GET /api/settings/mcp/:toolId/test — test MCP connection
router.get('/mcp/:toolId/test', async (req, res) => {
  const { toolId } = req.params;

  // MCP endpoint mapping — real endpoints where available
  const MCP_ENDPOINTS = {
    claude:     { url: 'https://api.anthropic.com/v1/messages', method: 'HEAD' },
    canva:      { url: 'https://api.canva.com/rest/v1/users/me', method: 'HEAD' },
    claap:      { url: 'https://api.claap.io/v1/health', method: 'GET' },
    slack:      { url: 'https://slack.com/api/api.test', method: 'GET' },
    notion:     { url: 'https://api.notion.com/v1/users/me', method: 'HEAD' },
    hubspot:    { url: 'https://api.hubapi.com/crm/v3/objects/contacts?limit=1', method: 'HEAD' },
    salesforce: { url: 'https://login.salesforce.com/.well-known/openid-configuration', method: 'GET' },
    modjo:      { url: 'https://api.modjo.ai/health', method: 'GET' },
    gong:       { url: 'https://api.gong.io/v2/calls', method: 'HEAD' },
    teams:      { url: 'https://graph.microsoft.com/v1.0/me', method: 'HEAD' },
    jira:       { url: 'https://api.atlassian.com/me', method: 'HEAD' },
  };

  const endpoint = MCP_ENDPOINTS[toolId];
  if (!endpoint) {
    return res.json({ toolId, status: 'unknown', message: 'MCP non reconnu' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      signal: controller.signal,
      headers: { 'User-Agent': 'MasterR2/1.0' },
    });
    clearTimeout(timeout);

    // Any response (even 401/403) means the service is reachable
    const reachable = response.status < 500;
    res.json({
      toolId,
      status: reachable ? 'reachable' : 'error',
      httpStatus: response.status,
      message: reachable
        ? `Service joignable (HTTP ${response.status})`
        : `Service en erreur (HTTP ${response.status})`,
    });
  } catch (err) {
    res.json({
      toolId,
      status: 'unreachable',
      message: err.name === 'AbortError' ? 'Timeout (5s)' : err.message,
    });
  }
});

module.exports = router;
