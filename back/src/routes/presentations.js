const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const router = express.Router();

// ── Template engine: duplicate template.html and fill variables ──
const FRONT_DIR = process.env.FRONT_DIR || path.join(__dirname, '../../../front');
const PRESENTATIONS_DIR = path.join(FRONT_DIR, 'presentations');
const TEMPLATE_PATH = path.join(PRESENTATIONS_DIR, 'template.html');

function slugify(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function generatePresentation(clientName, slug, bpName) {
  if (!fs.existsSync(TEMPLATE_PATH)) return null;
  let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  // 1. Replace XXX → client name (32 occurrences)
  html = html.replace(/XXX/g, clientName);

  // 2. Replace title
  html = html.replace(
    '<title>Bulldozer Growth Plan</title>',
    `<title>Growth Plan — ${clientName} x Bulldozer</title>`
  );

  // 3. Replace screenshot paths (lotchi → client slug)
  html = html.replace(/assets\/clients\/lotchi\/screen_lotchi\.png/g,
    `assets/clients/${slug}/screen_${slug}.png`);

  // 4. Replace BP name if provided
  if (bpName) {
    html = html.replace(/Pierre-Arnaud Destremau/g, bpName);
  }

  // 5. Create client assets directory
  const clientAssetsDir = path.join(PRESENTATIONS_DIR, 'assets', 'clients', slug);
  if (!fs.existsSync(clientAssetsDir)) {
    fs.mkdirSync(clientAssetsDir, { recursive: true });
  }

  // 6. Write the file
  const outputPath = path.join(PRESENTATIONS_DIR, `${slug}.html`);
  fs.writeFileSync(outputPath, html, 'utf-8');

  return `presentations/${slug}.html`;
}

// POST /api/presentations/bulk-delete — delete multiple (MUST be before :id routes)
router.post('/bulk-delete', async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array required' });
    }
    const deleted = await db('presentations').whereIn('id', ids).del();
    res.json({ deleted });
  } catch (err) { next(err); }
});

// GET /api/presentations — list with optional filters
router.get('/', async (req, res, next) => {
  try {
    let query = db('presentations as p')
      .join('bps as b', 'p.bp_id', 'b.id')
      .select(
        'p.*',
        'b.name as bp_name', 'b.color as bp_color',
        'b.text_color as bp_text_color', 'b.photo_url as bp_photo_url',
        'b.role as bp_role'
      )
      .orderBy('p.created_at', 'desc');

    if (req.query.bp) {
      query = query.where('b.name', req.query.bp);
    }
    if (req.query.status) {
      query = query.where('p.status', req.query.status);
    }
    if (req.query.search) {
      query = query.whereRaw(
        'p.client_name ILIKE ?', [`%${req.query.search}%`]
      );
    }

    const rows = await query;
    res.json(rows.map(formatPresentationList));
  } catch (err) { next(err); }
});

// GET /api/presentations/:id — single with nested analyses
router.get('/:id', async (req, res, next) => {
  try {
    const row = await db('presentations as p')
      .join('bps as b', 'p.bp_id', 'b.id')
      .select(
        'p.*',
        'b.name as bp_name', 'b.color as bp_color',
        'b.text_color as bp_text_color', 'b.photo_url as bp_photo_url',
        'b.role as bp_role'
      )
      .where('p.id', req.params.id)
      .first();

    if (!row) return res.status(404).json({ error: 'Presentation not found' });

    // Fetch analyses with sub_scores
    const analyses = await db('lever_analyses')
      .where('presentation_id', row.id)
      .orderBy('id');

    const analysisIds = analyses.map(a => a.id);
    const subScores = analysisIds.length
      ? await db('sub_scores').whereIn('analysis_id', analysisIds).orderBy('id')
      : [];

    const subScoresByAnalysis = {};
    for (const s of subScores) {
      if (!subScoresByAnalysis[s.analysis_id]) subScoresByAnalysis[s.analysis_id] = [];
      subScoresByAnalysis[s.analysis_id].push({
        nom: s.nom,
        note: parseFloat(s.note),
        description: s.description,
      });
    }

    const analysesObj = {};
    for (const a of analyses) {
      analysesObj[a.lever] = {
        noteGlobale: parseFloat(a.note_globale),
        lectureBusiness: a.lecture_business,
        sousScores: subScoresByAnalysis[a.id] || [],
      };
    }

    res.json({
      ...formatPresentationList(row),
      contextSummary: {
        entreprise: row.context_entreprise,
        enjeux: row.context_enjeux,
        challenges: row.context_challenges,
      },
      currentStep: row.current_step,
      analyses: analysesObj,
    });
  } catch (err) { next(err); }
});

