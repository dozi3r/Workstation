/**
 * BUILD SUITE - Centralized Asset Compiler, Zero-CORS Bundler & Agent Navigation Engine
 * Authority: ADR-0001, ADR-0002, docs/navigation_manifest.json
 * 
 * Functions:
 * 1. Generates AGENTS.md router at workspace root from docs/navigation_manifest.json.
 * 2. Injects / updates standardized Compass Headers at line 1 of all surface files.
 * 3. Validates authoritative module manifest (network/modules_manifest.json).
 * 4. Inlines authoritative datasets into standalone offline HTML distributions.
 * 5. Ensures 100% offline, zero-CORS file:/// execution across all tools.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const NETWORK_DIR = path.join(ROOT_DIR, 'network');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const SRC_WORKSTATION_DIR = path.join(ROOT_DIR, 'src', 'workstation');

// ------------------------------------------------------------------------------
// PORTABLE FILE URL HELPERS (Tech Debt Wave 0)
// file_url values are stored ROOT-RELATIVE (e.g. "campaigns/x/modules/y.md") so the
// repo can be cloned/moved anywhere. Surfaces nested in subfolders (network/*.html)
// receive a depth prefix ("../") at injection time via rebaseFileUrls().
// ------------------------------------------------------------------------------
function toRootRelUrl(absPath) {
  return path.relative(ROOT_DIR, absPath).replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/');
}
function rebaseFileUrls(jsonStr, prefix) {
  // Prefix only non-empty, relative (no scheme, not already ../ or /) file_url values.
  return jsonStr.replace(/("file_url"\s*:\s*")(?![a-zA-Z][a-zA-Z0-9+.-]*:|\/|\.\.\/)(?=[^"])/g, `$1${prefix}`);
}

function safeWriteFileSync(filePath, data, encoding = 'utf8') {
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      return fs.writeFileSync(filePath, data, encoding);
    } catch (err) {
      if ((err.code === 'EBUSY' || err.code === 'UNKNOWN' || err.code === 'EPERM' || err.errno === -4094) && attempt < 10) {
        const waitMs = attempt * 200;
        const end = Date.now() + waitMs;
        while (Date.now() < end) {}
        continue;
      }
      throw err;
    }
  }
}

// ------------------------------------------------------------------------------
// MODULE YAML & MARKDOWN EXTRACTION HELPERS (Stage 1B Shared Pipeline)
// ------------------------------------------------------------------------------
function parseYamlListOrArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const str = String(val).trim();
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return str.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
  }
  return str.split('\n').map(l => l.replace(/^[-*]\s*/, '').trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

function parseYamlScalar(rawVal) {
  if (rawVal === null || rawVal === undefined) return '';
  const trimmed = String(rawVal).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return parseYamlListOrArray(trimmed);
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)) {
    const quote = trimmed[0];
    let inner = trimmed.slice(1, -1);
    if (quote === '"') {
      inner = inner.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
    } else {
      inner = inner.replace(/''/g, "'");
    }
    return inner;
  }
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null' || trimmed === '~') return null;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function parseYamlFrontmatter(yamlBlock) {
  const root = {};
  if (!yamlBlock || typeof yamlBlock !== 'string') return root;
  const rawLines = yamlBlock.replace(/\r\n/g, '\n').split('\n');
  const items = [];
  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = raw.match(/^(\s*)/)[1].length;
    items.push({ raw, trimmed, indent });
  }

  const stack = [{ type: 'object', container: root, indent: -1 }];

  for (let i = 0; i < items.length; i++) {
    const { trimmed, indent } = items[i];
    const nextItem = items[i + 1] || null;

    while (stack.length > 1) {
      const top = stack[stack.length - 1];
      if (top.type === 'array') {
        const isDashAtArrayIndent = trimmed.startsWith('- ') || trimmed === '-';
        if (indent > top.indent || (indent === top.indent && isDashAtArrayIndent)) break;
        stack.pop();
      } else {
        if (indent > top.indent) break;
        stack.pop();
      }
    }

    const currentFrame = stack[stack.length - 1];

    if (trimmed.startsWith('- ') || trimmed === '-') {
      if (currentFrame.type !== 'array') continue;
      const afterDash = trimmed === '-' ? '' : trimmed.slice(2).trim();
      const objInListMatch = afterDash.match(/^([A-Za-z0-9_.-]+)\s*:(?:\s+(.*))?$/);
      if (objInListMatch && !/^https?:\/\//i.test(afterDash)) {
        const key = objInListMatch[1].trim();
        const valRaw = (objInListMatch[2] !== undefined ? objInListMatch[2] : '').trim();
        const itemObj = {};
        currentFrame.container.push(itemObj);
        stack.push({ type: 'object', container: itemObj, indent });
        if (valRaw !== '') {
          itemObj[key] = parseYamlScalar(valRaw);
        } else if (nextItem && nextItem.indent > indent + 2) {
          const isNestedList = nextItem.trimmed.startsWith('- ') || nextItem.trimmed === '-';
          const child = isNestedList ? [] : {};
          itemObj[key] = child;
          stack.push({
            type: isNestedList ? 'array' : 'object',
            container: child,
            indent: isNestedList ? nextItem.indent : (indent + 2)
          });
        } else {
          itemObj[key] = '';
        }
      } else {
        currentFrame.container.push(parseYamlScalar(afterDash));
      }
      continue;
    }

    const kvMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\s*:(?:\s+(.*))?$/);
    if (kvMatch && currentFrame.type === 'object') {
      const key = kvMatch[1].trim();
      const valRaw = (kvMatch[2] !== undefined ? kvMatch[2] : '').trim();
      if (valRaw !== '') {
        currentFrame.container[key] = parseYamlScalar(valRaw);
      } else if (nextItem && (nextItem.indent > indent || (nextItem.indent === indent && (nextItem.trimmed.startsWith('- ') || nextItem.trimmed === '-')))) {
        const isChildList = nextItem.trimmed.startsWith('- ') || nextItem.trimmed === '-';
        const child = isChildList ? [] : {};
        currentFrame.container[key] = child;
        stack.push({
          type: isChildList ? 'array' : 'object',
          container: child,
          indent: isChildList ? nextItem.indent : indent
        });
      } else {
        currentFrame.container[key] = '';
      }
    }
  }

  return root;
}

function stripMarkdownNoise(text) {
  if (!text) return '';
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$([^$\n]+)\$/g, (_, inner) => inner.replace(/\\text\{([^}]*)\}/g, '$1'))
    .replace(/<\/?Agent\s+System\s+Instructions>/gi, ' ')
    .replace(/^<[^>]+>\s*$/gm, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*[-*_]{3,}\s*$/gm, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/[│┌┐└┘├┤┬┴┼▲▼►◄──•]+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function truncateClean(text, maxLen = 700) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean || clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen);
  const lastStop = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('; '));
  if (lastStop > maxLen * 0.5) return slice.slice(0, lastStop + 1).trim();
  return slice.trim() + '...';
}

