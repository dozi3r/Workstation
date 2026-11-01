const fs = require('fs');
const path = require('path');

// Tech Debt Wave 0: ROOT_DIR was hardcoded to a different checkout ('.../Antigravity/Creator').
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// Portable file URLs: root-relative in tier_0_manifest.json; rebased '../../' for the HTML in tickets/tier_0/.
function toRootRelUrl(absPath) {
  return path.relative(ROOT_DIR, absPath).replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/');
}
function rebaseFileUrls(jsonStr, prefix) {
  return jsonStr.replace(/("file_url"\s*:\s*")(?![a-zA-Z][a-zA-Z0-9+.-]*:|\/|\.\.\/)(?=[^"])/g, `$1${prefix}`);
}
const tier0Dir = path.join(ROOT_DIR, 'tickets', 'tier_0');
const notesDir = path.join(tier0Dir, 'notes');
const ticketsDir = path.join(tier0Dir, 'tickets');

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: content };
  const lines = match[1].split(/\r?\n/);
  const data = {};
  lines.forEach(l => {
    const colon = l.indexOf(':');
    if (colon > -1) {
      const k = l.substring(0, colon).trim();
      let v = l.substring(colon + 1).trim();
      if (v.startsWith('[') && v.endsWith(']')) {
        try { v = JSON.parse(v); } catch(e) { v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')); }
      } else if (v.startsWith('"') && v.endsWith('"')) {
        v = v.slice(1, -1);
      }
      data[k] = v;
    }
  });
  return { data, body: content.replace(match[0], '').trim() };
}