// POST /api/presentations — create
router.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    if (!b.clientName || !b.bpId) {
      return res.status(400).json({ error: 'clientName and bpId are required' });
    }

    // Auto-generate next num
    const last = await db('presentations').max('id as max').first();
    const nextNum = `R2-${String((last?.max || 0) + 1).padStart(3, '0')}`;

    const [row] = await db('presentations').insert({
      num: b.num || nextNum,
      bp_id: b.bpId,
      client_name: b.clientName,
      client_website_url: b.clientWebsiteUrl || null,
      canva_url: b.canvaUrl || null,
      claap_url: b.claapUrl || null,
      pre_audit_url: b.preAuditUrl || null,
      active_levers: b.activeLevers
        ? JSON.stringify(b.activeLevers)
        : '[]',
      pricing: b.pricing || null,
      date_r1: b.dateR1 || null,
      date_r2: b.dateR2 || null,
      status: b.status || 'brouillon',
      context_entreprise: b.contextSummary?.entreprise || null,
      context_enjeux: b.contextSummary?.enjeux || null,
      context_challenges: b.contextSummary?.challenges || null,
      current_step: b.currentStep || 1,
    }).returning('*');

    // Generate HTML from template
    const slug = slugify(b.clientName);
    const bp = await db('bps').where('id', b.bpId).first();
    const htmlPath = generatePresentation(b.clientName, slug, bp?.name);
    if (htmlPath) {
      await db('presentations').where('id', row.id).update({ html_path: htmlPath });
    }

    res.status(201).json({ id: row.id, num: row.num, htmlPath });
  } catch (err) { next(err); }
});

// PUT /api/presentations/:id — update
router.put('/:id', async (req, res, next) => {
  try {
    const b = req.body;
    const updates = {};

    if (b.clientName !== undefined) updates.client_name = b.clientName;
    if (b.clientWebsiteUrl !== undefined) updates.client_website_url = b.clientWebsiteUrl;
    if (b.canvaUrl !== undefined) updates.canva_url = b.canvaUrl;
    if (b.claapUrl !== undefined) updates.claap_url = b.claapUrl;
    if (b.preAuditUrl !== undefined) updates.pre_audit_url = b.preAuditUrl;
    if (b.activeLevers !== undefined) {
      updates.active_levers = JSON.stringify(b.activeLevers);
    }
    if (b.pricing !== undefined) updates.pricing = b.pricing;
    if (b.dateR1 !== undefined) updates.date_r1 = b.dateR1;
    if (b.dateR2 !== undefined) updates.date_r2 = b.dateR2;
    if (b.status !== undefined) updates.status = b.status;
    if (b.currentStep !== undefined) updates.current_step = b.currentStep;
    if (b.bpId !== undefined) updates.bp_id = b.bpId;

    if (b.contextSummary) {
      if (b.contextSummary.entreprise !== undefined) updates.context_entreprise = b.contextSummary.entreprise;
      if (b.contextSummary.enjeux !== undefined) updates.context_enjeux = b.contextSummary.enjeux;
      if (b.contextSummary.challenges !== undefined) updates.context_challenges = b.contextSummary.challenges;
    }

    updates.updated_at = db.fn.now();

    const [row] = await db('presentations').where('id', req.params.id).update(updates).returning('*');
    if (!row) return res.status(404).json({ error: 'Presentation not found' });
    res.json({ id: row.id, num: row.num });
  } catch (err) { next(err); }
});

// PATCH /api/presentations/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['brouillon', 'en_cours', 'terminee'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const [row] = await db('presentations')
      .where('id', req.params.id)
      .update({ status, updated_at: db.fn.now() })
      .returning('*');
    if (!row) return res.status(404).json({ error: 'Presentation not found' });
    res.json({ id: row.id, status: row.status });
  } catch (err) { next(err); }
});

// POST /api/presentations/:id/duplicate
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const original = await db('presentations').where('id', req.params.id).first();
    if (!original) return res.status(404).json({ error: 'Presentation not found' });

    const last = await db('presentations').max('id as max').first();
    const nextNum = `R2-${String((last?.max || 0) + 1).padStart(3, '0')}`;

    const { id, num, created_at, updated_at, ...rest } = original;
    const [newRow] = await db('presentations').insert({
      ...rest,
      num: nextNum,
      status: 'brouillon',
      current_step: 1,
    }).returning('*');

    // Duplicate analyses
    const analyses = await db('lever_analyses').where('presentation_id', id);
    for (const a of analyses) {
      const [newAnalysis] = await db('lever_analyses').insert({
        presentation_id: newRow.id,
        lever: a.lever,
        note_globale: a.note_globale,
        lecture_business: a.lecture_business,
      }).returning('*');

      const scores = await db('sub_scores').where('analysis_id', a.id);
      if (scores.length) {
        await db('sub_scores').insert(
          scores.map(s => ({
            analysis_id: newAnalysis.id,
            nom: s.nom,
            note: s.note,
            description: s.description,
          }))
        );
      }
    }

    res.status(201).json({ id: newRow.id, num: newRow.num });
  } catch (err) { next(err); }
});

