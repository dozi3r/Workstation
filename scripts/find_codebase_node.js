#!/usr/bin/env node
/**
 * Creator Studio - Cross-Platform Zero-Token Codebase Graph Inspector (scripts/find_codebase_node.js)
 *
 * Queries wiki/wiki_graph.json (compiled deterministically by wiki/build_wiki.js)
 * to inspect file blast radius, inbound backlinks, outbound dependencies,
 * declared functions/symbols, module resource supply chains (provides/requires),
 * and documentation drift without consuming LLM tokens or grepping the workspace.
 *
 * Supports both POSIX (--file, --symbol, --resource, --stale, --json)
 * and PowerShell (-File, -Symbol, -Resource, -Stale, -Json) flags.
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
  const opts = { file: '', symbol: '', resource: '', stale: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = String(argv[i] || '');
    const lower = arg.toLowerCase();
    if (lower === '-file' || lower === '--file') {
      opts.file = String(argv[++i] || '');
    } else if (lower === '-symbol' || lower === '--symbol') {
      opts.symbol = String(argv[++i] || '');
    } else if (lower === '-resource' || lower === '--resource') {
      opts.resource = String(argv[++i] || '');
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

function getStaleFiles(graph) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  return nodes.filter(n => n.stale === true);
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
    const syncLabel = node.stale ? `STALE (Reviewed SHA: ${node.reviewedHash})` : 'SYNCED';
    console.log('\n==================================================================');
    console.log(` CODEBASE NODE: ${node.relPath}`);
    console.log('==================================================================');
    console.log(` Title:    ${node.title}`);
    console.log(` Kind:     ${node.kind} (${node.volume})`);
    console.log(` Metrics:  ${node.lineCount} lines | ${node.sizeBytes} bytes | SHA: ${node.hash}`);
    console.log(` Wiki:     ${syncLabel} (wiki/src/files/${node.relPath}.md)`);

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

  // 4. LIST STALE FILES (-Stale / --stale)
  if (opts.stale) {
    const staleNodes = getStaleFiles(graph);
    if (opts.json) {
      const compact = staleNodes.map(s => ({
        relPath: s.relPath,
        title: s.title,
        hash: s.hash,
        reviewedHash: s.reviewedHash
      }));
      console.log(JSON.stringify(compact, null, 2));
      return;
    }
    console.log('\n==================================================================');
    console.log(` WIKI DRIFT / STALE FILES (${staleNodes.length} file(s))`);
    console.log('==================================================================');
    if (staleNodes.length === 0) {
      console.log(`  All ${graph.totalFiles} tracked files are in sync with their wiki documentation!`);
    } else {
      staleNodes.forEach(s => {
        console.log(`  [STALE] ${String(s.relPath).padEnd(52)} (Current: ${s.hash} != Reviewed: ${s.reviewedHash})`);
      });
      console.log('\n  Tip: Update wiki/src/files/<relPath>.md and run:');
      console.log('       node build_suite.js --stamp-reviewed\n');
    }
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
  console.log(` Stale Files:        ${graph.staleCount}`);
  console.log('\nUsage Examples:');
  console.log('  node scripts/find_codebase_node.js --file "entity_core.js"');
  console.log('  node scripts/find_codebase_node.js --symbol "openEntityManager"');
  console.log('  node scripts/find_codebase_node.js --resource "timber"');
  console.log('  node scripts/find_codebase_node.js --stale\n');
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
  getStaleFiles,
  runCli
};
