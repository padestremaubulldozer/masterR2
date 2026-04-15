/**
 * Master R2 — API Client
 * Replaces localStorage persistence with backend API calls.
 * Returns data in the same shape the frontend components expect.
 */
const API_BASE = window.MASTER_R2_API || '/api';

// BPs cache — loaded once, used for name→id lookups
let _bpsCache = null;

// ── Toast notification for API errors ──
let _toastEl = null;
let _toastTimer = null;
function showApiToast(msg) {
  if (!_toastEl) {
    _toastEl = document.createElement('div');
    Object.assign(_toastEl.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
      background: '#ff4444', color: '#fff', padding: '12px 20px',
      borderRadius: '8px', fontFamily: 'Inconsolata, monospace',
      fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,.3)',
      transition: 'opacity .3s', opacity: '0', pointerEvents: 'none',
    });
    document.body.appendChild(_toastEl);
  }
  _toastEl.textContent = msg;
  _toastEl.style.opacity = '1';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { _toastEl.style.opacity = '0'; }, 5000);
}

async function apiFetch(path, opts = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
  } catch (e) {
    showApiToast('API injoignable — vérifiez que le serveur tourne');
    throw e;
  }
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const msg = err.error || res.statusText;
    showApiToast(msg);
    throw new Error(msg);
  }
  return res.json();
}

// ── BPs ──

async function apiFetchBPs() {
  const data = await apiFetch('/bps');
  _bpsCache = data;
  return data.map(apiToBp);
}

function apiToBp(row) {
  return {
    name: row.name,
    role: row.role,
    color: row.color,
    tc: row.textColor,
    photo: row.photoUrl,
    _id: row.id,
  };
}

async function getBpId(name) {
  if (!_bpsCache) await apiFetchBPs();
  const bp = _bpsCache.find(b => b.name === name);
  return bp ? bp.id : null;
}

async function apiCreateBP(bp) {
  const data = await apiFetch('/bps', {
    method: 'POST',
    body: JSON.stringify({
      name: bp.name,
      role: bp.role,
      color: bp.color,
      textColor: bp.tc || '#000',
      photoUrl: bp.photo || null,
    }),
  });
  _bpsCache = null; // invalidate cache
  return apiToBp(data);
}

