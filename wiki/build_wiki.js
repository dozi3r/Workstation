/**
 * ============================================================================
 * CREATOR STUDIO: TECHNICAL MANUAL & BIDIRECTIONAL CODEBASE WIKI COMPILER
 * File: wiki/build_wiki.js
 * Authority: ADR-0003, AGENTS.md, SYS-AUDIT-01
 * ============================================================================
 * Responsibilities:
 * 1. Scans the entire repository (excluding .zip, .pdf, regions/images/, wiki/pages/).
 * 2. Classifies every file into the 8-Volume Technical Manual Table of Contents.
 * 3. Extracts AST symbols (JS/PS1/PY), YAML frontmatter & resource contracts (MD),
 *    JSON schemas, HTML includes, and audit/duplicate metadata (SYS-AUDIT-01).
 * 4. Scaffolds / updates Markdown source files in wiki/src/files/<relPath>.md while
 *    preserving custom agent/human architectural notes between
 *    <!-- BEGIN_CUSTOM_NOTES --> and <!-- END_CUSTOM_NOTES -->.
 * 5. Compiles the 7 Cross-Cutting System Series (wiki/src/series/*.md).
 * 6. Computes the complete Bidirectional Inverted Backlink Graph across all
 *    files, series, modules, tickets, shared JS globals, and resource supply chains.
 * 7. Renders zero-CORS responsive Wikipedia-style HTML (Desktop + Mobile, Light/Dark
 *    toggle, instant offline search bar) to wiki/index.html and wiki/pages/**.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WIKI_DIR = __dirname;
const ROOT_DIR = path.resolve(WIKI_DIR, '..');
const SRC_FILES_DIR = path.join(WIKI_DIR, 'src', 'files');
const SRC_SERIES_DIR = path.join(WIKI_DIR, 'src', 'series');
const PAGES_DIR = path.join(WIKI_DIR, 'pages');
const SERIES_PAGES_DIR = path.join(PAGES_DIR, 'series');
const MANIFEST_OUT = path.join(WIKI_DIR, 'wiki_manifest.json');
const GRAPH_OUT = path.join(WIKI_DIR, 'wiki_graph.json');
const SEARCH_INDEX_OUT = path.join(WIKI_DIR, 'search_index.js');
const INDEX_HTML_OUT = path.join(WIKI_DIR, 'index.html');

console.log('========================================================');
console.log('   CREATOR STUDIO - TECHNICAL MANUAL & WIKI COMPILER    ');
console.log('========================================================\n');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

ensureDir(SRC_FILES_DIR);
ensureDir(SRC_SERIES_DIR);
ensureDir(PAGES_DIR);
ensureDir(SERIES_PAGES_DIR);

// ----------------------------------------------------------------------------
// 1. VOLUME DEFINITIONS & CROSS-CUTTING SERIES REGISTRY
// ----------------------------------------------------------------------------
const VOLUMES = [
  {
    id: 'vol-1',
    num: 'Volume I',
    title: 'System Architecture, Governance & Ontology',
    subtitle: 'Ubiquitous domain language, agent operating routers, ADRs, and master system audit dossiers.',
    icon: '🏛️'
  },
  {
    id: 'vol-2',
    num: 'Volume II',
    title: 'System Reference Documents (The Dual SRD & Substratum)',
    subtitle: 'Formal mathematical specifications for the Authoring Engine, Tabletop Adventure Framework, Tier 0 Substratum, and IP Conversion.',
    icon: '📜'
  },
  {
    id: 'vol-3',
    num: 'Volume III',
    title: 'Build Pipeline & Workstation Tooling',
    subtitle: 'Zero-CORS asset compilation, navigation manifest routing, and wiki indexing.',
    icon: '⚙️'
  },
  {
    id: 'vol-4',
    num: 'Volume IV',
    title: 'Workstation Architecture & Mod Engine (src/workstation/ & mods/)',
    subtitle: 'Unified Win95/VB6 desktop workstation shell, Pointcrawl CAD canvas, scale-fluid cartography, entity architecture, and modular extensions.',
    icon: '🎛️'
  },
  {
    id: 'vol-5',
    num: 'Volume V',
    title: 'Network Surfaces, Topologies & CLI Simulation (network/)',
    subtitle: 'Compiled HTML workstations, headless PowerShell Monte Carlo balancing simulator, canonical graph topologies, and balance outputs.',
    icon: '🕸️'
  },
  {
    id: 'vol-6',
    num: 'Volume VI',
    title: 'Sociology & Organizational Hermeneutics (sociology/)',
    subtitle: 'Competing Values Framework (CVF), 64-cell [S, E, C] disposition matrix, and sociodynamics.',
    icon: '🏛️'
  },
  {
    id: 'vol-7',
    num: 'Volume VII',
    title: 'Regional Scenery & Visual Asset Engine (regions/)',
    subtitle: 'Offline visual asset recommendation browser, CLI scenery search, and 344-image metadata catalog.',
    icon: '🖼️'
  },
  {
    id: 'vol-8',
    num: 'Volume VIII',
    title: 'Campaign Packages, Modules & Templates',
    subtitle: 'Multi-campaign sourcebooks (Generic Starter, Opal Island, Sun Wukong), plug-and-play modules, and templates.',
    icon: '📦'
  }
];

const SERIES_LIST = [
  {
    id: 'series_a_balancing_and_smothering_math',
    code: 'Series A',
    title: 'Pointcrawl Topological Mathematics & Network Centrality',
    summary: 'Scale-fluid pointcrawl graph topology, directional influence pressure, supply-chain BFS reachability, and contradiction tension math.',
    volume: 'vol-2',
    relatedFiles: [
      'docs/srd/authoring_engine_srd.md',
      'network/presets/blank_canvas.json',
      'src/workstation/scripts/stage_5_slotting.js'
    ]
  },
  {
    id: 'series_b_scale_fluid_nested_cartography',
    code: 'Series B',
    title: 'Scale-Fluid Hierarchical Cartography, Global State Swap & IndexedDB',
    summary: 'How top-down, bottom-up, and lateral campaigns operate across 7 descriptive scale tiers using the Global State Swap Adapter and CreatorStudioMapDB v2.',
    volume: 'vol-4',
    relatedFiles: [
      'docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md',
      'src/workstation/scripts/state_adapter.js',
      'src/workstation/scripts/map_store.js',
      'src/workstation/scripts/map_navigator.js',
      'src/workstation/scripts/canvas_hud.js',
      'src/workstation/scripts/cad_canvas_renderer.js',
      'src/workstation/scripts/cad_interaction.js'
    ]
  },
  {
    id: 'series_c_sociology_and_tarot_hermeneutics',
    code: 'Series C',
    title: 'The 64-Cell [S, E, C] Disposition Algebra & CVF Cultural Quadrants',
    summary: 'Complete mapping between organizational sociology (Structure, Energy, Cohesion), the 4 Cultural Quadrants, and Operational Profiles.',
    volume: 'vol-6',
    relatedFiles: [
      'sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md',
      'sociology/07_Granular_64_Disposition_Matrix.md'
    ]
  },
  {
    id: 'series_d_module_supply_chains_and_contracts',
    code: 'Series D',
    title: 'The 5-Tier Module Pipeline, Resource Contracts (provides/requires) & Fallbacks',
    summary: 'How Tier 0–5 worldbuilding modules declare machine-readable resource inputs/outputs, form industrial supply chains, and trigger Standalone Fallback Mode when severed.',
    volume: 'vol-8',
    relatedFiles: [
      'docs/adr/0002-dual-srd-and-tiered-module-architecture.md',
      'docs/srd/tier_0_substratum_srd.md',
      'src/workstation/scripts/stage_5_slotting.js',
      'src/workstation/scripts/module_explorer.js',
      'src/workstation/scripts/entity_core.js',
      'src/workstation/scripts/entity_manager_ui.js',
      'src/workstation/scripts/entity_crud_dialogs.js',
      'src/workstation/scripts/entity_cascade_delete.js',
      'docs/MODULES_CATALOG.md',
      'campaigns/Emerald Isle/modules_manifest.json'
    ]
  },
  {
    id: 'series_e_zero_cors_compiler_and_agent_router',
    code: 'Series E',
    title: 'Zero-CORS Offline Bundling, Compass Headers & Self-Updating Wiki Architecture',
    summary: 'How build_suite.js and wiki/build_wiki.js enforce zero-CORS file:/// execution, inline fenced datasets, stamp Compass Headers, and maintain bidirectional backlinks.',
    volume: 'vol-3',
    relatedFiles: [
      'Build-Suite.ps1',
      'build_suite.js',
      'wiki/build_wiki.js',
      'docs/navigation_manifest.json',
      'AGENTS.md',
      'docs/AI_DEVELOPER_GUIDE.md',
      'src/workstation/template.html',
      'src/workstation/scripts/workstation_state.js',
      'src/workstation/scripts/property_grid_inspector.js',
      'src/workstation/scripts/wiki_engine.js'
    ]
  },
  {
    id: 'series_f_campaign_authoring_and_ip_conversion',
    code: 'Series F',
    title: 'Authoring Custom Campaign Presets, IP Conversions & Scenario Primitives',
    summary: 'End-to-end engineering guide for transforming any setting, historical era, or IP into a validated Creator Studio Campaign Package without setting bleed.',
    volume: 'vol-2',
    relatedFiles: [
      'docs/srd/campaign_preset_specification_srd.md',
      'docs/srd/ip_module_framework_srd.md',
      'docs/srd/scenario_primitives_srd.md',
      'campaigns/Test-CampaignPackage.ps1',
      'templates/IP_MODULE_TEMPLATE.md',
      'system/primitives/051_opal_island_module_deconstruction_and_scenario_primitives.md'
    ]
  },
  {
    id: 'series_g_duplicate_and_orphan_audit',
    code: 'Series G',
    title: 'Repository Hygiene Audit: Build-Time Mirrors, Legacy Scratch & Orphan Remediation',
    summary: 'Comprehensive catalog and cleanup roadmap (SYS-AUDIT-01) for build-time file mirrors, overlapping sociology drafts, stale balance reports, and unreferenced diagrams.',
    volume: 'vol-1',
    relatedFiles: [
      'tickets/system/SYS-AUDIT-01_duplicate_mirror_and_orphan_file_remediation.md',
      'tickets/creative/platform_audit_visualizer.html',
      'network/platform_audit_dashboard.html',
      'sociology/05_Node_and_Faction_Mapping.md',
      'sociology/05_Pointcrawl_Graph_and_Faction_Alignment.md'
    ]
  }
];

// ----------------------------------------------------------------------------
// 2. DUPLICATE / MIRROR / LEGACY AUDIT REGISTRY (SYS-AUDIT-01)
// ----------------------------------------------------------------------------
const AUDIT_FLAGS = {
  'tickets/creative/platform_audit_visualizer.html': {
    badge: '🔗 BUILD-TIME MIRROR (SYS-AUDIT-01)',
    canonical: 'network/platform_audit_dashboard.html',
    reason: 'Byte-for-byte mirror written by build_suite.js (lines 486–493). Edit network/platform_audit_dashboard.html instead.'
  },
  'sociology/05_Node_and_Faction_Mapping.md': {
    badge: '⚠️ LEGACY OVERLAP (SYS-AUDIT-01)',
    canonical: 'sociology/05_Pointcrawl_Graph_and_Faction_Alignment.md',
    reason: 'Earlier setting-specific iteration of SOC-05 that shares the 05_ numeric prefix with the decoupled 05_Pointcrawl_Graph_and_Faction_Alignment.md.'
  },
  'network/balance_matrix.csv': {
    badge: '⚠️ STALE SIMULATION OUTPUT (SYS-AUDIT-01)',
    canonical: 'network/network_balance_matrix.csv',
    reason: 'Historical CSV output superseded by network/network_balance_matrix.csv (generated by Run-NetworkEngine.ps1).'
  },
  'network/balance_report.md': {
    badge: '⚠️ STALE SIMULATION OUTPUT (SYS-AUDIT-01)',
    canonical: 'network/network_balance_report.md',
    reason: 'Historical report superseded by network/network_balance_report.md (generated by Run-NetworkEngine.ps1).'
  },
  'network/sample_balance_run.md': {
    badge: '⚠️ HISTORICAL SAMPLE (SYS-AUDIT-01)',
    canonical: 'network/network_balance_report.md',
    reason: 'Static sample simulation run retained for comparison against live Run-NetworkEngine.ps1 outputs.'
  },
  'sociology/1-s2.png': {
    badge: '⚠️ RAW DIAGRAM ASSET (SYS-AUDIT-01)',
    canonical: 'sociology/01_Core_Cultural_Quadrants.md',
    reason: 'Web-extracted organizational culture diagram with non-semantic filename; flagged in SYS-AUDIT-01 for semantic renaming.'
  },
  'sociology/1520159723101.png': {
    badge: '⚠️ RAW DIAGRAM ASSET (SYS-AUDIT-01)',
    canonical: 'sociology/01_Core_Cultural_Quadrants.md',
    reason: 'Web-extracted organizational culture reference graphic with numeric filename; flagged in SYS-AUDIT-01.'
  },
  'sociology/https3A2F2Fblogs-imag4es.png': {
    badge: '⚠️ RAW DIAGRAM ASSET (SYS-AUDIT-01)',
    canonical: 'sociology/02_Operational_Profiles_and_Power.md',
    reason: 'URL-encoded filename diagram in sociology/; flagged in SYS-AUDIT-01 for cleanup.'
  },
  'sociology/https3A2F2Fblogs-images.png': {
    badge: '⚠️ RAW DIAGRAM ASSET (SYS-AUDIT-01)',
    canonical: 'sociology/02_Operational_Profiles_and_Power.md',
    reason: 'URL-encoded filename diagram in sociology/; flagged in SYS-AUDIT-01 for cleanup.'
  }
};

// ----------------------------------------------------------------------------
// 3. DISCOVER ALL TARGET FILES IN WORKSPACE
// ----------------------------------------------------------------------------
function shouldTrackFile(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  // Exclude .zip, .pdf, regions/images/
  if (norm.endsWith('.zip') || norm.endsWith('.pdf')) return false;
  if (norm.startsWith('regions/images/')) return false;
  // Exclude all wiki internals, backlog tickets, scratch tooling, and duplicate mirrors
  if (norm.startsWith('wiki/')) return false;
  if (norm.startsWith('tickets/')) return false;
  if (norm.startsWith('.scratch/')) return false;
  if (norm.startsWith('.tmp') || norm.includes('/.tmp')) return false;
  if (norm.startsWith('Creator_Studio_Standalone/')) return false;
  return true;
}

function walkWorkspace(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name.startsWith('.tmp') || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT_DIR, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (
        rel === 'regions/images' ||
        rel === 'wiki' || rel.startsWith('wiki/') || rel.endsWith('/wiki') ||
        rel === 'tickets' || rel.startsWith('tickets/') ||
        rel === '.scratch' || rel.startsWith('.scratch/') ||
        rel.startsWith('.tmp') ||
        rel === 'Creator_Studio_Standalone' || rel.startsWith('Creator_Studio_Standalone/')
      ) {
        continue;
      }
      walkWorkspace(full, list);
    } else if (entry.isFile()) {
      if (shouldTrackFile(rel)) {
        list.push(rel);
      }
    }
  }
  return list;
}

function classifyVolume(relPath) {
  if (
    relPath === 'AGENTS.md' ||
    relPath === 'CONTEXT.md' ||
    relPath === 'README.md' ||
    relPath === 'QUICKSTART.md' ||
    relPath === 'index.html' ||
    relPath === 'start.html' ||
    relPath === 'admin.html' ||
    relPath === 'docs/AI_DEVELOPER_GUIDE.md' ||
    relPath.startsWith('docs/adr/') ||
    relPath.startsWith('docs/audit/')
  ) {
    return 'vol-1';
  }
  if (relPath.startsWith('docs/srd/') || relPath.startsWith('system/')) {
    return 'vol-2';
  }
  if (
    relPath === 'Build-Suite.ps1' ||
    relPath === 'Find-CodebaseNode.ps1' ||
    relPath === 'build_suite.js' ||
    relPath === 'Create-ProjectZip.ps1' ||
    relPath === 'docs/navigation_manifest.json'
  ) {
    return 'vol-3';
  }
  if (relPath.startsWith('src/workstation/') || relPath.startsWith('mods/')) {
    return 'vol-4';
  }
  if (relPath.startsWith('network/')) {
    return 'vol-5';
  }
  if (relPath.startsWith('sociology/')) {
    return 'vol-6';
  }
  if (relPath.startsWith('regions/')) {
    return 'vol-7';
  }
  return 'vol-8';
}

function classifyFileKind(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (relPath.startsWith('.scratch/creator-remediation/')) return 'Legacy Remediation Issue';
  if (relPath.startsWith('.scratch/')) return 'Legacy Scratch Python Script';
  if (relPath.startsWith('campaigns/') && relPath.includes('/modules/') && ext === '.md') return 'Campaign Worldbuilding Module';
  if (relPath.startsWith('tickets/creative/backlog/')) return 'Creative Backlog Ticket (CWT)';
  if (relPath.startsWith('tickets/tier_0/tickets/')) return 'Tier 0 Substratum Ticket (T0-DOM)';
  if (relPath.startsWith('tickets/system/')) return 'Platform Architecture Ticket (SYS)';
  if (relPath.startsWith('docs/srd/')) return 'System Reference Document (SRD)';
  if (relPath.startsWith('docs/adr/')) return 'Architectural Decision Record (ADR)';
  if (relPath.startsWith('sociology/') && ext === '.md') return 'Sociology Specification';
  if (relPath.startsWith('src/workstation/scripts/')) return 'Workstation Modular JS Engine';
  if (relPath.startsWith('src/workstation/')) return 'Workstation Shell Template';
  if (relPath.startsWith('mods/') && ext === '.js') return 'Workstation Mod / Extension';
  if (relPath.startsWith('mods/') && ext === '.json') return 'Workstation Mod Manifest (JSON)';
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) return 'Visual Diagram / Cartographic Asset';
  if (ext === '.html') return 'Standalone Zero-CORS HTML Workstation';
  if (ext === '.ps1') return 'PowerShell Automation / Simulation Runner';
  if (ext === '.js') return 'Node.js / Browser Engine Script';
  if (ext === '.json') return 'Authoritative JSON Data / Manifest';
  if (ext === '.csv') return 'Simulation Telemetry Matrix (CSV)';
  if (ext === '.md') return 'Technical Documentation / Guide';
  return 'Project Asset';
}

function computeFileHash(fullPath) {
  const buf = fs.readFileSync(fullPath);
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

// ----------------------------------------------------------------------------
// 4. STRUCTURAL & METADATA EXTRACTORS BY FILE TYPE
// ----------------------------------------------------------------------------
function parseYamlFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: text };
  const rawYaml = m[1];
  const body = m[2];
  const fm = {};
  let currentKey = null;
  rawYaml.split(/\r?\n/).forEach(line => {
    if (/^\s+-\s+/.test(line) && currentKey) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, ''));
      return;
    }
    const colon = line.indexOf(':');
    if (colon > 0 && !/^\s/.test(line)) {
      const k = line.slice(0, colon).trim();
      let v = line.slice(colon + 1).trim();
      currentKey = k;
      if (v.startsWith('[') && v.endsWith(']')) {
        const inner = v.slice(1, -1).trim();
        fm[k] = inner ? inner.split(',').map(x => x.trim().replace(/^["']|["']$/g, '')) : [];
      } else {
        fm[k] = v.replace(/^["']|["']$/g, '');
      }
    }
  });
  return { frontmatter: fm, body };
}

function extractFileMetadata(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  const stat = fs.statSync(fullPath);
  const ext = path.extname(relPath).toLowerCase();
  const hash = computeFileHash(fullPath);
  const kind = classifyFileKind(relPath);
  const volume = classifyVolume(relPath);
  const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext);

  const meta = {
    relPath,
    fileName: path.basename(relPath),
    ext,
    sizeBytes: stat.size,
    hash,
    kind,
    volume,
    isImage,
    title: path.basename(relPath),
    summary: '',
    headings: [],
    symbols: [],
    globals: [],
    includes: [],
    frontmatter: {},
    provides: [],
    requires: [],
    dials: [],
    threatClocks: [],
    fourCorners: null,
    syllogism: '',
    referencesAndSources: [],
    jsonStats: null,
    csvStats: null,
    lineCount: 0,
    rawText: ''
  };

  if (isImage) {
    meta.title = `${path.basename(relPath)} (${kind})`;
    meta.summary = describeImageAsset(relPath);
    return meta;
  }

  let text = '';
  try {
    text = fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, '');
  } catch (e) {
    return meta;
  }
  meta.rawText = text;
  const lines = text.split(/\r?\n/);
  meta.lineCount = lines.length;

  if (ext === '.md') {
    const { frontmatter, body } = parseYamlFrontmatter(text);
    meta.frontmatter = frontmatter;
    if (frontmatter.title) {
      meta.title = frontmatter.id ? `${frontmatter.id}: ${frontmatter.title}` : frontmatter.title;
    } else {
      const h1 = body.match(/^#\s+(.+)$/m);
      if (h1) meta.title = h1[1].trim();
    }

    // Headings
    const hRegex = /^(#{1,3})\s+(.+)$/gm;
    let hm;
    while ((hm = hRegex.exec(body)) !== null && meta.headings.length < 25) {
      meta.headings.push({ level: hm[1].length, text: hm[2].trim() });
    }

    // Provides / Requires
    if (Array.isArray(frontmatter.provides)) meta.provides = frontmatter.provides.filter(Boolean);
    if (Array.isArray(frontmatter.requires)) meta.requires = frontmatter.requires.filter(Boolean);

    // Extract summary paragraph
    const cleanParagraphs = body
      .split(/\r?\n\r?\n/)
      .map(p => p.trim())
      .filter(p => p && !p.startsWith('#') && !p.startsWith('---') && !p.startsWith('*Category:') && !p.startsWith('<!--') && !p.startsWith('|'));
    if (frontmatter.summary) {
      meta.summary = frontmatter.summary;
    } else if (cleanParagraphs.length > 0) {
      meta.summary = cleanParagraphs[0].replace(/[\r\n]+/g, ' ').slice(0, 360);
    }

    // Extract Threat Clocks
    const clockMatches = body.match(/([A-Za-z0-9\s\-'/]+Clock\s*\[\d+\s*Ticks\][^\n\r]*)/gi);
    if (clockMatches) {
      meta.threatClocks = [...new Set(clockMatches.map(c => c.trim().replace(/^[*-\s#]+/, '')))].slice(0, 8);
    }

    // Extract Dials
    const dialMatches = body.match(/(?:level_\d+|Level\s*\d+):?\s*["']?([^"'\n\r]+)["']?/gi);
    if (dialMatches) {
      meta.dials = dialMatches.slice(0, 4).map(d => d.trim().replace(/^[*-\s#]+/, ''));
    }

    // Extract Syllogism
    const sylMatch = body.match(/(?:Syllogism|Dramatic Argument|Core Premise)[^\n:]*:\s*\*?([^\n\r*]+)\*?/i);
    if (sylMatch) meta.syllogism = sylMatch[1].trim();

    // Extract Four Corners
    const estMatch = body.match(/(?:Establishment)[^\n:]*:\s*([^\n\r]+)/i);
    const oppMatch = body.match(/(?:Opponent)[^\n:]*:\s*([^\n\r]+)/i);
    const shdMatch = body.match(/(?:Shadow)[^\n:]*:\s*([^\n\r]+)/i);
    const outMatch = body.match(/(?:Outcast)[^\n:]*:\s*([^\n\r]+)/i);
    if (estMatch || oppMatch || shdMatch || outMatch) {
      meta.fourCorners = {
        establishment: estMatch ? estMatch[1].trim() : '',
        opponent: oppMatch ? oppMatch[1].trim() : '',
        shadow: shdMatch ? shdMatch[1].trim() : '',
        outcast: outMatch ? outMatch[1].trim() : ''
      };
    }

    // Extract Real-World / Literary / Tabletop Reference Cues
    meta.referencesAndSources = extractReferenceSources(relPath, frontmatter, body);
  } else if (ext === '.js') {
    // Extract top comment block
    const topComment = text.match(/^\/\*\*?([\s\S]*?)\*\//);
    if (topComment) {
      const cleaned = topComment[1].split(/\r?\n/).map(l => l.replace(/^\s*\*\s?/, '').trim()).filter(l => l && !l.startsWith('==='));
      if (cleaned.length > 0) meta.summary = cleaned.slice(0, 3).join(' ');
    }
    if (!meta.summary) {
      const lineComments = lines.slice(0, 12).filter(l => l.trim().startsWith('//') && !l.includes('===')).map(l => l.replace(/^\s*\/\/\s*/, '').trim());
      if (lineComments.length > 0) meta.summary = lineComments.join(' ');
    }

    // Extract functions
    const fnRegex = /(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g;
    let fm;
    while ((fm = fnRegex.exec(text)) !== null && meta.symbols.length < 60) {
      meta.symbols.push(`${fm[1]}(${fm[2].trim()})`);
    }

    // Extract top-level globals (let / const / var at column 0)
    const globRegex = /^(?:let|const|var)\s+([a-zA-Z0-9_]+)\s*=/gm;
    let gm;
    while ((gm = globRegex.exec(text)) !== null && meta.globals.length < 40) {
      meta.globals.push(gm[1]);
    }
  } else if (ext === '.ps1') {
    const syn = text.match(/\.SYNOPSIS\s+([\s\S]*?)(?=\.DESCRIPTION|\.PARAMETER|#Requires|#===|\n\s*\n)/i);
    const desc = text.match(/\.DESCRIPTION\s+([\s\S]*?)(?=\.PARAMETER|\.EXAMPLE|#===|\n\s*#>)/i);
    if (syn) meta.title = `${path.basename(relPath)} — ${syn[1].trim().split(/\r?\n/)[0]}`;
    if (desc) meta.summary = desc[1].trim().replace(/[\r\n\s]+/g, ' ');

    const fnRegex = /function\s+([a-zA-Z0-9_\-]+)\s*\{/gi;
    let fm;
    while ((fm = fnRegex.exec(text)) !== null) {
      meta.symbols.push(fm[1]);
    }
  } else if (ext === '.html') {
    const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch) meta.title = titleMatch[1].trim().replace(/&mdash;/g, '—').replace(/&bull;/g, '•').replace(/&amp;/g, '&');

    const incRegex = /(?:<!--|\/\/)\s*@@INCLUDE:\s*([^\s@]+)\s*@@/g;
    let im;
    while ((im = incRegex.exec(text)) !== null) {
      meta.includes.push(im[1]);
    }

    const fnRegex = /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g;
    let fm;
    while ((fm = fnRegex.exec(text)) !== null && meta.symbols.length < 50) {
      meta.symbols.push(`${fm[1]}(${fm[2].trim()})`);
    }
  } else if (ext === '.json') {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const sampleKeys = parsed[0] && typeof parsed[0] === 'object' ? Object.keys(parsed[0]).slice(0, 12) : [];
        meta.jsonStats = {
          rootType: 'Array',
          itemCount: parsed.length,
          sampleKeys
        };
        meta.summary = `JSON Array dataset containing ${parsed.length} structured records (fields: ${sampleKeys.join(', ')}).`;
      } else if (parsed && typeof parsed === 'object') {
        const topKeys = Object.keys(parsed);
        const counts = {};
        topKeys.forEach(k => {
          if (Array.isArray(parsed[k])) counts[k] = `${parsed[k].length} items`;
          else if (parsed[k] && typeof parsed[k] === 'object') counts[k] = `${Object.keys(parsed[k]).length} keys`;
        });
        meta.jsonStats = {
          rootType: 'Object',
          topKeys,
          counts
        };
        if (parsed.description) meta.summary = parsed.description;
        else if (parsed.deckName) meta.summary = `${parsed.deckName} (${parsed.author || 'Canonical Deck'}) — ${parsed.ontologicalLens || ''}`;
        else if (parsed.name) meta.summary = `${parsed.name} — keys: ${topKeys.join(', ')}`;
        else meta.summary = `JSON Object configuration/database with top-level keys: ${topKeys.join(', ')}.`;
      }
    } catch (e) {
      meta.summary = 'JSON dataset / manifest file.';
    }
  } else if (ext === '.csv') {
    const nonEmpty = lines.filter(l => l.trim().length > 0);
    const headers = nonEmpty[0] ? nonEmpty[0].split(',').map(h => h.trim()) : [];
    meta.csvStats = {
      rowCount: Math.max(0, nonEmpty.length - 1),
      headers,
      sampleRows: nonEmpty.slice(1, 6)
    };
    meta.summary = `Simulation telemetry CSV table with ${Math.max(0, nonEmpty.length - 1)} data rows and ${headers.length} columns (${headers.slice(0, 6).join(', ')}).`;
  } else if (ext === '.py') {
    const docMatch = text.match(/^"""([\s\S]*?)"""/);
    if (docMatch) meta.summary = docMatch[1].trim().replace(/[\r\n]+/g, ' ');
    const fnRegex = /^def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/gm;
    let fm;
    while ((fm = fnRegex.exec(text)) !== null) {
      meta.symbols.push(`${fm[1]}(${fm[2]})`);
    }
    if (!meta.summary) {
      meta.summary = `Legacy Python utility script in .scratch/ (${meta.lineCount} lines) used during Minor Arcana / SVG suite compilation.`;
    }
  }

  if (!meta.summary) {
    meta.summary = `${kind} located at ${relPath} (${meta.lineCount} lines, ${meta.sizeBytes} bytes).`;
  }

  return meta;
}

function describeImageAsset(relPath) {
  const map = {
    'campaigns/opal_island/Opal Scaled.JPG': 'Primary topographic & pointcrawl reference map of Opal Island showing node placements and coastal contours.',
    'campaigns/opal_island/Opal Scaled backside.JPG': 'Reverse/backside perspective render of the Opal Island 3D topographic elevation model.',
    'campaigns/opal_island/Opal Scaled swampside.JPG': 'Swampside oblique angle render of the Opal Island terrain model highlighting low-lying wetland basins.',
    'campaigns/Emerald Isle/modules/Set_E_Transit_and_Edges/EDGE-03_Walters_Wiggles_Cliffside_Switchback_Ascent.jpg': 'Visual reference photograph of cliffside switchbacks (modeled on Walters Wiggles, Zion National Park) anchoring EDGE-03.',
    'network/network map.JPG': 'Hand-annotated pointcrawl network map showing the 22 canonical nodes and directional influence vectors.',
    'network/network.png': 'Iteration 1 topological graph diagram of the 22-node pointcrawl network.',
    'network/network v2.png': 'Iteration 2 topological graph diagram with updated wave groupings and influence links.',
    'network/network v3.png': 'Iteration 3 canonical topological graph diagram showing asymmetric hegemonic and transit edges.',
    'sociology/00 sociology all.png': 'Composite master chart of organizational sociology frameworks (CVF quadrants, operational profiles, and cultural dimensions).',
    'sociology/4_culture_types.png': 'Competing Values Framework (CVF) 2x2 matrix diagram (Clan, Adhocracy, Market, Hierarchy) used in SOC-01.',
    'sociology/Culture-and-organization-design.png': 'Organizational design trade-off matrix mapping structure (flexibility vs. control) and focus (internal vs. external).',
    'sociology/Culture-Diagram-Clean.png': 'Clean vector diagram of cultural archetypes and organizational polarity axes.',
    'sociology/1-s2.png': 'Academic reference figure on organizational uncertainty and structural adaptation (flagged in SYS-AUDIT-01 for semantic renaming).',
    'sociology/1520159723101.png': 'Reference chart of leadership and operational culture profiles (flagged in SYS-AUDIT-01 for semantic renaming).',
    'sociology/https3A2F2Fblogs-imag4es.png': 'Reference diagram on organizational culture dimensions (flagged in SYS-AUDIT-01 for semantic filename cleanup).',
    'sociology/https3A2F2Fblogs-images.png': 'Supplementary organizational culture reference graphic (flagged in SYS-AUDIT-01 for semantic filename cleanup).'
  };
  return map[relPath] || `Visual diagram / cartographic asset at ${relPath}.`;
}

function extractReferenceSources(relPath, fm, body) {
  const refs = [];
  if (fm.creator_source) refs.push(`Source Attribution: ${fm.creator_source}`);
  if (fm.culture_quadrant) refs.push(`CVF Cultural Quadrant: ${fm.culture_quadrant}`);
  if (fm.mtg_color) refs.push(`Ideological Color Wheel: ${fm.mtg_color}`);

  // Historical / real-world / literary anchors for CWT, Tier 0, and Modules
  const knownAnchors = [
    { pattern: /Pelton/i, ref: 'Real-World Engineering: Lester Allan Pelton impulse water turbine (1870s high-head hydro-electric generation) & early direct-current dynamos.' },
    { pattern: /CaC2|Calcium Carbide|Acetylene/i, ref: 'Real-World Chemistry: Electric arc furnace synthesis of Calcium Carbide (CaC2 + H2O -> C2H2 acetylene gas lighting & chemical smudge defense).' },
    { pattern: /Saltpeter|Nitrification/i, ref: 'Historical Military Chemistry: French nitre beds (calcareous earth, wood ash, and organic nitrogen leaching for black powder).' },
    { pattern: /Walters Wiggles/i, ref: 'Real-World Geography: Walters Wiggles (21 steep masonry switchbacks built in 1926 on the Angels Landing trail, Zion Canyon, Utah).' },
    { pattern: /Bronze Age/i, ref: 'Historical Archaeology: 1177 BC Late Bronze Age Collapse (tin/copper trade network severance, palace economy cascade failure).' },
    { pattern: /Cypriot|Copper/i, ref: 'Historical Metallurgy: Enkomi & oxhide copper ingot smelting monopolies of Late Bronze Age Cyprus.' },
    { pattern: /Derinkuyu/i, ref: 'Historical Archaeology: Derinkuyu underground city (Cappadocia, Turkey) — 18-level subterranean tuff-rock refuge with rolling millstone blast doors.' },
    { pattern: /Thonis|Heracleion/i, ref: 'Historical Geo-Archaeology: Thonis-Heracleion (Nile Delta port city lost to seismic soil liquefaction and clay compaction).' },
    { pattern: /Angkor/i, ref: 'Historical Hydrology: Greater Angkor baray reservoir and monsoon canal network (vulnerable to extreme ENSO drought-deluge siltation).' },
    { pattern: /Garamantes|Foggara/i, ref: 'Historical Hydrology: Garamantian Empire of the Fezzan (Sahara) extracting non-renewable fossil aquifer water via subterranean foggara qanats.' },
    { pattern: /Tainter/i, ref: 'Sociological Theory: Joseph Tainter, "The Collapse of Complex Societies" (1988) — diminishing marginal returns on institutional complexity.' },
    { pattern: /Gobekli|Göbekli/i, ref: 'Prehistoric Archaeology: Göbekli Tepe (Pre-Pottery Neolithic A monumental T-pillars erected by hunter-gatherers prior to domestic agriculture).' },
    { pattern: /Tollense/i, ref: 'Bronze Age Conflict Archaeology: Tollense Valley battlefield (c. 1250 BC, northern Germany) — wooden causeway chokepoint mass casualty site.' },
    { pattern: /Upano|Amazonian/i, ref: 'Lidar Archaeology: Upano Valley (Ecuador) pre-Columbian garden-urbanism, geometric earthen platforms, and drainage canals.' },
    { pattern: /Fistulae|Debasement/i, ref: 'Roman Economic & Infrastructure History: Lead water pipes (plumbum fistulae) with patrician water-theft taps + Antonine silver denarius debasement.' },
    { pattern: /Rapa Nui|Moai/i, ref: 'Ecological History: Rapa Nui (Easter Island) volcanic tuff moai transport roads and Jubaea palm deforestation / Polynesian rat seed predation.' },
    { pattern: /Cahokia/i, ref: 'Mississippian Archaeology: Cahokia (Monks Mound, Illinois) — earthen platform urbanism disrupted by Mississippi River mega-floods and wood depletion.' },
    { pattern: /Antikythera/i, ref: 'Hellenistic Horology: The Antikythera Mechanism (epicyclic bronze differential gear computer predicting lunar/solar eclipses and Olympiad cycles).' },
    { pattern: /Harappa|Saraswati|Indus/i, ref: 'Indus Valley Civilization: Mohenjo-daro & Dholavira standardized baked-brick municipal sewers and Ghaggar-Hakra monsoon river desiccation.' },
    { pattern: /Teotihuacan/i, ref: 'Mesoamerican Archaeology: Teotihuacan (c. 550 AD) — selective burning and ritual shattering of elite palaces along the Avenue of the Dead.' },
    { pattern: /Chaco Canyon/i, ref: 'Ancestral Puebloan Archaeology: Chaco Canyon Great Houses (Pueblo Bonito), 200,000 spruce/fir beams hauled 50 miles, and 12th-century megadrought.' },
    { pattern: /Great Zimbabwe/i, ref: 'Sub-Saharan Archaeology: Great Zimbabwe dry-stone granite enclosures (Great Enclosure) controlling plateau cattle and Kilwa gold trade.' },
    { pattern: /Nan Madol/i, ref: 'Micronesian Archaeology: Nan Madol (Pohnpei) — 92 artificial lagoon islets constructed from prismatic columnar basalt logs.' },
    { pattern: /Skara Brae/i, ref: 'Neolithic Archaeology: Skara Brae (Orkney) — semi-subterranean flagstone houses insulated inside warm nutrient-rich midden mounds.' },
    { pattern: /Truck-System|Company Store|CWT-080/i, ref: 'Labor History: 19th-century coal & ore company towns, non-convertible tin scrip wages, debt peonage, and the Battle of Blair Mountain.' },
    { pattern: /Tutorial Isle|generic_starter/i, ref: 'Tabletop & CRPG Design Classics: Might & Magic III: Isles of Terra (1991), B2 Keep on the Borderlands, and X1 The Isle of Dread.' },
    { pattern: /Namek|DBZ-01/i, ref: 'IP Conversion Exemplar: Dragon Ball Z (Frieza/Namek Saga) translated into a 7-MacGuffin asymmetric triangulation race and planetary destruction clock.' },
    { pattern: /Barovia|DND-01/i, ref: 'IP Conversion Exemplar: Ravenloft (I6 / Curse of Strahd) translated into a closed mist-border gothic domain with an omnipresent apex predator.' },
    { pattern: /Rubicon|HIST-01/i, ref: 'Historical Campaign Exemplar: Julius Caesar crossing the Rubicon (49 BC) — rapid legionary blitzkrieg vs. senatorial treasury evacuation.' }
  ];

  knownAnchors.forEach(a => {
    if (a.pattern.test(relPath) || a.pattern.test(body)) {
      refs.push(a.ref);
    }
  });

  return refs;
}

// ----------------------------------------------------------------------------
// 5. SCAFFOLD / UPDATE MARKDOWN SOURCE IN wiki/src/files/<relPath>.md
// ----------------------------------------------------------------------------
function getWikiSrcPath(relPath) {
  return path.join(SRC_FILES_DIR, relPath + '.md');
}

function getWikiHtmlRelPath(relPath) {
  return 'pages/' + relPath + '.html';
}

function generateDefaultCustomNotes(meta) {
  const lines = [];
  lines.push(`### Architectural Purpose & Role`);
  lines.push(`\`${meta.relPath}\` serves as a **${meta.kind}** within **${VOLUMES.find(v => v.id === meta.volume)?.num}: ${VOLUMES.find(v => v.id === meta.volume)?.title}**.`);
  lines.push('');

  if (AUDIT_FLAGS[meta.relPath]) {
    const af = AUDIT_FLAGS[meta.relPath];
    lines.push(`> [!WARNING]`);
    lines.push(`> **${af.badge}**: ${af.reason} Canonical counterpart: [[File:${af.canonical}]]. Tracked under [[Ticket:SYS-AUDIT-01]].`);
    lines.push('');
  }

  // Add context-specific architectural notes
  if (meta.relPath.startsWith('src/workstation/scripts/')) {
    lines.push(`- **Workstation Modular Engine**: Inlined into \`start.html\` via \`// @@INCLUDE: scripts/${meta.fileName} @@\` inside \`src/workstation/template.html\`.`);
    lines.push(`- **Single Source of Truth Rule**: Always edit \`${meta.relPath}\` rather than the compiled bundle in \`start.html\`, then run \`Build-Suite.ps1\`.`);
  } else if (meta.relPath.startsWith('mods/')) {
    lines.push(`- **Workstation Extension Mod**: Pluggable client-side mod registering hooks via \`window.CreatorStudio.registerMod()\`.`);
  } else if (meta.relPath.startsWith('campaigns/') && meta.relPath.includes('/modules/')) {
    lines.push(`- **Modular Worldbuilding Contract**: Compiled by \`build_suite.js\` into the active campaign registry (\`CAMPAIGN_REGISTRY\`) and \`MODULES_MANIFEST\`.`);
    lines.push(`- **Zero Whole-Cloth Lore Policy**: This page extracts the authoritative mechanical schema, resource contracts (\`provides\` / \`requires\`), threat clocks, 4-corner opposition roles, and real-world/literary design references so GMs or downstream agents can adapt it to any setting.`);
  } else if (meta.relPath.startsWith('tickets/')) {
    lines.push(`- **Backlog & Tracer-Bullet Pipeline**: Indexed by \`tickets/build_unified_tracker.js\` into \`tickets/master_ticket_manifest.json\` and rendered in \`tickets/unified_ticket_tracker.html\`.`);
  } else if (meta.relPath.startsWith('.scratch/')) {
    lines.push(`- **Historical / Scratch Provenance**: Retained in \`.scratch/\` from earlier suite migrations and Minor Arcana generation passes. Documented for provenance and tracked under [[Ticket:SYS-AUDIT-01]].`);
  }

  return lines.join('\n');
}

function syncMarkdownSourceForFile(meta) {
  const srcMdPath = getWikiSrcPath(meta.relPath);
  ensureDir(path.dirname(srcMdPath));

  let customNotes = '';
  let reviewedHash = meta.hash;
  let isStale = false;

  if (fs.existsSync(srcMdPath)) {
    const existing = fs.readFileSync(srcMdPath, 'utf8');
    const customMatch = existing.match(/<!-- BEGIN_CUSTOM_NOTES -->\r?\n([\s\S]*?)\r?\n<!-- END_CUSTOM_NOTES -->/);
    if (customMatch) {
      customNotes = customMatch[1].trim();
    }
    const revMatch = existing.match(/^reviewed_hash:\s*["']?([a-f0-9]+)["']?/m);
    if (process.argv.includes('--stamp-reviewed')) {
      reviewedHash = meta.hash;
      isStale = false;
    } else if (revMatch) {
      reviewedHash = revMatch[1];
      if (reviewedHash !== meta.hash) {
        isStale = true;
      }
    }
  }

  if (!customNotes) {
    customNotes = generateDefaultCustomNotes(meta);
    reviewedHash = meta.hash;
    isStale = false;
  }

  const mdLines = [
    `---`,
    `file_path: "${meta.relPath}"`,
    `title: "${meta.title.replace(/"/g, '\\"')}"`,
    `volume: "${meta.volume}"`,
    `kind: "${meta.kind}"`,
    `current_hash: "${meta.hash}"`,
    `reviewed_hash: "${reviewedHash}"`,
    `stale: ${isStale}`,
    `size_bytes: ${meta.sizeBytes}`,
    `line_count: ${meta.lineCount}`,
    `---`,
    ``,
    `# ${meta.title}`,
    ``,
    `<!-- BEGIN_CUSTOM_NOTES -->`,
    customNotes,
    `<!-- END_CUSTOM_NOTES -->`,
    ``
  ];

  fs.writeFileSync(srcMdPath, mdLines.join('\n'), 'utf8');
  meta.customNotes = customNotes;
  meta.reviewedHash = reviewedHash;
  meta.isStale = isStale;
}

// ----------------------------------------------------------------------------
// 6. SCAFFOLD / LOAD THE 7 CROSS-CUTTING SERIES PAGES
// ----------------------------------------------------------------------------
function ensureSeriesMarkdownFiles() {
  SERIES_LIST.forEach(s => {
    const p = path.join(SRC_SERIES_DIR, `${s.id}.md`);
    if (!fs.existsSync(p)) {
      const defaultSeriesMd = [
        `---`,
        `series_id: "${s.id}"`,
        `code: "${s.code}"`,
        `title: "${s.title}"`,
        `volume: "${s.volume}"`,
        `---`,
        ``,
        `# ${s.code}: ${s.title}`,
        ``,
        `> **Cross-Cutting Analytical Series**: ${s.summary}`,
        ``,
        `## 1. Architectural Seam Overview`,
        `This series slices across physical directory boundaries to document how the following files collaborate as a unified subsystem:`,
        ...s.relatedFiles.map(rf => `- [[File:${rf}]]`),
        ``
      ].join('\n');
      fs.writeFileSync(p, defaultSeriesMd, 'utf8');
    }
  });
}

// ----------------------------------------------------------------------------
// 7. BUILD BIDIRECTIONAL LINK & BACKLINK GRAPH
// ----------------------------------------------------------------------------
function buildKnowledgeGraph(allMetas) {
  const byRelPath = new Map();
  const byFileName = new Map();
  const byModuleId = new Map();
  const byTicketId = new Map();
  const byGlobalFunc = new Map();
  const providersByTag = new Map(); // tagPrefixOrExact -> [relPath]

  allMetas.forEach(m => {
    byRelPath.set(m.relPath, m);
    if (!byFileName.has(m.fileName)) byFileName.set(m.fileName, []);
    byFileName.get(m.fileName).push(m.relPath);

    // Index Module IDs (e.g. INFRA-01, STARTER-01, DBZ-01)
    const modMatch = m.fileName.match(/^([A-Z]+-\d+[A-Z]?)[_.]/);
    if (modMatch && (m.relPath.includes('/modules/') || m.relPath.startsWith('templates/examples/'))) {
      const id = modMatch[1];
      if (!byModuleId.has(id)) byModuleId.set(id, []);
      byModuleId.get(id).push(m.relPath);
    }
    if (m.frontmatter && m.frontmatter.id && m.relPath.includes('/modules/')) {
      const id = m.frontmatter.id;
      if (!byModuleId.has(id)) byModuleId.set(id, []);
      if (!byModuleId.get(id).includes(m.relPath)) byModuleId.get(id).push(m.relPath);
    }

    // Index Ticket IDs (e.g. CWT-010, T0-DOM-01, SYS-RACE-01, SYS-AUDIT-01)
    const tktMatch = m.fileName.match(/^((?:CWT|T0-DOM|SYS-[A-Z]+)-\d+[A-Z]?)[_.]/);
    if (tktMatch && m.relPath.startsWith('tickets/')) {
      byTicketId.set(tktMatch[1], m.relPath);
    }
    if (m.frontmatter && m.frontmatter.id && m.relPath.startsWith('tickets/')) {
      byTicketId.set(m.frontmatter.id, m.relPath);
    }

    // Index JS Functions in src/workstation/scripts/ and mods/
    if (
      m.relPath.startsWith('src/workstation/scripts/') ||
      m.relPath.startsWith('mods/')
    ) {
      m.symbols.forEach(sig => {
        const fnName = sig.split('(')[0].trim();
        if (fnName.length > 3) {
          byGlobalFunc.set(fnName, m.relPath);
        }
      });
    }

    // Index Resource Tag Providers
    (m.provides || []).forEach(tag => {
      const clean = tag.trim();
      if (!providersByTag.has(clean)) providersByTag.set(clean, []);
      providersByTag.get(clean).push(m.relPath);
      const prefix = clean.split(':')[0].trim();
      if (prefix && prefix !== clean) {
        const key = `prefix:${prefix}`;
        if (!providersByTag.has(key)) providersByTag.set(key, []);
        providersByTag.get(key).push(m.relPath);
      }
    });
  });

  // Edges: Map<sourceKey, Map<targetKey, { targetKey, type, reason }>>
  const outbound = new Map();
  const inbound = new Map();

  function ensureNode(k) {
    if (!outbound.has(k)) outbound.set(k, new Map());
    if (!inbound.has(k)) inbound.set(k, new Map());
  }

  allMetas.forEach(m => ensureNode(`file:${m.relPath}`));
  SERIES_LIST.forEach(s => ensureNode(`series:${s.id}`));

  function addEdge(srcKey, dstKey, type, reason) {
    if (!srcKey || !dstKey || srcKey === dstKey) return;
    ensureNode(srcKey);
    ensureNode(dstKey);
    if (!outbound.get(srcKey).has(dstKey)) {
      outbound.get(srcKey).set(dstKey, { targetKey: dstKey, type, reason });
    }
    if (!inbound.get(dstKey).has(srcKey)) {
      inbound.get(dstKey).set(srcKey, { sourceKey: srcKey, type, reason });
    }
  }

  // 1. Connect Series <-> Related Files
  SERIES_LIST.forEach(s => {
    const sKey = `series:${s.id}`;
    s.relatedFiles.forEach(rf => {
      if (byRelPath.has(rf)) {
        addEdge(sKey, `file:${rf}`, 'Series Component', `Core file analyzed in ${s.code}: ${s.title}`);
        addEdge(`file:${rf}`, sKey, 'In Deep Series', `Part of cross-cutting subsystem ${s.code}: ${s.title}`);
      }
    });

    // Also parse explicit links in wiki/src/series/<id>.md
    const sMdPath = path.join(SRC_SERIES_DIR, `${s.id}.md`);
    if (fs.existsSync(sMdPath)) {
      const sText = fs.readFileSync(sMdPath, 'utf8');
      scanTextForLinks(sKey, sText, byRelPath, byFileName, byModuleId, byTicketId, addEdge);
    }
  });

  // 2. Connect Navigation Manifest Surfaces <-> Authority Specs & Data Sources
  const navPath = path.join(ROOT_DIR, 'docs', 'navigation_manifest.json');
  if (fs.existsSync(navPath)) {
    try {
      const nav = JSON.parse(fs.readFileSync(navPath, 'utf8'));
      (nav.surfaces || []).forEach(surf => {
        if (byRelPath.has(surf.file)) {
          const surfKey = `file:${surf.file}`;
          addEdge('file:docs/navigation_manifest.json', surfKey, 'Registers Surface', `Registered surface in navigation_manifest.json`);
          addEdge('file:AGENTS.md', surfKey, 'Routes Agent To', `Listed in AGENTS.md Surface-to-Authority Matrix`);
          (surf.authoritative_specs || []).forEach(sp => {
            const cleanSp = sp.split(' ')[0].trim();
            if (byRelPath.has(cleanSp)) {
              addEdge(surfKey, `file:${cleanSp}`, 'Governing Spec', `Authoritative specification for ${surf.file}`);
            }
          });
          (surf.data_sources || []).forEach(ds => {
            const cleanDs = ds.split(' ')[0].trim();
            if (byRelPath.has(cleanDs)) {
              addEdge(surfKey, `file:${cleanDs}`, 'Data Source', `Authoritative data source consumed by ${surf.file}`);
            } else if (cleanDs.endsWith('/')) {
              allMetas.forEach(m => {
                if (m.relPath.startsWith(cleanDs) && m.relPath !== surf.file) {
                  addEdge(surfKey, `file:${m.relPath}`, 'Data Source', `Authoritative data source in ${cleanDs} consumed by ${surf.file}`);
                }
              });
            }
          });
        }
      });
    } catch (e) {}
  }

  // 3. Scan every file's raw content + custom wiki notes for relationships
  allMetas.forEach(m => {
    const srcKey = `file:${m.relPath}`;

    // Audit duplicate / mirror link
    if (AUDIT_FLAGS[m.relPath]) {
      const can = AUDIT_FLAGS[m.relPath].canonical;
      if (byRelPath.has(can)) {
        addEdge(srcKey, `file:${can}`, 'Canonical Counterpart', AUDIT_FLAGS[m.relPath].reason);
      }
      const auditTkt = byTicketId.get('SYS-AUDIT-01');
      if (auditTkt) {
        addEdge(srcKey, `file:${auditTkt}`, 'Remediation Ticket', `Flagged in SYS-AUDIT-01 duplicate/orphan audit`);
      }
      addEdge(srcKey, 'series:series_g_duplicate_and_orphan_audit', 'Audit Series', 'Cataloged in Series G: Duplicate & Orphan Audit');
    }

    // HTML @@INCLUDE@@ links
    (m.includes || []).forEach(inc => {
      const resolved = path.posix.join(path.posix.dirname(m.relPath), inc);
      if (byRelPath.has(resolved)) {
        addEdge(srcKey, `file:${resolved}`, 'Template Include', `Inlined via @@INCLUDE: ${inc} @@`);
      }
    });

    // Workstation scripts & mods -> compiled into start.html & src/workstation/template.html
    if (m.relPath.startsWith('src/workstation/scripts/')) {
      addEdge(srcKey, 'file:src/workstation/template.html', 'Included By Template', 'Assembled into master Workstation template');
      addEdge(srcKey, 'file:start.html', 'Compiles Into', 'Bundled into standalone offline workstation via build_suite.js');
      addEdge('file:build_suite.js', srcKey, 'Bundles Source', 'Inlines modular source during suite compilation');
    } else if (m.relPath.startsWith('mods/') && (m.ext === '.js' || m.ext === '.json')) {
      addEdge(srcKey, 'file:start.html', 'Compiles Into', 'Bundled as workstation mod extension into start.html via build_suite.js');
      addEdge('file:build_suite.js', srcKey, 'Bundles Mod', 'Compiles mod extension during suite compilation');
    }

    // Shared JS function calls across workstation scripts & mods
    if (
      (m.relPath.startsWith('src/workstation/scripts/') ||
       m.relPath.startsWith('mods/')) &&
      m.rawText
    ) {
      byGlobalFunc.forEach((targetPath, fnName) => {
        if (targetPath !== m.relPath && m.rawText.includes(fnName + '(')) {
          addEdge(srcKey, `file:${targetPath}`, 'Calls Function', `Invokes ${fnName}() defined in ${path.basename(targetPath)}`);
        }
      });
    }

    // Campaign packages relationship
    if (m.relPath.startsWith('campaigns/')) {
      const parts = m.relPath.split('/');
      if (parts.length >= 3) {
        const campId = parts[1];
        const campJson = `campaigns/${campId}/campaign.json`;
        const manifestJson = `campaigns/${campId}/modules_manifest.json`;
        if (m.relPath !== campJson && byRelPath.has(campJson)) {
          addEdge(srcKey, `file:${campJson}`, 'Campaign Package', `Belongs to ${campId} campaign sourcebook`);
        }
        if (m.relPath.includes('/modules/') && byRelPath.has(manifestJson)) {
          addEdge(`file:${manifestJson}`, srcKey, 'Indexes Module', `Registered in ${campId} modules_manifest.json`);
        }
      }
    }

    // Supply-chain provides <-> requires matching
    (m.requires || []).forEach(reqTag => {
      const cleanReq = reqTag.trim();
      const exactMatches = providersByTag.get(cleanReq) || [];
      exactMatches.forEach(provPath => {
        if (provPath !== m.relPath) {
          addEdge(srcKey, `file:${provPath}`, 'Requires Resource From', `Requires [${cleanReq}] provided by ${path.basename(provPath)}`);
        }
      });
    });

    // Scan raw text & custom notes for file paths, module IDs, ticket IDs, and [[WikiLinks]]
    const combinedText = (m.customNotes || '') + '\n' + (m.rawText ? m.rawText.slice(0, 60000) : '');
    scanTextForLinks(srcKey, combinedText, byRelPath, byFileName, byModuleId, byTicketId, addEdge);
  });

  return { outbound, inbound, byRelPath };
}

function scanTextForLinks(srcKey, text, byRelPath, byFileName, byModuleId, byTicketId, addEdge) {
  if (!text) return;

  // 1. Explicit [[File:path]], [[Series:id]], [[Ticket:id]], [[Mod:id]]
  const wikiRegex = /\[\[(File|Series|Ticket|Mod):([^\]]+)\]\]/gi;
  let wm;
  while ((wm = wikiRegex.exec(text)) !== null) {
    const type = wm[1].toLowerCase();
    const val = wm[2].trim();
    if (type === 'file' && byRelPath.has(val)) {
      addEdge(srcKey, `file:${val}`, 'Wiki Citation', `Explicit [[File:${val}]] reference`);
    } else if (type === 'series') {
      addEdge(srcKey, `series:${val}`, 'Series Citation', `Explicit [[Series:${val}]] reference`);
    } else if (type === 'ticket' && byTicketId.has(val)) {
      addEdge(srcKey, `file:${byTicketId.get(val)}`, 'Ticket Citation', `References ticket ${val}`);
    } else if (type === 'mod' && byModuleId.has(val)) {
      byModuleId.get(val).forEach(mp => addEdge(srcKey, `file:${mp}`, 'Module Citation', `References module ${val}`));
    }
  }

  // 2. Direct mentions of known relative paths
  byRelPath.forEach((_, candidatePath) => {
    if (candidatePath.length > 5 && text.includes(candidatePath)) {
      addEdge(srcKey, `file:${candidatePath}`, 'Path Reference', `References ${candidatePath}`);
    }
  });

  // 3. Mentions of Ticket IDs (CWT-XXX, T0-DOM-XX, SYS-XXXX-XX)
  const tktMentionRegex = /\b((?:CWT|T0-DOM|SYS-[A-Z]+)-\d+[A-Z]?)\b/g;
  let tm;
  while ((tm = tktMentionRegex.exec(text)) !== null) {
    const tid = tm[1];
    if (byTicketId.has(tid)) {
      addEdge(srcKey, `file:${byTicketId.get(tid)}`, 'Ticket Cross-Ref', `Mentions ticket ${tid}`);
    }
  }

  // 4. Mentions of Module IDs (INFRA-XX, ECOL-XX, FACT-XX, CONF-XX, EDGE-XX, SPARK-XX, ESOT-XX, STARTER-XX)
  const modMentionRegex = /\b((?:INFRA|ECOL|FACT|CONF|EDGE|SPARK|ESOT|STARTER|DBZ|DND|HIST)-\d+[A-Z]?)\b/g;
  let mm;
  while ((mm = modMentionRegex.exec(text)) !== null) {
    const mid = mm[1];
    if (byModuleId.has(mid)) {
      byModuleId.get(mid).forEach(mp => {
        // Avoid noisy self-campaign manifest dumps linking 60 times unless it's a specific doc/module/ticket
        if (!srcKey.endsWith('.html') && !srcKey.endsWith('_manifest.json')) {
          addEdge(srcKey, `file:${mp}`, 'Module Cross-Ref', `Mentions module ${mid}`);
        }
      });
    }
  }
}

// ----------------------------------------------------------------------------
// 8. SIMPLE MARKDOWN-TO-HTML CONVERTER (WITH WIKILINK SUPPORT)
// ----------------------------------------------------------------------------
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveKeyToHref(fromDepth, targetKey, byRelPath) {
  const prefix = fromDepth === 0 ? '' : '../'.repeat(fromDepth);
  if (targetKey.startsWith('series:')) {
    const sid = targetKey.slice(7);
    const sObj = SERIES_LIST.find(x => x.id === sid);
    return {
      href: `${prefix}pages/series/${sid}.html`,
      label: sObj ? `${sObj.code}: ${sObj.title}` : sid,
      badge: 'Series'
    };
  }
  if (targetKey.startsWith('file:')) {
    const rp = targetKey.slice(5);
    const m = byRelPath.get(rp);
    return {
      href: `${prefix}pages/${rp.split('/').map(encodeURIComponent).join('/')}.html`,
      label: m ? m.relPath : rp,
      title: m ? m.title : rp,
      badge: m ? m.kind : 'File'
    };
  }
  return { href: '#', label: targetKey, badge: 'Ref' };
}

function renderMarkdownToHtml(md, fromDepth, byRelPath) {
  if (!md) return '';
  const prefix = fromDepth === 0 ? '' : '../'.repeat(fromDepth);

  // Strip YAML frontmatter if present
  let body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  // Strip HTML comments for custom note markers
  body = body.replace(/<!--\s*(?:BEGIN|END)_CUSTOM_NOTES\s*-->/g, '');

  // Handle fenced code blocks first
  const codeBlocks = [];
  body = body.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre class="code-block"><code class="lang-${lang || 'text'}">${escapeHtml(code.trimEnd())}</code></pre>`);
    return `@@CODE_BLOCK_${idx}@@`;
  });

  // Transform [[File:...]], [[Series:...]], [[Ticket:...]], [[Mod:...]]
  body = body.replace(/\[\[(File|Series|Ticket|Mod):([^\]]+)\]\]/gi, (_, rawType, rawVal) => {
    const t = rawType.toLowerCase();
    const v = rawVal.trim();
    if (t === 'file') {
      const href = `${prefix}pages/${v.split('/').map(encodeURIComponent).join('/')}.html`;
      return `<a class="wiki-link" href="${href}">📄 ${escapeHtml(v)}</a>`;
    }
    if (t === 'series') {
      const sObj = SERIES_LIST.find(x => x.id === v);
      const href = `${prefix}pages/series/${v}.html`;
      return `<a class="wiki-link series-link" href="${href}">🧭 ${escapeHtml(sObj ? sObj.code + ': ' + sObj.title : v)}</a>`;
    }
    if (t === 'ticket') {
      return `<span class="wiki-tag">🎫 ${escapeHtml(v)}</span>`;
    }
    if (t === 'mod') {
      return `<span class="wiki-tag">📦 ${escapeHtml(v)}</span>`;
    }
    return escapeHtml(v);
  });

  const lines = body.split(/\r?\n/);
  const out = [];
  let inList = false;
  let inTable = false;
  let tableRows = [];

  function flushList() {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  }

  function flushTable() {
    if (!inTable) return;
    if (tableRows.length > 0) {
      out.push('<div class="table-wrap"><table class="wiki-table">');
      tableRows.forEach((r, idx) => {
        const cells = r.split('|').slice(1, -1).map(c => c.trim());
        if (idx === 1 && cells.every(c => /^[:\-]+$/.test(c))) return;
        const tag = idx === 0 ? 'th' : 'td';
        if (idx === 0) out.push('<thead>');
        if (idx === 2) out.push('<tbody>');
        out.push('<tr>' + cells.map(c => `<${tag}>${formatInline(c)}</${tag}>`).join('') + '</tr>');
        if (idx === 0) out.push('</thead>');
      });
      if (tableRows.length > 2) out.push('</tbody>');
      out.push('</table></div>');
    }
    inTable = false;
    tableRows = [];
  }

  function formatInline(s) {
    return s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^@@CODE_BLOCK_\d+@@$/.test(trimmed)) {
      flushList();
      flushTable();
      const idx = parseInt(trimmed.match(/\d+/)[0], 10);
      out.push(codeBlocks[idx]);
      continue;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed === '---') {
      flushList();
      out.push('<hr class="wiki-hr"/>');
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      out.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      out.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      continue; // Page H1 is rendered in the main article header
    }

    if (trimmed.startsWith('> ')) {
      flushList();
      const calloutText = trimmed.slice(2);
      if (/^\[!(WARNING|IMPORTANT|NOTE|TIP|CAUTION)\]/i.test(calloutText)) {
        const type = calloutText.match(/^\[!([A-Z]+)\]/i)[1].toUpperCase();
        const nextLine = (lines[i + 1] && lines[i + 1].trim().startsWith('>')) ? lines[++i].trim().replace(/^>\s*/, '') : '';
        out.push(`<div class="callout callout-${type.toLowerCase()}"><strong>${type}:</strong> ${formatInline(nextLine || calloutText)}</div>`);
      } else {
        out.push(`<blockquote class="wiki-quote">${formatInline(calloutText)}</blockquote>`);
      }
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) {
        out.push('<ul class="wiki-list">');
        inList = true;
      }
      out.push(`<li>${formatInline(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    flushList();
    out.push(`<p>${formatInline(trimmed)}</p>`);
  }

  flushList();
  flushTable();
  return out.join('\n');
}

// ----------------------------------------------------------------------------
// 9. SHARED WIKIPEDIA-STYLE RESPONSIVE CSS & CLIENT SEARCH SCRIPT
// ----------------------------------------------------------------------------
function getSharedCss() {
  return `
    :root {
      --bg: #0b0f19;
      --bg-elevated: #111827;
      --bg-infobox: #131c31;
      --border: #1e293b;
      --border-strong: #334155;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --heading: #f8fafc;
      --link: #38bdf8;
      --link-hover: #7dd3fc;
      --accent: #f59e0b;
      --code-bg: #090d16;
      --table-stripe: rgba(30, 41, 59, 0.35);
      --badge-bg: #1e293b;
    }
    html[data-theme="light"] {
      --bg: #f8fafc;
      --bg-elevated: #ffffff;
      --bg-infobox: #f1f5f9;
      --border: #cbd5e1;
      --border-strong: #94a3b8;
      --text: #1e293b;
      --text-muted: #475569;
      --heading: #0f172a;
      --link: #0284c7;
      --link-hover: #0369a1;
      --accent: #d97706;
      --code-bg: #f1f5f9;
      --table-stripe: #f8fafc;
      --badge-bg: #e2e8f0;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, sans-serif;
      line-height: 1.6;
      font-size: 15px;
    }
    a { color: var(--link); text-decoration: none; }
    a:hover { color: var(--link-hover); text-decoration: underline; }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.88em;
      background: var(--code-bg);
      padding: 0.15em 0.4em;
      border-radius: 4px;
      border: 1px solid var(--border);
    }
    pre.code-block {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 12px 14px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.45;
    }
    pre.code-block code { border: none; padding: 0; background: transparent; }

    /* Top Header Bar */
    .wiki-topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-elevated);
      border-bottom: 1px solid var(--border);
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .wiki-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 17px;
      color: var(--heading);
    }
    .wiki-brand span.sub {
      font-weight: 500;
      font-size: 12px;
      color: var(--text-muted);
      border-left: 1px solid var(--border-strong);
      padding-left: 10px;
    }
    .wiki-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      max-width: 560px;
      justify-content: flex-end;
    }
    .search-wrap {
      position: relative;
      flex: 1;
      max-width: 380px;
    }
    .search-input {
      width: 100%;
      padding: 7px 12px;
      border-radius: 6px;
      border: 1px solid var(--border-strong);
      background: var(--bg);
      color: var(--text);
      font-size: 13px;
    }
    .search-results {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--bg-elevated);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      max-height: 380px;
      overflow-y: auto;
      box-shadow: 0 12px 30px rgba(0,0,0,0.45);
      display: none;
      z-index: 200;
    }
    .search-item {
      display: block;
      padding: 8px 12px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
      text-decoration: none !important;
    }
    .search-item:hover { background: var(--bg-infobox); }
    .search-item .s-title { font-weight: 700; font-size: 13px; color: var(--link); }
    .search-item .s-meta { font-size: 11px; color: var(--text-muted); font-family: monospace; }
    .btn-ctrl {
      padding: 6px 11px;
      border-radius: 6px;
      border: 1px solid var(--border-strong);
      background: var(--bg);
      color: var(--text);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-ctrl:hover { border-color: var(--link); }

    /* Layout Grid */
    .wiki-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      max-width: 1520px;
      margin: 0 auto;
      min-height: calc(100vh - 56px);
    }
    .wiki-sidebar {
      border-right: 1px solid var(--border);
      background: var(--bg-elevated);
      padding: 16px 14px;
      font-size: 13px;
      overflow-y: auto;
    }
    .wiki-sidebar h4 {
      margin: 14px 0 6px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }
    .wiki-sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0 0 12px;
    }
    .wiki-sidebar li { margin: 3px 0; }
    .wiki-sidebar a {
      display: block;
      padding: 3px 6px;
      border-radius: 4px;
      color: var(--text);
      font-size: 12.5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .wiki-sidebar a:hover, .wiki-sidebar a.active {
      background: var(--bg-infobox);
      color: var(--link);
    }

    /* Main Content Area */
    .wiki-main {
      padding: 24px 32px 60px;
      min-width: 0;
    }
    .breadcrumbs {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 10px;
      font-family: ui-monospace, monospace;
    }
    .article-header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .article-title {
      font-size: 26px;
      font-weight: 800;
      color: var(--heading);
      margin: 0 0 6px;
      line-height: 1.25;
      word-break: break-word;
    }
    .article-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      background: var(--badge-bg);
      border: 1px solid var(--border-strong);
      color: var(--text);
    }
    .badge-ok { background: rgba(16, 185, 129, 0.15); border-color: #059669; color: #34d399; }
    .badge-warn { background: rgba(245, 158, 11, 0.18); border-color: #d97706; color: #fbbf24; }
    .badge-Series { background: rgba(56, 189, 248, 0.15); border-color: #0284c7; color: #38bdf8; }

    /* Wikipedia-Style Right Infobox */
    .infobox {
      float: right;
      width: 320px;
      margin: 0 0 20px 24px;
      background: var(--bg-infobox);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      font-size: 12.5px;
      overflow: hidden;
    }
    .infobox-header {
      background: var(--border);
      color: var(--heading);
      font-weight: 700;
      padding: 8px 12px;
      text-align: center;
      font-size: 13px;
      border-bottom: 1px solid var(--border-strong);
    }
    .infobox-table {
      width: 100%;
      border-collapse: collapse;
    }
    .infobox-table th, .infobox-table td {
      padding: 6px 10px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
      text-align: left;
    }
    .infobox-table th {
      width: 38%;
      color: var(--text-muted);
      font-weight: 600;
    }
    .infobox-table td { word-break: break-word; }

    /* AI Fast-Digest Box */
    .ai-digest {
      background: var(--bg-elevated);
      border: 1px solid var(--border-strong);
      border-left: 4px solid var(--accent);
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 13.5px;
    }
    .ai-digest-title {
      font-weight: 800;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      margin-bottom: 6px;
    }

    h2 {
      font-size: 19px;
      color: var(--heading);
      border-bottom: 1px solid var(--border);
      padding-bottom: 5px;
      margin-top: 28px;
      margin-bottom: 12px;
      clear: left;
    }
    h3 {
      font-size: 15.5px;
      color: var(--heading);
      margin-top: 20px;
      margin-bottom: 8px;
    }

    .table-wrap { overflow-x: auto; margin: 14px 0; clear: both; }
    .wiki-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
    }
    .wiki-table th, .wiki-table td {
      border: 1px solid var(--border);
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }
    .wiki-table th {
      background: var(--bg-infobox);
      color: var(--heading);
      font-weight: 700;
    }
    .wiki-table tr:nth-child(even) td { background: var(--table-stripe); }

    .callout {
      padding: 10px 14px;
      border-radius: 6px;
      margin: 14px 0;
      border: 1px solid var(--border-strong);
      background: var(--bg-infobox);
      font-size: 13.5px;
    }
    .callout-warning { border-left: 4px solid #f59e0b; }
    .callout-important { border-left: 4px solid #38bdf8; }

    .pill-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
    .pill {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11.5px;
      font-family: ui-monospace, monospace;
      background: var(--bg-infobox);
      border: 1px solid var(--border-strong);
    }

    /* Mobile Responsiveness */
    @media (max-width: 960px) {
      .wiki-layout { grid-template-columns: 1fr; }
      .wiki-sidebar {
        display: none;
        border-right: none;
        border-bottom: 1px solid var(--border);
      }
      .wiki-sidebar.open { display: block; }
      .infobox {
        float: none;
        width: 100%;
        margin: 0 0 18px 0;
      }
      .wiki-main { padding: 16px; }
    }
  `;
}

function getSharedClientJs(fromDepth) {
  const prefix = fromDepth === 0 ? '' : '../'.repeat(fromDepth);
  return `
    (function() {
      const savedTheme = localStorage.getItem('cs_wiki_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      window.toggleWikiTheme = function() {
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('cs_wiki_theme', next);
      };
      window.toggleMobileSidebar = function() {
        const sb = document.getElementById('wiki-sidebar');
        if (sb) sb.classList.toggle('open');
      };

      document.addEventListener('DOMContentLoaded', function() {
        const input = document.getElementById('wiki-search-input');
        const box = document.getElementById('wiki-search-results');
        if (!input || !box) return;

        input.addEventListener('input', function() {
          const q = input.value.trim().toLowerCase();
          if (!q || typeof WIKI_SEARCH_INDEX === 'undefined') {
            box.style.display = 'none';
            return;
          }
          const matches = WIKI_SEARCH_INDEX.filter(item => {
            return item.title.toLowerCase().includes(q) ||
                   item.path.toLowerCase().includes(q) ||
                   (item.keywords && item.keywords.toLowerCase().includes(q));
          }).slice(0, 18);

          if (matches.length === 0) {
            box.innerHTML = '<div class="search-item"><span class="s-meta">No matching files, series, or symbols found.</span></div>';
            box.style.display = 'block';
            return;
          }

          box.innerHTML = matches.map(m => {
            return '<a class="search-item" href="' + '${prefix}' + m.href + '">' +
              '<div class="s-title">' + m.title + '</div>' +
              '<div class="s-meta">' + m.kind + ' &bull; ' + m.path + '</div>' +
            '</a>';
          }).join('');
          box.style.display = 'block';
        });

        document.addEventListener('click', function(e) {
          if (!input.contains(e.target) && !box.contains(e.target)) {
            box.style.display = 'none';
          }
        });

        document.addEventListener('keydown', function(e) {
          if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault();
            input.focus();
          } else if (e.key === 'Escape') {
            box.style.display = 'none';
          }
        });
      });
    })();
  `;
}

function renderSidebarHtml(fromDepth, activeId = '') {
  const prefix = fromDepth === 0 ? '' : '../'.repeat(fromDepth);
  let html = `<aside id="wiki-sidebar" class="wiki-sidebar">`;
  html += `<h4>Navigation</h4>`;
  html += `<ul>`;
  html += `<li><a href="${prefix}index.html" class="${activeId === 'index' ? 'active' : ''}">📚 Master Table of Contents</a></li>`;
  html += `<li><a href="${prefix}../start.html">💻 Desktop Workstation (start.html)</a></li>`;
  html += `<li><a href="${prefix}../index.html">⚡ Creator Studio Launcher</a></li>`;
  html += `<li><a href="${prefix}../network/campaign_studio.html">🎛️ Campaign Studio (Step 1)</a></li>`;
  html += `<li><a href="${prefix}../tickets/unified_ticket_tracker.html">🎫 Unified Ticket Tracker</a></li>`;
  html += `</ul>`;

  html += `<h4>Cross-Cutting Series</h4>`;
  html += `<ul>`;
  SERIES_LIST.forEach(s => {
    const isAct = activeId === `series:${s.id}`;
    html += `<li><a href="${prefix}pages/series/${s.id}.html" class="${isAct ? 'active' : ''}" title="${escapeHtml(s.title)}">🧭 ${escapeHtml(s.code)}: ${escapeHtml(s.title)}</a></li>`;
  });
  html += `</ul>`;

  html += `<h4>Technical Manual Volumes</h4>`;
  html += `<ul>`;
  VOLUMES.forEach(v => {
    html += `<li><a href="${prefix}index.html#${v.id}">${v.icon} ${escapeHtml(v.num)}: ${escapeHtml(v.title)}</a></li>`;
  });
  html += `</ul>`;
  html += `</aside>`;
  return html;
}

function renderTopbarHtml(fromDepth) {
  const prefix = fromDepth === 0 ? '' : '../'.repeat(fromDepth);
  return `
    <header class="wiki-topbar">
      <div class="wiki-brand">
        <button class="btn-ctrl" onclick="toggleMobileSidebar()" title="Toggle Table of Contents">☰ ToC</button>
        <a href="${prefix}index.html" style="color:inherit;text-decoration:none;">📚 Creator Studio Wiki</a>
        <span class="sub">Technical Manual &amp; Bidirectional Backlink Encyclopedia</span>
      </div>
      <div class="wiki-controls">
        <div class="search-wrap">
          <input id="wiki-search-input" class="search-input" type="search" placeholder="Search 350+ files, symbols, tags (Press /)..." autocomplete="off"/>
          <div id="wiki-search-results" class="search-results"></div>
        </div>
        <button class="btn-ctrl" onclick="toggleWikiTheme()" title="Toggle Light / Dark Appearance">🌗 Theme</button>
      </div>
    </header>
  `;
}

// ----------------------------------------------------------------------------
// 10. RENDER INDIVIDUAL FILE WIKI PAGES (wiki/pages/<relPath>.html)
// ----------------------------------------------------------------------------
function renderFileWikiPage(meta, graph) {
  const htmlOutPath = path.join(PAGES_DIR, meta.relPath + '.html');
  ensureDir(path.dirname(htmlOutPath));

  const depth = meta.relPath.split('/').length; // relative to wiki/ root: pages/<segments>
  const prefixToWikiRoot = '../'.repeat(depth);
  const rawFileHref = `${prefixToWikiRoot}../${meta.relPath.split('/').map(encodeURIComponent).join('/')}`;
  const volObj = VOLUMES.find(v => v.id === meta.volume) || VOLUMES[0];

  const nodeKey = `file:${meta.relPath}`;
  const outEdges = Array.from((graph.outbound.get(nodeKey) || new Map()).values());
  const inEdges = Array.from((graph.inbound.get(nodeKey) || new Map()).values());

  const auditFlag = AUDIT_FLAGS[meta.relPath];
  const syncBadge = meta.isStale
    ? `<span class="badge badge-warn">⚠️ SOURCE MODIFIED SINCE LAST WIKI REVIEW</span>`
    : `<span class="badge badge-ok">✓ Synced (SHA: ${meta.hash.slice(0, 8)})</span>`;

  // Build Infobox rows
  let infoboxRows = `
    <tr><th>File Path</th><td><code>${escapeHtml(meta.relPath)}</code></td></tr>
    <tr><th>Manual Volume</th><td><a href="${prefixToWikiRoot}index.html#${volObj.id}">${escapeHtml(volObj.num)}</a></td></tr>
    <tr><th>Surface Kind</th><td>${escapeHtml(meta.kind)}</td></tr>
    <tr><th>File Metrics</th><td>${meta.isImage ? `${(meta.sizeBytes / 1024).toFixed(1)} KB (Image)` : `${meta.lineCount} lines &bull; ${(meta.sizeBytes / 1024).toFixed(1)} KB`}</td></tr>
    <tr><th>Sync Status</th><td>${syncBadge}</td></tr>
    <tr><th>Outbound Links</th><td><strong>${outEdges.length}</strong> references</td></tr>
    <tr><th>Inbound Backlinks</th><td><strong>${inEdges.length}</strong> backlinks</td></tr>
    <tr><th>Raw File</th><td><a href="${rawFileHref}" target="_blank">🔗 Open Source File &rarr;</a></td></tr>
  `;

  if (meta.frontmatter && meta.frontmatter.pipeline_tier !== undefined) {
    infoboxRows += `<tr><th>Pipeline Tier</th><td><span class="badge">Tier ${escapeHtml(meta.frontmatter.pipeline_tier)}</span></td></tr>`;
  }
  if (meta.frontmatter && meta.frontmatter.status) {
    infoboxRows += `<tr><th>Status</th><td><code>${escapeHtml(meta.frontmatter.status)}</code></td></tr>`;
  }
  if (meta.frontmatter && meta.frontmatter.culture_quadrant) {
    infoboxRows += `<tr><th>CVF Quadrant</th><td>${escapeHtml(meta.frontmatter.culture_quadrant)}</td></tr>`;
  }
  if (meta.frontmatter && meta.frontmatter.mtg_color) {
    infoboxRows += `<tr><th>Color Wheel</th><td>${escapeHtml(meta.frontmatter.mtg_color)}</td></tr>`;
  }

  // Build AI Fast-Digest Block
  const aiDigestHtml = `
    <div class="ai-digest">
      <div class="ai-digest-title">🤖 AI &amp; Human Fast-Digest (Zero-Turn Context Summary)</div>
      <p style="margin:4px 0;"><strong>Summary:</strong> ${escapeHtml(meta.summary)}</p>
      ${auditFlag ? `<p style="margin:6px 0;color:#fbbf24;"><strong>${escapeHtml(auditFlag.badge)}:</strong> ${escapeHtml(auditFlag.reason)}</p>` : ''}
      ${meta.provides.length > 0 ? `<p style="margin:4px 0;"><strong>Provides Contracts:</strong> ${meta.provides.map(p => `<code>${escapeHtml(p)}</code>`).join(' ')}</p>` : ''}
      ${meta.requires.length > 0 ? `<p style="margin:4px 0;"><strong>Requires Contracts:</strong> ${meta.requires.map(r => `<code>${escapeHtml(r)}</code>`).join(' ')}</p>` : ''}
    </div>
  `;

  // Image preview if image asset
  let imagePreviewHtml = '';
  if (meta.isImage) {
    imagePreviewHtml = `
      <h2>Visual Asset Preview</h2>
      <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
        <img src="${rawFileHref}" alt="${escapeHtml(meta.fileName)}" style="max-width:100%;max-height:540px;border-radius:6px;border:1px solid var(--border-strong);"/>
        <div style="margin-top:8px;font-size:12px;color:var(--text-muted);"><code>${escapeHtml(meta.relPath)}</code> (${(meta.sizeBytes / 1024).toFixed(1)} KB)</div>
      </div>
    `;
  }

  // Custom architectural notes
  const customNotesHtml = renderMarkdownToHtml(meta.customNotes, depth, graph.byRelPath);

  // Structural & Reference Breakdown Section
  let structuralHtml = '';

  if (meta.headings.length > 0) {
    structuralHtml += `<h2>Document Section Outline</h2><ul class="wiki-list">`;
    meta.headings.forEach(h => {
      const indent = (h.level - 1) * 18;
      structuralHtml += `<li style="margin-left:${indent}px;"><code>H${h.level}</code> ${escapeHtml(h.text)}</li>`;
    });
    structuralHtml += `</ul>`;
  }

  if (meta.symbols.length > 0 || meta.globals.length > 0 || meta.includes.length > 0) {
    structuralHtml += `<h2>Exported Symbols, Functions &amp; State Globals</h2>`;
    if (meta.includes.length > 0) {
      structuralHtml += `<h3>Template Includes (<code>@@INCLUDE@@</code>)</h3><div class="pill-list">`;
      meta.includes.forEach(inc => {
        structuralHtml += `<span class="pill">${escapeHtml(inc)}</span>`;
      });
      structuralHtml += `</div>`;
    }
    if (meta.globals.length > 0) {
      structuralHtml += `<h3>Top-Level Globals &amp; Constants</h3><div class="pill-list">`;
      meta.globals.forEach(g => {
        structuralHtml += `<span class="pill">${escapeHtml(g)}</span>`;
      });
      structuralHtml += `</div>`;
    }
    if (meta.symbols.length > 0) {
      structuralHtml += `<h3>Declared Functions / Subroutines (${meta.symbols.length})</h3><div class="pill-list">`;
      meta.symbols.forEach(s => {
        structuralHtml += `<span class="pill">${escapeHtml(s)}</span>`;
      });
      structuralHtml += `</div>`;
    }
  }

  // Tabletop / Module / Ticket Structured Data & References (No whole-cloth lore!)
  if (
    meta.provides.length > 0 ||
    meta.requires.length > 0 ||
    meta.dials.length > 0 ||
    meta.threatClocks.length > 0 ||
    meta.fourCorners ||
    meta.syllogism ||
    meta.referencesAndSources.length > 0
  ) {
    structuralHtml += `<h2>Mechanical Contracts, Dials &amp; Real-World Reference Data</h2>`;
    if (meta.syllogism) {
      structuralHtml += `<p><strong>Dramatic Syllogism:</strong> <code>${escapeHtml(meta.syllogism)}</code></p>`;
    }
    if (meta.referencesAndSources.length > 0) {
      structuralHtml += `<h3>Reference Foundations &amp; Design Provenance (For GM / Downstream Expansion)</h3><ul class="wiki-list">`;
      meta.referencesAndSources.forEach(r => {
        structuralHtml += `<li>${escapeHtml(r)}</li>`;
      });
      structuralHtml += `</ul>`;
    }
    if (meta.fourCorners) {
      structuralHtml += `<h3>Truby 4-Corner Opposition Matrix</h3>
        <div class="table-wrap"><table class="wiki-table">
          <thead><tr><th>Role</th><th>Faction / Actor Vector</th></tr></thead>
          <tbody>
            <tr><td><strong>Establishment</strong></td><td>${escapeHtml(meta.fourCorners.establishment || '—')}</td></tr>
            <tr><td><strong>Opponent</strong></td><td>${escapeHtml(meta.fourCorners.opponent || '—')}</td></tr>
            <tr><td><strong>Shadow</strong></td><td>${escapeHtml(meta.fourCorners.shadow || '—')}</td></tr>
            <tr><td><strong>Outcast</strong></td><td>${escapeHtml(meta.fourCorners.outcast || '—')}</td></tr>
          </tbody>
        </table></div>`;
    }
    if (meta.dials.length > 0) {
      structuralHtml += `<h3>Systemic Escalation Dials (Levels 1–4)</h3><ul class="wiki-list">`;
      meta.dials.forEach(d => {
        structuralHtml += `<li>${escapeHtml(d)}</li>`;
      });
      structuralHtml += `</ul>`;
    }
    if (meta.threatClocks.length > 0) {
      structuralHtml += `<h3>Active Threat Clocks</h3><ul class="wiki-list">`;
      meta.threatClocks.forEach(c => {
        structuralHtml += `<li><code>${escapeHtml(c)}</code></li>`;
      });
      structuralHtml += `</ul>`;
    }
    if (meta.frontmatter && meta.frontmatter.standalone_fallback) {
      structuralHtml += `<p><strong>Standalone Fallback Mode:</strong> ${escapeHtml(meta.frontmatter.standalone_fallback)}</p>`;
    }
  }

  if (meta.jsonStats) {
    structuralHtml += `<h2>JSON Dataset Structure</h2>`;
    if (meta.jsonStats.rootType === 'Array') {
      structuralHtml += `<p>Root Type: <code>Array[${meta.jsonStats.itemCount}]</code> &bull; Record Keys: ${meta.jsonStats.sampleKeys.map(k => `<code>${escapeHtml(k)}</code>`).join(', ')}</p>`;
    } else {
      structuralHtml += `<p>Root Type: <code>Object</code> &bull; Top-Level Keys: ${meta.jsonStats.topKeys.map(k => `<code>${escapeHtml(k)}</code>`).join(', ')}</p>`;
      const countKeys = Object.keys(meta.jsonStats.counts || {});
      if (countKeys.length > 0) {
        structuralHtml += `<ul class="wiki-list">` + countKeys.map(k => `<li><code>${escapeHtml(k)}</code>: ${escapeHtml(meta.jsonStats.counts[k])}</li>`).join('') + `</ul>`;
      }
    }
  }

  if (meta.csvStats) {
    structuralHtml += `<h2>CSV Telemetry Schema (${meta.csvStats.rowCount} Rows)</h2>`;
    structuralHtml += `<p>Columns: ${meta.csvStats.headers.map(h => `<code>${escapeHtml(h)}</code>`).join(', ')}</p>`;
  }

  // Outbound Links Table
  let outboundHtml = `<h2 id="outbound-links">Outbound References (${outEdges.length})</h2>`;
  if (outEdges.length === 0) {
    outboundHtml += `<p style="color:var(--text-muted);">No outbound file or series links detected.</p>`;
  } else {
    outboundHtml += `<div class="table-wrap"><table class="wiki-table"><thead><tr><th>Target Page</th><th>Relationship</th><th>Context / Seam Note</th></tr></thead><tbody>`;
    outEdges.forEach(e => {
      const resolved = resolveKeyToHref(depth, e.targetKey, graph.byRelPath);
      outboundHtml += `<tr>
        <td><a href="${resolved.href}"><strong>${escapeHtml(resolved.label)}</strong></a></td>
        <td><span class="badge badge-${resolved.badge}">${escapeHtml(e.type)}</span></td>
        <td>${escapeHtml(e.reason)}</td>
      </tr>`;
    });
    outboundHtml += `</tbody></table></div>`;
  }

  // Inbound Backlinks Table ("What Links Here")
  let inboundHtml = `<h2 id="backlinks">What Links Here — Inbound Backlinks (${inEdges.length})</h2>`;
  if (inEdges.length === 0) {
    inboundHtml += `<p style="color:var(--text-muted);">No inbound backlinks from other pages yet.</p>`;
  } else {
    inboundHtml += `<div class="table-wrap"><table class="wiki-table"><thead><tr><th>Referencing Page (Source)</th><th>Link Type</th><th>How It References This File</th></tr></thead><tbody>`;
    inEdges.forEach(e => {
      const resolved = resolveKeyToHref(depth, e.sourceKey, graph.byRelPath);
      inboundHtml += `<tr>
        <td><a href="${resolved.href}"><strong>${escapeHtml(resolved.label)}</strong></a></td>
        <td><span class="badge badge-${resolved.badge}">${escapeHtml(e.type)}</span></td>
        <td>${escapeHtml(e.reason)}</td>
      </tr>`;
    });
    inboundHtml += `</tbody></table></div>`;
  }

  const pageHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(meta.title)} — Creator Studio Technical Manual &amp; Wiki</title>
  <style>${getSharedCss()}</style>
  <script src="${prefixToWikiRoot}search_index.js"></script>
  <script>${getSharedClientJs(depth)}</script>
</head>
<body>
  ${renderTopbarHtml(depth)}
  <div class="wiki-layout">
    ${renderSidebarHtml(depth, nodeKey)}
    <main class="wiki-main">
      <div class="breadcrumbs">
        <a href="${prefixToWikiRoot}index.html">Wiki Manual</a> &rsaquo;
        <a href="${prefixToWikiRoot}index.html#${volObj.id}">${escapeHtml(volObj.num)}: ${escapeHtml(volObj.title)}</a> &rsaquo;
        <span>${escapeHtml(meta.relPath)}</span>
      </div>
      <div class="article-header">
        <h1 class="article-title">${escapeHtml(meta.title)}</h1>
        <div class="article-subtitle">
          <span class="badge">${escapeHtml(meta.kind)}</span>
          ${syncBadge}
          ${auditFlag ? `<span class="badge badge-warn">${escapeHtml(auditFlag.badge)}</span>` : ''}
          <a href="#backlinks" style="margin-left:auto;font-weight:700;">&darr; Jump to Backlinks (${inEdges.length})</a>
        </div>
      </div>

      <aside class="infobox">
        <div class="infobox-header">${escapeHtml(meta.fileName)}</div>
        <table class="infobox-table">
          ${infoboxRows}
        </table>
      </aside>

      ${aiDigestHtml}
      ${imagePreviewHtml}
      ${customNotesHtml}
      ${structuralHtml}
      ${outboundHtml}
      ${inboundHtml}
    </main>
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlOutPath, pageHtml, 'utf8');
}

// ----------------------------------------------------------------------------
// 11. RENDER SERIES PAGES (wiki/pages/series/<seriesId>.html)
// ----------------------------------------------------------------------------
function renderSeriesPages(graph) {
  const depth = 2; // pages/series/<id>.html -> 2 levels deep from wiki/
  const prefixToWikiRoot = '../../';

  SERIES_LIST.forEach(s => {
    const mdPath = path.join(SRC_SERIES_DIR, `${s.id}.md`);
    const rawMd = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
    const outPath = path.join(SERIES_PAGES_DIR, `${s.id}.html`);
    const volObj = VOLUMES.find(v => v.id === s.volume) || VOLUMES[0];

    const nodeKey = `series:${s.id}`;
    const outEdges = Array.from((graph.outbound.get(nodeKey) || new Map()).values());
    const inEdges = Array.from((graph.inbound.get(nodeKey) || new Map()).values());

    const bodyHtml = renderMarkdownToHtml(rawMd, depth, graph.byRelPath);

    let outboundHtml = `<h2 id="outbound-links">Subsystem Files Covered in This Series (${outEdges.length})</h2>`;
    if (outEdges.length > 0) {
      outboundHtml += `<div class="table-wrap"><table class="wiki-table"><thead><tr><th>File / Page</th><th>Role</th><th>Notes</th></tr></thead><tbody>`;
      outEdges.forEach(e => {
        const resolved = resolveKeyToHref(depth, e.targetKey, graph.byRelPath);
        outboundHtml += `<tr>
          <td><a href="${resolved.href}"><strong>${escapeHtml(resolved.label)}</strong></a></td>
          <td><span class="badge">${escapeHtml(e.type)}</span></td>
          <td>${escapeHtml(e.reason)}</td>
        </tr>`;
      });
      outboundHtml += `</tbody></table></div>`;
    }

    let inboundHtml = `<h2 id="backlinks">What Links Here — Inbound Backlinks (${inEdges.length})</h2>`;
    if (inEdges.length > 0) {
      inboundHtml += `<div class="table-wrap"><table class="wiki-table"><thead><tr><th>Referencing Page</th><th>Relationship</th><th>Context</th></tr></thead><tbody>`;
      inEdges.forEach(e => {
        const resolved = resolveKeyToHref(depth, e.sourceKey, graph.byRelPath);
        inboundHtml += `<tr>
          <td><a href="${resolved.href}"><strong>${escapeHtml(resolved.label)}</strong></a></td>
          <td><span class="badge">${escapeHtml(e.type)}</span></td>
          <td>${escapeHtml(e.reason)}</td>
        </tr>`;
      });
      inboundHtml += `</tbody></table></div>`;
    }

    const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(s.code)}: ${escapeHtml(s.title)} — Creator Studio Technical Manual</title>
  <style>${getSharedCss()}</style>
  <script src="${prefixToWikiRoot}search_index.js"></script>
  <script>${getSharedClientJs(depth)}</script>
</head>
<body>
  ${renderTopbarHtml(depth)}
  <div class="wiki-layout">
    ${renderSidebarHtml(depth, nodeKey)}
    <main class="wiki-main">
      <div class="breadcrumbs">
        <a href="${prefixToWikiRoot}index.html">Wiki Manual</a> &rsaquo;
        <a href="${prefixToWikiRoot}index.html#series-index">Cross-Cutting Series</a> &rsaquo;
        <span>${escapeHtml(s.code)}</span>
      </div>
      <div class="article-header">
        <h1 class="article-title">🧭 ${escapeHtml(s.code)}: ${escapeHtml(s.title)}</h1>
        <div class="article-subtitle">
          <span class="badge badge-Series">Cross-Cutting Subsystem Series</span>
          <span class="badge">${escapeHtml(volObj.num)}</span>
          <a href="#backlinks" style="margin-left:auto;font-weight:700;">&darr; Jump to Backlinks (${inEdges.length})</a>
        </div>
      </div>

      <div class="ai-digest">
        <div class="ai-digest-title">🤖 Analytical Knife Seam Summary</div>
        <p style="margin:4px 0;">${escapeHtml(s.summary)}</p>
      </div>

      ${bodyHtml}
      ${outboundHtml}
      ${inboundHtml}
    </main>
  </div>
</body>
</html>`;

    fs.writeFileSync(outPath, html, 'utf8');
  });
}

// ----------------------------------------------------------------------------
// 12. RENDER MASTER INDEX / TABLE OF CONTENTS (wiki/index.html)
// ----------------------------------------------------------------------------
function renderMasterIndexHtml(allMetas, graph) {
  const totalFiles = allMetas.length;
  const staleFiles = allMetas.filter(m => m.isStale);
  const flaggedDuplicates = allMetas.filter(m => AUDIT_FLAGS[m.relPath]);
  let totalEdges = 0;
  graph.outbound.forEach(map => { totalEdges += map.size; });

  // Series Section
  let seriesCardsHtml = `<div class="table-wrap"><table class="wiki-table">
    <thead><tr><th>Series</th><th>Cross-Cutting Subsystem Title</th><th>Analytical Seam Summary</th><th>Connected Pages</th></tr></thead>
    <tbody>`;
  SERIES_LIST.forEach(s => {
    const outCount = (graph.outbound.get(`series:${s.id}`) || new Map()).size;
    const inCount = (graph.inbound.get(`series:${s.id}`) || new Map()).size;
    seriesCardsHtml += `<tr>
      <td style="white-space:nowrap;"><span class="badge badge-Series">${escapeHtml(s.code)}</span></td>
      <td><a href="pages/series/${s.id}.html"><strong>${escapeHtml(s.title)}</strong></a></td>
      <td>${escapeHtml(s.summary)}</td>
      <td style="white-space:nowrap;">${outCount} out &bull; ${inCount} backlinks</td>
    </tr>`;
  });
  seriesCardsHtml += `</tbody></table></div>`;

  // Volumes Sections
  let volumesHtml = '';
  VOLUMES.forEach(v => {
    const volFiles = allMetas.filter(m => m.volume === v.id).sort((a, b) => a.relPath.localeCompare(b.relPath));
    volumesHtml += `
      <h2 id="${v.id}">${v.icon} ${escapeHtml(v.num)}: ${escapeHtml(v.title)} (${volFiles.length} Files)</h2>
      <p style="color:var(--text-muted);margin-top:-6px;">${escapeHtml(v.subtitle)}</p>
      <div class="table-wrap">
        <table class="wiki-table">
          <thead>
            <tr>
              <th style="width:34%;">File Path (Click for Wiki Page)</th>
              <th style="width:18%;">Surface / Kind</th>
              <th style="width:36%;">Summary &amp; Audit Notes</th>
              <th style="width:12%;">Links / Backlinks</th>
            </tr>
          </thead>
          <tbody>
            ${volFiles.map(m => {
              const href = `pages/${m.relPath.split('/').map(encodeURIComponent).join('/')}.html`;
              const outC = (graph.outbound.get(`file:${m.relPath}`) || new Map()).size;
              const inC = (graph.inbound.get(`file:${m.relPath}`) || new Map()).size;
              const af = AUDIT_FLAGS[m.relPath];
              return `<tr>
                <td>
                  <a href="${href}"><code>${escapeHtml(m.relPath)}</code></a>
                  ${m.isStale ? `<br/><span class="badge badge-warn">⚠️ Stale</span>` : ''}
                  ${af ? `<br/><span class="badge badge-warn">${escapeHtml(af.badge)}</span>` : ''}
                </td>
                <td>${escapeHtml(m.kind)}</td>
                <td>${escapeHtml(m.summary.slice(0, 190))}${m.summary.length > 190 ? '...' : ''}</td>
                <td style="white-space:nowrap;font-family:monospace;font-size:12px;">
                  <span title="Outbound References">&rarr; ${outC}</span> &bull;
                  <a href="${href}#backlinks" title="Inbound Backlinks"><strong>&larr; ${inC}</strong></a>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  });

  const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Creator Studio Technical Manual &amp; Bidirectional Codebase Wiki</title>
  <style>${getSharedCss()}</style>
  <script src="search_index.js"></script>
  <script>${getSharedClientJs(0)}</script>
</head>
<body>
  ${renderTopbarHtml(0)}
  <div class="wiki-layout">
    ${renderSidebarHtml(0, 'index')}
    <main class="wiki-main">
      <div class="article-header">
        <h1 class="article-title">📚 Creator Studio — Technical Manual &amp; Bidirectional Codebase Wiki</h1>
        <div class="article-subtitle">
          <span class="badge badge-ok">✓ ${totalFiles} Tracked Project Files (100% Coverage)</span>
          <span class="badge badge-Series">🧭 ${SERIES_LIST.length} Cross-Cutting Subsystem Series</span>
          <span class="badge">🔗 ${totalEdges} Bidirectional Cross-References</span>
          ${staleFiles.length > 0
            ? `<span class="badge badge-warn">⚠️ ${staleFiles.length} Pages Need Review After Source Edit</span>`
            : `<span class="badge badge-ok">✓ Zero Stale Pages</span>`}
          <span class="badge badge-warn">🔍 ${flaggedDuplicates.length} Duplicate/Legacy Files Flagged (SYS-AUDIT-01)</span>
        </div>
      </div>

      <div class="ai-digest">
        <div class="ai-digest-title">🤖 Operating Manual for Humans &amp; Autonomous AI Agents</div>
        <p style="margin:4px 0;">
          Every file in <strong>Creator Studio</strong> has a dedicated 1:1 wiki page below with its SHA-256 sync hash, exported symbols/contracts, real-world reference anchors, and automated <strong>What Links Here (Backlinks)</strong> table.
          Whenever any file in the repository is created or updated, running <code>powershell -ExecutionPolicy Bypass -File .\\Build-Suite.ps1</code> automatically scaffolds new file pages, recomputes all backlinks, and flags any modified files whose wiki notes need updating.
        </p>
      </div>

      <h2 id="series-index">🧭 Cross-Cutting Subsystem Series (The "Analytical Knife" Seams)</h2>
      <p style="color:var(--text-muted);margin-top:-6px;">
        Where engine mechanics cut across multiple folders and languages (JS, PowerShell, Markdown SRDs, JSON), these 7 multi-page series document the end-to-end architecture:
      </p>
      ${seriesCardsHtml}

      ${volumesHtml}
    </main>
  </div>
</body>
</html>`;

  fs.writeFileSync(INDEX_HTML_OUT, html, 'utf8');
}

// ----------------------------------------------------------------------------
// 13. ORPHAN PURGE & EXECUTE COMPILATION PIPELINE
// ----------------------------------------------------------------------------
function purgeOrphanWikiOutputs(trackedRelPaths) {
  const trackedSet = new Set(trackedRelPaths);

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return [];
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        results = results.concat(walkDir(full));
      } else if (e.isFile()) {
        results.push(full);
      }
    }
    return results;
  }

  // 1. Purge orphan markdown sources in wiki/src/files
  let purgedSrc = 0;
  walkDir(SRC_FILES_DIR).forEach(full => {
    const rel = path.relative(SRC_FILES_DIR, full).replace(/\\/g, '/');
    if (rel.endsWith('.md')) {
      const originalRelPath = rel.slice(0, -3);
      if (!trackedSet.has(originalRelPath)) {
        try { fs.unlinkSync(full); purgedSrc++; } catch (_) {}
      }
    }
  });

  // 2. Purge orphan HTML pages in wiki/pages (preserving pages/series/*)
  let purgedPages = 0;
  walkDir(PAGES_DIR).forEach(full => {
    const rel = path.relative(PAGES_DIR, full).replace(/\\/g, '/');
    if (rel.startsWith('series/')) return;
    if (rel.endsWith('.html')) {
      const originalRelPath = rel.slice(0, -5);
      if (!trackedSet.has(originalRelPath)) {
        try { fs.unlinkSync(full); purgedPages++; } catch (_) {}
      }
    }
  });

  // 3. Remove empty subdirectories
  function removeEmptyDirs(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        const full = path.join(dir, e.name);
        removeEmptyDirs(full);
        if (fs.readdirSync(full).length === 0) {
          try { fs.rmdirSync(full); } catch (_) {}
        }
      }
    }
  }
  removeEmptyDirs(SRC_FILES_DIR);
  removeEmptyDirs(PAGES_DIR);

  if (purgedSrc > 0 || purgedPages > 0) {
    console.log(`[PURGE] Removed ${purgedSrc} orphan markdown source(s) and ${purgedPages} orphan HTML page(s).`);
  }
}

