const fs = require('fs');
const path = require('path');

const baseDir = 'C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains';
const dirsToScan = ['extraction', 'synthesis'];

const citeRegex = /\b(?:ch\s*\d+|p\.\s*\d+|note\s*\d+\.\d+|Yu\s+note|JW\s*\d+|this pack)\b/i;

dirsToScan.forEach(dir => {
  const fullDir = path.join(baseDir, dir);
  if (!fs.existsSync(fullDir)) return;
  fs.readdirSync(fullDir).forEach(file => {
    if (!file.endsWith('.json') && !file.endsWith('.js')) return;
    const filePath = path.join(fullDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((l, idx) => {
      if (citeRegex.test(l)) {
        console.log(`[${dir}/${file}:${idx+1}] ${l.trim().slice(0, 100)}`);
      }
    });
  });
});
