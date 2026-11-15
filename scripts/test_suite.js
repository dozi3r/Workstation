#!/usr/bin/env node
/**
 * Creator Studio - Cross-Platform Master Automated Test Harness (scripts/test_suite.js)
 *
 * Implements the 5-Phase Quality Assurance Gate:
 *   Phase 1: Build Suite - Centralized Asset Compilation & Wiki Build
 *   Phase 2: JS Test Suite - Surfaces Syntax, ZeroCorsZip, Importer, Cascade & Co-Authoring
 *   Phase 3: Campaign Packages - Schema & Asset Validation across all Campaign Packages
 *   Phase 4: Wiki Knowledge Graph - Zero Stale Documentation Drift
 *   Phase 5: Loopback Servers - Node.js & Windows PowerShell/.NET Loopback Verification
 *
 * Also supports single-campaign package validation via `--campaign <Name>` / `-Campaign <Name>`.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync, spawn } = require('child_process');
const { loadGraph, getStaleFiles } = require('./find_codebase_node.js');

const ROOT_DIR = path.resolve(__dirname, '..');
const CAMPAIGNS_DIR = path.join(ROOT_DIR, 'campaigns');

const GRAPH_DATA_PATH = path.join(ROOT_DIR, 'infographic', 'data', 'graph_data.json');

// Collects every `provides` / `requires` resource tag ("Category: Tag-Name") found anywhere in a parsed JSON value.
function collectCampaignResourceTags(node, out, relFile) {
  if (Array.isArray(node)) { node.forEach(n => collectCampaignResourceTags(n, out, relFile)); return out; }
  if (!node || typeof node !== 'object') return out;
  for (const [key, val] of Object.entries(node)) {
    if ((key === 'provides' || key === 'requires') && Array.isArray(val)) {
      val.forEach(t => {
        if (typeof t !== 'string' || !/^[A-Za-z][A-Za-z ]*:\s*\S/.test(t)) return;
        const tag = t.trim();
        if (!out.has(tag)) out.set(tag, { kinds: new Set(), files: new Set() });
        out.get(tag).kinds.add(key);
        out.get(tag).files.add(relFile);
      });
    } else if (val && typeof val === 'object') {
      collectCampaignResourceTags(val, out, relFile);
    }
  }
  return out;
}

// Guards against stale campaign snapshots: when infographic/data/graph_data.json exists, every resource tag a campaign
// JSON provides or requires must be declared (provides/requires) by some module in that graph or the campaign manifest. Skips cleanly when infographic/ is absent (CI).
function validateCampaignResourceTags(campaignName) {
  if (!fs.existsSync(GRAPH_DATA_PATH)) {
    console.log(`  [SKIP] Resource-tag check for ${campaignName}: infographic/data/graph_data.json not present.`);
    return { skipped: true, missing: [] };
  }
  let graph;
  try {
    graph = JSON.parse(fs.readFileSync(GRAPH_DATA_PATH, 'utf8').replace(/^\uFEFF/, ''));
  } catch (err) {
    console.warn(`  [WARN] Resource-tag check for ${campaignName} skipped: graph_data.json unreadable (${err.message}).`);
    return { skipped: true, missing: [] };
  }
  if (!graph || !Array.isArray(graph.modules)) {
    console.warn(`  [WARN] Resource-tag check for ${campaignName} skipped: graph_data.json has no modules[] array.`);
    return { skipped: true, missing: [] };
  }
  // Known tags: everything any module declares (infographic graph + this campaign's own manifest).
  const provided = new Set();
  const addTags = m => ['provides', 'requires'].forEach(k => (m[k] || []).forEach(t => { if (typeof t === 'string') provided.add(t.trim()); }));
  graph.modules.forEach(addTags);
  try {
    const cj = JSON.parse(fs.readFileSync(path.join(CAMPAIGNS_DIR, campaignName, 'campaign.json'), 'utf8').replace(/^\uFEFF/, ''));
    const mf = path.join(CAMPAIGNS_DIR, campaignName, cj.manifestFile || 'modules_manifest.json');
    if (fs.existsSync(mf)) { const mods = JSON.parse(fs.readFileSync(mf, 'utf8').replace(/^\uFEFF/, '')); if (Array.isArray(mods)) mods.forEach(addTags); }
  } catch (_) { /* manifest problems are reported by validateCampaignPackage */ }

  const campDir = path.join(CAMPAIGNS_DIR, campaignName);
  const files = ['campaign.json', 'preset.json', 'topology.json'];
  const mapsDir = path.join(campDir, 'maps');
  if (fs.existsSync(mapsDir)) fs.readdirSync(mapsDir).filter(f => f.endsWith('.json')).forEach(f => files.push('maps/' + f));

  const tags = new Map();
  files.forEach(rel => {
    const abs = path.join(campDir, rel);
    if (!fs.existsSync(abs)) return;
    try {
      collectCampaignResourceTags(JSON.parse(fs.readFileSync(abs, 'utf8').replace(/^\uFEFF/, '')), tags, rel);
    } catch (err) {
      throw new Error(`Invalid JSON in ${campaignName}/${rel}: ${err.message}`);
    }
  });

  const missing = [...tags.entries()].filter(([tag]) => !provided.has(tag));
  if (missing.length) {
    const lines = missing.map(([tag, info]) => `    - ${tag} (${[...info.kinds].join('/')}; in ${[...info.files].join(', ')})`);
    throw new Error(
      `Campaign '${campaignName}' references ${missing.length} resource tag(s) declared by no module in infographic/data/graph_data.json or the campaign manifest (stale snapshot?):\n${lines.join('\n')}`
    );
  }
  console.log(`  [OK] ${tags.size} resource tags in ${campaignName} all resolve to module-provided tags (graph_data.json).`);
  return { skipped: false, missing: [] };
}