// DELETE /api/presentations/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await db('presentations').where('id', req.params.id).del();
    if (!deleted) return res.status(404).json({ error: 'Presentation not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});


// POST /api/presentations/:id/generate-pricing — pricing via Claude LLM
router.post('/:id/generate-pricing', async (req, res, next) => {
  try {
    const { userMessage, history } = req.body;
    const pres = await db('presentations').where('id', req.params.id).first();
    if (!pres) return res.status(404).json({ error: 'Presentation not found' });

    const levers = JSON.parse(pres.active_levers || '[]');
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Build system prompt
    const systemPrompt = `Tu es un expert pricing Bulldozer Collective. Tu construis des devis Growth Plan R2.

Contexte :
- Client : ${pres.client_name}
- Leviers actifs : ${levers.join(', ')}

Règles pricing Bulldozer :
- Format : phases de 3 mois minimum
- Rôles types : Head of Growth, Paid Manager, SEO Expert, Designer, GTM Engineer
- Setup initial + run mensuel
- Budget média recommandé en sus
- Engagement 3 mois fermes puis 3 mois reconductibles

IMPORTANT : Réponds TOUJOURS avec un tableau markdown au format :
| Rôle | Setup | Run / mois | Sous-total (3 mois) |
Inclus une ligne **TOTAL** à la fin. Montants en € HT.`;

    // Try Claude API
    if (apiKey) {
      try {
        const messages = [
          ...(history || []).map(m => ({ role: m.role, content: m.text })),
          { role: 'user', content: userMessage },
        ];

        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            system: systemPrompt,
            messages,
          }),
        });

        if (claudeRes.ok) {
          const data = await claudeRes.json();
          const response = data.content[0]?.text || '';
          const totalMatch = response.match(/TOTAL.*?(\d[\d\s,.]*\s*€\s*HT)/i);
          return res.json({
            response,
            pricing: totalMatch ? totalMatch[1].trim() : null,
          });
        }
      } catch (err) {
        console.error('Claude API error:', err.message);
      }
    }

    // Smart local pricing engine — no API needed
    const msg = (userMessage || '').toLowerCase();
    const prevHistory = history || [];
    const months = parseInt(msg.match(/(\d+)\s*mois/)?.[1]) || 3;

    // Parse budget hints
    let budgetHint = parseInt((msg.match(/(\d+)\s*k/)?.[1] || '0')) * 1000;
    if (!budgetHint) budgetHint = parseInt(msg.match(/budget\s*(\d[\d\s]*)/)?.[1]?.replace(/\s/g,'') || '0');

    // Build roles based on levers
    const rolesCatalog = {
      'Head of Growth':  { setup: 0, monthly: 2500 },
      'SEO Expert':      { setup: 0, monthly: 1800 },
      'Paid Manager':    { setup: 0, monthly: 2000 },
      'Content Manager': { setup: 0, monthly: 1500 },
      'Designer':        { setup: 0, monthly: 900  },
      'GTM Engineer':    { setup: 1500, monthly: 0  },
      'Outbound Manager':{ setup: 0, monthly: 1600 },
    };

    let selectedRoles = ['Head of Growth', 'Designer', 'GTM Engineer'];
    if (levers.includes('SEO')) selectedRoles.splice(1, 0, 'SEO Expert');
    if (levers.some(l => l.includes('Ads'))) selectedRoles.splice(1, 0, 'Paid Manager');
    if (levers.includes('Content') || msg.includes('content')) selectedRoles.splice(-1, 0, 'Content Manager');
    if (msg.includes('outbound')) selectedRoles.splice(-1, 0, 'Outbound Manager');

    // Adjust if user mentions specific roles
    if (msg.includes('sans designer') || msg.includes('pas de designer')) selectedRoles = selectedRoles.filter(r => r !== 'Designer');
    if (msg.includes('sans gtm') || msg.includes('pas de gtm')) selectedRoles = selectedRoles.filter(r => r !== 'GTM Engineer');

    // Scale prices if budget hint given
    let scale = 1;
    if (budgetHint > 0) {
      const baseTotal = selectedRoles.reduce((s, r) => s + (rolesCatalog[r].monthly * months) + rolesCatalog[r].setup, 0);
      if (baseTotal > 0) scale = Math.max(0.5, Math.min(2.5, budgetHint / baseTotal));
    }

    // Handle adjustment requests from follow-up messages
    if (prevHistory.length > 0) {
      if (msg.includes('moins cher') || msg.includes('réduire') || msg.includes('baisser')) scale *= 0.75;
      if (msg.includes('plus cher') || msg.includes('augmenter') || msg.includes('premium')) scale *= 1.3;
      if (msg.match(/(\d+)\s*€.*mois.*head/i)) {
        const custom = parseInt(msg.match(/(\d+)\s*€/)[1]);
        rolesCatalog['Head of Growth'].monthly = custom;
      }
    }

    const fmt = n => n.toLocaleString('fr-FR');
    const roles = selectedRoles.map(name => {
      const cat = rolesCatalog[name];
      const setup = Math.round(cat.setup * scale / 100) * 100;
      const monthly = Math.round(cat.monthly * scale / 100) * 100;
      const subtotal = setup + monthly * months;
      return {
        name,
        setup: setup > 0 ? `${fmt(setup)} € HT` : '—',
        monthly: monthly > 0 ? `${fmt(monthly)} € HT` : '—',
        subtotal: `${fmt(subtotal)} € HT`,
        _total: subtotal,
      };
    });
    const total = roles.reduce((s, r) => s + r._total, 0);

    const table = roles.map(r => `| ${r.name} | ${r.setup} | ${r.monthly} | ${r.subtotal} |`).join('\n');
    const mediaRec = Math.max(2000, Math.round(total * 0.15 / 100) * 100);

    let commentary = '';
    if (prevHistory.length === 0) {
      commentary = `\nCette proposition est basée sur les leviers actifs (${levers.join(', ')}) et un engagement de ${months} mois.\n\nVous pouvez me demander :\n- "Réduis le budget de 20%"\n- "Ajoute un Content Manager"\n- "Passe à 6 mois"\n- "Sans GTM Engineer"\n- "Budget total 20K"`;
    } else {
      commentary = `\n_Proposition ajustée selon votre demande. Continuez à affiner._`;
    }

    res.json({
      response: `## Proposition de pricing — ${pres.client_name}\n\n**${months > 3 ? `Phase 1 : Growth Plan — ${months} mois` : 'Phase 1 : Growth Plan — 3 mois'}**\n\n| Rôle | Setup | Run / mois | Sous-total (${months} mois) |\n|------|-------|-----------|---------------------|\n${table}\n| **TOTAL** | | | **${fmt(total)} € HT** |\n\n**Budget média recommandé :** ${fmt(mediaRec)} € / mois minimum\n**Engagement :** 3 mois fermes puis reconductible\n**Leviers couverts :** ${levers.join(', ')}${commentary}`,
      pricing: `${fmt(total)} € HT`,
    });
  } catch (err) { next(err); }
});