function extractMarkdownSections(rawMarkdown) {
  if (!rawMarkdown) return { body: '', preamble: '', sections: [] };
  const body = String(rawMarkdown)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/^---\n[\s\S]*?\n---\n?/, '');
  const lines = body.split('\n');
  const sections = [];
  let current = null;
  const preambleLines = [];
  let seenSubheading = false;

  for (const line of lines) {
    const hMatch = line.match(/^(#{1,4})\s+(.+?)\s*$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const title = hMatch[2].trim();
      if (level === 1 && !seenSubheading) {
        continue;
      }
      seenSubheading = true;
      if (current) {
        current.text = current.lines.join('\n').trim();
        current.cleanText = stripMarkdownNoise(current.text);
        sections.push(current);
      }
      current = {
        level,
        title,
        normTitle: title.replace(/^\d+(?:\.\d+)?\.?\s*/, '').toLowerCase(),
        lines: []
      };
    } else if (current) {
      current.lines.push(line);
    } else {
      preambleLines.push(line);
    }
  }
  if (current) {
    current.text = current.lines.join('\n').trim();
    current.cleanText = stripMarkdownNoise(current.text);
    sections.push(current);
  }
  const preamble = stripMarkdownNoise(
    preambleLines.filter(l => !/^\*Domain:|^#/.test(l.trim())).join('\n')
  );
  return { body, preamble, sections };
}

function extractDialFromData(m, parsedMd) {
  const im = (m && m.injected_mechanics && typeof m.injected_mechanics === 'object') ? m.injected_mechanics : {};
  let dialObj = null;
  let dialKey = null;

  const hasLevelKeys = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj) &&
    Object.keys(obj).some(k => /^level_\d+$/i.test(k));

  if (hasLevelKeys(m && m.output_dial)) {
    dialObj = m.output_dial;
    dialKey = (m && m.output_dial_key) || 'output_dial';
  } else if (hasLevelKeys(im.output_dial)) {
    dialObj = im.output_dial;
    dialKey = 'output_dial';
  } else {
    for (const k of Object.keys(im)) {
      if (/_dial$/i.test(k) && hasLevelKeys(im[k])) {
        dialObj = im[k];
        dialKey = k;
        break;
      }
    }
    if (!dialObj && hasLevelKeys(im)) {
      dialObj = {
        ...(im.level_1 !== undefined ? { level_1: im.level_1 } : {}),
        ...(im.level_2 !== undefined ? { level_2: im.level_2 } : {}),
        ...(im.level_3 !== undefined ? { level_3: im.level_3 } : {}),
        ...(im.level_4 !== undefined ? { level_4: im.level_4 } : {})
      };
      dialKey = 'injected_mechanics';
    }
  }

  const normalizedDial = {};
  if (dialObj) {
    Object.keys(dialObj).sort().forEach(k => {
      if (dialObj[k] !== undefined && dialObj[k] !== null && String(dialObj[k]).trim() !== '') {
        normalizedDial[k] = String(dialObj[k]).trim();
      }
    });
  }

  if (Object.keys(normalizedDial).length === 0 && parsedMd && parsedMd.body) {
    const dialSec = parsedMd.sections.find(s => /output\s*dial|dynamic\s*dial|severity\s*dial/i.test(s.title));
    const searchText = dialSec ? dialSec.text : parsedMd.body;
    const mdLines = searchText.split('\n');
    for (let i = 0; i < mdLines.length; i++) {
      const lm = mdLines[i].match(/^\s*(?:[-*]\s*)?\*{0,2}(?:level[_\s]*([1-4]))(?:\s*\(([^)]+)\))?\*{0,2}\s*:?\*{0,2}\s*(.*)$/i);
      if (!lm) continue;
      const num = lm[1];
      const header = lm[2] ? lm[2].trim() : '';
      let rest = lm[3] ? lm[3].replace(/^\*{1,2}/, '').trim() : '';
      if (!rest) {
        const subParts = [];
        for (let j = i + 1; j < Math.min(mdLines.length, i + 5); j++) {
          const nextL = mdLines[j];
          if (/^\s*#{1,4}\s+/.test(nextL) || /^\s*(?:[-*]\s*)?\*{0,2}level[_\s]*[1-4]/i.test(nextL)) break;
          if (/^\s+[-*]\s+/.test(nextL)) subParts.push(stripMarkdownNoise(nextL.replace(/^\s*[-*]\s+/, '')));
        }
        rest = subParts.join(' ');
      }
      const combined = [header, stripMarkdownNoise(rest)].filter(Boolean).join(' - ');
      if (combined) normalizedDial[`level_${num}`] = combined;
    }
    if (Object.keys(normalizedDial).length > 0 && !dialKey) dialKey = 'markdown_dial';
  }

  const formattedDials = Object.keys(normalizedDial).length > 0
    ? ['level_1', 'level_2', 'level_3', 'level_4']
        .filter(k => normalizedDial[k])
        .map(k => `Level ${k.split('_')[1]}: ${normalizedDial[k]}`)
    : (Array.isArray(m && m.dials) ? m.dials.filter(Boolean).map(String) : []);

  if (formattedDials.length === 0 && parsedMd && parsedMd.body) {
    const opSec = parsedMd.sections.find(s => /operational\s*dial|failure\s*mode/i.test(s.title));
    if (opSec && opSec.text) {
      opSec.text.split('\n').forEach(line => {
        const om = line.match(/^\s*[-*]\s*\*{0,2}Dial\s*[—–:-]\s*`?([^`*]+)`?(?:\s*\(([^)]+)\))?\*{0,2}\s*:\s*(.+)$/i);
        if (om) {
          const dialName = stripMarkdownNoise(om[1]).trim();
          const scale = om[2] ? ` (${stripMarkdownNoise(om[2])})` : '';
          const desc = stripMarkdownNoise(om[3]).trim();
          formattedDials.push(`${dialName}${scale}: ${desc}`);
        }
      });
    }
  }

  return {
    output_dial: Object.keys(normalizedDial).length > 0 ? normalizedDial : null,
    output_dial_key: dialKey,
    dials: formattedDials
  };
}

function parseSingleClockString(rawClock, fallbackKey) {
  const str = String(rawClock || '').replace(/^[-*\s]+/, '').trim();
  const tickMatch = str.match(/\[(\d+)\s*Ticks?\]/i) || str.match(/\((\d+)\s*Ticks?\)/i);
  const ticks = tickMatch ? parseInt(tickMatch[1], 10) : 4;
  let name = str.split(/\[|\(| - |:\s/)[0].replace(/\*\*/g, '').trim();
  if (!name && fallbackKey) name = String(fallbackKey).replace(/[_-]+/g, ' ').trim();
  const dashSplit = str.split(/\]\s*-?\s*|\)\s*-?\s*/);
  const trigger = dashSplit.length > 1 ? dashSplit.slice(1).join(' ').replace(/^["']|["']$/g, '').trim() : str;
  return { key: fallbackKey || null, name: name || 'Threat Clock', ticks, trigger, raw: str };
}

function extractThreatClocksFromData(m, parsedMd) {
  const im = (m && m.injected_mechanics && typeof m.injected_mechanics === 'object') ? m.injected_mechanics : {};
  const yamlClocks = (im.threat_clocks !== undefined && im.threat_clocks !== '')
    ? im.threat_clocks
    : (m && m.threat_clocks && (!Array.isArray(m.threat_clocks) || m.threat_clocks.length > 0) ? m.threat_clocks : null);

  const strings = [];
  const specs = [];

  if (Array.isArray(yamlClocks)) {
    yamlClocks.forEach((entry, idx) => {
      if (entry && typeof entry === 'object') {
        const name = String(entry.name || entry.title || `Clock ${idx + 1}`).trim();
        const ticks = entry.ticks ? parseInt(entry.ticks, 10) : 4;
        const trig = String(entry.advances_when || entry.trigger || entry.description || '').trim();
        const suffix = /\b(clock|meter)\b/i.test(name) ? '' : ' Clock';
        const formatted = `${name}${suffix} [${ticks} Ticks]${trig ? ` - Advances when: ${trig}` : ''}`;
        strings.push(formatted);
        specs.push({ key: null, name, ticks, trigger: trig, raw: formatted });
      } else if (typeof entry === 'string' && entry.trim()) {
        const parsed = parseSingleClockString(entry, null);
        strings.push(parsed.raw);
        specs.push(parsed);
      }
    });
  } else if (yamlClocks && typeof yamlClocks === 'object') {
    Object.entries(yamlClocks).forEach(([k, v]) => {
      if (v && typeof v === 'string' && v.trim()) {
        const parsed = parseSingleClockString(v, k);
        strings.push(parsed.raw);
        specs.push(parsed);
      } else if (v && typeof v === 'object') {
        const name = String(v.name || k.replace(/[_-]+/g, ' ')).trim();
        const ticks = v.ticks ? parseInt(v.ticks, 10) : 4;
        const trig = String(v.advances_when || v.trigger || v.description || '').trim();
        const formatted = `${name} [${ticks} Ticks]${trig ? ` - ${trig}` : ''}`;
        strings.push(formatted);
        specs.push({ key: k, name, ticks, trigger: trig, raw: formatted });
      }
    });
  }

  if (strings.length === 0 && parsedMd && parsedMd.body) {
    const clockSec = parsedMd.sections.find(s => /threat\s*clock|escalation.*clock/i.test(s.title));
    const searchSpace = clockSec ? clockSec.text : parsedMd.body;
    const seen = new Set();
    const matches = searchSpace.match(/([A-Za-z0-9][A-Za-z0-9\s'/-]*(?:Clock|Meter)\s*\[\d+\s*Ticks?\][^\n\r]*)/gi);
    if (matches) {
      matches.forEach(c => {
        const cleaned = stripMarkdownNoise(c).replace(/^[-*\s]+/, '').trim();
        if (cleaned && !seen.has(cleaned.toLowerCase())) {
          seen.add(cleaned.toLowerCase());
          strings.push(cleaned);
          specs.push(parseSingleClockString(cleaned, null));
        }
      });
    }
  }

  return { threat_clocks: strings, threat_clock_specs: specs };
}

function extractFourCornersFromData(m, parsedMd) {
  const existing = (m && m.four_corners && typeof m.four_corners === 'object' && !Array.isArray(m.four_corners))
    ? m.four_corners
    : ((m && m.injected_mechanics && m.injected_mechanics.four_corners && typeof m.injected_mechanics.four_corners === 'object') ? m.injected_mechanics.four_corners : null);

  if (existing && (existing.establishment || existing.opponent || existing.shadow || existing.outcast)) {
    return {
      establishment: String(existing.establishment || '').trim(),
      opponent: String(existing.opponent || '').trim(),
      shadow: String(existing.shadow || '').trim(),
      outcast: String(existing.outcast || '').trim()
    };
  }

  if (!parsedMd || !parsedMd.body) return null;
  const fcSec = parsedMd.sections.find(s => /4-?corner|four-?corner|opposition web/i.test(s.title));
  const searchText = fcSec ? fcSec.text : parsedMd.body;

  const findCorner = (roleRegex) => {
    const lines = searchText.split('\n');
    for (const line of lines) {
      const mBullet = line.match(new RegExp(`^\\s*[-*]\\s*\\*{0,2}(?:Corner\\s*\\d+\\s*:\\s*)?(?:The\\s+)?${roleRegex}(?:\\s*\\(([^)]+)\\))?\\*{0,2}\\s*:?\\*{0,2}\\s*(.+)$`, 'i'));
      if (mBullet) {
        const paren = mBullet[1] ? mBullet[1].trim() : '';
        const bodyTxt = stripMarkdownNoise(mBullet[2] || '');
        if (paren && bodyTxt) return `${paren} - ${truncateClean(bodyTxt, 180)}`;
        return truncateClean(paren || bodyTxt, 180);
      }
      const mPlain = line.match(new RegExp(`^\\s*${roleRegex}\\s*:\\s*["']?([^"'\\n\\r]+)["']?`, 'i'));
      if (mPlain) return stripMarkdownNoise(mPlain[1]).trim();
    }
    return '';
  };

  const est = findCorner('(?:Establishment(?:\\s*Authority)?)');
  const opp = findCorner('(?:(?:Main|Zealot)\\s+Opponent|Opponent(?:\\s*Infiltrator)?)');
  const shd = findCorner('(?:(?:Thematic|Economic)\\s+Shadow|Shadow(?:\\s*Broker)?)');
  const out = findCorner('(?:(?:Tertiary)\\s+Outcast|Outcast)');

  if (est || opp || shd || out) {
    return {
      establishment: est || 'Local Ward Authority',
      opponent: opp || 'Rival Faction Infiltrators',
      shadow: shd || 'Black Market Opportunists',
      outcast: out || 'Displaced Exiles'
    };
  }
  return null;
}

function isIndustrialModuleMeta(m) {
  if (!m || typeof m !== 'object') return false;
  const id = String(m.id || '').trim();
  const kind = String(m.kind || '').trim().toLowerCase();
  const tierStr = String(m.tier || '').trim();
  if (/^(ability|spell|situation|hook|character|faction|creature|bestiary)$/i.test(kind)) return false;
  if (/^(MOD_DIABLO_|MOD_JTTW_|MOD_OBLIVION_|MOD_KRYNN_|HOOK-|FACTION-|BOSS-|CLIMAX-)/i.test(id)) return false;
  if (m.chain_id || /^(T0-DOM|ECOL|AGRI|FARM|IND|EXT|INFRA|MINE|FORGE|MILL|CRAFT|PORT|ROAD)-/i.test(id)) return true;
  if ((m.pipeline_tier === 3 || m.pipeline_tier === 0 || /Tier\s*(0|3)\b/i.test(tierStr)) &&
      !/^(CWT|SIT)-/i.test(id)) {
    return true;
  }
  return false;
}

function enrichModuleFromMarkdown(m, rawMarkdown, baseDirPath) {
  if (!m || typeof m !== 'object') return m;
  const md = rawMarkdown || '';
  const parsedMd = extractMarkdownSections(md);
  const im = (m.injected_mechanics && typeof m.injected_mechanics === 'object') ? m.injected_mechanics : {};

  // file_url normalization if baseDirPath provided
  if (baseDirPath && m.path) {
    let resolvedPath = path.resolve(baseDirPath, m.path || '');
    if (!fs.existsSync(resolvedPath)) {
      const fallback = path.join(baseDirPath, 'modules', path.basename(m.path || ''));
      if (fs.existsSync(fallback)) resolvedPath = fallback;
    }
    if (fs.existsSync(resolvedPath) || !m.file_url) {
      m.file_url = toRootRelUrl(resolvedPath);
    }
  }

  // Yields resolution
  let resolvedYields = String(m.yields || im.yields_resource || im.yields || '').trim();
  if (!resolvedYields && parsedMd.body) {
    const yieldSec = parsedMd.sections.find(s => /^yields?$/i.test(s.normTitle));
    if (yieldSec && yieldSec.cleanText) {
      resolvedYields = truncateClean(yieldSec.cleanText, 240);
    } else {
      const ym = parsedMd.body.match(/^\s*[-*]?\s*\*{0,2}Yields(?:_resource)?\*{0,2}\s*:\s*["']?([^"'\n\r]+)["']?/im);
      if (ym) resolvedYields = stripMarkdownNoise(ym[1]).trim();
    }
  }
  if (!resolvedYields && isIndustrialModuleMeta(m)) {
    const stockSec = parsedMd.sections.find(s => /material stocks|item prototypes/i.test(s.normTitle));
    if (stockSec && stockSec.text) {
      const commodities = [];
      stockSec.text.split('\n').forEach(line => {
        const cm = line.match(/^\s*[-*]\s*\*\*([^*]+)\*\*\s*\(`?Commodity`?\)\s*:\s*(.+)$/i);
        if (cm) commodities.push(`${cm[1].trim()} (${truncateClean(stripMarkdownNoise(cm[2]), 100)})`);
      });
      if (commodities.length > 0) resolvedYields = truncateClean(commodities.join('; '), 240);
    }
    if (!resolvedYields && Array.isArray(m.provides) && m.provides.length > 0) {
      const exports = m.provides.filter(p => !/^(Crisis|Dilemma):/i.test(p)).map(p => p.replace(/^[^:]+:\s*/, '').replace(/-/g, ' '));
      if (exports.length > 0) resolvedYields = truncateClean(exports.join(', '), 240);
    }
  }
  m.yields = resolvedYields;

  // Overview & Summary extraction
  const overviewSec = parsedMd.sections.find(s => /overview|executive summary|what it does|core premise|dramatic premise|thematic premise|philosophy/i.test(s.normTitle));
  const rawOverview = (overviewSec && overviewSec.cleanText) || parsedMd.preamble || '';
  m.overview = truncateClean(String(m.overview || rawOverview || m.summary || m.yields || '').trim(), 500);
  if (!m.summary || String(m.summary).trim() === '') {
    m.summary = truncateClean(m.overview || m.yields || '', 260);
  }

  // Mechanical Architecture, Extraction Lore & Hazards
  const mechSec = parsedMd.sections.find(s => /mechanical.*architecture|refining.*architecture|architectural overview|operational loop|agrarian reality|hydrology|metallurgy|engineering|facts|logistical|what it does/i.test(s.normTitle));
  const placementSec = parsedMd.sections.find(s => /gm placement|supply synergy|resource flow/i.test(s.normTitle));
  const hazardSec = parsedMd.sections.find(s => /hazard|sabotage|failure mode|operational dials/i.test(s.normTitle));
  const mechText = (mechSec && mechSec.cleanText) || m.overview || m.standalone_fallback || '';
  m.mechanical_architecture = truncateClean(mechText, 900);
  if (hazardSec && hazardSec.cleanText) {
    m.hazards = truncateClean(hazardSec.cleanText, 600);
  }

  const lorePieces = [];
  if (placementSec && placementSec.cleanText) lorePieces.push(placementSec.cleanText);
  if (mechSec && mechSec.cleanText && (!placementSec || mechSec !== placementSec)) lorePieces.push(mechSec.cleanText);
  if (lorePieces.length === 0 && parsedMd.preamble) lorePieces.push(parsedMd.preamble);
  if (m.standalone_fallback) lorePieces.push(`Fallback: ${m.standalone_fallback}`);
  m.extraction_lore = truncateClean(lorePieces.join(' '), 800);

  // Standalone fallback markdown backup
  if (!m.standalone_fallback && parsedMd.body) {
    const fbSec = parsedMd.sections.find(s => /standalone fallback/i.test(s.normTitle));
    if (fbSec && fbSec.cleanText) {
      m.standalone_fallback = truncateClean(fbSec.cleanText, 450);
    } else {
      const fbm = parsedMd.body.match(/^\s*[-*]\s*\*{0,2}Standalone\s+Fallback:?\*{0,2}\s*(.+)$/im);
      if (fbm) m.standalone_fallback = truncateClean(stripMarkdownNoise(fbm[1]), 450);
    }
  }

  // Dials (YAML output_dial / *_dial / Markdown fallback)
  const dialInfo = extractDialFromData(m, parsedMd);
  m.output_dial = dialInfo.output_dial;
  if (dialInfo.output_dial_key) m.output_dial_key = dialInfo.output_dial_key;
  m.dials = dialInfo.dials;

  // Threat Clocks (YAML array/map / Markdown fallback)
  const clockInfo = extractThreatClocksFromData(m, parsedMd);
  m.threat_clocks = clockInfo.threat_clocks;
  m.threat_clock_specs = clockInfo.threat_clock_specs;

  // Four-Corner Opposition Web
  const fc = extractFourCornersFromData(m, parsedMd);
  if (fc) m.four_corners = fc;

  return m;
}

function isEmptyMetaValue(val) {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') return val.trim() === '';
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === 'object') return Object.keys(val).length === 0;
  return false;
}

function mergeModuleDiskAndManifest(dm, m) {
  // Base preserves manifest-only custom annotations, while non-empty freshly scanned disk fields override stale manifest blanks.
  const out = { ...m };
  Object.keys(dm).forEach(k => {
    if (!isEmptyMetaValue(dm[k]) || out[k] === undefined) {
      out[k] = dm[k];
    }
  });
  if (dm.path) out.path = dm.path;
  return out;
}

function parseModuleMarkdownFile(fullPath, relRootDir, preloadedRawText = null) {
  const rawText = (preloadedRawText !== null ? preloadedRawText : fs.readFileSync(fullPath, 'utf8')).replace(/^\uFEFF/, '');
  let fm = {};
  const fmMatch = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    fm = parseYamlFrontmatter(fmMatch[1]);
  }

  let modId = fm.id || fm.module_id;
  const baseName = path.basename(fullPath);
  if (!modId) {
    const baseNoExt = path.basename(fullPath, '.md');
    const prefixMatch = baseNoExt.match(/^([A-Z0-9]+(?:-[A-Z0-9]+)+|[A-Z0-9]+)/i);
    modId = prefixMatch ? prefixMatch[1] : baseNoExt;
  }

  let title = fm.title;
  if (!title) {
    const h1Match = rawText.match(/^#\s+(?:MODULE\s+[A-Z0-9-]+:\s*)?([^\r\n]+)/m);
    title = h1Match ? h1Match[1].trim() : path.basename(fullPath, '.md').replace(/_/g, ' ');
  }

  const hasNumTier = fm.pipeline_tier !== undefined && fm.pipeline_tier !== '' && !Number.isNaN(Number(fm.pipeline_tier));
  const tierMatch = (typeof fm.tier === 'string') ? fm.tier.match(/Tier\s*(\d)/i) : null;
  const pipelineTier = hasNumTier
    ? parseInt(fm.pipeline_tier, 10)
    : (tierMatch ? parseInt(tierMatch[1], 10) : 3);
  const relPath = './' + path.relative(relRootDir, fullPath).replace(/\\/g, '/');

  let setName = fm.set;
  if (!setName) {
    const parentFolderName = path.basename(path.dirname(fullPath));
    setName = parentFolderName.startsWith('Set_') ? parentFolderName.replace(/_/g, ' ') : 'Core Modules';
  }

  const im = (fm.injected_mechanics && typeof fm.injected_mechanics === 'object') ? fm.injected_mechanics : {};
  const modObj = {
    id: String(modId),
    title: String(title),
    set: String(setName),
    tier: fm.tier || `Tier ${pipelineTier}`,
    pipeline_tier: pipelineTier,
    culture: fm.culture || fm.culture_quadrant || 'Universal',
    color: fm.color || fm.mtg_color || 'Colorless',
    kind: fm.kind || null,
    ip: fm.ip || null,
    category: fm.category || null,
    operational_profile: fm.operational_profile || null,
    hub_eligibility: fm.hub_eligibility || null,
    tarot_affinity: fm.tarot_affinity || null,
    bands: fm.bands || null,
    provides: parseYamlListOrArray(fm.provides),
    requires: parseYamlListOrArray(fm.requires),
    summary: fm.summary || fm.description || '',
    yields: fm.yields_resource || fm.yields || im.yields_resource || im.yields || '',
    path: relPath,
    file_url: toRootRelUrl(fullPath),
    standalone_fallback: fm.standalone_fallback || '',
    chain_id: fm.chain_id || fm.industry_chain || null,
    chain_stage: fm.chain_stage !== undefined && fm.chain_stage !== '' ? parseInt(fm.chain_stage, 10) : (fm.stage !== undefined && fm.stage !== '' ? parseInt(fm.stage, 10) : null),
    chain_role: fm.chain_role || null,
    node_prerequisites: fm.node_prerequisites || (typeof fm.prerequisites === 'object' ? fm.prerequisites : null) || null,
    edge_prerequisites: fm.edge_prerequisites || null,
    injected_mechanics: Object.keys(im).length > 0 ? im : null,
    four_corners: fm.four_corners || null,
    output_dial: fm.output_dial || im.output_dial || null,
    threat_clocks: [],
    dials: []
  };

  enrichModuleFromMarkdown(modObj, rawText, relRootDir);
  return modObj;
}

function scanModulesDirRecursive(modulesRootDir, campaignRootDir, deletedIdsSet = new Set()) {
  const discovered = [];
  if (!fs.existsSync(modulesRootDir)) return discovered;

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const ent of entries) {
      const fullPath = path.join(currentDir, ent.name);
      if (ent.isDirectory() && !ent.name.startsWith('.') && !ent.name.startsWith('_')) {
        walk(fullPath);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md') && !ent.name.toLowerCase().startsWith('readme')) {
        try {
          const parsedMod = parseModuleMarkdownFile(fullPath, campaignRootDir);
          if (!deletedIdsSet.has(String(parsedMod.id))) {
            discovered.push(parsedMod);
          }
        } catch (readErr) {
          console.warn(`[WARN] Could not parse module at ${fullPath}:`, readErr.message);
        }
      }
    }
  }

  walk(modulesRootDir);
  return discovered;
}

// ---------------------------------------------------------------------------
// Stage 3A: Module-backed prose synthesis helpers (zero-boilerplate extraction)
// ---------------------------------------------------------------------------
const GENERIC_FOUR_CORNER_DEFAULTS = new Set([
  'Local Ward Authority', 'Rival Faction Infiltrators', 'Black Market Opportunists', 'Displaced Exiles'
]);

function splitProseSentences(text) {
  const clean = String(text || '')
    .replace(/\n\s*[*•-]\s+/g, ' ')
    .replace(/(^|\s)[*•]\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return [];
  const protectedText = clean.replace(/\b(e\.g|i\.e|vs|approx|etc)\./gi, (mm) => mm.replace(/\./g, '․'));
  return protectedText.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/).map(s => s.replace(/․/g, '.').trim()).filter(Boolean);
}

function leadSentences(text, count = 1, maxLen = 260) {
  const sents = splitProseSentences(text);
  const out = [];
  let total = 0;
  for (const s of sents) {
    if (out.length >= count) break;
    if (s.length < 12) continue;
    if (total + s.length > maxLen && out.length > 0) break;
    out.push(s);
    total += s.length + 1;
  }
  const joined = out.join(' ');
  return joined.length > maxLen ? truncateClean(joined, maxLen) : joined;
}

function endSentence(text) {
  const t = String(text || '').trim().replace(/[\s;,:—-]+$/, '');
  if (!t) return '';
  return /[.!?]$/.test(t) ? t : t + '.';
}

function lowerFirst(text) {
  const t = String(text || '');
  if (!t) return t;
  // Preserve acronyms / proper nouns (second char uppercase) and numerals
  if (/^[A-Z]{2}/.test(t)) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function fourCornerLabel(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  if (GENERIC_FOUR_CORNER_DEFAULTS.has(s)) return '';
  s = s.split(/\s+[-–—]\s+/)[0].trim();
  if (s.length > 70) s = s.split(/[,;.(]/)[0].trim();
  if (s.length > 70) s = s.slice(0, 67).trim() + '...';
  return s;
}

function parseTagForBuild(raw) {
  const cleaned = String(raw || '').trim();
  const idx = cleaned.indexOf(':');
  let sector = 'General';
  let label = cleaned;
  if (idx > 0) {
    sector = cleaned.slice(0, idx).replace(/[_-]+/g, ' ').trim() || 'General';
    sector = sector.charAt(0).toUpperCase() + sector.slice(1);
    label = cleaned.slice(idx + 1).trim();
  }
  const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return {
    raw: cleaned,
    sector,
    name: label.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(),
    key: idx > 0 ? `${slug(sector)}:${slug(label)}` : slug(label),
    tail: slug(label)
  };
}

const RESOURCE_SECTOR_PROFILES = [
  { re: /^hydraulics?/i, unit: 'standing flume-flow',
    handling: 'It exists only while the head and channel hold; a blocked, iced or silted tailrace backs water into the works, and nothing can be banked for later.' },
  { re: /^(water|hydrology|aqua)/i, unit: 'bucket, barrel or flume-flow',
    handling: 'It cannot be stockpiled cleanly: stored water fouls within days, so supply is only as reliable as the head, aquifer or cistern behind it.' },
  { re: /^(food|provisions?|grain|meat|dairy|ration)/i, unit: 'sack, cask or crate',
    handling: 'It spoils to damp, vermin and rot, so it wants dry lofts, salting or sealed casks and a short route to market.' },
  { re: /^(crop|agri|harvest|fiber|fibre|flax|cane)/i, unit: 'cartload or hopper-fill',
    handling: 'It is harvest-seasonal and bulky; hoppers and ricks must stay dry or the lot heats, moulds and is written off.' },
  { re: /^(fuel|energy|coal|charcoal|wood)/i, unit: 'cord, sack or wagon-ton',
    handling: 'It is heavy per unit of heat and a fire hazard in store; cover it dry and stack it away from the furnaces it feeds.' },
  { re: /^(power|electric|energy)/i, unit: 'kilowatt of continuous output',
    handling: 'It cannot be hoarded; it is spent as fast as it is made unless wet-cell accumulators bank it, and it dies the moment the prime mover stops.' },
  { re: /^(chem|reagent|acid|alkali|mordant|solvent)/i, unit: 'sealed cask or lead-lined keg',
    handling: 'It is caustic or toxic in bulk, needs lead, glass or glazed vessels, and a single contaminated batch can ruin a whole run.' },
  { re: /^(metal|ore|mineral|stone|ingot|alloy|mining)/i, unit: 'ingot, ore-cart or pig',
    handling: 'It is dense and wagon-bound; ore heaps weather, ingots tempt thieves, and every haul is a labour and axle problem.' },
  { re: /^(commodity|trade|goods|manufactured|textile|cloth|material)/i, unit: 'bale, hogshead or crate',
    handling: 'It travels in tallied lots; damp, pilferage and short-weight customs fees are the usual losses.' },
  { re: /^(geography|terrain|environment)/i, unit: 'standing site feature',
    handling: 'It is a fixed feature of the ground rather than a hauled good, so it can be blocked, diverted or seized but never carted off.' }
];

function resourceSectorProfile(sector) {
  const s = String(sector || '').trim();
  return RESOURCE_SECTOR_PROFILES.find(p => p.re.test(s)) || {
    unit: 'batch', handling: 'It moves in discrete lots, and neglect, weather and theft erode a stockpile faster than demand drains it.'
  };
}

function tokenizeForMatch(text) {
  const stop = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'baseline', 'potable', 'general', 'raw', 'refined']);
  return String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length >= 4 && !stop.has(t)).map(t => (t.length > 5 ? t.slice(0, 5) : t));
}

function findSection(parsedMd, re) {
  return parsedMd.sections.find(s => re.test(s.normTitle));
}

function collectProseCorpus(parsedMd) {
  // Physical-process prose only: skips placement lists, cross-references, personnel, opposition web,
  // thematic premise, scene scripts, dials, hazards and clocks (those feed other fields).
  const skip = /cross-?reference|authoritative|key personnel|notable characters|personnel|disposition baseline|stationed entities|gm (?:socket )?placement|scene calculus|segmented threat|dial|hazard|sabotage|clock|corner|opposition|syllogism|thematic|premise|crucible|failure mode/i;
  const chunks = [];
  if (parsedMd.preamble) chunks.push(parsedMd.preamble);
  parsedMd.sections.forEach(sec => {
    if (skip.test(sec.normTitle)) return;
    if (sec.cleanText) chunks.push(sec.cleanText);
  });
  return chunks.join('\n')
    .split('\n')
    .filter(l => !/^\s*(Industry Chain|Corner\s*\d|Domain:|Pipeline Tier)/i.test(l))
    .join('\n');
}

function bestSentenceForTokens(corpus, tokens, uniqueTokens, rawTag, usedSentences) {
  if (!corpus || tokens.length === 0) return { sentence: '', score: 0 };
  const rawLower = String(rawTag || '').toLowerCase();
  let best = { sentence: '', score: 0 };
  splitProseSentences(corpus).forEach(sent => {
    const lower = sent.toLowerCase();
    if (rawLower && lower.includes(rawLower)) return; // tag-listing lines are not prose
    if (usedSentences && usedSentences.has(sent)) return; // each sibling resource gets its own method line
    if (sent.length < 30 || sent.length > 420) return;
    if ((sent.match(/:\s/g) || []).length >= 2) return; // merged bullet-label runs read badly as prose
    let score = 0;
    tokens.forEach(t => { if (lower.includes(t)) score += uniqueTokens.has(t) ? 3 : 1; });
    if (score > best.score) best = { sentence: sent, score };
  });
  return best;
}

function extractModuleComponents(parsedMd, mechSec) {
  const sec = mechSec || findSection(parsedMd, /mechanical|architectur|operational loop|reality|engineering/);
  if (!sec || !sec.text) return [];
  const out = [];
  sec.text.split('\n').forEach(line => {
    const bm = line.match(/^\s*(?:[*•-]|\d+\.)\s*\*\*([^*]+?)\*\*/);
    if (bm) {
      const name = bm[1].replace(/[:.\s]+$/, '').trim();
      if (name && name.length <= 60 && !out.includes(name)) out.push(name);
    }
  });
  return out.slice(0, 5);
}

function joinList(items) {
  const list = items.filter(Boolean);
  if (list.length <= 1) return list.join('');
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

function summarizeOutputDial(m) {
  const d = m.output_dial && typeof m.output_dial === 'object' ? m.output_dial : null;
  if (!d) return '';
  const keys = ['level_1', 'level_2', 'level_3', 'level_4'].filter(k => d[k]);
  if (keys.length === 0) return '';
  const label = (k) => String(d[k]).split(/\s+[-–—]\s+/)[0].replace(/\s*\([^)]*\)\s*$/, '').trim();
  const first = keys[0];
  const last = keys[keys.length - 1];
  return keys.length === 1
    ? `L${first.split('_')[1]} ${label(first)}`
    : `L${first.split('_')[1]} ${label(first)} -> L${last.split('_')[1]} ${label(last)}`;
}

function buildModuleStakeProfile(m, parsedMd) {
  const fc = m.four_corners || {};
  const est = fourCornerLabel(fc.establishment);
  const opp = fourCornerLabel(fc.opponent);
  const shd = fourCornerLabel(fc.shadow);
  const out = fourCornerLabel(fc.outcast);
  const specs = Array.isArray(m.threat_clock_specs) ? m.threat_clock_specs : [];
  const clock = specs.length > 0 ? specs[0] : null;
  const clockTrigger = clock
    ? String(clock.trigger || '').replace(/^Advances when:\s*/i, '').replace(/^Ticks?\s+/i, '').trim()
    : '';
  const hazardLead = m.hazards ? leadSentences(m.hazards, 1, 200) : '';

  let tension = '';
  if (est && opp) {
    tension = `${est} stands against ${opp}${shd ? `, while ${shd} works the margins` : ''}${out ? ` and ${out} bears the cost` : ''}.`;
  } else if (est || opp || shd || out) {
    const only = [est, opp, shd, out].filter(Boolean);
    tension = `The pressure runs through ${joinList(only)}.`;
  }

  let stakes = '';
  if (clock) {
    const second = specs.length > 1 ? ` (the ${specs[1].name} runs alongside)` : '';
    stakes = endSentence(`Stakes: ${clock.name} [${clock.ticks} ticks]${second}${clockTrigger ? ` - ${clockTrigger.charAt(0).toUpperCase() + clockTrigger.slice(1)}` : ''}`);
  } else {
    const hook = parsedMd && parsedMd.body
      ? parsedMd.body.match(/Quest Hook[^\n:]*?[-–—]\s*\*?\s*([^*:\n]+?)\s*\*?\s*\**:\s*\**\s*([^\n]+)/i)
      : null;
    if (hook) {
      stakes = endSentence(`Stakes: ${hook[1].trim()} - ${truncateClean(stripMarkdownNoise(hook[2]), 200)}`);
    } else if (Array.isArray(m.dials) && m.dials.length > 0 && !/^Level\s*\d/i.test(String(m.dials[0]))) {
      stakes = endSentence(`Stakes: ${truncateClean(stripMarkdownNoise(String(m.dials[0])), 220)}`);
    } else if (hazardLead) {
      const cleanHazard = hazardLead.replace(/^[-*\s]+/, '').replace(/^Dial\s*[—–-]\s*/i, '');
      stakes = endSentence(`Stakes: ${cleanHazard}`);
    }
  }
  return { est, opp, shd, out, clock, specs, tension, stakes, hazardLead };
}

function buildIndustryLore(m, parsedMd, mechSec) {
  const profile = buildModuleStakeProfile(m, parsedMd);
  const components = extractModuleComponents(parsedMd, mechSec);
  const premiseSec = findSection(parsedMd, /operational (premise|loop)|dramatic premise|thematic premise|core premise|overview|what it does|crucible/);
  const physical = leadSentences(m.mechanical_architecture || m.overview || m.summary || '', 1, 260);
  const parts = [];
  if (physical) parts.push(endSentence(physical));
  if (components.length >= 2) parts.push(`Working parts: ${joinList(components.slice(0, 4))}.`);
  if (profile.tension) parts.push(profile.tension);
  else if (premiseSec && premiseSec.cleanText) {
    const prem = leadSentences(premiseSec.cleanText, 1, 220);
    if (prem && !physical.startsWith(prem.slice(0, 40))) parts.push(endSentence(prem));
  }
  if (profile.stakes) parts.push(profile.stakes);
  if (parts.length === 0) {
    const yieldsText = String(m.yields || '').trim();
    parts.push(endSentence(`${m.title}${yieldsText ? ` turns out ${lowerFirst(yieldsText)}` : ` anchors its node`}`));
  }
  return parts.slice(0, 4).join(' ');
}

function buildRefiningProcess(m, parsedMd, corpus) {
  const verbs = /\b(roast|leach|boil|crush|smelt|distill|ferment|mill|press|kiln|refin|cur(?:e|ing)|brew|spin|weav|forge|quarr|dredg|draw|drain|hoist|filter|temper|cast|grind|steep|evaporat|extract|harvest|thresh|tan|dye|spun|fire|bake|malt)/i;
  const role = String(m.chain_role || '').trim().toLowerCase();
  const sentences = splitProseSentences(corpus).filter(s => s.length >= 40 && s.length <= 360 && verbs.test(s));
  const picked = sentences.slice(0, 2).join(' ');
  const body = picked || leadSentences(m.mechanical_architecture || m.overview || '', 2, 340);
  if (!body) return '';
  return role ? `[${role}] ${body}` : body;
}

function composeResourceNotes(item) {
  const parts = [];
  if (item.extractionLore) parts.push(endSentence(item.extractionLore));
  if (item.batchSpecs) {
    const b = item.batchSpecs;
    const yieldBit = b.yields ? ` (${b.yields})` : '';
    parts.push(`Moves as ${b.unit}${yieldBit}. ${b.handling}`);
  }
  if (item.consumedByHint) parts.push(endSentence(`Downstream: ${item.consumedByHint}`));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function buildResourcePrototype(m, p, idx, ctx) {
  const meta = parseTagForBuild(p);
  const profile = resourceSectorProfile(meta.sector);
  const yieldList = String(ctx.yieldDesc || '').split(/\s*,\s*|\s*;\s*|\s+&\s+/).map(s => s.trim()).filter(Boolean);
  const tokens = Array.from(new Set(tokenizeForMatch(meta.name).concat(tokenizeForMatch(meta.sector))));
  const otherTokens = new Set();
  ctx.tagMetas.forEach((om, oi) => {
    if (oi !== idx) tokenizeForMatch(om.name).concat(tokenizeForMatch(om.sector)).forEach(t => otherTokens.add(t));
  });
  const uniqueTokens = new Set(tokens.filter(t => !otherTokens.has(t)));

  // Yield phrase that best matches this specific resource
  let yieldMatch = '';
  let yieldScore = 0;
  yieldList.forEach(y => {
    const yl = y.toLowerCase();
    let sc = 0;
    tokens.forEach(t => { if (yl.includes(t)) sc += uniqueTokens.has(t) ? 3 : 1; });
    if (sc > yieldScore) { yieldScore = sc; yieldMatch = y; }
  });
  const singleTag = ctx.tagMetas.length === 1;
  if (!singleTag && yieldScore < 3) yieldMatch = '';
  if (!yieldMatch && yieldScore === 0 && yieldList.length === ctx.tagMetas.length && yieldList[idx]) yieldMatch = yieldList[idx];
  if (!yieldMatch && singleTag) yieldMatch = ctx.yieldDesc;
  yieldMatch = String(yieldMatch || '').replace(/\s*\([^)]{30,}\)/g, '').trim();

  const hit = bestSentenceForTokens(ctx.corpus, tokens, uniqueTokens, meta.raw, ctx.usedSentences);
  if (hit.sentence && (hit.score >= 3 || (hit.score > 0 && singleTag))) ctx.usedSentences.add(hit.sentence);
  const stockHit = ctx.stockBullets.find(sb => tokens.some(t => sb.name.toLowerCase().includes(t)));

  const role = String(m.chain_role || '').trim().toLowerCase();
  const verb = /extract/.test(role) ? 'Extracted at'
    : /refin/.test(role) ? 'Refined at'
    : /manufactur|fabricat|craft/.test(role) ? 'Manufactured at'
    : /process|mill/.test(role) ? 'Processed at'
    : /distribut|logistic|transport/.test(role) ? 'Staged through'
    : 'Produced at';

  let method = '';
  if (stockHit) method = stockHit.text;
  else if (hit.score >= 3 || (hit.score > 0 && ctx.tagMetas.length === 1)) method = hit.sentence.replace(/^[^:.]{3,60}:\s+(?=[A-Z])/, '');
  else if (ctx.components.length > 0) {
    const comp = ctx.components[idx % ctx.components.length];
    method = `Worked through the ${comp.replace(/^The\s+/i, '')}`;
  } else if (ctx.processLead) method = ctx.processLead;

  const originFacility = m.title;
  const extractionLore = endSentence(`${verb} ${originFacility}${method ? `: ${String(method).replace(/[.]+$/, '')}` : ''}`);

  const batchSpecs = {
    yields: yieldMatch || '',
    unit: profile.unit,
    handling: profile.handling,
    sector: meta.sector,
    chainStage: m.chain_stage ?? null,
    chainRole: m.chain_role || null
  };

  const consumedByHint = ctx.markdownConsumers[meta.key] || ctx.markdownConsumers[meta.tail] || '';

  const item = {
    id: `${m.id}-item-res-${idx + 1}`,
    name: p.replace(/-/g, ' '),
    category: 'Resource Export / Supply Anchor',
    entityKind: 'resource',
    isResource: true,
    resourceSector: meta.sector,
    specs: `Provides: ${p}`,
    originFacility,
    extractionMethod: method ? endSentence(method) : '',
    handlingNotes: profile.handling,
    extractionLore,
    batchSpecs,
    consumedByHint,
    producedByModuleId: m.id,
    overview: m.overview || '',
    yields: ctx.yieldDesc,
    yieldsSpec: batchSpecs.yields,
    provides: [p],
    requires: Array.isArray(m.requires) ? m.requires : [],
    chain_id: m.chain_id || null,
    chainId: m.chain_id || null,
    chain_stage: m.chain_stage ?? null,
    chainStage: m.chain_stage ?? null,
    chain_role: m.chain_role || null,
    chainRole: m.chain_role || null,
    standalone_fallback: m.standalone_fallback || '',
    moduleId: m.id,
    moduleTitle: m.title
  };
  item.notes = composeResourceNotes(item);
  return item;
}

function extractMarkdownConsumers(parsedMd, tagMetas) {
  const map = {};
  const placement = findSection(parsedMd, /gm (?:socket )?placement|supply synergy|resource flow|topological synerg/);
  if (!placement || !placement.cleanText) return map;
  const sentences = splitProseSentences(placement.cleanText).filter(s => /output|dispatch|supply|feeds?|transmi|sockets? into|downstream|powers|charges|sells?/i.test(s));
  const stripLabel = (s) => s.replace(/^(?:[A-Z][\w-]*\s){0,3}[A-Z][\w-]*:\s+/, '');
  tagMetas.forEach(tm => {
    const hit = sentences.find(s => s.toLowerCase().includes(tm.name.toLowerCase().replace(/\s+/g, '-')) || s.toLowerCase().includes(tm.raw.toLowerCase()));
    const fallback = sentences.find(s => /^output|dispatch|downstream/i.test(s));
    const chosen = hit || (tagMetas.length === 1 ? fallback : '');
    if (chosen) {
      map[tm.key] = truncateClean(stripLabel(chosen), 240);
      map[tm.tail] = map[tm.key];
    }
  });
  return map;
}

function enrichModuleEntities(m, rawMarkdown) {
  const npcs = [];
  const quests = [];
  const items = [];
  const md = rawMarkdown || '';
  const parsedMd = extractMarkdownSections(md);

  if (m.four_corners) {
    if (m.four_corners.establishment) {
      npcs.push({
        id: `${m.id}-npc-est`,
        name: m.four_corners.establishment,
        role: "Establishment Authority",
        faction: m.culture || "Hierarchy",
        motivation: "Preserve institutional order, enforce regulations, and meet quotas.",
        moduleId: m.id,
        moduleTitle: m.title
      });
    }
    if (m.four_corners.opponent) {
      npcs.push({
        id: `${m.id}-npc-opp`,
        name: m.four_corners.opponent,
        role: "Opponent Infiltrator",
        faction: "Rival Faction",
        motivation: "Disrupt local administration and undermine establishment control.",
        moduleId: m.id,
        moduleTitle: m.title
      });
    }
    if (m.four_corners.shadow) {
      npcs.push({
        id: `${m.id}-npc-shd`,
        name: m.four_corners.shadow,
        role: "Shadow Broker",
        faction: "Black Market",
        motivation: "Exploit supply shortages and crises for private illicit margins.",
        moduleId: m.id,
        moduleTitle: m.title
      });
    }
    if (m.four_corners.outcast) {
      npcs.push({
        id: `${m.id}-npc-out`,
        name: m.four_corners.outcast,
        role: "Displaced Outcast",
        faction: "Exiles / Convicts",
        motivation: "Survive against harsh environmental hazards and organize resistance.",
        moduleId: m.id,
        moduleTitle: m.title
      });
    }
  }

  const lines = md.split('\n');
  let inCharacterSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(?:#+\s*.*(?:character|personnel|npc|dramatis)|npcs?:|characters?:)/i.test(line)) {
      inCharacterSection = true;
    } else if (/^\s*#+\s*.*(?:item|machinery|hazard|relic|threat|quest|dial)/i.test(line)) {
      inCharacterSection = false;
    }

    const nameMatch = line.match(/^\s*name:\s*["']?([^"'\r\n]+)["']?/i);
    if (nameMatch) {
      let role = null;
      let motivation = null;
      let hasCharacterIndicators = inCharacterSection;

      if (i + 1 < lines.length) {
        const roleMatch = lines[i + 1].match(/^\s*role:\s*["']?([^"'\r\n]+)["']?/i);
        if (roleMatch) { role = roleMatch[1].trim(); hasCharacterIndicators = true; }
        const motMatch1 = lines[i + 1].match(/^\s*motivation:\s*["']?([^"'\r\n]+)["']?/i);
        if (motMatch1) { motivation = motMatch1[1].trim(); hasCharacterIndicators = true; }
      }
      if (i + 2 < lines.length) {
        const roleMatch2 = lines[i + 2].match(/^\s*role:\s*["']?([^"'\r\n]+)["']?/i);
        if (roleMatch2 && !role) { role = roleMatch2[1].trim(); hasCharacterIndicators = true; }
        const motMatch = lines[i + 2].match(/^\s*motivation:\s*["']?([^"'\r\n]+)["']?/i);
        if (motMatch && !motivation) { motivation = motMatch[1].trim(); hasCharacterIndicators = true; }
      }
      if (i + 3 < lines.length) {
        const motMatch3 = lines[i + 3].match(/^\s*motivation:\s*["']?([^"'\r\n]+)["']?/i);
        if (motMatch3 && !motivation) { motivation = motMatch3[1].trim(); hasCharacterIndicators = true; }
      }

      if (hasCharacterIndicators) {
        const n = nameMatch[1].trim();
        if (n && !npcs.some(existing => existing.name === n)) {
          npcs.unshift({
            id: `${m.id}-npc-${npcs.length + 1}`,
            name: n,
            role: role || 'Local Specialist / Agent',
            faction: m.culture || "Independent",
            motivation: motivation || 'Pursue personal and factional objectives.',
            moduleId: m.id,
            moduleTitle: m.title
          });
        }
      }
    }
  }

  if (Array.isArray(m.threat_clocks)) {
    m.threat_clocks.forEach((tc, idx) => {
      const parts = String(tc).split(/Clock\s*\[(\d+\s*Ticks)\]\s*-?\s*/i);
      const clockName = parts[0] ? parts[0].trim() : `${m.id} Hazard`;
      const ticks = parts[1] ? parts[1].trim() : '4 Ticks';
      const desc = parts[2] ? parts[2].trim().replace(/^["']|["']$/g, '') : tc;
      quests.push({
        id: `${m.id}-quest-clock-${idx + 1}`,
        title: `${clockName} Threat`,
        type: "Threat Clock Escalation",
        threat: ticks,
        notes: desc,
        moduleId: m.id,
        moduleTitle: m.title
      });
    });
  }

  const stakeProfile = buildModuleStakeProfile(m, parsedMd);
  const mechSec = findSection(parsedMd, /mechanical.*architecture|refining.*architecture|architectural overview|operational loop|agrarian reality|hydrology|metallurgy|engineering|facts|logistical|what it does/);
  const corpus = collectProseCorpus(parsedMd);

  if (Array.isArray(m.provides)) {
    m.provides.filter(p => p.startsWith('Crisis:') || p.startsWith('Dilemma:')).forEach((p, idx) => {
      const cleanTitle = p.replace(/^(Crisis|Dilemma):\s*/, '').replace(/-/g, ' ');
      const lead = leadSentences(m.overview || m.mechanical_architecture || m.summary || '', 1, 200);
      const stakeBits = [];
      if (stakeProfile.tension) stakeBits.push(stakeProfile.tension);
      if (stakeProfile.stakes) stakeBits.push(stakeProfile.stakes);
      let notes = stakeBits.join(' ');
      if (lead) notes = `${m.title}: ${endSentence(lead)}${notes ? ' ' + notes : ''}`;
      if (!notes) notes = `${cleanTitle} presses on ${m.title}; its outcome decides who controls ${String(m.yields || 'the facility output').toLowerCase()}.`;
      quests.unshift({
        id: `${m.id}-quest-crisis-${idx + 1}`,
        title: cleanTitle,
        type: p.startsWith('Crisis:') ? "Crisis Vector" : "Moral Dilemma",
        threat: (m.threat_clocks && m.threat_clocks[0]) ? m.threat_clocks[0] : "4 Ticks",
        notes,
        moduleId: m.id,
        moduleTitle: m.title
      });
    });
  }

  const isIndustryMod = isIndustrialModuleMeta(m);
  const yieldDesc = m.yields || (m.injected_mechanics && m.injected_mechanics.yields_resource) || m.title;
  const providedTags = (Array.isArray(m.provides) ? m.provides : []).filter(p => !/^(Crisis|Dilemma):/i.test(p));
  const requiredTags = Array.isArray(m.requires) ? m.requires : [];
  const components = extractModuleComponents(parsedMd, mechSec);
  const lore = buildIndustryLore(m, parsedMd, mechSec);
  const refiningProcess = buildRefiningProcess(m, parsedMd, corpus);
  const prereqs = (m.node_prerequisites && typeof m.node_prerequisites === 'object') ? m.node_prerequisites : null;
  const requirementLines = [];
  if (prereqs) Object.keys(prereqs).forEach(k => {
    const v = prereqs[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') requirementLines.push(`${k.replace(/_/g, ' ')}: ${String(v).trim()}`);
  });
  requiredTags.forEach(t => requirementLines.push(t));

  const mechanicalSpecs = {
    physical: leadSentences(m.mechanical_architecture || m.overview || '', 2, 360),
    components,
    throughput: yieldDesc,
    requirements: requirementLines,
    outputDialKey: m.output_dial_key || null,
    outputDialSummary: summarizeOutputDial(m),
    outputDial: m.output_dial || null,
    dials: Array.isArray(m.dials) ? m.dials : [],
    hazards: m.hazards || ''
  };

  const apparatusItem = {
    id: `${m.id}-item-apparatus`,
    name: m.title.replace(/^The\s+/i, '').split('&')[0].trim(),
    category: isIndustryMod
      ? "Infrastructural Machinery"
      : ((m.pipeline_tier === 3 || m.tier === 3 || (typeof m.tier === 'string' && m.tier.includes('Tier 3'))) ? "Infrastructural Machinery" : "Tabletop Asset / Relic"),
    specs: yieldDesc,
    notes: lore,
    lore,
    moduleId: m.id,
    moduleTitle: m.title,
    provides: Array.isArray(m.provides) ? m.provides : [],
    requires: requiredTags,
    providesTags: providedTags,
    requiresTags: requiredTags,
    yields: yieldDesc,
    yieldsSpec: yieldDesc,
    mechanicalSpecs,
    refiningProcess,
    chain_id: m.chain_id || null,
    chainId: m.chain_id || null,
    chain_stage: m.chain_stage ?? null,
    chainStage: m.chain_stage ?? null,
    chain_role: m.chain_role || null,
    chainRole: m.chain_role || null,
    standalone_fallback: m.standalone_fallback || '',
    standaloneFallback: m.standalone_fallback || '',
    node_prerequisites: m.node_prerequisites || null,
    nodePrerequisites: m.node_prerequisites || null,
    output_dial: m.output_dial || null,
    dials: Array.isArray(m.dials) ? m.dials : [],
    threat_clocks: Array.isArray(m.threat_clocks) ? m.threat_clocks : [],
    threatClocks: Array.isArray(m.threat_clocks) ? m.threat_clocks : [],
    threat_clock_specs: Array.isArray(m.threat_clock_specs) ? m.threat_clock_specs : [],
    four_corners: m.four_corners || null,
    overview: m.overview || '',
    mechanicalArchitecture: m.mechanical_architecture || ''
  };
  if (isIndustryMod) {
    apparatusItem.isIndustry = true;
    apparatusItem.entityKind = 'industry';
  } else {
    apparatusItem.entityKind = 'item';
  }
  items.push(apparatusItem);

  if (providedTags.length > 0) {
    const tagMetas = providedTags.map(parseTagForBuild);
    const stockBullets = [];
    const stockSec = findSection(parsedMd, /material stocks|item prototypes/);
    if (stockSec && stockSec.text) {
      stockSec.text.split('\n').forEach(line => {
        const sm = line.match(/^\s*[-*]\s*\*\*([^*]+)\*\*\s*(?:\(`?[^)]*`?\))?\s*:\s*(.+)$/);
        if (sm) stockBullets.push({ name: sm[1].trim(), text: truncateClean(stripMarkdownNoise(sm[2]), 180) });
      });
    }
    const ctx = {
      yieldDesc,
      tagMetas,
      corpus,
      components,
      stockBullets,
      // The facility's lead sentence already opens the industry lore; resources need their own method line.
      usedSentences: new Set([
        leadSentences(m.mechanical_architecture || '', 1, 260),
        leadSentences(m.overview || '', 1, 260)
      ].filter(Boolean).concat(splitProseSentences(m.mechanical_architecture || '').slice(0, 1))),
      processLead: leadSentences(refiningProcess.replace(/^\[[^\]]+\]\s*/, ''), 1, 200),
      markdownConsumers: extractMarkdownConsumers(parsedMd, tagMetas)
    };
    providedTags.forEach((p, idx) => {
      items.push(buildResourcePrototype(m, p, idx, ctx));
    });
  }

  return { npcs, quests, items };
}

// Cross-module pass: replaces markdown-only downstream hints with real consumer modules
// (any module whose `requires` lists the tag) and recomposes each resource prototype's notes.
function applyResourceConsumerIndex(allModules) {
  const consumersByKey = new Map();
  const add = (key, mod) => {
    if (!key) return;
    if (!consumersByKey.has(key)) consumersByKey.set(key, []);
    const bucket = consumersByKey.get(key);
    if (!bucket.some(b => b.id === mod.id)) bucket.push(mod);
  };
  (allModules || []).forEach(mod => {
    (Array.isArray(mod.requires) ? mod.requires : []).forEach(t => {
      const meta = parseTagForBuild(t);
      add(meta.key, mod);
      if (meta.tail !== meta.key) add(meta.tail, mod);
    });
  });
  (allModules || []).forEach(mod => {
    (mod.extracted_items || []).forEach(it => {
      if (!it || !it.isResource) return;
      const meta = parseTagForBuild((it.provides && it.provides[0]) || '');
      const bucket = (consumersByKey.get(meta.key) || consumersByKey.get(meta.tail) || []).filter(c => c.id !== mod.id);
      if (bucket.length > 0) {
        const shown = bucket.slice(0, 4).map(c => `${c.title} (${c.id})`);
        it.consumedByHint = `${joinList(shown)}${bucket.length > 4 ? ` and ${bucket.length - 4} more` : ''} draw on it`;
      }
      it.notes = composeResourceNotes(it);
    });
  });
}

function runBuildSuite() {
console.log('========================================================');
console.log('       CREATOR STUDIO - CENTRALIZED ASSET COMPILER      ');
console.log('========================================================\n');

// ------------------------------------------------------------------------------
// 1. LOAD NAVIGATION MANIFEST
// ------------------------------------------------------------------------------
const navManifestPath = path.join(DOCS_DIR, 'navigation_manifest.json');
let navManifest = null;
if (fs.existsSync(navManifestPath)) {
  try {
    navManifest = JSON.parse(fs.readFileSync(navManifestPath, 'utf8'));
    console.log(`[OK] Loaded Navigation Manifest: ${navManifest.surfaces.length} surfaces registered.`);
  } catch (err) {
    console.warn(`[WARN] Could not parse navigation_manifest.json:`, err.message);
  }
} else {
  console.warn(`[WARN] Navigation manifest not found at: ${navManifestPath}`);
}

// ------------------------------------------------------------------------------
// 2. GENERATE AGENTS.md AT WORKSPACE ROOT
// ------------------------------------------------------------------------------
if (navManifest && Array.isArray(navManifest.surfaces)) {
  const agentsMdPath = path.join(ROOT_DIR, 'AGENTS.md');
  let agentsMd = `<!-- [AUTO-GENERATED BY build_suite.js FROM docs/navigation_manifest.json - DO NOT EDIT DIRECTLY] -->
# AGENTS.md: Creator Studio Agent Operating Manual & Router

Welcome. You are operating in **Creator Studio**, a universal, system-agnostic campaign authoring workstation.
Before editing any file, consult this router to identify authoritative specifications, data sources, and compilation requirements.

Use [docs/agents/START_HERE.md](docs/agents/START_HERE.md) when starting a new session, resuming work, locating current subsystem owners, or checking portable campaign package contracts.

## 1. Ground Rules & Invariants
1. **Zero-CORS Offline Execution**: Open all compiled HTML tools (\`start.html\`, \`network/*.html\`, \`regions/*.html\`, \`wiki/*.html\`) directly via the \`file:///\` protocol in any standard browser without a web server, external CDN, or HTTP \`fetch()\`. Use browser IndexedDB (\`CreatorStudioMapDB\`) and localStorage for client state.
2. **Modular Source of Truth**: Edit workstation UI and logic in \`src/workstation/template.html\` and \`src/workstation/scripts/*.js\` (compiled and inlined into \`start.html\`). Edit data in source Markdown/JSON files rather than inlined HTML constants (\`ALL_MODULES\`, \`CAMPAIGN_REGISTRY\`, \`MASTER_TICKETS_DATA\`).
3. **Suite Compilation**: After updating any module, topology, preset, workstation script, or wiki source, compile the suite via:
   \`\`\`powershell
   powershell -ExecutionPolicy Bypass -File .\\Build-Suite.ps1
   \`\`\`
4. **Bidirectional Codebase Wiki & Backlinks (\`wiki/\`)**: All primary workstation HTML surfaces, architectural specifications, worldbuilding modules, and authoritative data models have a 1:1 Markdown source in \`wiki/src/files/<relPath>.md\` and compiled HTML page in \`wiki/pages/<relPath>.html\`. Whenever you create or modify a tracked file, update its \`<!-- BEGIN_CUSTOM_NOTES -->\` block and run \`Build-Suite.ps1 --stamp-reviewed\` (or update \`reviewed_hash\`).
5. **Zero-Token Codebase Graph Inspection (\`Find-CodebaseNode.ps1\`)**: Before grepping across the repository or reading large files, query \`wiki/wiki_graph.json\` via \`Find-CodebaseNode.ps1\` to inspect a file's callers/backlinks (\`-File "<path>"\`), locate symbol definitions (\`-Symbol "<name>"\`), trace resource supply chains (\`-Resource "<tag>"\`), or check documentation drift (\`-Stale\`).
6. **Diff-Driven Token Optimization & Atomic Commits**: Never re-read entire multi-hundred-line files solely to verify modifications. Use \`git diff\` (and \`git diff --stat\`) for granular token verification. Keep changes tracked under Conventional Atomic Commits, allowing any agent session to anchor state to commit hashes with zero token overhead.
7. **Unbounded Read Ban & Source-Only Worktrees**: Never perform unbounded whole-file reads or broad greps on compiled monolithic distributions (\`start.html\`, \`network/platform_audit_dashboard.html\`, \`wiki/wiki_graph.json\`). Diagnostic line reads are permitted strictly within bounded windows ($\le 50$ lines) for build error triage. Subagents working in isolated branches or worktrees must follow the **Source-Only Invariant** (never run \`Build-Suite.ps1\` or commit compiled bundles in branch sandboxes).

## 2. Task-Branch Context Pointers
- **Fast Graph / Symbol / Backlink Lookup**: Run \`powershell -ExecutionPolicy Bypass -File .\\Find-CodebaseNode.ps1 -File "<path>"\` or \`-Symbol "<name>"\`.
- **Fast Scoped Search (Ripgrep)**: Run \`rg "<pattern>" .\` (automatically respects root \`.ignore\` and skips compiled distributions).
- **Diff-Driven Context & Git State**: Run \`git status -s\` or \`git diff -U3 "<path>"\` for minimal-token change verification. Run \`git log -S "<symbol>" -p\` to trace historical changes without large file reads.
- **Workstation UI / MDI / Canvas (\`start.html\`)**: Read \`docs/adr/0004-desktop-workstation-start-html.md\` and \`docs/adr/0007-unified-workstation-consolidating-index-and-campaign-studio.md\`. Edit \`src/workstation/scripts/*.js\` and \`src/workstation/template.html\`.
- **Entities / Slotting / Module Explorer**: Read \`docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md\` and \`docs/adr/0006-comprehensive-module-explorer-and-mechanics-inspector.md\`. Edit \`src/workstation/scripts/entity_core.js\`, \`entity_manager_ui.js\`, \`entity_crud_dialogs.js\`, \`entity_cascade_delete.js\`, \`module_explorer.js\`, \`supply_chain_simulator.js\`.
- **Campaign Presets & Worldbuilding Modules**: Read \`docs/srd/campaign_preset_specification_srd.md\`, \`docs/srd/ip_module_framework_srd.md\`, \`docs/srd/scenario_primitives_srd.md\`. Validate via \`powershell -File .\\campaigns\\Test-CampaignPackage.ps1\`.
- **Multi-Scale Maps & In-App Wiki (\`[[Token]]\`)**: Read \`docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md\` and \`docs/AI_DEVELOPER_GUIDE.md\`. Edit \`src/workstation/scripts/state_adapter.js\`, \`map_navigator.js\`, \`wiki_engine.js\`.
- **Git Architecture & Token Economy**: Read \`docs/adr/0019-git-integrated-token-optimization-and-diff-driven-agent-workflows.md\`.

## 3. Surface-to-Authority Routing Matrix

| Surface File | Title / Purpose & Invariant | Read This Authority Spec FIRST | Authoritative Data Source |
| :--- | :--- | :--- | :--- |
`;

  navManifest.surfaces.forEach(s => {
    const specsFormatted = s.authoritative_specs.map(spec => `\`${spec}\``).join('<br>');
    const dataFormatted = s.data_sources.map(d => `\`${d}\``).join('<br>');
    const fileLink = `**\`${s.file}\`**`;
    let desc = s.title;
    if (s.immutable_rule) {
      desc += `<br><em>${s.immutable_rule}</em>`;
    }
    if (s.build_cmd) {
      desc += `<br><code>Run: ${s.build_cmd}</code>`;
    }
    agentsMd += `| ${fileLink} | ${desc} | ${specsFormatted} | ${dataFormatted} |\n`;
  });

  agentsMd += `
## 4. Documentation Surfaces
| Path | Covers | Voice |
| :--- | :--- | :--- |
| \`docs/adr/0004-desktop-workstation-start-html.md\` | start.html, desktop shell, MDI, Win95 | atomic-prose |
| \`docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md\` | entities, npcs, quests, items, dials, roster | atomic-prose |
| \`docs/adr/0006-comprehensive-module-explorer-and-mechanics-inspector.md\` | module explorer, mechanics inspector | atomic-prose |
| \`docs/adr/0007-unified-workstation-consolidating-index-and-campaign-studio.md\` | index.html, campaign_studio.html consolidation | atomic-prose |
| \`docs/adr/0016-workstation-2-5-zero-install-loopback-and-legacy-framework-retirement.md\` | server.js, server.ps1, loopback, zero-install | atomic-prose |
| \`docs/adr/0017-scale-fluid-node-exploration-dynamic-svg-stacking-and-desktop-shell-assimilation.md\` | node explorer, dynamic svg stacking, desktop shell | atomic-prose |
| \`docs/adr/0019-git-integrated-token-optimization-and-diff-driven-agent-workflows.md\` | git, diff, worktrees, token savings, atomic commits, node shim, ripgrep, unbounded read-ban, ast-inspection | atomic-prose |
| \`docs/adr/0020-scale-fluid-edge-explorer-and-conduit-catalog.md\` | edge explorer, conduits, dedicated flows, property grid mounting, scale-fluid corridors | atomic-prose |
| \`docs/adr/0021-first-class-factions-and-inter-entity-relational-social-graphs.md\` | factions, cultural quadrants, diplomatic matrix, territorial control, leader npcs | atomic-prose |

## 5. Domain Terminology
Always consult [\`CONTEXT.md\`](CONTEXT.md) for canonical terminology.

### Core Workstation Vocabulary
- **Pointcrawl Graph**: Mathematical network of spatial nodes connected by traversable edges with directional influence weights (avoid: *map*, *hex grid*).
- **Granular Disposition \`[S, E, C]\`**: 3D coordinate vector yielding 64 discrete archetypes (avoid: *alignment*, *stats*).
- **CVF Cultural Quadrant**: Clan, Adhocracy, Market, Hierarchy sociopolitical archetype derived from \`[S, E]\` vectors (avoid: *factions*, *colors*).
- **Worldbuilding Pipeline Tier 1..5**: Module stages from Macro Governance (Tier 1) to Climax Engines (Tier 5).
- **Scale-Fluidity & Portal Node**: Recursive multi-scale pointcrawl trees connected via \`childMapId\` portal rings across arbitrary scale tiers (avoid: *sub-maps*, *minimaps*).
- **Active Campaign Roster**: Authoritative NPCs, quests, items, dials, and tickets stationed on active nodes (avoid: *character list*, *database*).
- **Workstation Mod**: Self-contained client-side extension encapsulated in \`mods/<id>/mod.js\` registering hooks via \`window.CreatorStudio.registerMod()\` (avoid: *plugin*, *addon*).

## 6. Agent skills

### Issue tracker

Tickets are local files compiled into \`tickets/master_ticket_manifest.json\` and viewed in the app (no GitHub Issues, no web access). See \`docs/agents/issue-tracker.md\`.

### Triage labels

Default five-role vocabulary recorded in each ticket's \`triage:\` frontmatter field; \`wontfix\` also sets \`status: rejected\`. See \`docs/agents/triage-labels.md\`.

### Domain docs

Single-context: root \`CONTEXT.md\` plus \`docs/adr/\`. See \`docs/agents/domain.md\`.
`;

  safeWriteFileSync(agentsMdPath, agentsMd, 'utf8');
  console.log(`[OK] Generated AGENTS.md at workspace root.`);
}

// ------------------------------------------------------------------------------
// 3. DISCOVER CAMPAIGNS & ASSEMBLE CAMPAIGN REGISTRY
// ------------------------------------------------------------------------------
const campaignsDir = path.join(ROOT_DIR, 'campaigns');
const campaignRegistry = {};
const resolveCampaignId = (meta, folder) => (meta && meta.id) || folder.name;

if (fs.existsSync(campaignsDir)) {
  const campaignFolders = fs.readdirSync(campaignsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_') && !dirent.name.startsWith('.'));
  
  for (const folder of campaignFolders) {
    const cPath = path.join(campaignsDir, folder.name);
    const metaFile = path.join(cPath, 'campaign.json');
    if (fs.existsSync(metaFile)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
        meta.enabled = (meta.enabled !== false);
        const presetPath = path.join(cPath, meta.presetFile || 'preset.json');
        let presetData = fs.existsSync(presetPath) ? JSON.parse(fs.readFileSync(presetPath, 'utf8')) : null;
        if (!presetData) {
          const topoFallback = path.join(cPath, meta.topologyFile || 'topology.json');
          if (fs.existsSync(topoFallback)) {
            presetData = JSON.parse(fs.readFileSync(topoFallback, 'utf8'));
          }
        }
        if (presetData && presetData.nodes && !Array.isArray(presetData.nodes) && typeof presetData.nodes === 'object') {
          presetData.nodes = Object.values(presetData.nodes);
        }

        if (presetData && presetData.maps && typeof presetData.maps === 'object') {
          for (const mId of Object.keys(presetData.maps)) {
            const mMap = presetData.maps[mId];
            if (!mMap) continue;
            const hasNodes = Array.isArray(mMap.nodes) ? mMap.nodes.length > 0 : (mMap.nodes && typeof mMap.nodes === 'object' && Object.keys(mMap.nodes).length > 0);
            if (!hasNodes && Array.isArray(presetData.nodes) && presetData.nodes.length > 0) {
              if (Array.isArray(mMap.nodeIds) && mMap.nodeIds.length > 0) {
                const idSet = new Set(mMap.nodeIds.map(String));
                mMap.nodes = presetData.nodes.filter(n => n && idSet.has(String(n.id)));
              } else if (presetData.nodes.some(n => n && n.mapId === mId)) {
                mMap.nodes = presetData.nodes.filter(n => n && n.mapId === mId);
              } else if (Object.keys(presetData.maps).length === 1) {
                mMap.nodes = [...presetData.nodes];
              }
            }
          }
        }

        if (presetData && (!presetData.nodes || !presetData.nodes.length) && presetData.maps) {
          const rootId = presetData.activeMapId || presetData.rootMapId || Object.keys(presetData.maps)[0] || 'map_root';
          if (presetData.maps[rootId]) {
            presetData.name = presetData.name || meta.name || presetData.maps[rootId].name;
            presetData.nodes = Array.isArray(presetData.maps[rootId].nodes) ? presetData.maps[rootId].nodes : (presetData.maps[rootId].nodes ? Object.values(presetData.maps[rootId].nodes) : []);
            presetData.links = presetData.maps[rootId].links || [];
          }
        }

        // Normalize node coordinates and inline raster images for zero-CORS offline execution
        if (presetData && presetData.maps) {
          for (const mId of Object.keys(presetData.maps)) {
            const mMap = presetData.maps[mId];
            if (mMap && Array.isArray(mMap.nodes)) {
              mMap.nodes.forEach(n => {
                const rawX = (n.coordinates && n.coordinates.x !== undefined) ? n.coordinates.x : n.x;
                const rawY = (n.coordinates && n.coordinates.y !== undefined) ? n.coordinates.y : n.y;
                const numX = Number(rawX);
                const numY = Number(rawY);
                if (Number.isFinite(numX)) {
                  n.x = numX;
                  if (!n.coordinates) n.coordinates = {};
                  n.coordinates.x = numX;
                }
                if (Number.isFinite(numY)) {
                  n.y = numY;
                  if (!n.coordinates) n.coordinates = {};
                  n.coordinates.y = numY;
                }
              });
            }
            if (mMap) {
              let relPath = (mMap.mapMetadata && mMap.mapMetadata.assetPath) ? mMap.mapMetadata.assetPath.replace(/^\//, '') : '';
              if (!relPath || !fs.existsSync(path.join(cPath, relPath))) {
                const candidates = [];
                const shortId = mId.replace(/^map_bg1_/, '').replace(/^map_/, '');
                for (const candExt of ['png', 'jpg', 'jpeg', 'webp', 'gif']) {
                  candidates.push(`assets/${mId}_bg.${candExt}`);
                  candidates.push(`assets/${mId}.${candExt}`);
                  candidates.push(`assets/${shortId}_bg.${candExt}`);
                  candidates.push(`assets/${shortId}.${candExt}`);
                }
                for (const candRel of candidates) {
                  if (fs.existsSync(path.join(cPath, candRel))) {
                    relPath = candRel;
                    break;
                  }
                }
              }
              if (mMap.mapMetadata && typeof mMap.mapMetadata.url === 'string' && mMap.mapMetadata.url.startsWith('data:')) {
                delete mMap.mapMetadata.url;
              }
              if (relPath) {
                const imgFile = path.join(cPath, relPath);
                if (fs.existsSync(imgFile)) {
                  try {
                    const ext = path.extname(imgFile).toLowerCase().replace('.', '');
                    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : (ext === 'webp' ? 'image/webp' : (ext === 'gif' ? 'image/gif' : 'image/png'));
                    const imgBuf = fs.readFileSync(imgFile);
                    const imgBase64 = imgBuf.toString('base64');
                    let w = 1920, h = 1080;
                    if (ext === 'png' && imgBuf.length > 24) {
                      w = imgBuf.readUInt32BE(16);
                      h = imgBuf.readUInt32BE(20);
                    } else if (ext === 'gif' && imgBuf.length > 10) {
                      w = imgBuf.readUInt16LE(6);
                      h = imgBuf.readUInt16LE(8);
                    }
                    if (!mMap.mapMetadata) mMap.mapMetadata = { id: mId, name: path.basename(imgFile), width: w, height: h, opacity: 0.85 };
                    mMap.mapMetadata.assetPath = relPath;
                    mMap.mapMetadata.dataUrl = `data:${mime};base64,${imgBase64}`;
                    if (!mMap.mapMetadata.width || mMap.mapMetadata.width === 1920) mMap.mapMetadata.width = w;
                    if (!mMap.mapMetadata.height || mMap.mapMetadata.height === 1080) mMap.mapMetadata.height = h;
                  } catch(e) {}
                }
              }
            }
          }
          // Prevent duplicate base64 map payloads inside presetData.activeTopology.maps
          if (presetData.activeTopology && presetData.activeTopology.maps && typeof presetData.activeTopology.maps === 'object') {
            for (const amId of Object.keys(presetData.activeTopology.maps)) {
              const am = presetData.activeTopology.maps[amId];
              if (am && am.mapMetadata) {
                delete am.mapMetadata.dataUrl;
                if (typeof am.mapMetadata.url === 'string' && am.mapMetadata.url.startsWith('data:')) {
                  delete am.mapMetadata.url;
                }
              }
            }
          }
        }

        // Synchronize entities bidirectionally between preset and metadata
        if (presetData) {
          if (!presetData.entities || Object.keys(presetData.entities).length === 0) {
            if (meta.entities) presetData.entities = meta.entities;
          } else if (!meta.entities || Object.keys(meta.entities).length === 0) {
            meta.entities = presetData.entities;
          }

          if (Array.isArray(presetData.creatures) && presetData.creatures.length > 0) {
            if (!presetData.entities) presetData.entities = {};
            if (!presetData.entities.creatures || presetData.entities.creatures.length === 0) {
              presetData.entities.creatures = presetData.creatures;
            }
            if (meta.entities && (!meta.entities.creatures || meta.entities.creatures.length === 0)) {
              meta.entities.creatures = presetData.creatures;
            }
          } else if (presetData.entities && Array.isArray(presetData.entities.creatures) && presetData.entities.creatures.length > 0) {
            if (!presetData.creatures) presetData.creatures = presetData.entities.creatures;
          }

          // Zero-CORS Bestiary Evidence Support (campaigns/<id>/creatures/evidence.json)
          const evidencePath = path.join(cPath, 'creatures', 'evidence.json');
          if (fs.existsSync(evidencePath)) {
            try {
              const evidenceData = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
              presetData.creatureEvidence = evidenceData;
              if (presetData.entities) presetData.entities.creatureEvidence = evidenceData;
              if (meta.entities) meta.entities.creatureEvidence = evidenceData;
            } catch (evErr) {
              console.warn(`[WARN] Failed to parse creature evidence in ${evidencePath}:`, evErr.message);
            }
          }
        }
        
        const deletedSet = new Set((meta.entities?.deletedModules || presetData?.deletedModules || []).map(String));
        const diskModules = scanModulesDirRecursive(path.join(cPath, 'modules'), cPath, deletedSet);

        let modulesData = [];
        const manifestPath = path.join(cPath, meta.manifestFile || 'modules_manifest.json');
        let manifestList = [];
        if (fs.existsSync(manifestPath)) {
          try {
            manifestList = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          } catch(e) {}
        }

        const diskMap = new Map();
        diskModules.forEach(dm => diskMap.set(String(dm.id), dm));

        const merged = [];
        const seenIds = new Set();

        if (Array.isArray(manifestList)) {
          manifestList.forEach(m => {
            if (!m || !m.id || deletedSet.has(String(m.id))) return;
            const sId = String(m.id);
            if (diskMap.has(sId)) {
              const dm = diskMap.get(sId);
              merged.push(mergeModuleDiskAndManifest(dm, m));
              seenIds.add(sId);
            } else if (m.isCustom) {
              merged.push(m);
              seenIds.add(sId);
            }
          });
        }

        diskModules.forEach(dm => {
          const sId = String(dm.id);
          if (!seenIds.has(sId)) {
            merged.push(dm);
            seenIds.add(sId);
          }
        });

        modulesData = merged;

        // Enrich modules with structured tabletop & industrial metadata (dials, clocks, four_corners, prose, file_url)
        modulesData.forEach(m => {
          let resolvedPath = path.resolve(cPath, m.path || '');
          if (!fs.existsSync(resolvedPath)) {
            const fallback = path.join(cPath, 'modules', path.basename(m.path || ''));
            if (fs.existsSync(fallback)) resolvedPath = fallback;
          }
          const rawMd = fs.existsSync(resolvedPath) ? fs.readFileSync(resolvedPath, 'utf8') : '';
          enrichModuleFromMarkdown(m, rawMd, cPath);
        });

        // Persist healed manifest back to disk if needed
        try {
          fs.writeFileSync(manifestPath, JSON.stringify(modulesData, null, 2) + '\n', 'utf8');
        } catch(writeErr) {
          console.warn(`[WARN] Could not update ${manifestPath}:`, writeErr.message);
        }

        // Campaign-supplied ODV archetype matrix (overlay on built-in ODV_MATRIX_64).
        // Convention: campaigns/<id>/odv/matrix.json, odv_matrix.json, or odv_matrix_*.json
        const overrides = {};
        try {
          const slotsLib = require('./src/workstation/scripts/campaign_override_slots.js');
          const rels = [];
          ['', 'odv', 'overrides', 'overrides/odv'].forEach(sub => {
            const d = path.join(cPath, sub);
            if (fs.existsSync(d) && fs.statSync(d).isDirectory()) {
              fs.readdirSync(d).sort().forEach(f => { if (fs.statSync(path.join(d, f)).isFile()) rels.push((sub ? sub + '/' : '') + f); });
            }
          });
          slotsLib.CAMPAIGN_OVERRIDE_SLOTS.forEach(slot => {
            const hit = rels.find(r => slotsLib.matchSlotFile(r, [slot]));
            if (!hit) return;
            const payload = slot.parse(fs.readFileSync(path.join(cPath, hit), 'utf8'));
            const warns = slot.validate(payload) || [];
            overrides[slot.id] = payload;
            console.log(`[OK] Override slot '${slot.id}' for '${resolveCampaignId(meta, folder)}' from ${hit}${warns.length ? ' [WARN ' + warns.join('; ') + ']' : ''}`);
          });
        } catch (ovErr) {
          console.warn(`[WARN] Override slot in ${cPath} unreadable:`, ovErr.message);
        }

        const cId = meta.id || folder.name;
        campaignRegistry[cId] = {
          id: cId,
          folder: folder.name,
          metadata: meta,
          preset: presetData,
          modules: modulesData
        };
        if (presetData && presetData.creatureEvidence) {
          campaignRegistry[cId].creatureEvidence = presetData.creatureEvidence;
        }
        if (Object.keys(overrides).length) campaignRegistry[cId].overrides = overrides;
        console.log(`[OK] Registered Campaign Sourcebook '${meta.name || cId}' (${modulesData.length} modules, enabled: ${meta.enabled}) from campaigns/${folder.name}`);
      } catch (err) {
        console.warn(`[WARN] Failed to parse campaign in ${cPath}:`, err.message);
      }
    }
  }
}

// Emit campaign ODV matrices for standalone network pages (zero-CORS script tag, generated; do not hand-edit)
{
  const reg = {};
  const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  Object.keys(campaignRegistry).forEach(k => {
    const c = campaignRegistry[k];
    if (!c.overrides || !c.overrides.odvMatrix) return;
    const ids = Array.from(new Set([c.id, c.folder].filter(Boolean))).map(esc);
    reg[k] = { label: (c.metadata && c.metadata.name) || k, match: ids.join('|'), matrix: c.overrides.odvMatrix.matrix };
  });
  const out = path.join(__dirname, 'network', 'campaign_odv_matrices.js');
  fs.writeFileSync(out,
    '// GENERATED by build_suite.js from campaigns/*/odv_matrix*.json. Do not edit.\n' +
    'window.CS_CAMPAIGN_ODV_MATRICES = ' + JSON.stringify(reg) + ';\n', 'utf8');
}

// Determine default campaign and baseline datasets
const defaultCampaignId = campaignRegistry['generic_starter'] ? 'generic_starter' : (Object.keys(campaignRegistry)[0] || 'generic');
let modules = (campaignRegistry[defaultCampaignId] && campaignRegistry[defaultCampaignId].modules) || [];

// Sync default modules to network/modules_manifest.json for offline fallback
const networkManifestPath = path.join(NETWORK_DIR, 'modules_manifest.json');
fs.writeFileSync(networkManifestPath, JSON.stringify(modules, null, 2), 'utf8');

// ------------------------------------------------------------------------------
// 4c. COMPILE ALL_SURFACES_DATA FOR WORKSTATION SURFACE CATALOG
// ------------------------------------------------------------------------------
let compiledSurfacesData = [];
if (navManifest && Array.isArray(navManifest.surfaces)) {
  compiledSurfacesData = navManifest.surfaces.map(s => {
    let cat = 'core';
    let icon = 'âš¡';
    const f = s.file.toLowerCase();
    if (f.startsWith('regions/')) {
      cat = 'assets';
      icon = f.endsWith('.ps1') ? 'ðŸ’»' : 'ðŸ–¼ï¸';
    } else if (f.startsWith('tickets/')) {
      cat = 'trackers';
      icon = f.includes('tier_0') ? 'ðŸŒ¾' : 'ðŸŽ¯';
    } else if (f.startsWith('modules/')) {
      cat = 'modules';
      icon = 'ðŸ“¦';
    } else if (f.startsWith('network/')) {
      cat = 'core';
      if (f.includes('builder')) icon = 'ðŸ“';
      else if (f.includes('visualizer')) icon = 'ðŸŒŠ';
      else if (f.includes('contradiction')) icon = 'âš–ï¸';
      else if (f.includes('audit')) icon = 'ðŸ”';
      else if (f.endsWith('.ps1')) icon = 'âš™ï¸';
    } else if (f.includes('wiki')) {
      cat = 'core';
      icon = 'ðŸ“š';
    } else if (f.includes('admin')) {
      cat = 'core';
      icon = 'ðŸ› ï¸';
    }

    const wikiFile = (s.file === 'wiki/index.html') ? 'wiki/index.html' : `wiki/pages/${s.file}.html`;

    return {
      id: s.file.replace(/[^a-zA-Z0-9_-]/g, '_'),
      file: s.file,
      type: s.type || 'html',
      title: s.title,
      category: cat,
      icon: icon,
      wikiFile: wikiFile,
      authoritative_specs: s.authoritative_specs || [],
      data_sources: s.data_sources || [],
      build_cmd: s.build_cmd || null,
      immutable_rule: s.immutable_rule || ''
    };
  });
  console.log(`[OK] Compiled ${compiledSurfacesData.length} surfaces into ALL_SURFACES_DATA.`);
}

// ------------------------------------------------------------------------------
// 5. CAMPAIGN STUDIO DEPRECATION NOTICE (CONSOLIDATED INTO start.html)
// ------------------------------------------------------------------------------
// network/campaign_studio.html is now deprecated and compiled as a zero-CORS
// redirect stub pointing to start.html in Step 6e. Legacy src/campaign_studio/ pruned in Wave 1.
console.log(`[INFO] Pointcrawl Studio features consolidated into Universal Workstation (start.html).`);

// ------------------------------------------------------------------------------
// 6a. LEGACY NETWORK BUILDER (CONSOLIDATED INTO start.html)
// ------------------------------------------------------------------------------
// network/network_builder.html is deprecated and compiled as a zero-CORS
// redirect stub pointing to start.html in Step 6e. Pointcrawl CAD editing is native in start.html.

// ------------------------------------------------------------------------------
// 6b. COMPILE network/platform_audit_dashboard.html
// ------------------------------------------------------------------------------
const auditDashboardPath = path.join(NETWORK_DIR, 'platform_audit_dashboard.html');
const ticketsManifestPath = path.join(ROOT_DIR, 'tickets', 'creative', 'creative_backlog_manifest.json');

let ticketsData = [];
if (fs.existsSync(ticketsManifestPath)) {
  try {
    let rawTickets = fs.readFileSync(ticketsManifestPath, 'utf8');
    if (rawTickets.charCodeAt(0) === 0xFEFF) {
      rawTickets = rawTickets.slice(1);
    }
    ticketsData = JSON.parse(rawTickets);
    console.log(`[OK] Loaded ${ticketsData.length} creative writing tickets from tickets/creative/`);
  } catch (err) {
    console.warn(`[WARN] Failed to parse creative backlog manifest:`, err.message);
  }
}

// Assemble all enriched modules across active campaigns with narrative entity extraction
const allEnrichedModules = [];
Object.keys(campaignRegistry).forEach(cId => {
  const camp = campaignRegistry[cId];
  const campFolder = path.join(campaignsDir, camp.folder || cId);
  (camp.modules || []).forEach(m => {
    let resolvedPath = path.resolve(campFolder, m.path || '');
    if (!fs.existsSync(resolvedPath)) {
      const fallback = path.join(campFolder, 'modules', path.basename(m.path || ''));
      if (fs.existsSync(fallback)) resolvedPath = fallback;
    }
    let rawMarkdown = '';
    if (fs.existsSync(resolvedPath)) {
      rawMarkdown = fs.readFileSync(resolvedPath, 'utf8');
    }
    const fileUrl = toRootRelUrl(resolvedPath);
    const entities = enrichModuleEntities(m, rawMarkdown);

    allEnrichedModules.push({
      ...m,
      campaign: cId,
      campaign_name: (camp.metadata && camp.metadata.name) || cId,
      raw_markdown: rawMarkdown,
      file_url: fileUrl,
      extracted_npcs: entities.npcs,
      extracted_quests: entities.quests,
      extracted_items: entities.items
    });
  });
});

// ------------------------------------------------------------------------------
// 6b-2. DISCOVER & ENRICH CAMPAIGN-INDEPENDENT WORKSTATION MOD MODULES (mods/*/modules/)
// ------------------------------------------------------------------------------
const MODS_DIR = path.join(ROOT_DIR, 'mods');
if (fs.existsSync(MODS_DIR)) {
  const modFoldersForModules = fs.readdirSync(MODS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const folder of modFoldersForModules) {
    const modFolderPath = path.join(MODS_DIR, folder.name);
    const modJsonPath = path.join(modFolderPath, 'mod.json');
    let modMeta = { id: folder.name, name: folder.name, enabled: true };
    if (fs.existsSync(modJsonPath)) {
      try { modMeta = JSON.parse(fs.readFileSync(modJsonPath, 'utf8')); } catch (e) {}
    }
    if (modMeta.enabled === false) continue;

    const modModulesDir = path.join(modFolderPath, 'modules');
    if (fs.existsSync(modModulesDir)) {
      const modDiskModules = scanModulesDirRecursive(modModulesDir, modFolderPath, new Set());
      const modManifestPath = path.join(modFolderPath, 'modules_manifest.json');
      try {
        safeWriteFileSync(modManifestPath, JSON.stringify(modDiskModules, null, 2) + '\n', 'utf8');
      } catch (e) {}

      modDiskModules.forEach(m => {
        const resolvedPath = path.resolve(modFolderPath, m.path || '');
        let rawMarkdown = '';
        if (fs.existsSync(resolvedPath)) {
          rawMarkdown = fs.readFileSync(resolvedPath, 'utf8');
        }
        enrichModuleFromMarkdown(m, rawMarkdown, modFolderPath);
        const fileUrl = toRootRelUrl(resolvedPath);
        const entities = enrichModuleEntities(m, rawMarkdown);

        allEnrichedModules.push({
          ...m,
          campaign: `mod_${modMeta.id || folder.name}`,
          campaign_name: `Mod: ${modMeta.name || folder.name}`,
          isUniversalMod: true,
          mod_id: modMeta.id || folder.name,
          raw_markdown: rawMarkdown,
          file_url: fileUrl,
          extracted_npcs: entities.npcs,
          extracted_quests: entities.quests,
          extracted_items: entities.items
        });
      });
      console.log(`[OK] Loaded ${modDiskModules.length} campaign-independent modules from Workstation Mod '${modMeta.name || folder.name}' (mods/${folder.name}/modules).`);
    }
  }
}

applyResourceConsumerIndex(allEnrichedModules);
console.log(`[OK] Enriched ${allEnrichedModules.length} total modules across ${Object.keys(campaignRegistry).length} campaigns for audit dashboard & workstation.`);

const lightAuditRegistry = Object.fromEntries(
  Object.entries(campaignRegistry).map(([id, entry]) => {
    const lightMeta = entry.metadata ? { ...entry.metadata } : {};
    delete lightMeta.entities;
    delete lightMeta.npcs;
    delete lightMeta.quests;
    delete lightMeta.items;
    delete lightMeta.creatures;
    delete lightMeta.creatureEvidence;
    return [id, {
      id: entry.id || id,
      folder: entry.folder || id,
      metadata: lightMeta,
      modules: entry.modules || []
    }];
  })
);

const auditDatasetsBlock = `// ============================================================================
// [AUTO-GENERATED AUDIT DATASETS VIA build_suite.js - DO NOT EDIT DIRECTLY]
// Campaigns Registered: ${Object.keys(campaignRegistry).length} | Total Modules: ${allEnrichedModules.length} | Tickets: ${ticketsData.length}
// ============================================================================
const CAMPAIGN_REGISTRY = ${JSON.stringify(lightAuditRegistry, null, 2)};
const ALL_MODULES = ${JSON.stringify(allEnrichedModules).replace(/<\/script>/gi, '<\\/script>')};
const TICKETS = ${JSON.stringify(ticketsData, null, 2)};
// ============================================================================
// [END AUTO-GENERATED AUDIT DATASETS]
// ============================================================================`;
const auditDatasetsBlockRebased = rebaseFileUrls(auditDatasetsBlock, '../');

if (fs.existsSync(auditDashboardPath)) {
  let auditContent = fs.readFileSync(auditDashboardPath, 'utf8');
  const auditRegexFenced = /\/\/ =+[\s\S]*?\[AUTO-GENERATED AUDIT DATASETS VIA build_suite\.js[\s\S]*?\/\/ =+[\s\S]*?\[END AUTO-GENERATED AUDIT DATASETS\]\r?\n\/\/ =+/;
  const auditRegexOld = /const MODULES = \[[\s\S]*?\];\r?\n\s*const TICKETS = \[[\s\S]*?\];/;

  if (auditRegexFenced.test(auditContent)) {
    auditContent = auditContent.replace(auditRegexFenced, () => auditDatasetsBlockRebased);
    console.log(`[OK] Refreshed fenced audit datasets in network/platform_audit_dashboard.html`);
  } else if (auditRegexOld.test(auditContent)) {
    auditContent = auditContent.replace(auditRegexOld, () => auditDatasetsBlockRebased);
    console.log(`[OK] Upgraded inlined datasets to fenced audit datasets in network/platform_audit_dashboard.html`);
  } else {
    console.warn(`[WARN] Could not find audit dataset replacement target in platform_audit_dashboard.html`);
  }

  safeWriteFileSync(auditDashboardPath, auditContent, 'utf8');
}

// ------------------------------------------------------------------------------
// 6c. COMPILE tickets/unified_ticket_tracker.html & master_ticket_manifest.json
// ------------------------------------------------------------------------------
const unifiedTrackerScript = path.join(ROOT_DIR, 'tickets', 'build_unified_tracker.js');
let masterTickets = [];
if (fs.existsSync(unifiedTrackerScript)) {
  try {
    const trackerOutput = execSync(`"${process.execPath}" "${unifiedTrackerScript}"`, {
      cwd: path.join(ROOT_DIR, 'tickets'),
      encoding: 'utf8'
    });
    console.log(`[OK] Synchronized Unified Master Ticket Tracker across CWT, Tier 0, and SYS.`);
  } catch (err) {
    console.warn(`[WARN] Failed to compile unified ticket tracker:`, err.message);
  }
}

const masterTicketsManifestPath = path.join(ROOT_DIR, 'tickets', 'master_ticket_manifest.json');
if (fs.existsSync(masterTicketsManifestPath)) {
  try {
    masterTickets = JSON.parse(fs.readFileSync(masterTicketsManifestPath, 'utf8'));
  } catch (err) {
    console.warn(`[WARN] Failed to read master_ticket_manifest.json:`, err.message);
  }
}

// ------------------------------------------------------------------------------
// 6c. COMPILE CLIENT-SIDE WORKSTATION MODS (mods/)
// ------------------------------------------------------------------------------
const activeMods = [];
let modsScriptBundle = '';

if (fs.existsSync(MODS_DIR)) {
  const modFolders = fs.readdirSync(MODS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const folder of modFolders) {
    const modFolderPath = path.join(MODS_DIR, folder.name);
    const modJsonPath = path.join(modFolderPath, 'mod.json');
    let modMeta = { id: folder.name, name: folder.name, enabled: true };
    if (fs.existsSync(modJsonPath)) {
      try {
        modMeta = JSON.parse(fs.readFileSync(modJsonPath, 'utf8'));
      } catch (e) {
        console.warn(`[WARN] Could not parse mod.json in ${folder.name}:`, e.message);
      }
    }

    if (modMeta.enabled !== false) {
      const injectList = Array.isArray(modMeta.injectDatasets) ? modMeta.injectDatasets : [];

      // Dynamic dataset injection: REGIONAL_BIOMES_TREE
      if (injectList.includes('REGIONAL_BIOMES_TREE') || folder.name === 'regional_biomes') {
        const regImagesDir = path.join(ROOT_DIR, 'regions', 'images');
        const biomeTree = {};
        if (fs.existsSync(regImagesDir)) {
          const cats = fs.readdirSync(regImagesDir, { withFileTypes: true })
            .filter(d => d.isDirectory());
          for (const cat of cats) {
            const catPath = path.join(regImagesDir, cat.name);
            const subcats = fs.readdirSync(catPath, { withFileTypes: true })
              .filter(d => d.isDirectory())
              .map(d => d.name);
            biomeTree[cat.name] = subcats;
          }
        }
        fs.writeFileSync(path.join(modFolderPath, 'biomes_tree.json'), JSON.stringify(biomeTree, null, 2), 'utf8');
        modsScriptBundle += `\nconst REGIONAL_BIOMES_TREE = ${JSON.stringify(biomeTree, null, 2)};\n`;
      }

      const entryFile = modMeta.entry || 'mod.js';
      const entryPath = path.join(modFolderPath, entryFile);
      if (fs.existsSync(entryPath)) {
        let modCode = fs.readFileSync(entryPath, 'utf8');
        modsScriptBundle += `\n// --- BEGIN WORKSTATION MOD: ${modMeta.id} (${modMeta.name || folder.name}) ---\n`;
        modsScriptBundle += `try {\n(function() {\n${modCode}\n})();\n} catch (modErr) { console.error("[WorkstationMod] Failed to initialize mod '${modMeta.id}':", modErr); }\n`;
        modsScriptBundle += `// --- END WORKSTATION MOD: ${modMeta.id} ---\n`;
        activeMods.push(modMeta);
        console.log(`[OK] Registered Workstation Mod '${modMeta.name || modMeta.id}' from mods/${folder.name}`);
      }
    }
  }
}

const startModsBlock = `// ============================================================================
// [AUTO-GENERATED WORKSTATION MODS VIA build_suite.js - DO NOT EDIT DIRECTLY]
// Active Workstation Mods: ${activeMods.length}
// ============================================================================
${modsScriptBundle}
// ============================================================================
// [END AUTO-GENERATED WORKSTATION MODS]
// ============================================================================`;

// ------------------------------------------------------------------------------
// 6d. COMPILE start.html FROM src/workstation/ (Universal Desktop Workstation)
// ------------------------------------------------------------------------------
const startHtmlPath = path.join(ROOT_DIR, 'start.html');
const workstationTemplatePath = path.join(SRC_WORKSTATION_DIR, 'template.html');

// Keep the launcher census small in start.html and emit heavy per-campaign payloads to campaigns/<folder>/campaign_bundle.js.
function compileWorkstationRegistry(registry) {
  const count = collection => Array.isArray(collection) ? collection.length : Object.keys(collection || {}).length;
  const scriptJson = value => JSON.stringify(value).replace(/</g, "\\u003c");
  return Object.entries(registry).map(([id, entry]) => {
    const { preset, metadata, modules, ...identity } = entry;
    const mapCount = count(preset?.maps);
    const rootNodeCount = count(preset?.nodes);
    const mappedNodeCount = Object.values(preset?.maps || {}).reduce((sum, map) => sum + count(map?.nodes), 0);
    const ent = preset?.entities || metadata?.entities || {};
    const summary = {
      title: metadata?.name || preset?.name || id,
      description: metadata?.description || "",
      rootNodeCount,
      presetNodeCount: preset?.nodes ? rootNodeCount : mappedNodeCount,
      nodeCount: mapCount ? mappedNodeCount : rootNodeCount,
      mapsCount: mapCount || 1,
      npcCount: count(preset?.npcs || ent.npcs),
      questCount: count(preset?.quests || ent.quests),
      itemCount: count(preset?.items || ent.items),
      creatureCount: count(preset?.creatures || ent.creatures),
      trackerCount: count(preset?.trackers || ent.trackers),
      factionCount: count(preset?.factions || ent.factions),
      modCount: modules?.length || 0
    };
    const { creatureEvidence, overrides, ...catalogEntry } = identity;
    const folderName = entry.folder || id;
    const bundleUrl = `campaigns/${folderName}/campaign_bundle.js`;

    // Deduplicate redundant activeTopology snapshot and duplicate entity arrays inside preset before writing bundle
    let cleanPreset = preset ? { ...preset } : preset;
    if (cleanPreset) {
      if (cleanPreset.activeTopology && (cleanPreset.maps || cleanPreset.nodes || cleanPreset.entities)) {
        delete cleanPreset.activeTopology;
      }
      if (!cleanPreset.entities && metadata?.entities) {
        cleanPreset.entities = metadata.entities;
      }
      if (cleanPreset.entities) {
        if (cleanPreset.entities.npcs && cleanPreset.npcs) delete cleanPreset.npcs;
        if (cleanPreset.entities.quests && cleanPreset.quests) delete cleanPreset.quests;
        if (cleanPreset.entities.items && cleanPreset.items) delete cleanPreset.items;
        if (cleanPreset.entities.creatures && cleanPreset.creatures) delete cleanPreset.creatures;
        if (cleanPreset.entities.factions && cleanPreset.factions) delete cleanPreset.factions;
        if (cleanPreset.entities.trackers && cleanPreset.trackers) delete cleanPreset.trackers;
      }
    }

    const bundlePayload = {
      preset: cleanPreset,
      creatureEvidence
    };
    const bundleAbsPath = path.join(ROOT_DIR, 'campaigns', folderName, 'campaign_bundle.js');
    const bundleContent =
      `// GENERATED by build_suite.js - Zero-CORS on-demand campaign payload bundle\n` +
      `window.__CS_CAMPAIGN_BUNDLES__ = window.__CS_CAMPAIGN_BUNDLES__ || {};\n` +
      `window.__CS_CAMPAIGN_BUNDLES__[${scriptJson(id)}] = ${scriptJson(bundlePayload)};\n` +
      `if (typeof window.hydrateBundledCampaign === "function") {\n` +
      `  window.hydrateBundledCampaign(${scriptJson(id)}, window.__CS_CAMPAIGN_BUNDLES__[${scriptJson(id)}]);\n` +
      `}\n`;
    try {
      safeWriteFileSync(bundleAbsPath, bundleContent, 'utf8');
    } catch (bundleErr) {
      console.warn(`[WARN] Could not write campaign bundle ${bundleAbsPath}:`, bundleErr.message);
    }

    const lightMetadata = metadata ? { ...metadata } : undefined;
    if (lightMetadata) {
      delete lightMetadata.entities;
      delete lightMetadata.npcs;
      delete lightMetadata.quests;
      delete lightMetadata.items;
      delete lightMetadata.creatures;
      delete lightMetadata.creatureEvidence;
    }

    const fields = { metadata: lightMetadata, modules, overrides };
    const readers = Object.entries(fields)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => key + "() { return " + scriptJson(value) + "; }");
    return "registerBundledCampaign(" + scriptJson(id) + ", " +
      scriptJson({ ...catalogEntry, bundleUrl, summary }) + ", {" + readers.join(", ") + "}, " + !!preset + ");";
  }).join("\n");
}

const registryFenced = `// ============================================================================
// [AUTO-GENERATED CAMPAIGN REGISTRY VIA build_suite.js]
// ============================================================================
${compileWorkstationRegistry(campaignRegistry)}
// ============================================================================`;

const startModulesBlock = `// ============================================================================
// [AUTO-GENERATED ALL_MODULES DATASET VIA build_suite.js - DO NOT EDIT DIRECTLY]
// Campaigns Registered: ${Object.keys(campaignRegistry).length} | Total Modules: ${allEnrichedModules.length}
// ============================================================================
const ALL_MODULES = ${JSON.stringify(allEnrichedModules).replace(/<\/script>/gi, '<\\/script>')};
const MODULES_MANIFEST = ALL_MODULES;
// ============================================================================
// [END AUTO-GENERATED ALL_MODULES DATASET]
// ============================================================================`;

const startTicketsBlock = `// ============================================================================
// [AUTO-GENERATED MASTER_TICKETS_DATA VIA build_suite.js - DO NOT EDIT DIRECTLY]
// Total Master Tickets: ${masterTickets.length}
// ============================================================================
const MASTER_TICKETS_DATA = ${JSON.stringify(masterTickets).replace(/<\/script>/gi, '<\\/script>')};
// ============================================================================
// [END AUTO-GENERATED MASTER_TICKETS_DATA]
// ============================================================================`;

const startSurfacesBlock = `// ============================================================================
// [AUTO-GENERATED ALL_SURFACES_DATA VIA build_suite.js - DO NOT EDIT DIRECTLY]
// Total Tracked Surfaces: ${compiledSurfacesData.length}
// ============================================================================
const ALL_SURFACES_DATA = ${JSON.stringify(compiledSurfacesData, null, 2)};
// ============================================================================
// [END AUTO-GENERATED ALL_SURFACES_DATA]
// ============================================================================`;

if (fs.existsSync(workstationTemplatePath)) {
  let template = fs.readFileSync(workstationTemplatePath, 'utf8');

  // Recursively resolve @@INCLUDE: <relPath> @@
  const includeRegex = /(?:<!--|\/\/|\/\*)\s*@@INCLUDE:\s*([^\s@*]+)\s*@@\s*(?:-->|\*\/)?/g;
  let prevTemplate;
  do {
    prevTemplate = template;
    template = template.replace(includeRegex, (match, relPath) => {
      const fullIncPath = path.join(SRC_WORKSTATION_DIR, relPath);
      if (fs.existsSync(fullIncPath)) {
        return fs.readFileSync(fullIncPath, 'utf8');
      } else {
        console.warn(`[WARN] Missing workstation include file: ${fullIncPath}`);
        return `<!-- [MISSING INCLUDE: ${relPath}] -->`;
      }
    });
  } while (template !== prevTemplate);

  // Inject Datasets
  const buildTimestampStr = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
  template = template.replace(/__CS_BUILD_TIMESTAMP__/g, buildTimestampStr);
  template = template.replace('// @@INJECT_CAMPAIGN_REGISTRY@@', () => registryFenced);
  template = template.replace('// @@INJECT_ALL_MODULES@@', startModulesBlock);
  template = template.replace('// @@INJECT_MASTER_TICKETS_DATA@@', startTicketsBlock);
  template = template.replace('// @@INJECT_ALL_SURFACES@@', startSurfacesBlock);
  template = template.replace('// @@INJECT_WORKSTATION_MODS@@', startModsBlock);

  safeWriteFileSync(startHtmlPath, template, 'utf8');
  console.log(`[OK] Compiled modular start.html from src/workstation/ (${allEnrichedModules.length} modules, ${masterTickets.length} tickets, ${activeMods.length} mods).`);
  
  if (process.argv.includes('--mods-only')) {
    console.log(`[OK] Fast mod compilation complete. Exiting.`);
    process.exit(0);
  }
} else if (fs.existsSync(startHtmlPath)) {
  let startContent = fs.readFileSync(startHtmlPath, 'utf8');
  const startRegexFenced = /\/\/\s*={10,}\r?\n\/\/\s*\[AUTO-GENERATED ALL_MODULES DATASET VIA build_suite\.js[\s\S]*?\/\/\s*\[END AUTO-GENERATED ALL_MODULES DATASET\]\r?\n\/\/\s*={10,}/;
  if (startRegexFenced.test(startContent)) {
    startContent = startContent.replace(startRegexFenced, () => startModulesBlock);
  }
  const startRegexTickets = /\/\/\s*={10,}\r?\n\/\/\s*\[AUTO-GENERATED MASTER_TICKETS_DATA VIA build_suite\.js[\s\S]*?\/\/\s*\[END AUTO-GENERATED MASTER_TICKETS_DATA\]\r?\n\/\/\s*={10,}/;
  if (startRegexTickets.test(startContent)) {
    startContent = startContent.replace(startRegexTickets, () => startTicketsBlock);
  }
  fs.writeFileSync(startHtmlPath, startContent, 'utf8');
  console.log(`[OK] Refreshed datasets in monolithic start.html.`);
}

// ------------------------------------------------------------------------------
// 6e. EMIT DEPRECATION REDIRECT STUBS (index.html & network/campaign_studio.html)
// ------------------------------------------------------------------------------
const indexPath = path.join(ROOT_DIR, 'index.html');
const indexStubContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Creator Studio - Redirecting to Workstation...</title>
<style>
  body { background: #008080; color: #fff; font-family: "Segoe UI", Tahoma, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
  .box { background: #c0c0c0; color: #000; border: 2px solid; border-color: #fff #000 #000 #fff; padding: 20px 30px; box-shadow: 4px 4px 10px rgba(0,0,0,0.5); }
  a { color: #000080; font-weight: bold; }
</style>
<script>
  (function() {
    const params = window.location.search || '';
    const hash = window.location.hash || '';
    window.location.replace('start.html' + params + hash);
  })();
</script>
</head>
<body>
<div class="box">
  <h2 style="margin:0 0 10px 0;">Redirecting to Creator Studio Workstation...</h2>
  <p style="margin:0 0 14px 0; font-size:12px;">Universal Workstation has consolidated index.html into start.html.</p>
  <a href="start.html">Click here if not redirected automatically</a>
</div>
</body>
</html>
`;
fs.writeFileSync(indexPath, indexStubContent, 'utf8');
console.log(`[OK] Emitted Zero-CORS Deprecation Redirect Stub at index.html -> start.html`);

const studioPath = path.join(NETWORK_DIR, 'campaign_studio.html');
const studioStubContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Campaign Studio - Redirecting to Workstation...</title>
<style>
  body { background: #008080; color: #fff; font-family: "Segoe UI", Tahoma, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
  .box { background: #c0c0c0; color: #000; border: 2px solid; border-color: #fff #000 #000 #fff; padding: 20px 30px; box-shadow: 4px 4px 10px rgba(0,0,0,0.5); }
  a { color: #000080; font-weight: bold; }
</style>
<script>
  (function() {
    const params = window.location.search || '';
    const hash = window.location.hash || '';
    window.location.replace('../start.html' + params + hash);
  })();
</script>
</head>
<body>
<div class="box">
  <h2 style="margin:0 0 10px 0;">Redirecting to Creator Studio Workstation...</h2>
  <p style="margin:0 0 14px 0; font-size:12px;">Pointcrawl Studio & Procedural Balancer have been consolidated into start.html.</p>
  <a href="../start.html">Click here if not redirected automatically</a>
</div>
</body>
</html>
`;
fs.writeFileSync(studioPath, studioStubContent, 'utf8');
console.log(`[OK] Emitted Zero-CORS Deprecation Redirect Stub at network/campaign_studio.html -> ../start.html`);

const contradictionPath = path.join(NETWORK_DIR, 'contradiction_matrix_dashboard.html');
const contradictionStubContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contradiction Dashboard - Redirecting to Workstation...</title>
<style>
  body { background: #008080; color: #fff; font-family: "Segoe UI", Tahoma, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
  .box { background: #c0c0c0; color: #000; border: 2px solid; border-color: #fff #000 #000 #fff; padding: 20px 30px; box-shadow: 4px 4px 10px rgba(0,0,0,0.5); }
  a { color: #000080; font-weight: bold; }
</style>
<script>
  (function() {
    const params = window.location.search || '';
    const hash = window.location.hash || '';
    window.location.replace('../start.html' + params + hash);
  })();
</script>
</head>
<body>
<div class="box">
  <h2 style="margin:0 0 10px 0;">Redirecting to Creator Studio Workstation...</h2>
  <p style="margin:0 0 14px 0; font-size:12px;">Contradiction Matrix has been consolidated into the 64-Cell ODV Archetype Matrix in start.html.</p>
  <a href="../start.html">Click here if not redirected automatically</a>
</div>
</body>
</html>
`;
fs.writeFileSync(contradictionPath, contradictionStubContent, 'utf8');
console.log(`[OK] Emitted Zero-CORS Deprecation Redirect Stub at network/contradiction_matrix_dashboard.html -> ../start.html`);

const builderPath = path.join(NETWORK_DIR, 'network_builder.html');
const builderStubContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Network Builder - Redirecting to Workstation...</title>
<style>
  body { background: #008080; color: #fff; font-family: "Segoe UI", Tahoma, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
  .box { background: #c0c0c0; color: #000; border: 2px solid; border-color: #fff #000 #000 #fff; padding: 20px 30px; box-shadow: 4px 4px 10px rgba(0,0,0,0.5); }
  a { color: #000080; font-weight: bold; }
</style>
<script>
  (function() {
    const params = window.location.search || '';
    const hash = window.location.hash || '';
    window.location.replace('../start.html' + params + hash);
  })();
</script>
</head>
<body>
<div class="box">
  <h2 style="margin:0 0 10px 0;">Redirecting to Creator Studio Workstation...</h2>
  <p style="margin:0 0 14px 0; font-size:12px;">Network Builder (Step 0) has been consolidated into Universal Workstation (start.html).</p>
  <a href="../start.html">Click here if not redirected automatically</a>
</div>
</body>
</html>
`;
fs.writeFileSync(builderPath, builderStubContent, 'utf8');
console.log(`[OK] Emitted Zero-CORS Deprecation Redirect Stub at network/network_builder.html -> ../start.html`);

// ------------------------------------------------------------------------------
// 7c. TRIGGER ZERO-CORS OFFLINE CSS & HARDENING
// ------------------------------------------------------------------------------
const zeroCorsScript = path.join(ROOT_DIR, 'scripts', 'build_zero_cors_css.js');
if (fs.existsSync(zeroCorsScript)) {
  try {
    require(zeroCorsScript);
  } catch (err) {
    console.warn(`[WARN] Zero-CORS CSS generator warning:`, err.message);
  }
}

// ------------------------------------------------------------------------------
// 8. INJECT COMPASS HEADERS INTO SURFACES (POST-BUILD)
// ------------------------------------------------------------------------------
function injectCompassHeaders() {
  if (!navManifest || !Array.isArray(navManifest.surfaces)) return;

  navManifest.surfaces.forEach(s => {
    const fullPath = path.join(ROOT_DIR, s.file);
    if (!fs.existsSync(fullPath)) return;
    if (s.file === 'wiki/index.html') return; // wiki/index.html is generated by wiki/build_wiki.js

    let content = fs.readFileSync(fullPath, 'utf8');
    const wikiPageRel = `wiki/pages/${s.file}.html (Markdown Source: wiki/src/files/${s.file}.md)`;

    if (s.type === 'html') {
      const headerText = `<!--
================================================================================
CREATOR STUDIO COMPASS HEADER (AUTO-GENERATED VIA build_suite.js)
SURFACE: ${s.title}
WIKI PAGE: ${wikiPageRel}
AUTHORITATIVE SPECIFICATIONS:
${s.authoritative_specs.map(x => `  - ${x}`).join('\n')}
DATA PROVENANCE & BUILD PIPELINE:
${s.data_sources.map(x => `  - ${x}`).join('\n')}
CRITICAL INSTRUCTION:
  ${s.immutable_rule}
  Re-compile suite via: powershell -ExecutionPolicy Bypass -File .\\Build-Suite.ps1
================================================================================
-->\n`;

      const existingHeaderRegex = /<!--\r?\n={50,}[\s\S]*?CREATOR STUDIO COMPASS HEADER[\s\S]*?={50,}\r?\n-->\r?\n?/;
      if (existingHeaderRegex.test(content)) {
        content = content.replace(existingHeaderRegex, headerText);
      } else {
        content = headerText + content;
      }
      safeWriteFileSync(fullPath, content, 'utf8');
    } else if (s.type === 'powershell') {
      const headerText = `<#
================================================================================
CREATOR STUDIO COMPASS HEADER (AUTO-GENERATED VIA build_suite.js)
SURFACE: ${s.title}
WIKI PAGE: ${wikiPageRel}
AUTHORITATIVE SPECIFICATIONS:
${s.authoritative_specs.map(x => `  - ${x}`).join('\n')}
DATA PROVENANCE:
${s.data_sources.map(x => `  - ${x}`).join('\n')}
CRITICAL INSTRUCTION:
  ${s.immutable_rule}
================================================================================
#>\n`;

      const existingHeaderRegex = /<#\r?\n={50,}[\s\S]*?CREATOR STUDIO COMPASS HEADER[\s\S]*?={50,}\r?\n#>\r?\n?/;
      if (existingHeaderRegex.test(content)) {
        content = content.replace(existingHeaderRegex, headerText);
      } else {
        content = headerText + content;
      }
      safeWriteFileSync(fullPath, content, 'utf8');
    } else if (s.type === 'markdown') {
      const headerText = `<!--
================================================================================
CREATOR STUDIO COMPASS HEADER (AUTO-GENERATED VIA build_suite.js)
SURFACE: ${s.title}
WIKI PAGE: ${wikiPageRel}
AUTHORITATIVE SPECIFICATIONS:
${s.authoritative_specs.map(x => `  - ${x}`).join('\n')}
DATA PROVENANCE & BUILD PIPELINE:
${s.data_sources.map(x => `  - ${x}`).join('\n')}
CRITICAL INSTRUCTION:
  ${s.immutable_rule}
  Re-compile suite via: powershell -ExecutionPolicy Bypass -File .\\Build-Suite.ps1
================================================================================
-->\n\n`;

      const existingHeaderRegex = /<!--\r?\n={50,}[\s\S]*?CREATOR STUDIO COMPASS HEADER[\s\S]*?={50,}\r?\n-->\r?\n*/;
      if (existingHeaderRegex.test(content)) {
        content = content.replace(existingHeaderRegex, headerText);
      } else {
        const fmMatch = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
        if (fmMatch) {
          content = fmMatch[0] + headerText + content.slice(fmMatch[0].length);
        } else {
          content = headerText + content;
        }
      }
      safeWriteFileSync(fullPath, content, 'utf8');
    }
  });
  console.log(`[OK] Injected/refreshed Compass Headers across registered surfaces.`);
}

injectCompassHeaders();

// ------------------------------------------------------------------------------
// 9. TRIGGER BIDIRECTIONAL CODEBASE WIKI & BACKLINK COMPILER
// ------------------------------------------------------------------------------
const wikiBuildScript = path.join(ROOT_DIR, 'wiki', 'build_wiki.js');
if (fs.existsSync(wikiBuildScript)) {
  try {
    console.log('\n[INFO] Compiling Bidirectional Codebase Wiki & Backlink Encyclopedia...');
    const stampReviewedFlag = process.argv.includes('--stamp-reviewed') ? ' --stamp-reviewed' : '';
    const wikiOut = execSync(`"${process.execPath}" "${wikiBuildScript}"${stampReviewedFlag}`, {
      cwd: ROOT_DIR,
      encoding: 'utf8'
    });
    console.log(wikiOut.trim());
  } catch (err) {
    console.warn(`[WARN] Wiki compilation warning:`, err.message);
  }
}

console.log('\n========================================================');
console.log('   BUILD COMPLETE: All distributions & routers synchronized');
console.log('========================================================\n');
}

if (require.main === module) {
  runBuildSuite();
}

module.exports = {
  parseYamlListOrArray,
  parseYamlScalar,
  parseYamlFrontmatter,
  stripMarkdownNoise,
  extractMarkdownSections,
  extractDialFromData,
  extractThreatClocksFromData,
  extractFourCornersFromData,
  isIndustrialModuleMeta,
  enrichModuleFromMarkdown,
  mergeModuleDiskAndManifest,
  parseModuleMarkdownFile,
  scanModulesDirRecursive,
  enrichModuleEntities,
  applyResourceConsumerIndex,
  toRootRelUrl,
  rebaseFileUrls,
  runBuildSuite
};

