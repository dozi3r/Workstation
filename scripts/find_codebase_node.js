#!/usr/bin/env node
/**
 * Creator Studio - Cross-Platform Zero-Token Codebase Graph Inspector (scripts/find_codebase_node.js)
 *
 * Queries wiki/wiki_graph.json (compiled deterministically by wiki/build_wiki.js)
 * to inspect file blast radius, inbound backlinks, outbound dependencies,
 * declared functions/symbols, module resource supply chains (provides/requires),
 * and documentation drift without consuming LLM tokens or grepping the workspace.
 *
 * Supports both POSIX (--file, --symbol, --resource, --module, --chain, --check, --stale, --json)
 * and PowerShell (-File, -Symbol, -Resource, -Module, -Chain, -Check, -Stale, -Json) flags.
 * --module / --chain read graph.moduleAtlas (built from infographic/tools/wikimodule.js); on a clean
 * checkout without infographic/, --module falls back to the module file's provides/requires.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const GRAPH_PATH = path.join(ROOT_DIR, 'wiki', 'wiki_graph.json');

function loadGraph(autoBuild = true) {
  if (!fs.existsSync(GRAPH_PATH) && autoBuild) {
    console.log('[INFO] wiki/wiki_graph.json not found. Compiling suite first...');
    execFileSync(process.execPath, [path.join(ROOT_DIR, 'build_suite.js')], { stdio: 'ignore' });
  }
  if (!fs.existsSync(GRAPH_PATH)) {
    throw new Error('Could not locate or build wiki/wiki_graph.json.');
  }
  const raw = fs.readFileSync(GRAPH_PATH, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function parseCliArgs(argv) {
  const opts = { file: '', symbol: '', resource: '', module: '', chain: '', check: false, stale: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = String(argv[i] || '');
    const lower = arg.toLowerCase();
    if (lower === '-file' || lower === '--file') {
      opts.file = String(argv[++i] || '');
    } else if (lower === '-module' || lower === '--module') {
      opts.module = String(argv[++i] || '');
    } else if (lower === '-chain' || lower === '--chain') {
      opts.chain = String(argv[++i] || '');
    } else if (lower === '-symbol' || lower === '--symbol') {
      opts.symbol = String(argv[++i] || '');
    } else if (lower === '-resource' || lower === '--resource') {
      opts.resource = String(argv[++i] || '');
    } else if (lower === '-check' || lower === '--check') {
      opts.check = true;
    } else if (lower === '-stale' || lower === '--stale') {
      opts.stale = true;
    } else if (lower === '-json' || lower === '--json') {
      opts.json = true;
    }
  }
  return opts;
}

function findFileNode(graph, fileQuery) {
  const norm = String(fileQuery || '').trim().replace(/\\/g, '/').toLowerCase();
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  let node = nodes.find(n => String(n.relPath || '').toLowerCase() === norm);
  if (!node) {
    node = nodes.find(n => {
      const rp = String(n.relPath || '').toLowerCase();
      return rp.endsWith('/' + norm) || rp.includes(norm);
    });
  }
  return node || null;
}

function searchSymbols(graph, symbolQuery) {
  const q = String(symbolQuery || '').trim().toLowerCase();
  const symbols = Array.isArray(graph.symbols) ? graph.symbols : [];
  return symbols.filter(s =>
    String(s.name || '').toLowerCase().includes(q) ||
    String(s.signature || '').toLowerCase().includes(q)
  );
}

function searchResources(graph, resourceQuery) {
  const q = String(resourceQuery || '').trim().toLowerCase();
  const chains = Array.isArray(graph.supplyChains) ? graph.supplyChains : [];
  return chains.filter(sc => String(sc.tag || '').toLowerCase().includes(q));
}

// ---------------------------------------------------------------------------
// Module / chain atlas (graph.moduleAtlas, emitted by wiki/build_wiki.js from infographic/tools/wikimodule.js)
// ---------------------------------------------------------------------------
function getModuleAtlas(graph) {
  const a = graph && graph.moduleAtlas;
  return a && a.available && Array.isArray(a.modules) ? a : null;
}

// Returns { module, candidates }: exact id match (case-insensitive), else unique partial match on id/title.
function findModule(graph, query) {
  const atlas = getModuleAtlas(graph);
  const q = String(query || '').trim().toLowerCase();
  if (!atlas || !q) return { module: null, candidates: [] };
  const exact = atlas.modules.find(m => m.id.toLowerCase() === q);
  if (exact) return { module: exact, candidates: [] };
  const partial = atlas.modules.filter(m => m.id.toLowerCase().includes(q) || String(m.title || '').toLowerCase().includes(q));
  return partial.length === 1 ? { module: partial[0], candidates: [] } : { module: null, candidates: partial.map(m => m.id) };
}

// Accepts "CHAIN-SILVER", "chain-silver" or "silver".
function findChain(graph, query) {
  const atlas = getModuleAtlas(graph);
  const q = String(query || '').trim().toUpperCase();
  if (!atlas || !q) return { chain: null, candidates: [] };
  const id = q.startsWith('CHAIN-') ? q : `CHAIN-${q}`;
  const exact = atlas.chains.find(c => c.id === id);
  if (exact) return { chain: exact, candidates: [] };
  const partial = atlas.chains.filter(c => c.id.includes(q.replace(/^CHAIN-/, '')));
  return partial.length === 1 ? { chain: partial[0], candidates: [] } : { chain: null, candidates: partial.map(c => c.id) };
}

// Clean-checkout fallback: contracts from the indexed module file node (no atlas data).
function fallbackModuleFromNodes(graph, query) {
  const id = String(query || '').trim().toUpperCase();
  if (!id) return null;
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const node = nodes.find(n => /^mods\/[^/]+\/modules\//.test(String(n.relPath || '')) &&
    path.basename(String(n.relPath)).toUpperCase().startsWith(id + '_'));
  if (!node) return null;
  const chains = Array.isArray(graph.supplyChains) ? graph.supplyChains : [];
  const tagRec = tag => chains.find(sc => sc.tag === tag) || { providers: [], consumers: [] };
  return {
    id,
    file: node.relPath,
    provides: (node.provides || []).map(tag => ({ tag, consumers: tagRec(tag).consumers.filter(c => c !== node.relPath) })),
    requires: (node.requires || []).map(tag => ({ tag, providers: tagRec(tag).providers.filter(p => p !== node.relPath) }))
  };
}

const clipText = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 3) + '...' : s; };
const vecText = v => (Array.isArray(v) ? `[${v.join(', ')}]` : '[?]');
const idList = a => (a && a.length ? a.join(', ') : '(none)');

function formatModuleReport(m) {
  const L = [];
  const bar = '==================================================================';
  L.push('', bar, ` MODULE: ${m.id} - ${m.title}${m.tier0 ? ' (Tier 0)' : ''}`, bar);
  L.push(` File:      ${m.file}`);
  L.push(` Chain:     ${m.chainId} stage ${m.chainStage} (${m.chainRole}) | ${m.category} | pipeline tier ${m.pipelineTier}`);
  L.push(` Baseline:  [S, E, C] = ${vecText(m.baseline)} | quadrant ${m.quadrant || '?'} (derived ${m.derivedQuadrant || '?'}, ${m.quadrantMatches ? 'matches' : 'DIFFERS'}) | ${m.operationalProfile}`);
  L.push(` Research:  ${m.research || '(none)'}`);
  if (m.yields) L.push(` Yields:    ${m.yields}`);

  L.push(`\n[PROVIDES (${m.provides.length})]`);
  m.provides.forEach(p => L.push(`  + ${p.tag.padEnd(36)} -> ${p.consumers.length ? p.consumers.join(', ') : '(terminal: nobody requires it)'}`));
  L.push(`\n[REQUIRES (${m.requires.length})]`);
  m.requires.forEach(r => L.push(`  - ${r.tag.padEnd(36)} <- ${r.providers.length ? r.providers.join(', ') : '(ORPHAN: no provider)'}`));

  L.push(`\n[UPSTREAM SUPPLIERS (${m.upstream.length} direct, ${m.upstreamAll} transitive)]`);
  if (!m.upstream.length) L.push('  (None)');
  m.upstream.forEach(u => L.push(`  <- ${u.id.padEnd(18)} ${u.tags.join('; ')}${u.bridge ? ' [bridge]' : ''}`));
  L.push(`\n[DOWNSTREAM CONSUMERS (${m.downstream.length} direct, ${m.downstreamAll} transitive)]`);
  if (!m.downstream.length) L.push('  (None)');
  m.downstream.forEach(d => L.push(`  -> ${d.id.padEnd(18)} ${d.tags.join('; ')}${d.bridge ? ' [bridge]' : ''}`));

  L.push('\n[WHAT BREAKS IF THIS STOPS (cascade: starved = no provider left, degraded = lost one of several)]');
  L.push(`  ${m.cascade.summary}`);
  m.cascade.starved.forEach(s => L.push(`  STARVED   ${s.id.padEnd(18)} loses ${s.lost.join('; ')}`));
  m.cascade.degraded.forEach(s => L.push(`  DEGRADED  ${s.id.padEnd(18)} loses part of ${s.partial.join('; ')}`));

  L.push(`\n[NPC ROSTER (${m.npcs.length})]`);
  m.npcs.forEach(n => {
    L.push(`  * ${n.name} | ${n.role} | ${n.disposition || '[?]'}`);
    L.push(`      ${clipText(n.motivation, 200)}`);
  });

  L.push('\n[DIALS & CLOCKS]');
  if (!m.dials.length && !m.clocks.length) L.push('  (None)');
  m.dials.forEach(d => {
    L.push(`  Dial ${d.name}:`);
    d.levels.forEach((lv, i) => L.push(`    ${i + 1}. ${clipText(lv, 150)}`));
  });
  m.clocks.forEach(c => L.push(`  Clock ${c.id}: ${clipText(c.text, 170)}`));
  if (m.hazards.length) {
    L.push(`\n[HAZARDS (${m.hazards.length})]`);
    m.hazards.forEach(h => L.push(`  ! ${h.name}: ${clipText(h.text, 150)}`));
  }

  L.push('\n[GIT AUDIT (git log --follow)]');
  if (!m.audit) {
    L.push('  (Unavailable: git history not read when the atlas was built)');
  } else {
    L.push(`  ${m.audit.summary}`);
    m.audit.commits.forEach(c => L.push(`  ${c.h}  ${clipText(c.detail, 150)}`));
  }

  const v = m.verification || { confirmed: 0, wrong: 0, unverifiable: 0, flags: [], designFlags: [] };
  L.push('\n[VERIFICATION (infographic/audit/followups/C_verify.md)]');
  L.push(`  ${v.confirmed} confirmed, ${v.wrong} wrong (fixed), ${v.unverifiable} unverifiable${v.designFlags.length ? ' | Stream 3.9 design flags: ' + v.designFlags.join(', ') : ''}`);
  v.flags.forEach(f => L.push(`  ${String(f.verdict).toUpperCase().padEnd(12)} ${f.ref}: ${clipText(f.claim ? f.claim + ' -- ' + f.note : f.note, 170)}`));
  L.push('');
  return L.join('\n');
}

function formatChainReport(c, atlas) {
  const L = [];
  const bar = '==================================================================';
  const byId = new Map(((atlas && atlas.modules) || []).map(m => [m.id, m]));
  L.push('', bar, ` CHAIN: ${c.id} (${c.label})${c.tier0 ? ' - Tier 0' : ''}`, bar);
  L.push(` Research:  ${c.research || '(none)'}`);
  L.push(` Verified:  ${c.verification.confirmed} confirmed, ${c.verification.wrong} wrong (fixed), ${c.verification.unverifiable} unverifiable`);
  L.push(` Audit:     ${c.audit.rescaled} module(s) rescaled, ${c.audit.tagsChanged} with tag changes, ${c.audit.factsFixed} with fact fixes, ${c.audit.npcsRewritten} NPC(s) rewritten`);
  L.push(`\n[STAGES (${c.modules.length})]`);
  c.modules.forEach(m => {
    const full = byId.get(m.id);
    L.push(`  ${String(m.stage).padEnd(2)} ${m.id.padEnd(18)} ${m.role.padEnd(14)} ${m.title}${full && full.baseline ? '  ' + vecText(full.baseline) + ' ' + (full.quadrant || '') : ''}`);
  });
  L.push(`\n[EXTERNAL INPUTS (${c.inputs.length})]`);
  if (!c.inputs.length) L.push('  (None)');
  c.inputs.forEach(i => L.push(`  - ${i.tag.padEnd(36)} <- ${i.providers.length ? i.providers.join(', ') : '(ORPHAN)'}`));
  L.push(`\n[OUTPUTS (${c.outputs.length})]`);
  c.outputs.forEach(o => L.push(`  + ${o.tag.padEnd(36)} -> ${o.consumers.length ? o.consumers.join(', ') : '(terminal)'}`));
  L.push(`\n[UPSTREAM CHAINS]   ${idList(c.upstreamChains)}`);
  L.push(`[DOWNSTREAM CHAINS] ${idList(c.downstreamChains)}`);
  L.push('\n[BLAST RADIUS (every module of this chain stops)]');
  L.push(`  ${c.blastRadius.summary}`);
  L.push(`  Starved:  ${idList(c.blastRadius.starved)}`);
  L.push(`  Degraded: ${idList(c.blastRadius.degraded)}`);
  L.push('');
  return L.join('\n');
}

function getStaleFiles(graph) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  return nodes.filter(n => n.stale === true);
}

function checkGraphIntegrity(graph) {
  const errors = [];
  const warnings = [];
  if (!graph || typeof graph !== 'object') {
    return { ok: false, errors: ['Graph JSON is empty or invalid.'], warnings };
  }
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const symbols = Array.isArray(graph.symbols) ? graph.symbols : [];
  const chains = Array.isArray(graph.supplyChains) ? graph.supplyChains : [];
  if (nodes.length === 0) errors.push('wiki_graph.json contains 0 indexed file nodes.');
  if (symbols.length === 0) errors.push('wiki_graph.json contains 0 indexed symbols.');
  if (!Array.isArray(graph.supplyChains)) errors.push('wiki_graph.json is missing supplyChains[].');

  // Verify registered active surfaces exist on disk
  const navPath = path.join(ROOT_DIR, 'docs', 'navigation_manifest.json');
  if (fs.existsSync(navPath)) {
    try {
      const nav = JSON.parse(fs.readFileSync(navPath, 'utf8').replace(/^\uFEFF/, ''));
      (nav.surfaces || []).forEach(s => {
        if (s.file && !fs.existsSync(path.join(ROOT_DIR, s.file))) {
          errors.push(`Registered surface in navigation_manifest.json missing on disk: ${s.file}`);
        }
      });
    } catch (err) {
      errors.push(`Failed to parse docs/navigation_manifest.json: ${err.message}`);
    }
  }

  // Check series markdown files exist and inspect [[File:...]] references
  const seriesIds = Array.isArray(graph.seriesIds) ? graph.seriesIds : [];
  seriesIds.forEach(sid => {
    const mdPath = path.join(ROOT_DIR, 'wiki', 'src', 'series', `${sid}.md`);
    if (!fs.existsSync(mdPath)) {
      errors.push(`Series Markdown source missing: wiki/src/series/${sid}.md`);
      return;
    }
    const raw = fs.readFileSync(mdPath, 'utf8');
    const re = /\[\[File:([^\]]+)\]\]/g;
    let m;
    while ((m = re.exec(raw)) !== null) {
      const target = m[1].trim();
      if (!fs.existsSync(path.join(ROOT_DIR, target))) {
        warnings.push(`wiki/src/series/${sid}.md cites missing/archived path: ${target}`);
      }
    }
  });

  // Module atlas is optional (infographic/ is git-ignored); report it, never fail on its absence.
  const atlas = getModuleAtlas(graph);
  const moduleAtlas = atlas
    ? { available: true, modules: atlas.modules.length, chains: atlas.chains.length, tags: atlas.tags.length }
    : { available: false, reason: (graph.moduleAtlas && graph.moduleAtlas.reason) || 'not present in wiki_graph.json' };

  return {
    ok: errors.length === 0,
    totalFiles: nodes.length,
    totalSymbols: symbols.length,
    totalSupplyChains: chains.length,
    moduleAtlas,
    errors,
    warnings
  };
}

function runCli(argv = process.argv.slice(2)) {
  const opts = parseCliArgs(argv);
  const graph = loadGraph(true);

  // 1. INSPECT FILE NODE (-File / --file)
  if (opts.file) {
    const node = findFileNode(graph, opts.file);
    if (!node) {
      console.error(`No tracked file matching '${opts.file}' found in wiki/wiki_graph.json.`);
      process.exit(1);
    }
    if (opts.json) {
      console.log(JSON.stringify(node, null, 2));
      return;
    }
    console.log('\n==================================================================');
    console.log(` CODEBASE NODE: ${node.relPath}`);
    console.log('==================================================================');
    console.log(` Title:    ${node.title}`);
    console.log(` Kind:     ${node.kind} (${node.volume})`);
    console.log(` Metrics:  ${node.lineCount} lines | ${node.sizeBytes} bytes`);

    if (Array.isArray(node.symbols) && node.symbols.length > 0) {
      console.log(`\n[DECLARED SYMBOLS & SUBROUTINES (${node.symbols.length})]`);
      node.symbols.forEach(sym => console.log(`  * ${sym}`));
    }
    if (Array.isArray(node.globals) && node.globals.length > 0) {
      console.log(`\n[SHARED GLOBALS (${node.globals.length})]`);
      console.log('  ' + node.globals.join(', '));
    }
    if ((Array.isArray(node.provides) && node.provides.length > 0) || (Array.isArray(node.requires) && node.requires.length > 0)) {
      console.log('\n[RESOURCE CONTRACTS]');
      if (Array.isArray(node.provides) && node.provides.length > 0) {
        console.log('  Provides: ' + node.provides.join(', '));
      }
      if (Array.isArray(node.requires) && node.requires.length > 0) {
        console.log('  Requires: ' + node.requires.join(', '));
      }
    }
    const inbound = Array.isArray(node.inbound) ? node.inbound : [];
    console.log(`\n[INBOUND BACKLINKS / CALLERS / CONSUMERS (${inbound.length})]`);
    if (inbound.length === 0) {
      console.log('  (None)');
    } else {
      inbound.forEach(inEdge => {
        console.log(`  <- ${String(inEdge.source).padEnd(48)} [${inEdge.type}] ${inEdge.reason}`);
      });
    }
    const outbound = Array.isArray(node.outbound) ? node.outbound : [];
    console.log(`\n[OUTBOUND REFERENCES & DEPENDENCIES (${outbound.length})]`);
    if (outbound.length === 0) {
      console.log('  (None)');
    } else {
      outbound.forEach(outEdge => {
        console.log(`  -> ${String(outEdge.target).padEnd(48)} [${outEdge.type}] ${outEdge.reason}`);
      });
    }
    console.log('');
    return;
  }

  // 2. SEARCH SYMBOL (-Symbol / --symbol)
  if (opts.symbol) {
    const q = opts.symbol.trim();
    const matches = searchSymbols(graph, q);
    if (opts.json) {
      console.log(JSON.stringify(matches, null, 2));
      return;
    }
    console.log('\n==================================================================');
    console.log(` SYMBOL SEARCH: '${q}' (${matches.length} match(es))`);
    console.log('==================================================================');
    if (matches.length === 0) {
      console.log(`  No declared symbols matching '${q}' found.`);
      return;
    }
    const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
    matches.forEach(m => {
      console.log(`\n  Symbol:    ${m.signature}`);
      console.log(`  Defined:   ${m.file} (${m.kind})`);
      const defNode = nodes.find(n => n.relPath === m.file);
      if (defNode && Array.isArray(defNode.inbound)) {
        const needle = `${String(m.name || '').toLowerCase()}(`;
        const callers = defNode.inbound.filter(c => String(c.reason || '').toLowerCase().includes(needle));
        if (callers.length > 0) {
          console.log('  Called By:');
          callers.forEach(c => console.log(`    <- ${c.source} (${c.reason})`));
        }
      }
    });
    console.log('');
    return;
  }

  // 3. SEARCH RESOURCE SUPPLY CHAIN (-Resource / --resource)
  if (opts.resource) {
    const q = opts.resource.trim();
    const matches = searchResources(graph, q);
    if (opts.json) {
      console.log(JSON.stringify(matches, null, 2));
      return;
    }
    console.log('\n==================================================================');
    console.log(` RESOURCE SUPPLY CHAIN SEARCH: '${q}' (${matches.length} tag(s))`);
    console.log('==================================================================');
    if (matches.length === 0) {
      console.log(`  No resource tags matching '${q}' found.`);
      return;
    }
    matches.forEach(sc => {
      console.log(`\n  Tag: [${sc.tag}]`);
      if (Array.isArray(sc.providers) && sc.providers.length > 0) {
        console.log(`    Providers (${sc.providers.length}):`);
        sc.providers.forEach(p => console.log(`      + ${p}`));
      } else {
        console.log('    Providers: (None - Orphan Requirement)');
      }
      if (Array.isArray(sc.consumers) && sc.consumers.length > 0) {
        console.log(`    Consumers (${sc.consumers.length}):`);
        sc.consumers.forEach(c => console.log(`      - ${c}`));
      } else {
        console.log('    Consumers: (None)');
      }
    });
    console.log('');
    return;
  }

  // 3b. MODULE ATLAS (-Module / --module)
  if (opts.module) {
    const { module: mod, candidates } = findModule(graph, opts.module);
    if (!mod) {
      if (candidates.length > 1) {
        console.error(`'${opts.module}' matches ${candidates.length} modules: ${candidates.join(', ')}`);
        process.exit(1);
      }
      const fb = fallbackModuleFromNodes(graph, opts.module);
      if (!fb) {
        console.error(getModuleAtlas(graph)
          ? `No module matching '${opts.module}' in the module atlas.`
          : `No module matching '${opts.module}' (module atlas unavailable: ${(graph.moduleAtlas && graph.moduleAtlas.reason) || 'rebuild with Build-Suite.ps1'}).`);
        process.exit(1);
      }
      if (opts.json) { console.log(JSON.stringify(Object.assign({ atlas: false }, fb), null, 2)); return; }
      console.log(`\n MODULE: ${fb.id} (contracts only; module atlas unavailable: ${(graph.moduleAtlas && graph.moduleAtlas.reason) || 'not built'})`);
      console.log(` File: ${fb.file}`);
      fb.provides.forEach(p => console.log(`  + ${p.tag.padEnd(36)} -> ${p.consumers.join(', ') || '(none)'}`));
      fb.requires.forEach(r => console.log(`  - ${r.tag.padEnd(36)} <- ${r.providers.join(', ') || '(ORPHAN)'}`));
      console.log('');
      return;
    }
    if (opts.json) { console.log(JSON.stringify(mod, null, 2)); return; }
    console.log(formatModuleReport(mod));
    return;
  }

  // 3c. CHAIN ATLAS (-Chain / --chain)
  if (opts.chain) {
    const atlas = getModuleAtlas(graph);
    if (!atlas) {
      console.error(`Chain queries need the module atlas (unavailable: ${(graph.moduleAtlas && graph.moduleAtlas.reason) || 'rebuild with Build-Suite.ps1'}).`);
      process.exit(1);
    }
    const { chain, candidates } = findChain(graph, opts.chain);
    if (!chain) {
      console.error(candidates.length > 1
        ? `'${opts.chain}' matches ${candidates.length} chains: ${candidates.join(', ')}`
        : `No chain matching '${opts.chain}'. Known: ${atlas.chains.map(c => c.id).join(', ')}`);
      process.exit(1);
    }
    if (opts.json) { console.log(JSON.stringify(chain, null, 2)); return; }
    console.log(formatChainReport(chain, atlas));
    return;
  }

  // 4. CHECK GRAPH & SERIES INTEGRITY (-Check / --check, or legacy -Stale / --stale)
  if (opts.check || opts.stale) {
    const report = checkGraphIntegrity(graph);
    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
      if (!report.ok) process.exit(1);
      return;
    }
    console.log('\n==================================================================');
    console.log(` CODEBASE GRAPH & SERIES INTEGRITY (${report.ok ? 'OK' : 'FAILED'})`);
    console.log('==================================================================');
    console.log(`  Indexed Nodes:         ${report.totalFiles}`);
    console.log(`  Indexed Symbols:       ${report.totalSymbols}`);
    console.log(`  Resource Supply Tags:  ${report.totalSupplyChains}`);
    console.log(`  Module Atlas:          ${report.moduleAtlas.available
      ? `${report.moduleAtlas.modules} modules, ${report.moduleAtlas.chains} chains, ${report.moduleAtlas.tags} tags`
      : `unavailable (${report.moduleAtlas.reason})`}`);
    if (report.errors.length > 0) {
      console.log('\n  [ERRORS]');
      report.errors.forEach(e => console.log(`    - ${e}`));
    }
    if (report.warnings.length > 0) {
      console.log(`\n  [SERIES LINK WARNINGS (${report.warnings.length})]`);
      report.warnings.forEach(w => console.log(`    - ${w}`));
    }
    console.log('');
    if (!report.ok) process.exit(1);
    return;
  }

  // DEFAULT SUMMARY & USAGE
  console.log('\n==================================================================');
  console.log(' CREATOR STUDIO - ZERO-TOKEN CODEBASE GRAPH INSPECTOR');
  console.log('==================================================================');
  console.log(` Generated At:       ${graph.generatedAt}`);
  console.log(` Tracked Files:      ${graph.totalFiles}`);
  console.log(` Bidirectional Edges:${graph.totalBidirectionalEdges}`);
  console.log(` Indexed Symbols:    ${(graph.symbols || []).length}`);
  console.log(` Supply-Chain Tags:  ${(graph.supplyChains || []).length}`);
  const atlas = getModuleAtlas(graph);
  console.log(` Module Atlas:       ${atlas ? `${atlas.modules.length} modules, ${atlas.chains.length} chains, ${atlas.tags.length} tags` : 'unavailable'}`);
  console.log('\nUsage Examples:');
  console.log('  node scripts/find_codebase_node.js --file "entity_core.js"');
  console.log('  node scripts/find_codebase_node.js --symbol "openEntityManager"');
  console.log('  node scripts/find_codebase_node.js --resource "timber"');
  console.log('  node scripts/find_codebase_node.js --module IND-SILVER-02 [--json]');
  console.log('  node scripts/find_codebase_node.js --chain CHAIN-SILVER [--json]');
  console.log('  node scripts/find_codebase_node.js --check\n');
}

if (require.main === module) {
  try {
    runCli();
  } catch (err) {
    console.error(`[ERROR] ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  loadGraph,
  parseCliArgs,
  findFileNode,
  searchSymbols,
  searchResources,
  getModuleAtlas,
  findModule,
  findChain,
  fallbackModuleFromNodes,
  formatModuleReport,
  formatChainReport,
  getStaleFiles,
  checkGraphIntegrity,
  runCli
};