async function apiUpdateBP(id, updates) {
  const body = {};
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.role !== undefined) body.role = updates.role;
  if (updates.color !== undefined) body.color = updates.color;
  if (updates.tc !== undefined) body.textColor = updates.tc;
  if (updates.photo !== undefined) body.photoUrl = updates.photo;
  const data = await apiFetch(`/bps/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  _bpsCache = null;
  return apiToBp(data);
}

async function apiDeleteBP(id) {
  await apiFetch(`/bps/${id}`, { method: 'DELETE' });
  _bpsCache = null;
}

// ── Presentations ──

function apiToPresentation(p) {
  // Coerce null → '' for all string fields the frontend may call .trim() on
  const s = v => v == null ? '' : String(v);
  // Coerce dates: ISO timestamps → YYYY-MM-DD, null → ''
  const d = v => v ? String(v).slice(0, 10) : '';
  return {
    id: p.id,
    num: p.num || '',
    bp: p.bp.name,
    _bpId: p.bp.id,
    _bpData: { name: p.bp.name, role: p.bp.role, color: p.bp.color, tc: p.bp.textColor, photo: p.bp.photoUrl },
    clientName: s(p.clientName),
    clientWebsiteUrl: s(p.clientWebsiteUrl),
    canvaUrl: s(p.canvaUrl),
    claapUrl: s(p.claapUrl),
    preAuditUrl: s(p.preAuditUrl),
    activeLevers: p.activeLevers || [],
    pricing: s(p.pricing),
    dateR1: d(p.dateR1),
    dateR2: d(p.dateR2),
    status: p.status || 'brouillon',
    createdAt: p.createdAt || '',
    updatedAt: p.updatedAt || '',
    currentStep: p.currentStep,
    contextSummary: p.contextSummary || { entreprise: '', enjeux: '', challenges: '' },
    analyses: p.analyses || {},
  };
}

async function apiFetchPresentations(params = {}) {
  const qs = new URLSearchParams();
  if (params.bp) qs.set('bp', params.bp);
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  const query = qs.toString();
  const data = await apiFetch(`/presentations${query ? '?' + query : ''}`);
  return data.map(apiToPresentation);
}

async function apiFetchPresentation(id) {
  const data = await apiFetch(`/presentations/${id}`);
  return apiToPresentation(data);
}

async function apiCreatePresentation(p) {
  const bpId = p._bpId || await getBpId(p.bp);
  const body = {
    bpId,
    clientName: p.clientName,
    clientWebsiteUrl: p.clientWebsiteUrl || '',
    canvaUrl: p.canvaUrl || '',
    claapUrl: p.claapUrl || '',
    preAuditUrl: p.preAuditUrl || '',
    activeLevers: p.activeLevers || [],
    pricing: p.pricing || '',
    dateR1: p.dateR1 || null,
    dateR2: p.dateR2 || null,
    status: p.status || 'brouillon',
    currentStep: p.currentStep || 1,
    contextSummary: p.contextSummary || {},
  };
  const data = await apiFetch('/presentations', { method: 'POST', body: JSON.stringify(body) });
  return data; // { id, num }
}

async function apiUpdatePresentation(id, updates) {
  const body = {};
  if (updates.clientName !== undefined) body.clientName = updates.clientName;
  if (updates.clientWebsiteUrl !== undefined) body.clientWebsiteUrl = updates.clientWebsiteUrl;
  if (updates.canvaUrl !== undefined) body.canvaUrl = updates.canvaUrl;
  if (updates.claapUrl !== undefined) body.claapUrl = updates.claapUrl;
  if (updates.preAuditUrl !== undefined) body.preAuditUrl = updates.preAuditUrl;
  if (updates.activeLevers !== undefined) body.activeLevers = updates.activeLevers;
  if (updates.pricing !== undefined) body.pricing = updates.pricing;
  if (updates.dateR1 !== undefined) body.dateR1 = updates.dateR1;
  if (updates.dateR2 !== undefined) body.dateR2 = updates.dateR2;
  if (updates.status !== undefined) body.status = updates.status;
  if (updates.currentStep !== undefined) body.currentStep = updates.currentStep;
  if (updates.contextSummary !== undefined) body.contextSummary = updates.contextSummary;
  if (updates.bp !== undefined) {
    body.bpId = updates._bpId || await getBpId(updates.bp);
  }
  return apiFetch(`/presentations/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

async function apiUpdateStatus(id, status) {
  return apiFetch(`/presentations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

async function apiDuplicatePresentation(id) {
  return apiFetch(`/presentations/${id}/duplicate`, { method: 'POST' });
}

async function apiDeletePresentation(id) {
  return apiFetch(`/presentations/${id}`, { method: 'DELETE' });
}

async function apiUpsertAnalysis(presId, lever, analysis) {
  return apiFetch(`/presentations/${presId}/analyses/${encodeURIComponent(lever)}`, {
    method: 'PUT',
    body: JSON.stringify({
      noteGlobale: analysis.noteGlobale,
      lectureBusiness: analysis.lectureBusiness,
      sousScores: analysis.sousScores,
    }),
  });
}

/**
 * upsert — drop-in replacement for the localStorage upsert.
 * Creates or updates a presentation + its analyses.
 * Returns the saved presentation's { id, num }.
 */
async function apiUpsert(p) {
  let presId = p.id;
  let result;

  if (typeof presId === 'string' && isNaN(presId)) {
    // New presentation (frontend-generated string ID like 'x7a9b2k')
    result = await apiCreatePresentation(p);
    presId = result.id;
  } else {
    // Existing presentation (integer ID from DB)
    await apiUpdatePresentation(presId, p);
    result = { id: presId };
  }

  // Save analyses
  if (p.analyses) {
    for (const [lever, analysis] of Object.entries(p.analyses)) {
      if (p.activeLevers && p.activeLevers.includes(lever)) {
        await apiUpsertAnalysis(presId, lever, analysis);
      }
    }
  }

  return result;
}

// ── Settings ──

async function apiFetchSettings() {
  return apiFetch('/settings');
}

async function apiUpdateSettings(patch) {
  return apiFetch('/settings', { method: 'PUT', body: JSON.stringify(patch) });
}