// 1. Gather Notes
const notes = [];
if (fs.existsSync(notesDir)) {
  fs.readdirSync(notesDir).filter(f => f.endsWith('.md')).forEach(file => {
    const filePath = path.join(notesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, body } = parseFrontmatter(content);
    notes.push({
      file,
      path: `tickets/tier_0/notes/${file}`,
      title: data.title || file.replace('.md', ''),
      domain: data.domain || 'General',
      type: data.type || 'Note',
      status: data.status || 'in_research',
      preview: body.slice(0, 200).replace(/#/g, '').trim(),
      raw_markdown: content,
      file_url: toRootRelUrl(path.resolve(ROOT_DIR, 'tickets/tier_0/notes/' + file))
    });
  });
}

// 2. Gather Tickets
const tickets = [];
if (fs.existsSync(ticketsDir)) {
  fs.readdirSync(ticketsDir).filter(f => f.endsWith('.md')).forEach(file => {
    const filePath = path.join(ticketsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, body } = parseFrontmatter(content);
    tickets.push({
      file,
      path: `tickets/tier_0/tickets/${file}`,
      id: data.id || file.split('_')[0],
      domain: data.domain || 'Unassigned',
      title: data.title || file.replace('.md', ''),
      scale: data.scale || 'All',
      status: data.status || 'idea',
      provides: data.provides || [],
      requires: data.requires || [],
      preview: body.slice(0, 200).replace(/#/g, '').trim(),
      raw_markdown: content,
      file_url: toRootRelUrl(path.resolve(ROOT_DIR, 'tickets/tier_0/tickets/' + file))
    });
  });
}

const domains = [
  { id: "DOM-01", name: "Food & Caloric Subsistence", icon: "🌾", desc: "Dryland crop rotation, root cellars, foraging perimeters, livestock calories." },
  { id: "DOM-02", name: "Water & Hydrology", icon: "💧", desc: "Artesian wells, snowmelt flumes, communal cisterns, gravity head flow." },
  { id: "DOM-03", name: "Shelter & Civic Municipal", icon: "🪵", desc: "Vernacular timber framing, stone masonry, thatch weatherproofing, hearth soot." },
  { id: "DOM-04", name: "Peacekeeping & Perimeter Defense", icon: "🛡️", desc: "Ditch-and-palisade, communal militia bailiff, gate alarm horns." },
  { id: "DOM-05", name: "Trade, Barter & Mundane Craft", icon: "⚒️", desc: "Village smithy, copper barter squares, horse shoes, tool repair." },
  { id: "DOM-06", name: "Health, Folk Medicine & Midwifery", icon: "🌿", desc: "Herbal leachcraft, fever willow teas, bone setting, quarantine huts." },
  { id: "DOM-07", name: "Waste, Drainage & Sanitation", icon: "🐖", desc: "Midden trenches, scavenger swine, night-soil pits, cholera prevention." },
  { id: "DOM-08", name: "Folklore, Shrine & Communal Rites", icon: "🕯️", desc: "Wayside boundary shrines, hearth vigils, seasonal taboos, funeral cairns." }
];

const manifest = {
  project: "Tier 0: Baseline Settlement Substratum",
  version: "1.0.0",
  last_updated: new Date().toISOString(),
  domains,
  notes,
  tickets
};

// Save refreshed manifest.json
const manifestPath = path.join(tier0Dir, 'tier_0_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Creator Studio: Tier 0 Baseline Settlement Substratum Tracker</title>
  <style id="zero-cors-tailwind">
*, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: #e2e8f0; }
:root { --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(0,0,0,0)); }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
.bg-slate-950 { background-color: #020617; }
.text-slate-100 { color: #f1f5f9; }
.min-h-screen { min-height: 100vh; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; }
.border-slate-800 { border-color: #1e293b; }
.bg-slate-900\/95 { background-color: rgba(15, 23, 42, 0.95); }
.backdrop-blur { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.sticky { position: sticky; }
.top-0 { top: 0; }
.z-40 { z-index: 40; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.py-3\.5 { padding-top: 0.875rem; padding-bottom: 0.875rem; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-4 { gap: 1rem; }
.gap-3 { gap: 0.75rem; }
.w-10 { width: 2.5rem; }
.h-10 { height: 2.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.bg-gradient-to-tr { background-image: linear-gradient(to top right, var(--tw-gradient-stops)); }
.from-emerald-600 { --tw-gradient-from: #059669; --tw-gradient-to: rgba(0,0,0,0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.via-teal-600 { --tw-gradient-to: rgba(0,0,0,0); --tw-gradient-stops: var(--tw-gradient-from), #0d9488, var(--tw-gradient-to); }
.to-sky-600 { --tw-gradient-to: #0284c7; }
.justify-center { justify-content: center; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.shadow-emerald-950 { --tw-shadow-color: rgba(2, 44, 34, undefined); box-shadow: 0 10px 15px -3px var(--tw-shadow-color); }
.font-black { font-weight: 900; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-white { color: #ffffff; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.font-bold { font-weight: 700; }
.tracking-wide { letter-spacing: 0.025em; }
.gap-2 { gap: 0.5rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.py-0\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.rounded { border-radius: 0.25rem; }
.text-\[10px\] { font-size: 10px; }
.bg-emerald-950 { background-color: #022c22; }
.text-emerald-400 { color: #34d399; }
.border { border-width: 1px; border-style: solid; }
.border-emerald-800 { border-color: #065f46; }
.text-\[11px\] { font-size: 11px; }
.text-slate-400 { color: #94a3b8; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.py-1\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
.bg-slate-800 { background-color: #1e293b; }
.border-slate-700 { border-color: #334155; }
.gap-1\.5 { gap: 0.375rem; }
.text-slate-500 { color: #64748b; }
.hover\:bg-slate-700:hover { background-color: #334155; }
.text-slate-300 { color: #cbd5e1; }
.font-semibold { font-weight: 600; }
.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.flex-1 { flex: 1 1 0%; }
.p-6 { padding: 1.5rem; }
.max-w-7xl { max-width: 80rem; }
.w-full { width: 100%; }
.mx-auto { margin-left: auto; margin-right: auto; }
.space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
.p-5 { padding: 1.25rem; }
.rounded-2xl { border-radius: 1rem; }
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.from-slate-900 { --tw-gradient-from: #0f172a; --tw-gradient-to: rgba(0,0,0,0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.via-slate-900\/90 { --tw-gradient-to: rgba(0,0,0,0); --tw-gradient-stops: var(--tw-gradient-from), rgba(15, 23, 42, 0.9), var(--tw-gradient-to); }
.to-emerald-950\/40 { --tw-gradient-to: rgba(2, 44, 34, 0.4); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
.items-start { align-items: flex-start; }
.max-w-3xl { max-width: 48rem; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
.inline-flex { display: inline-flex; }
.px-2\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }
.rounded-full { border-radius: 9999px; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }
.p-3 { padding: 0.75rem; }
.bg-slate-950\/80 { background-color: rgba(2, 6, 23, 0.8); }
.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
.uppercase { text-transform: uppercase; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pt-1 { padding-top: 0.25rem; }
.mb-3 { margin-bottom: 0.75rem; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.bg-slate-900 { background-color: #0f172a; }
.border-slate-800\/80 { border-color: rgba(30, 41, 59, 0.8); }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.min-h-\[38px\] { min-height: 38px; }
.italic { font-style: italic; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media (min-width: 1024px) { .lg\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); } }
.gap-6 { gap: 1.5rem; }
@media (min-width: 1024px) { .lg\:col-span-5 { grid-column: span 5 / span 5; } }
.space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
.space-y-2\.5 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.625rem; }
@media (min-width: 1024px) { .lg\:col-span-7 { grid-column: span 7 / span 7; } }
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.z-50 { z-index: 50; }
.bg-black\/80 { background-color: rgba(0, 0, 0, 0.8); }
.backdrop-blur-sm { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.hidden { display: none; }
.p-4 { padding: 1rem; }
.max-h-\[90vh\] { max-height: 90vh; }
.rounded-3xl { border-radius: 1.5rem; }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
.overflow-hidden { overflow: hidden; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.bg-slate-900\/90 { background-color: rgba(15, 23, 42, 0.9); }
.min-w-0 { min-width: 0px; }
.rounded-lg { border-radius: 0.5rem; }
.w-8 { width: 2rem; }
.h-8 { height: 2rem; }
.hover\:text-white:hover { color: #ffffff; }
.overflow-y-auto { overflow-y: auto; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
.font-normal { font-weight: 400; }
.mt-4 { margin-top: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.pb-1 { padding-bottom: 0.25rem; }
.mt-5 { margin-top: 1.25rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.pb-2 { padding-bottom: 0.5rem; }
.border-slate-600 { border-color: #475569; }
.px-1\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
.text-emerald-300 { color: #6ee7b7; }
.ml-4 { margin-left: 1rem; }
.list-disc { list-style-type: disc; }
.mb-1\.5 { margin-bottom: 0.375rem; }
.mb-1 { margin-bottom: 0.25rem; }
.leading-snug { line-height: 1.375; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pt-2 { padding-top: 0.5rem; }
.border-t { border-top-width: 1px; border-top-style: solid; }
.ml-1 { margin-left: 0.25rem; }
.text-center { text-align: center; }
.p-3\.5 { padding: 0.875rem; }
.hover\:border-emerald-500\/80:hover { border-color: rgba(16, 185, 129, 0.8); }
.shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.cursor-pointer { cursor: pointer; }
.hover\:text-emerald-300:hover { color: #6ee7b7; }
.hover\:underline:hover { text-decoration-line: underline; }
.gap-1 { gap: 0.25rem; }
.p-2\.5 { padding: 0.625rem; }
.text-sky-400 { color: #38bdf8; }
.bg-emerald-600\/80 { background-color: rgba(5, 150, 105, 0.8); }
.hover\:bg-emerald-600:hover { background-color: #059669; }
</style>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0b1120; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col custom-scrollbar">

  <!-- TOP HEADER -->
  <header class="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-950 font-black text-xl text-white">
        T0
      </div>
      <div>
        <h1 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          Tier 0: Baseline Settlement Substratum Tracker
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">Future Project Backlog</span>
        </h1>
        <p class="text-[11px] text-slate-400">System-Agnostic Fantasy World Baseline Framework • Mundane Survival Scaffolding & Dual-Mode Mechanics</p>
      </div>
    </div>

    <!-- STATS & RESET -->
    <div class="flex items-center gap-2 text-xs">
      <div class="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1.5">
        <span class="text-slate-400">Total Items:</span>
        <strong id="header-total-badge" class="text-emerald-400 font-bold">\${manifest.notes.length + manifest.tickets.length}</strong>
        <span class="text-slate-500">(\${manifest.notes.length} Notes, \${manifest.tickets.length} Tickets)</span>
      </div>
      <button onclick="resetFilters()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition">
        🔄 Reset Filter
      </button>
    </div>
  </header>

  <!-- MAIN WRAPPER -->
  <main class="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">

    <!-- DUAL-MODE CONCEPT BANNER -->
    <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 shadow-xl">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="max-w-3xl space-y-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-800">
            <span>✨</span> Dual-Mode Architecture Contract
          </div>
          <h2 class="text-base font-bold text-white leading-tight">Mundane Fantasy Baseline: Smooth Generic vs. Granular Modularity</h2>
          <p class="text-xs text-slate-300 leading-relaxed">
            Tier 0 solves the GM burden of worldbuilding mundane survival (calories, water, smithies, watchtowers). 
            When <strong>"Standard Substratum"</strong> is enabled, settlements function implicitly with zero GM bookkeeping. 
            When set to <strong>"Granular Modularity"</strong>, GMs can inspect, slot, and stress individual survival systems, transforming baseline logistics into emergent tabletop quests.
          </p>
        </div>
        <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 w-full sm:w-64">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tracker Storage</div>
          <div class="text-slate-300 font-mono text-[11px] truncate">📁 tickets/tier_0/notes/</div>
          <div class="text-slate-300 font-mono text-[11px] truncate">📁 tickets/tier_0/tickets/</div>
          <div class="text-[10px] text-emerald-400 pt-1">Batch compile anytime via Build-Tier0Tracker.ps1</div>
        </div>
      </div>
    </div>

    <!-- DOMAIN FILTER CARDS (8 MUNDANE DOMAINS) -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-bold text-white flex items-center gap-1.5">
          <span>🏛️</span> The 8 Mundane Survival Domains
        </h3>
        <span class="text-[11px] text-slate-400">Click any domain to filter notes and tickets</span>
      </div>
      <div id="domain-cards-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <!-- Rendered via JS -->
      </div>
    </div>

    <!-- ACTIVE FILTER BAR -->
    <div id="active-filter-bar" class="bg-slate-900 border border-slate-800/80 px-4 py-2 rounded-xl flex items-center justify-between text-xs min-h-[38px]">
      <div class="flex items-center gap-2">
        <span class="text-slate-400 font-semibold">🔍 Active Filter:</span>
        <span id="active-filter-label" class="text-emerald-400 font-bold italic">Showing All Domains</span>
      </div>
      <div class="flex items-center gap-2">
        <span id="items-count-badge" class="text-slate-400 text-[11px]"></span>
      </div>
    </div>

    <!-- SPLIT WORKBENCH: NOTES (LEFT) VS TICKETS (RIGHT) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- LEFT: RESEARCH NOTES & BRAIN DUMPS (5 cols) -->
      <div class="lg:col-span-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-white flex items-center gap-1.5">
            <span>📝</span> Notes & Brain Dumps (<span id="notes-counter">0</span>)
          </h3>
          <span class="text-[10px] text-slate-400">Raw research & design rules</span>
        </div>
        <div id="notes-list" class="space-y-2.5">
          <!-- Rendered via JS -->
        </div>
      </div>

      <!-- RIGHT: ATOMIC DOMAIN TICKETS (7 cols) -->
      <div class="lg:col-span-7 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-white flex items-center gap-1.5">
            <span>🎫</span> Domain Tickets & Specifications (<span id="tickets-counter">0</span>)
          </h3>
          <span class="text-[10px] text-slate-400">Modular settlement templates</span>
        </div>
        <div id="tickets-list" class="space-y-3">
          <!-- Rendered via JS -->
        </div>
      </div>

    </div>

  </main>

  <!-- DOCUMENT READER MODAL -->
  <div id="reader-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <span id="modal-badge" class="px-2 py-0.5 rounded text-xs font-black bg-emerald-950 text-emerald-400 border border-emerald-800"></span>
          <h3 id="modal-title" class="text-sm font-bold text-white truncate"></h3>
        </div>
        <div class="flex items-center gap-2">
          <a id="modal-newtab-btn" href="#" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700">
            ↗️ Open in Tab
          </a>
          <button onclick="closeModal()" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition">
            ✕
          </button>
        </div>
      </div>
      <!-- Modal Content Body -->
      <div id="modal-content" class="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed custom-scrollbar font-normal">
      </div>
    </div>
  </div>

  <script>
    const DATA = ${rebaseFileUrls(JSON.stringify(manifest), '../../')};
    let activeDomainId = null;

    // Markdown Formatter (100% offline, zero-CORS)
    function renderMarkdown(md) {
      if (!md) return "";
      let html = md;
      // Strip frontmatter
      html = html.replace(/^---[\\r\\n]+[\\s\\S]*?[\\r\\n]+---/, '').trim();
      // Headers
      html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-emerald-400 mt-4 mb-2 pb-1 border-b border-slate-800">$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-white mt-5 mb-2 pb-1 border-b border-slate-700">$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-white mb-3 pb-2 border-b border-slate-600">$1</h1>');
      // Bold & Italic
      html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-white font-bold">$1</strong>');
      html = html.replace(/\\*(.*?)\\*/g, '<em class="text-slate-300 italic">$1</em>');
      // Inline code
      html = html.replace(/\\x60([^\\x60]+)\\x60/g, '<code class="px-1.5 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800 font-mono text-[11px]">$1</code>');
      // Lists
      html = html.replace(/^\\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');
      html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');
      // Paragraphs
      return html.split(/[\\r\\n]{2,}/).map(para => {
        if (para.startsWith('<h') || para.startsWith('<li') || para.startsWith('<div')) return para;
        return '<p class="text-slate-300 leading-relaxed mb-3">' + para + '</p>';
      }).join('');
    }

    function toggleDomainFilter(domainId) {
      activeDomainId = (activeDomainId === domainId) ? null : domainId;
      updateUI();
    }

    function resetFilters() {
      activeDomainId = null;
      updateUI();
    }

    function updateUI() {
      // 1. Render Domain Cards
      const domainGrid = document.getElementById('domain-cards-grid');
      domainGrid.innerHTML = DATA.domains.map(d => {
        const notesCount = DATA.notes.filter(n => (n.domain||'').includes(d.id)).length;
        const ticketsCount = DATA.tickets.filter(t => (t.domain||'').includes(d.id)).length;
        const total = notesCount + ticketsCount;
        const isSelected = activeDomainId === d.id;
        const isDimmed = activeDomainId !== null && !isSelected;
        const isZero = total === 0;

        let cardClass = "p-3.5 rounded-2xl bg-slate-900 border transition cursor-pointer flex flex-col justify-between shadow-md ";
        if (isSelected) {
          cardClass += "border-emerald-500 ring-2 ring-emerald-400 bg-slate-850 ";
        } else if (isDimmed || isZero) {
          cardClass += "border-slate-900 bg-slate-950/40 opacity-30 grayscale ";
        } else {
          cardClass += "border-slate-800 hover:border-slate-700 hover:bg-slate-850 ";
        }

        return \`
          <div onclick="toggleDomainFilter('\${d.id}')" class="\${cardClass}">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-lg">\${d.icon}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">\${d.id}</span>
              </div>
              <h4 class="text-xs font-bold text-white mb-1 leading-snug">\${d.name}</h4>
              <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-2">\${d.desc}</p>
            </div>
            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span class="text-slate-400">\${notesCount} Notes • \${ticketsCount} Tickets</span>
              <strong class="text-emerald-400 font-bold">\${total} Total</strong>
            </div>
          </div>
        \`;
      }).join('');

      // 2. Filter notes & tickets
      const filteredNotes = DATA.notes.filter(n => !activeDomainId || (n.domain||'').includes(activeDomainId));
      const filteredTickets = DATA.tickets.filter(t => !activeDomainId || (t.domain||'').includes(activeDomainId));

      // 3. Update Labels & Counters
      document.getElementById('notes-counter').textContent = filteredNotes.length;
      document.getElementById('tickets-counter').textContent = filteredTickets.length;
      document.getElementById('items-count-badge').textContent = \`Showing \${filteredNotes.length + filteredTickets.length} of \${DATA.notes.length + DATA.tickets.length} total items\`;

      const filterLabel = document.getElementById('active-filter-label');
      if (activeDomainId) {
        const dom = DATA.domains.find(x => x.id === activeDomainId);
        filterLabel.innerHTML = \`<span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">\${dom.icon} \${dom.id}: \${dom.name}</span> <button onclick="resetFilters()" class="text-slate-400 hover:text-white ml-1">&times; Clear</button>\`;
      } else {
        filterLabel.textContent = "Showing All Domains";
      }

      // 4. Render Notes List
      const notesList = document.getElementById('notes-list');
      if (filteredNotes.length === 0) {
        notesList.innerHTML = '<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">No research notes for this domain.</div>';
      } else {
        notesList.innerHTML = filteredNotes.map(n => \`
          <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/80 transition flex flex-col justify-between gap-2 shadow">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400">\${n.domain}</span>
                <span class="text-[10px] text-slate-500 font-mono">\${n.file}</span>
              </div>
              <h4 class="text-xs font-bold text-white mb-1 cursor-pointer hover:text-emerald-300" onclick="openModal('note', '\${n.file}')">\${n.title}</h4>
              <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-1">\${n.preview}</p>
            </div>
            <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <button onclick="openModal('note', '\${n.file}')" class="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                📖 Read Note
              </button>
              <a href="\${n.file_url}" target="_blank" class="text-slate-400 hover:text-white" title="Open in tab">↗️</a>
            </div>
          </div>
        \`).join('');
      }

      // 5. Render Tickets List
      const ticketsList = document.getElementById('tickets-list');
      if (filteredTickets.length === 0) {
        ticketsList.innerHTML = '<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">No domain tickets for this domain yet.</div>';
      } else {
        ticketsList.innerHTML = filteredTickets.map(t => \`
          <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/80 transition flex flex-col justify-between gap-3 shadow">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">\${t.id}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">\${t.scale}</span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">\${t.domain}</span>
              </div>
              <h4 class="text-xs font-bold text-white mb-1 cursor-pointer hover:text-emerald-300" onclick="openModal('ticket', '\${t.id}')">\${t.title}</h4>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-2">\${t.preview}</p>

              <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap justify-between gap-2 text-[10px]">
                <div><span class="text-slate-500 font-semibold">Provides:</span> <code class="text-emerald-400">\${(t.provides||[]).join(', ')}</code></div>
                <div><span class="text-slate-500 font-semibold">Requires:</span> <code class="text-sky-400">\${(t.requires||[]).join(', ')}</code></div>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <button onclick="openModal('ticket', '\${t.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold transition">
                📖 View Full Specification
              </button>
              <a href="\${t.file_url}" target="_blank" class="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition" title="Open in new tab">
                ↗️ Tab
              </a>
            </div>
          </div>
        \`).join('');
      }
    }

    function openModal(type, id) {
      let item = null;
      if (type === 'note') {
        item = DATA.notes.find(x => x.file === id);
      } else {
        item = DATA.tickets.find(x => x.id === id);
      }
      if (!item) return;

      document.getElementById('modal-badge').textContent = type.toUpperCase() + ' • ' + (item.id || item.domain);
      document.getElementById('modal-title').textContent = item.title;
      document.getElementById('modal-newtab-btn').href = item.file_url;
      document.getElementById('modal-content').innerHTML = renderMarkdown(item.raw_markdown);
      document.getElementById('reader-modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('reader-modal').classList.add('hidden');
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Initial render
    updateUI();
  </script>
</body>
</html>
`;

// Save workspace copy
const outPath = path.join(tier0Dir, 'tier_0_project_visualizer.html');
fs.writeFileSync(outPath, htmlContent, 'utf8');
console.log('[OK] Saved Tier 0 Project Visualizer to:', outPath);
console.log(`[COMPLETED] Tier 0 compilation finished! (${manifest.notes.length} notes, ${manifest.tickets.length} tickets across 8 domains).`);