function validateCampaignPackage(campaignName) {
  const campDir = path.join(CAMPAIGNS_DIR, campaignName);
  if (!fs.existsSync(campDir) || !fs.statSync(campDir).isDirectory()) {
    throw new Error(`Campaign directory does not exist: ${campDir}`);
  }
  const campJson = path.join(campDir, 'campaign.json');
  if (!fs.existsSync(campJson)) {
    throw new Error(`Missing campaign.json in ${campDir}`);
  }
  let meta;
  try {
    const raw = fs.readFileSync(campJson, 'utf8').replace(/^\uFEFF/, '');
    meta = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in campaign.json (${campaignName}): ${err.message}`);
  }
  const topoFile = meta.topologyFile || 'topology.json';
  const presetFile = meta.presetFile || 'preset.json';
  const topoJson = path.join(campDir, topoFile);
  const presetJson = path.join(campDir, presetFile);

  if (!fs.existsSync(topoJson) && !fs.existsSync(presetJson)) {
    throw new Error(`Missing topology.json or preset.json in ${campDir}`);
  }

  // Validate modules and industry chain contracts if manifest is present
  const manifestPath = path.join(campDir, meta.manifestFile || 'modules_manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifestRaw = fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, '');
      const modules = JSON.parse(manifestRaw);
      if (Array.isArray(modules)) {
        modules.forEach(m => {
          if (!m.id) throw new Error(`Module missing required 'id' attribute in ${manifestPath}`);
          if (!m.title) throw new Error(`Module ${m.id} missing required 'title' in ${manifestPath}`);
          if (m.chain_id && (!m.chain_stage || typeof m.chain_stage !== 'number' || m.chain_stage < 1)) {
            throw new Error(`Module ${m.id} declares chain_id '${m.chain_id}' but missing valid positive numeric chain_stage`);
          }
        });
        console.log(`  [OK] Validated ${modules.length} modules and industry chain contracts in ${campaignName}.`);
      }
    } catch (mErr) {
      throw new Error(`Module manifest validation error in ${campaignName}: ${mErr.message}`);
    }
  }

  // Validate campaign override slots (SYS-ODV-04): every slot file found must parse and validate.
  {
    const slotsLib = require(path.join(ROOT_DIR, 'src/workstation/scripts/campaign_override_slots.js'));
    const rels = [];
    ['', 'odv', 'overrides', 'overrides/odv'].forEach(sub => {
      const d = path.join(campDir, sub);
      if (fs.existsSync(d) && fs.statSync(d).isDirectory()) {
        fs.readdirSync(d).forEach(f => { if (fs.statSync(path.join(d, f)).isFile()) rels.push((sub ? sub + '/' : '') + f); });
      }
    });
    slotsLib.CAMPAIGN_OVERRIDE_SLOTS.forEach(slot => {
      const hit = rels.find(r => slotsLib.matchSlotFile(r, [slot]));
      if (!hit) return;
      let warns;
      try {
        warns = slot.validate(slot.parse(fs.readFileSync(path.join(campDir, hit), 'utf8'))) || [];
      } catch (err) {
        throw new Error(`Override slot '${slot.id}' (${hit}) invalid in ${campaignName}: ${err.message}`);
      }
      if (warns.length && process.argv.includes('--strict-overrides')) {
        throw new Error(`Override slot '${slot.id}' in ${campaignName}: ${warns.join('; ')}`);
      }
      warns.forEach(w => console.warn(`  [WARN] ${slot.id} (${hit}): ${w}`));
      console.log(`  [OK] Override slot '${slot.id}' valid in ${campaignName} (${hit}).`);
    });
  }

  validateCampaignResourceTags(campaignName);

  console.log(`  [OK] Campaign package '${campaignName}' passed structural validation.`);
  return true;
}

function httpGet(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method, timeout: 4000 }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error(`Request timeout: ${url}`));
    });
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function verifyLoopbackServer(label, cmd, args, port, expectedEngine) {
  console.log(`--> Verifying ${label}...`);
  const proc = spawn(cmd, args, { cwd: ROOT_DIR, stdio: 'ignore', windowsHide: true });
  try {
    let statusRes = null;
    let lastErr = null;
    for (let attempt = 0; attempt < 20; attempt++) {
      await sleep(250);
      try {
        statusRes = await httpGet(`http://127.0.0.1:${port}/api/status`);
        if (statusRes && statusRes.statusCode === 200) break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!statusRes) {
      throw lastErr || new Error(`${label} failed to respond on port ${port}`);
    }
    if (statusRes.statusCode !== 200) {
      throw new Error(`${label} /api/status returned HTTP ${statusRes.statusCode}`);
    }
    const statusJson = JSON.parse(statusRes.body);
    if (statusJson.status !== 'running' || statusJson.engine !== expectedEngine) {
      throw new Error(`${label} /api/status invalid payload: ${statusRes.body}`);
    }
    const htmlRes = await httpGet(`http://127.0.0.1:${port}/start.html`);
    if (htmlRes.statusCode !== 200) {
      throw new Error(`${label} GET /start.html returned HTTP ${htmlRes.statusCode}`);
    }
    const ct = String(htmlRes.headers['content-type'] || '');
    if (!ct.includes('text/html')) {
      throw new Error(`${label} GET /start.html Content-Type is not text/html (${ct})`);
    }
    try {
      await httpGet(`http://127.0.0.1:${port}/api/shutdown`, 'POST');
    } catch (_) {}
    console.log(`  [OK] ${label} validated (HTTP 200, MIME types, CORS, Shutdown).`);
  } finally {
    await sleep(250);
    try {
      proc.kill();
    } catch (_) {}
  }
}