ensureSeriesMarkdownFiles();

const trackedRelPaths = walkWorkspace(ROOT_DIR).sort();
console.log(`[OK] Discovered ${trackedRelPaths.length} tracked files across workspace.`);

purgeOrphanWikiOutputs(trackedRelPaths);

const allMetas = trackedRelPaths.map(rp => {
  const m = extractFileMetadata(rp);
  syncMarkdownSourceForFile(m);
  return m;
});

const graph = buildKnowledgeGraph(allMetas);

// Generate Search Index (zero-CORS JS script)
const searchEntries = [];
SERIES_LIST.forEach(s => {
  searchEntries.push({
    title: `${s.code}: ${s.title}`,
    path: `series/${s.id}`,
    kind: 'Cross-Cutting Series',
    href: `pages/series/${s.id}.html`,
    keywords: s.summary + ' ' + s.relatedFiles.join(' ')
  });
});
allMetas.forEach(m => {
  searchEntries.push({
    title: m.title,
    path: m.relPath,
    kind: m.kind,
    href: `pages/${m.relPath.split('/').map(encodeURIComponent).join('/')}.html`,
    keywords: [
      ...(m.provides || []),
      ...(m.requires || []),
      ...(m.symbols || []).slice(0, 15),
      ...(m.globals || []).slice(0, 10),
      AUDIT_FLAGS[m.relPath] ? 'SYS-AUDIT-01 duplicate mirror legacy' : ''
    ].join(' ')
  });
});
fs.writeFileSync(
  SEARCH_INDEX_OUT,
  `// [AUTO-GENERATED BY wiki/build_wiki.js - DO NOT EDIT]\nconst WIKI_SEARCH_INDEX = ${JSON.stringify(searchEntries)};\n`,
  'utf8'
);