// PUT /api/presentations/:id/analyses/:lever — upsert analysis
router.put('/:id/analyses/:lever', async (req, res, next) => {
  try {
    const { id, lever } = req.params;
    const { noteGlobale, lectureBusiness, sousScores } = req.body;

    // Check presentation exists
    const pres = await db('presentations').where('id', id).first();
    if (!pres) return res.status(404).json({ error: 'Presentation not found' });

    await db.transaction(async (trx) => {
      // Upsert analysis
      let analysis = await trx('lever_analyses')
        .where({ presentation_id: id, lever })
        .first();

      if (analysis) {
        await trx('lever_analyses').where('id', analysis.id).update({
          note_globale: noteGlobale ?? analysis.note_globale,
          lecture_business: lectureBusiness ?? analysis.lecture_business,
        });
      } else {
        [analysis] = await trx('lever_analyses').insert({
          presentation_id: id,
          lever,
          note_globale: noteGlobale ?? 7.0,
          lecture_business: lectureBusiness ?? '',
        }).returning('*');
      }

      // Replace sub_scores
      if (sousScores) {
        await trx('sub_scores').where('analysis_id', analysis.id).del();
        if (sousScores.length) {
          await trx('sub_scores').insert(
            sousScores.map(s => ({
              analysis_id: analysis.id,
              nom: s.nom,
              note: s.note,
              description: s.description || '',
            }))
          );
        }
      }
    });

    res.json({ ok: true });
  } catch (err) { next(err); }
});

function formatPresentationList(row) {
  return {
    id: row.id,
    num: row.num,
    bp: {
      id: row.bp_id,
      name: row.bp_name,
      color: row.bp_color,
      textColor: row.bp_text_color,
      photoUrl: row.bp_photo_url,
      role: row.bp_role,
    },
    clientName: row.client_name,
    clientWebsiteUrl: row.client_website_url,
    canvaUrl: row.canva_url,
    claapUrl: row.claap_url,
    preAuditUrl: row.pre_audit_url,
    activeLevers: typeof row.active_levers === 'string' ? JSON.parse(row.active_levers || '[]') : (row.active_levers || []),
    pricing: row.pricing,
    dateR1: row.date_r1,
    dateR2: row.date_r2,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = router;