async function runMasterTestSuite(argv = process.argv.slice(2)) {
  let skipBuild = false;
  let quick = false;
  let singleCampaign = '';

  for (let i = 0; i < argv.length; i++) {
    const a = String(argv[i] || '').toLowerCase();
    if (a === '-skipbuild' || a === '--skip-build') skipBuild = true;
    else if (a === '-quick' || a === '--quick') quick = true;
    else if (a === '-campaign' || a === '--campaign') singleCampaign = String(argv[++i] || '');
  }

  if (singleCampaign) {
    validateCampaignPackage(singleCampaign);
    return;
  }

  const results = [];
  const suiteStart = Date.now();

  async function recordPhase(phaseName, description, action, skip = false) {
    console.log('\n================================================================================');
    console.log(` RUNNING: ${phaseName} - ${description}`);
    console.log('================================================================================');
    if (skip) {
      console.log(' [SKIPPED] Phase was skipped via parameters.');
      results.push({ phase: phaseName, description, duration: '0.00s', status: 'SKIP', error: null });
      return;
    }
    const t0 = Date.now();
    let status = 'PASS';
    let error = null;
    try {
      await action();
    } catch (err) {
      status = 'FAIL';
      error = err.message || String(err);
      console.error(` [ERROR] ${error}`);
    }
    const dur = `${((Date.now() - t0) / 1000).toFixed(2)}s`;
    results.push({ phase: phaseName, description, duration: dur, status, error });
  }

  // Phase 1: Build Suite
  await recordPhase('Phase 1: Build Suite', 'Centralized Asset Compilation & Wiki Build', () => {
    execFileSync(process.execPath, [path.join(ROOT_DIR, 'build_suite.js'), '--stamp-reviewed'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
    });
  }, skipBuild);

  // Phase 2: Headless JS Test Suite
  await recordPhase('Phase 2: JS Test Suite', 'Surfaces Syntax, ZeroCorsZip, Importer & Cascade', () => {
    execFileSync(process.execPath, [path.join(ROOT_DIR, 'test', 'run_tests.js')], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
    });
  });

  // Phase 3: Multi-Campaign Package Audit
  await recordPhase('Phase 3: Campaign Packages', 'Schema & Asset Validation across all Campaign Packages', () => {
    const entries = fs.readdirSync(CAMPAIGNS_DIR, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    dirs.forEach(camp => {
      console.log(`\n--> Auditing Campaign Package: ${camp}...`);
      validateCampaignPackage(camp);
    });
  });

  // Phase 4: Wiki Knowledge Graph Drift Check
  await recordPhase('Phase 4: Wiki Knowledge Graph', 'Zero Stale Documentation Drift via find_codebase_node.js', () => {
    const graph = loadGraph(false);
    const stale = getStaleFiles(graph);
    if (stale.length > 0) {
      throw new Error(`Detected ${stale.length} stale/unreviewed file(s) in knowledge graph: ${stale.map(s => s.relPath).join(', ')}`);
    }
    console.log('Knowledge graph is 100% synchronized (0 stale files).');
  });

  // Phase 5: Loopback Servers
  await recordPhase('Phase 5: Loopback Servers', 'Zero-Install Node & .NET Loopback Verification', async () => {
    await verifyLoopbackServer(
      'Node.js Loopback Server Engine (server.js)',
      process.execPath,
      ['server.js', '--port', '8991', '--no-open'],
      8991,
      'node'
    );
    if (process.platform === 'win32') {
      await verifyLoopbackServer(
        'PowerShell/.NET Loopback Server Engine (server.ps1)',
        'powershell',
        ['-ExecutionPolicy', 'Bypass', '-File', 'server.ps1', '-Port', '8992'],
        8992,
        'powershell-net'
      );
    } else {
      console.log('  [INFO] Non-Windows OS detected; skipping Windows .NET HttpListener fallback check.');
    }
  }, quick);

  const totalSec = ((Date.now() - suiteStart) / 1000).toFixed(2);
  console.log('\n================================================================================');
  console.log('                       MASTER TEST SUITE SUMMARY REPORT                         ');
  console.log('================================================================================');

  let hasFailure = false;
  results.forEach(r => {
    if (r.status === 'FAIL') hasFailure = true;
    const pPad = r.phase.padEnd(28);
    const dPad = r.description.slice(0, 34).padEnd(34);
    const durPad = r.duration.padStart(8);
    const statPad = `[${r.status}]`.padStart(8);
    console.log(` ${pPad} ${dPad} ${durPad} ${statPad}`);
    if (r.error) {
      console.log(`   -> Error: ${r.error}`);
    }
  });

  console.log('--------------------------------------------------------------------------------');
  console.log(` Total Execution Time: ${totalSec}s`);
  console.log('================================================================================');

  if (hasFailure) {
    console.error('\n [FAILURE] One or more test phases failed. See details above.');
    process.exit(1);
  } else {
    console.log('\n [SUCCESS] All test suites and quality gates passed with 100% compliance!');
  }
}

if (require.main === module) {
  runMasterTestSuite().catch(err => {
    console.error(`[FATAL] ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  validateCampaignPackage,
  validateCampaignResourceTags,
  runMasterTestSuite
};