// Render all HTML pages
allMetas.forEach(m => renderFileWikiPage(m, graph));
renderSeriesPages(graph);
renderMasterIndexHtml(allMetas, graph);

// Write machine-readable wiki_manifest.json
let totalEdges = 0;
graph.outbound.forEach(map => { totalEdges += map.size; });

const manifestData = {
  generatedAt: new Date().toISOString(),
  totalFiles: allMetas.length,
  totalSeries: SERIES_LIST.length,
  totalBidirectionalEdges: totalEdges,
  staleCount: allMetas.filter(m => m.isStale).length,
  duplicateAuditTargets: Object.keys(AUDIT_FLAGS).length,
  volumes: VOLUMES,
  series: SERIES_LIST,
  files: allMetas.map(m => ({
    relPath: m.relPath,
    wikiHtml: `wiki/pages/${m.relPath}.html`,
    wikiSrc: `wiki/src/files/${m.relPath}.md`,
    title: m.title,
    volume: m.volume,
    kind: m.kind,
    hash: m.hash,
    reviewedHash: m.reviewedHash,
    stale: m.isStale,
    auditFlag: AUDIT_FLAGS[m.relPath] ? AUDIT_FLAGS[m.relPath].badge : null,
    outboundCount: (graph.outbound.get(`file:${m.relPath}`) || new Map()).size,
    inboundBacklinkCount: (graph.inbound.get(`file:${m.relPath}`) || new Map()).size
  }))
};
fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifestData, null, 2), 'utf8');

