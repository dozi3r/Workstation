#!/usr/bin/env node
'use strict';

// Read-only, bounded onboarding retrieval. The index contains paths and dated hashes,
// never source bodies, conversion contents, credentials, or a complete Git log.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const indexFile = path.join(root, 'docs/agents/context-index.json');
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const absolute = relative => {
  const file = path.resolve(root, relative);
  const rel = path.relative(root, file);
  if (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) {
    throw new Error('Context index path must stay inside the project: ' + relative);
  }
  return file;
};

function gitState() {
  try {
    const run = args => execFileSync('git', args, {
      cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 4 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe']
    }).trimEnd();
    const changes = run(['status', '--porcelain=v1', '--untracked-files=normal']);
    const entries = changes ? changes.split(/\r?\n/) : [];
    const counts = {};
    for (const line of entries) {
      const state = line.slice(0, 2).trim();
      counts[state] = (counts[state] || 0) + 1;
    }
    return { head: run(['rev-parse', 'HEAD']), branch: run(['branch', '--show-current']), statusCounts: counts };
  } catch (error) {
    return { unavailable: true, reason: error.code || 'git command failed' };
  }
}

function freshness() {
  const missing = [], changed = [];
  for (const entry of index.fingerprints) {
    const file = absolute(entry.path);
    if (!fs.existsSync(file)) missing.push(entry.path);
    else if (digest(file) !== entry.sha256) changed.push(entry.path);
  }
  return { referenceDate: index.verifiedOn, watchedFiles: index.fingerprints.length, changed, missing };
}

function check() {
  const errors = [];
  for (const route of index.routes) {
    for (const relative of [...route.sources, ...route.read]) {
      if (!fs.existsSync(absolute(relative))) errors.push(`Missing route ${route.id}: ${relative}`);
    }
  }
  let links = 0;
  for (const relative of index.documents) {
    const file = absolute(relative);
    if (!fs.existsSync(file)) { errors.push(`Missing document: ${relative}`); continue; }
    const text = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const match of text.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
      let target = match[1].trim();
      if (/^(?:[a-z]+:|#)/i.test(target)) continue;
      target = target.replace(/^<|>$/g, '').split('#')[0];
      if (!target) continue;
      try {
        target = decodeURIComponent(target);
        links++;
        if (!fs.existsSync(path.resolve(path.dirname(file), target))) errors.push(`Broken link in ${relative}: ${target}`);
      } catch { errors.push(`Invalid link in ${relative}: ${target}`); }
    }
  }
  const startup = fs.readFileSync(absolute('docs/agents/START_HERE.md'), 'utf8');
  const words = startup.trim().split(/\s+/).length;
  if (words > 800) errors.push(`Startup map exceeds 800-word budget: ${words}`);
  const fresh = freshness();
  errors.push(...fresh.missing.map(file => `Missing fingerprint target: ${file}`));
  console.log(JSON.stringify({ checkedDocuments: index.documents.length, localLinks: links,
    routes: index.routes.length, startupWords: words, startupApproxTokens: Math.ceil(startup.length / 4),
    errors, freshness: fresh,
    limits: 'Checks local link targets, not anchors, prose accuracy, behavior, or the full codebase. Hash drift requires review; it does not auto-update the baseline.'
  }, null, 2));
  process.exitCode = errors.length ? 1 : 0;
}

const [command, argument] = process.argv.slice(2);
if (command === '--status') {
  console.log(JSON.stringify({ git: gitState(), freshness: freshness(),
    next: 'Read docs/agents/START_HERE.md, then select one --route. Changed hashes are a review signal, not a test failure.'
  }, null, 2));
} else if (command === '--route') {
  const route = index.routes.find(item => item.id === argument);
  if (!route) { console.error(`Choose route: ${index.routes.map(item => item.id).join(', ')}`); process.exitCode = 1; }
  else console.log(JSON.stringify(route, null, 2));
} else if (command === '--check') {
  check();
} else if (command) {
  console.error(`Unknown option: ${command}. Use --status, --route <id>, or --check.`);
  process.exitCode = 1;
} else {
  console.log('Read-only context helper: --status | --route <id> | --check');
  console.log(`Routes: ${index.routes.map(item => item.id).join(', ')}`);
}
