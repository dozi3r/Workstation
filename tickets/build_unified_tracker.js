/**
 * BUILD UNIFIED TRACKER - Master Backlog & Ticket Execution Command Center Compiler
 * Authority: ADR-0001, ADR-0002, tickets/creative/README.md, tickets/tier_0/README.md, Skills/reference/04_PRODUCT_DISCOVERY_TO_DELIVERY.md
 * 
 * Aggregates all ticket pipelines across Creator Studio:
 * 1. Creative Writing & Worldbuilding Modules (tickets/creative/creative_backlog_manifest.json)
 * 2. Tier 0 Baseline Settlement Substratum (tickets/tier_0/tier_0_manifest.json)
 * 3. Platform Architecture & System Agnosticism (tickets/system/*.md)
 * 
 * Outputs:
 * - tickets/master_ticket_manifest.json (Normalized master JSON database)
 * - tickets/unified_ticket_tracker.html (Standalone Zero-CORS Interactive Dashboard)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TICKETS_DIR = path.join(ROOT_DIR, 'tickets');
const CREATIVE_MANIFEST_PATH = path.join(TICKETS_DIR, 'creative', 'creative_backlog_manifest.json');
const TIER0_MANIFEST_PATH = path.join(TICKETS_DIR, 'tier_0', 'tier_0_manifest.json');
const SYSTEM_TICKETS_DIR = path.join(TICKETS_DIR, 'system');
const MASTER_MANIFEST_PATH = path.join(TICKETS_DIR, 'master_ticket_manifest.json');

// Portable file URLs (Tech Debt Wave 0): stored root-relative in the manifest
// (consumed by root-level start.html); rebased with '../' for tickets/*.html.
function toRootRelUrl(absPath) {
  return path.relative(ROOT_DIR, absPath).replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/');
}
function rebaseFileUrls(jsonStr, prefix) {
  return jsonStr.replace(/("file_url"\s*:\s*")(?![a-zA-Z][a-zA-Z0-9+.-]*:|\/|\.\.\/)(?=[^"])/g, `$1${prefix}`);
}
const UNIFIED_TRACKER_HTML = path.join(TICKETS_DIR, 'unified_ticket_tracker.html');

console.log('========================================================');
console.log('       CREATOR STUDIO - UNIFIED TICKET TRACKER COMPILER ');
console.log('========================================================\n');

// Simple YAML frontmatter parser for markdown files
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  const rawYaml = match[1];
  const body = match[2];
  const data = {};
  
  rawYaml.split(/\r?\n/).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      else if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val.replace(/'/g, '"'));
        } catch {
          val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      }
      data[key] = val;
    }
  });
  return { data, body };
}

const masterTickets = [];

// 1. Ingest Creative Writing Tickets (CWT)
if (fs.existsSync(CREATIVE_MANIFEST_PATH)) {
  try {
    let raw = fs.readFileSync(CREATIVE_MANIFEST_PATH, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const creativeList = JSON.parse(raw);
    creativeList.forEach(t => {
      const relPath = t.ticket_file || (t.id ? `tickets/creative/backlog/${t.category}/${t.id}.md` : '');
      const absPath = path.resolve(ROOT_DIR, relPath);
      const fileUrl = fs.existsSync(absPath) ? toRootRelUrl(absPath) : '';
      
      masterTickets.push({
        id: t.id,
        track: 'Creative Modules (CWT)',
        track_code: 'CWT',
        title: t.title,
        pipeline_tier: t.pipeline_tier,
        tier_label: `Tier ${t.pipeline_tier}`,
        category: t.category || 'creative',
        wave: t.wave || 'Creative Backlog',
        status: t.status || 'discovery',
        summary: t.summary || '',
        syllogism: t.syllogism || '',
        four_corners: t.four_corners || null,
        dials: t.dials || [],
        threat_clocks: t.threat_clocks || [],
        provides: t.provides || [],
        requires: t.requires || [],
        blocked_by: t.blocked_by || ['None'],
        blocks: t.blocks || [],
        culture_quadrant: t.culture_quadrant || '',
        mtg_color: t.mtg_color || '',
        agent_brief: t.agent_brief || '',
        ticket_file: relPath,
        file_url: fileUrl,
        module_path: t.module_path || '',
        tags: t.tags || [],
        creator_source: t.creator_source || ''
      });
    });
    console.log(`[OK] Ingested ${creativeList.length} Creative Writing Tickets (CWT)`);
  } catch (err) {
    console.warn(`[WARN] Failed to read creative backlog manifest:`, err.message);
  }
}

// 2. Ingest Tier 0 Baseline Substratum Tickets
if (fs.existsSync(TIER0_MANIFEST_PATH)) {
  try {
    let raw = fs.readFileSync(TIER0_MANIFEST_PATH, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const tier0Data = JSON.parse(raw);
    (tier0Data.tickets || []).forEach(t => {
      const absPath = path.resolve(ROOT_DIR, t.path);
      const fileUrl = toRootRelUrl(absPath);
      
      // Extract summary from raw markdown
      let summaryText = t.preview || '';
      if (t.raw_markdown) {
        const m = t.raw_markdown.match(/## 1\. Baseline Concept[^\n]*\n([\s\S]*?)(?=\n## 2|$)/);
        if (m) summaryText = m[1].trim();
      }

      masterTickets.push({
        id: t.id,
        track: 'Baseline Substratum (Tier 0)',
        track_code: 'T0-DOM',
        title: t.title,
        pipeline_tier: 0,
        tier_label: 'Tier 0 Substratum',
        category: t.domain || 'DOM-00',
        wave: 'Tier 0: Mundane Settlement Substratum',
        status: t.status || 'ready_for_spec',
        summary: summaryText,
        syllogism: 'Mundane Survival Needs + Settlement Carrying Capacity = Foundation for Macro Politics',
        four_corners: {
          establishment: 'Settlement Bailiff & Grain Store (Enforcing basic rations & curfew)',
          opponent: 'Famine & Drought Exposure (Severe seasonal elements breaking baseline)',
          shadow: 'Black Market Smugglers (Diverting emergency grain stores for copper)',
          outcast: 'Foragers & Wasteland Nomads (Surviving outside the municipal perimeter)'
        },
        dials: [
          'Level 1: Bountiful - Abundant supplies; full reserves (Light)',
          'Level 2: Normal - Standard carrying capacity; steady flow (Moderate)',
          'Level 3: Lean - Scarcity; rationing; minor unrest checks (Severe)',
          'Level 4: Famine / Collapse - Total resource exhaustion; population forced to migrate (Lethal)'
        ],
        threat_clocks: [
          'Seasonal Depletion Clock [6 Ticks] - Ticks when winter or drought strikes.',
          'Local Scarcity Unrest [4 Ticks] - Ticks when rations are withheld.'
        ],
        provides: t.provides || [],
        requires: t.requires || [],
        blocked_by: ['None'],
        blocks: [],
        culture_quadrant: 'Clan / Hierarchy',
        mtg_color: 'Green / White',
        agent_brief: 'Author using Tier 0 baseline settlement schema. Support both Smooth Generic and Granular Modularity modes.',
        ticket_file: t.path,
        file_url: fileUrl,
        module_path: ''
      });
    });
    console.log(`[OK] Ingested ${tier0Data.tickets.length} Tier 0 Substratum Tickets`);
  } catch (err) {
    console.warn(`[WARN] Failed to read tier 0 manifest:`, err.message);
  }
}

// 3. Ingest Platform Architecture & System Tickets
if (fs.existsSync(SYSTEM_TICKETS_DIR)) {
  const sysFiles = fs.readdirSync(SYSTEM_TICKETS_DIR).filter(f => f.endsWith('.md'));
  sysFiles.forEach(file => {
    const fullPath = path.join(SYSTEM_TICKETS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const { data, body } = parseFrontmatter(content);
    const fileUrl = toRootRelUrl(fullPath);

    // Extract first section as summary
    let summaryText = '';
    const m = body.match(/## 1\. Executive [^\n]*\n([\s\S]*?)(?=\n## 2|$)/);
    if (m) summaryText = m[1].replace(/[\r\n]+/g, ' ').slice(0, 240) + '...';

    masterTickets.push({
      id: data.id || path.basename(file, '.md'),
      track: 'Platform Architecture (SYS)',
      track_code: 'SYS',
      title: data.title || file,
      pipeline_tier: 'Platform',
      tier_label: 'Platform Architecture',
      category: data.category || 'system_architecture',
      wave: data.wave || 'Platform Core',
      status: data.status || 'ready_for_spec',
      summary: summaryText || body.slice(0, 200) + '...',
      syllogism: 'System Agnosticism + Flexible Ancestry Tagging = Unconstrained GM Worldbuilding',
      four_corners: null,
      dials: [],
      threat_clocks: [],
      provides: data.provides || [],
      requires: data.requires || [],
      blocked_by: data.blocked_by || ['None'],
      blocks: data.blocks || [],
      culture_quadrant: 'Universal / All Quadrants',
      mtg_color: 'Colorless',
      agent_brief: 'Implement system architectural feature ensuring zero-CORS offline execution.',
      ticket_file: `tickets/system/${file}`,
      file_url: fileUrl,
      module_path: ''
    });
  });
  console.log(`[OK] Ingested ${sysFiles.length} System Architecture Tickets (SYS)`);
}

// Save master manifest JSON
fs.writeFileSync(MASTER_MANIFEST_PATH, JSON.stringify(masterTickets, null, 2), 'utf8');
console.log(`[OK] Master Ticket Manifest generated: ${masterTickets.length} total tickets registered at tickets/master_ticket_manifest.json`);

// 4. Generate Interactive Standalone Unified Tracker HTML
function generateUnifiedTrackerHtml(tickets) {
  const shippedCount = tickets.filter(t => t.status === 'shipped').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_drafting' || t.status === 'in_editorial').length;
  const readyCount = tickets.filter(t => t.status === 'ready_for_authoring' || t.status === 'ready_for_spec').length;
  const backlogCount = tickets.filter(t => t.status === 'discovery').length;
  const totalCount = tickets.length;
  const pctShipped = totalCount > 0 ? Math.round((shippedCount / totalCount) * 100) : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creator Studio — Unified Master Ticket Tracker & Command Center</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #131b2e;
      --card-border: #1e293b;
      --accent: #d97706;
      --accent-glow: rgba(217, 119, 6, 0.2);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --cyan: #06b6d4;
      --purple: #8b5cf6;
      --emerald: #10b981;
      --rose: #f43f5e;
      --amber: #f59e0b;
      --blue: #3b82f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--card-border);
      flex-wrap: wrap;
      gap: 16px;
    }
    .header-titles h1 {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #fff;
    }
    .header-titles p {
      color: var(--text-muted);
      font-size: 14px;
      margin-top: 4px;
    }
    .brand-badge {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(217, 119, 6, 0.15);
      color: var(--accent);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(217, 119, 6, 0.3);
      font-weight: 600;
    }

    /* KPI STATS */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 16px;
      position: relative;
      overflow: hidden;
    }
    .kpi-card::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
    }
    .kpi-card.total::before { background: var(--blue); }
    .kpi-card.shipped::before { background: var(--emerald); }
    .kpi-card.progress::before { background: var(--amber); }
    .kpi-card.ready::before { background: var(--cyan); }
    .kpi-card.backlog::before { background: var(--purple); }
    .kpi-label { font-size: 12px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #fff; margin-top: 4px; }
    .kpi-sub { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

    /* CONTROLS & FILTERS */
    .filter-panel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      align-items: center;
    }
    .search-box {
      flex: 1 1 240px;
      position: relative;
    }
    .search-box input {
      width: 100%;
      background: #0b0f19;
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 9px 12px;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      transition: border 0.15s;
    }
    .search-box input:focus { border-color: var(--accent); }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .filter-group label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .filter-group select {
      background: #0b0f19;
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      cursor: pointer;
    }

    /* FRONTIER BANNER */
    .frontier-banner {
      background: linear-gradient(90deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.08));
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .frontier-info h3 { font-size: 15px; color: var(--cyan); font-weight: 600; }
    .frontier-info p { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
    .frontier-btn {
      background: var(--cyan);
      color: #0b0f19;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .frontier-btn:hover { opacity: 0.9; }

    /* TICKETS GRID */
    .tickets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 16px;
    }
    .ticket-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
      position: relative;
    }
    .ticket-card:hover {
      transform: translateY(-2px);
      border-color: rgba(217, 119, 6, 0.5);
    }
    .ticket-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      gap: 8px;
    }
    .ticket-id-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ticket-id {
      font-family: monospace;
      font-weight: 700;
      font-size: 13px;
      color: var(--accent);
      background: rgba(217, 119, 6, 0.12);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid rgba(217, 119, 6, 0.25);
    }
    .badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge.shipped { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge.in_editorial, .badge.in_drafting { background: rgba(245, 158, 11, 0.15); color: var(--amber); border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge.ready_for_authoring, .badge.ready_for_spec { background: rgba(6, 182, 212, 0.15); color: var(--cyan); border: 1px solid rgba(6, 182, 212, 0.3); }
    .badge.discovery { background: rgba(139, 92, 246, 0.15); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.3); }
    
    .badge-tier {
      font-size: 11px;
      background: #1e293b;
      color: #94a3b8;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .badge-track {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .badge-track.CWT { background: rgba(217, 119, 6, 0.15); color: #fbbf24; }
    .badge-track.T0-DOM { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .badge-track.SYS { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }

    .ticket-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
      line-height: 1.35;
    }
    .ticket-summary {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }
    .tag-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: auto;
    }
    .tag-pill {
      font-size: 11px;
      background: #0f172a;
      border: 1px solid #1e293b;
      color: #94a3b8;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .tag-pill.prov { border-color: rgba(16, 185, 129, 0.3); color: #34d399; }
    .tag-pill.req { border-color: rgba(244, 63, 94, 0.3); color: #fb7185; }

    /* MODAL / DRAWER */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 1000;
    }
    .modal-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      position: relative;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .modal-close {
      position: absolute;
      top: 20px; right: 20px;
      background: none; border: none;
      color: var(--text-muted); font-size: 20px; cursor: pointer;
    }
    .modal-section { margin-top: 18px; padding-top: 14px; border-top: 1px solid #1e293b; }
    .modal-section h4 { font-size: 13px; text-transform: uppercase; color: var(--accent); letter-spacing: 0.5px; margin-bottom: 8px; }
    .modal-dials, .modal-clocks { list-style: none; }
    .modal-dials li, .modal-clocks li { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; padding-left: 12px; border-left: 2px solid #334155; }
    .modal-link-btn {
      display: inline-block;
      margin-top: 16px;
      background: var(--accent);
      color: #0b0f19;
      font-weight: 600;
      font-size: 13px;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <header>
    <div class="header-titles">
      <h1>
        Creator Studio
        <span class="brand-badge">Master Ticket Command Center</span>
      </h1>
      <p>Unified tracer-bullet execution dashboard syncing Creative Modules (CWT), Baseline Substratum (Tier 0), and Platform Systems.</p>
    </div>
  </header>

  <div class="kpi-grid">
    <div class="kpi-card total">
      <div class="kpi-label">Total Backlog Tickets</div>
      <div class="kpi-value">${totalCount}</div>
      <div class="kpi-sub">Across 3 Specialized Tracks</div>
    </div>
    <div class="kpi-card shipped">
      <div class="kpi-label">Shipped & Integrated</div>
      <div class="kpi-value">${shippedCount}</div>
      <div class="kpi-sub">${pctShipped}% of Total Backlog</div>
    </div>
    <div class="kpi-card progress">
      <div class="kpi-label">In Editorial / Drafting</div>
      <div class="kpi-value">${inProgressCount}</div>
      <div class="kpi-sub">Active In Pipeline</div>
    </div>
    <div class="kpi-card ready">
      <div class="kpi-label">Frontier (Ready for Pickup)</div>
      <div class="kpi-value">${readyCount}</div>
      <div class="kpi-sub">Unblocked for Immediate Agent Work</div>
    </div>
    <div class="kpi-card backlog">
      <div class="kpi-label">Discovery Backlog</div>
      <div class="kpi-value">${backlogCount}</div>
      <div class="kpi-sub">Framing & Concept Phase</div>
    </div>
  </div>

  <div class="frontier-banner">
    <div class="frontier-info">
      <h3>🚀 Active Frontier Radar (${readyCount} Unblocked Tickets)</h3>
      <p>Filtered view of tickets with zero unresolved blockers ready for immediate subagent pickup.</p>
    </div>
    <button class="frontier-btn" onclick="filterToFrontier()">Show Only Frontier</button>
  </div>

  <div class="filter-panel">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="Search by ID, title, keyword, provides/requires..." oninput="applyFilters()">
    </div>
    <div class="filter-group">
      <label>Track:</label>
      <select id="trackFilter" onchange="applyFilters()">
        <option value="ALL">All Tracks</option>
        <option value="CWT">Creative Modules (CWT)</option>
        <option value="T0-DOM">Tier 0 Substratum (T0)</option>
        <option value="SYS">Platform Architecture (SYS)</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Status:</label>
      <select id="statusFilter" onchange="applyFilters()">
        <option value="ALL">All Statuses</option>
        <option value="ready">Frontier / Ready (Spec & Authoring)</option>
        <option value="in_progress">In Progress / Editorial</option>
        <option value="shipped">Shipped</option>
        <option value="discovery">Discovery</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Pipeline Tier:</label>
      <select id="tierFilter" onchange="applyFilters()">
        <option value="ALL">All Tiers</option>
        <option value="0">Tier 0 (Substratum)</option>
        <option value="1">Tier 1 (Macro Governance)</option>
        <option value="2">Tier 2 (Topological & Biome)</option>
        <option value="3">Tier 3 (Infrastructure)</option>
        <option value="4">Tier 4 (Dynamic Sparks)</option>
        <option value="5">Tier 5 (Climax Engines)</option>
        <option value="Platform">Platform Architecture</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Source / Series:</label>
      <select id="sourceFilter" onchange="applyFilters()">
        <option value="ALL">All Sources</option>
        <option value="chill_dude">☕ Chill Dude Explains (Civilizations)</option>
        <option value="core">🏛️ Core Setting / Standard</option>
      </select>
    </div>
  </div>

  <div class="tickets-grid" id="ticketsContainer"></div>

  <!-- MODAL DETAIL -->
  <div class="modal-overlay" id="modalOverlay" onclick="closeModal(event)">
    <div class="modal-box" id="modalBox" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeModal()">&times;</button>
      <div id="modalContent"></div>
    </div>
  </div>

  <script>
    const MASTER_TICKETS = ${rebaseFileUrls(JSON.stringify(tickets, null, 2), '../')};

    function renderTickets(list) {
      const container = document.getElementById('ticketsContainer');
      container.innerHTML = '';
      if (list.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 48px;">No tickets match the selected filters.</div>';
        return;
      }
      list.forEach(t => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.onclick = () => openModal(t);

        const provPills = (t.provides || []).slice(0, 2).map(p => '<span class="tag-pill prov">+' + p.split(': ')[1] || p + '</span>').join('');
        const reqPills = (t.requires || []).slice(0, 2).map(r => '<span class="tag-pill req">-' + r.split(': ')[1] || r + '</span>').join('');

        card.innerHTML = \`
          <div class="ticket-top">
            <div class="ticket-id-wrap">
              <span class="ticket-id">\${t.id}</span>
              <span class="badge-track \${t.track_code}">\${t.track_code}</span>
              <span class="badge-tier">\${t.tier_label}</span>
              \${(t.tags && t.tags.includes('chill_dude')) ? '<span class="badge-track" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4);">☕ Chill Dude</span>' : ''}
            </div>
            <span class="badge \${t.status}">\${t.status.replace(/_/g, ' ')}</span>
          </div>
          <div class="ticket-title">\${t.title}</div>
          <div class="ticket-summary">\${t.summary || 'No summary provided.'}</div>
          <div class="tag-pills">
            \${provPills}
            \${reqPills}
          </div>
        \`;
        container.appendChild(card);
      });
    }

    function applyFilters() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const track = document.getElementById('trackFilter').value;
      const status = document.getElementById('statusFilter').value;
      const tier = document.getElementById('tierFilter').value;
      const source = document.getElementById('sourceFilter') ? document.getElementById('sourceFilter').value : 'ALL';

      const filtered = MASTER_TICKETS.filter(t => {
        // Track
        if (track !== 'ALL' && t.track_code !== track) return false;
        // Status
        if (status === 'shipped' && t.status !== 'shipped') return false;
        if (status === 'in_progress' && (t.status !== 'in_drafting' && t.status !== 'in_editorial')) return false;
        if (status === 'ready' && (t.status !== 'ready_for_authoring' && t.status !== 'ready_for_spec')) return false;
        if (status === 'discovery' && t.status !== 'discovery') return false;
        // Tier
        if (tier !== 'ALL' && String(t.pipeline_tier) !== tier) return false;
        // Source
        if (source === 'chill_dude') {
          const isChillDude = (t.tags && t.tags.includes('chill_dude')) || (t.creator_source && t.creator_source.toLowerCase().includes('chill dude'));
          if (!isChillDude) return false;
        } else if (source === 'core') {
          const isChillDude = (t.tags && t.tags.includes('chill_dude')) || (t.creator_source && t.creator_source.toLowerCase().includes('chill dude'));
          if (isChillDude) return false;
        }
        // Search text
        if (q) {
          const hay = [
            t.id, t.title, t.summary, t.wave, t.culture_quadrant, t.creator_source || '',
            ...(t.tags || []),
            ...(t.provides || []), ...(t.requires || [])
          ].join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      renderTickets(filtered);
    }

    function filterToFrontier() {
      document.getElementById('searchInput').value = '';
      document.getElementById('trackFilter').value = 'ALL';
      document.getElementById('statusFilter').value = 'ready';
      document.getElementById('tierFilter').value = 'ALL';
      applyFilters();
    }

    function openModal(t) {
      const box = document.getElementById('modalContent');
      const dialsHtml = (t.dials || []).map(d => '<li>' + d + '</li>').join('');
      const clocksHtml = (t.threat_clocks || []).map(c => '<li>' + c + '</li>').join('');
      
      let cornersHtml = '';
      if (t.four_corners) {
        cornersHtml = \`
          <div class="modal-section">
            <h4>4-Corner Opposition Web</h4>
            <ul class="modal-dials">
              <li><strong>Establishment:</strong> \${t.four_corners.establishment || 'N/A'}</li>
              <li><strong>Opponent:</strong> \${t.four_corners.opponent || 'N/A'}</li>
              <li><strong>Shadow:</strong> \${t.four_corners.shadow || 'N/A'}</li>
              <li><strong>Outcast:</strong> \${t.four_corners.outcast || 'N/A'}</li>
            </ul>
          </div>
        \`;
      }

      box.innerHTML = \`
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
          <span class="ticket-id" style="font-size: 15px;">\${t.id}</span>
          <span class="badge-track \${t.track_code}">\${t.track}</span>
          <span class="badge \${t.status}">\${t.status.replace(/_/g, ' ')}</span>
          <span class="badge-tier">\${t.tier_label}</span>
        </div>
        <h2 style="font-size: 22px; color: #fff; margin-bottom: 8px;">\${t.title}</h2>
        <div style="font-size: 13px; color: var(--accent); margin-bottom: 14px;"><strong>Wave:</strong> \${t.wave} | <strong>Culture:</strong> \${t.culture_quadrant || 'Universal'}</div>
        <p style="font-size: 14px; color: var(--text-muted); line-height: 1.6;">\${t.summary}</p>

        \${t.syllogism ? \`
        <div class="modal-section">
          <h4>Dramatic Syllogism (writing-discovery)</h4>
          <p style="font-size: 13px; font-style: italic; color: #e2e8f0; background: #0b0f19; padding: 10px 14px; border-radius: 6px; border-left: 3px solid var(--accent);">\${t.syllogism}</p>
        </div>\` : ''}

        \${cornersHtml}

        \${dialsHtml ? \`
        <div class="modal-section">
          <h4>Dynamic Hazard Dials</h4>
          <ul class="modal-dials">\${dialsHtml}</ul>
        </div>\` : ''}

        \${clocksHtml ? \`
        <div class="modal-section">
          <h4>Threat Clocks</h4>
          <ul class="modal-clocks">\${clocksHtml}</ul>
        </div>\` : ''}

        <div class="modal-section">
          <h4>Resource Contract</h4>
          <div style="display: flex; gap: 16px; font-size: 13px; flex-wrap: wrap;">
            <div><strong style="color: #34d399;">Provides:</strong> \${(t.provides || []).join(', ') || 'None'}</div>
            <div><strong style="color: #fb7185;">Requires:</strong> \${(t.requires || []).join(', ') || 'None'}</div>
          </div>
        </div>

        \${t.file_url ? \`
        <div style="margin-top: 20px;">
          <a class="modal-link-btn" href="\${t.file_url}" target="_blank">Open Local Ticket Markdown ↗</a>
        </div>\` : ''}
      \`;

      document.getElementById('modalOverlay').style.display = 'flex';
    }

    function closeModal() {
      document.getElementById('modalOverlay').style.display = 'none';
    }

    // Initialize
    renderTickets(MASTER_TICKETS);
  </script>
</body>
</html>`;
}

const trackerHtmlContent = generateUnifiedTrackerHtml(masterTickets);
fs.writeFileSync(UNIFIED_TRACKER_HTML, trackerHtmlContent, 'utf8');
console.log(`[OK] Generated Standalone Zero-CORS Dashboard at tickets/unified_ticket_tracker.html`);

console.log('\n========================================================');
console.log('       UNIFIED TICKET TRACKER COMPILATION COMPLETE       ');
console.log('========================================================\n');