// Write full zero-token queryable graph to wiki/wiki_graph.json
const symbolRecords = [];
const resourceTagMap = new Map(); // tag -> { providers: Set, consumers: Set }

const graphNodes = allMetas.map(m => {
  const nodeKey = `file:${m.relPath}`;
  const outEdges = Array.from((graph.outbound.get(nodeKey) || new Map()).values());
  const inEdges = Array.from((graph.inbound.get(nodeKey) || new Map()).values());

  (m.symbols || []).forEach(sig => {
    const fnName = sig.split('(')[0].replace(/^(function|class|def)\s+/i, '').trim();
    symbolRecords.push({
      name: fnName,
      signature: sig,
      file: m.relPath,
      kind: m.kind
    });
  });

  (m.provides || []).forEach(tag => {
    const clean = tag.trim();
    if (!resourceTagMap.has(clean)) resourceTagMap.set(clean, { providers: new Set(), consumers: new Set() });
    resourceTagMap.get(clean).providers.add(m.relPath);
  });

  (m.requires || []).forEach(tag => {
    const clean = tag.trim();
    if (!resourceTagMap.has(clean)) resourceTagMap.set(clean, { providers: new Set(), consumers: new Set() });
    resourceTagMap.get(clean).consumers.add(m.relPath);
  });

  return {
    relPath: m.relPath,
    title: m.title,
    volume: m.volume,
    kind: m.kind,
    stale: m.isStale,
    hash: m.hash,
    reviewedHash: m.reviewedHash,
    lineCount: m.lineCount || 0,
    sizeBytes: m.sizeBytes || 0,
    symbols: m.symbols || [],
    globals: m.globals || [],
    provides: m.provides || [],
    requires: m.requires || [],
    outbound: outEdges.map(e => ({
      target: e.targetKey.replace(/^(file|series):/, ''),
      targetType: e.targetKey.startsWith('series:') ? 'series' : 'file',
      type: e.type,
      reason: e.reason
    })),
    inbound: inEdges.map(e => ({
      source: e.sourceKey.replace(/^(file|series):/, ''),
      sourceType: e.sourceKey.startsWith('series:') ? 'series' : 'file',
      type: e.type,
      reason: e.reason
    }))
  };
});

const supplyChainRecords = Array.from(resourceTagMap.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([tag, sets]) => ({
    tag,
    providers: Array.from(sets.providers),
    consumers: Array.from(sets.consumers)
  }));

const graphExport = {
  generatedAt: manifestData.generatedAt,
  totalFiles: allMetas.length,
  totalSeries: SERIES_LIST.length,
  totalBidirectionalEdges: totalEdges,
  staleCount: manifestData.staleCount,
  nodes: graphNodes,
  symbols: symbolRecords,
  supplyChains: supplyChainRecords
};
fs.writeFileSync(GRAPH_OUT, JSON.stringify(graphExport, null, 2), 'utf8');

console.log(`[OK] Compiled ${allMetas.length} File Wiki Pages + ${SERIES_LIST.length} Series Pages + Master Index.`);
console.log(`[OK] Indexed ${totalEdges} Bidirectional Cross-References & Backlinks (exported to wiki/wiki_graph.json).`);
if (manifestData.staleCount > 0) {
  console.warn(`[WIKI-DRIFT] ${manifestData.staleCount} file(s) modified since last wiki review!`);
}
