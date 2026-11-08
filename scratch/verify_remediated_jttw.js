const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains';
const camp = JSON.parse(fs.readFileSync(path.join(outDir, 'campaign.json'), 'utf8'));
const topo = JSON.parse(fs.readFileSync(path.join(outDir, 'topology.json'), 'utf8'));

console.log('=== VERIFYING REMEDIATED JTTW 5 OUTPUT ===');
console.log('1. Topology:');
console.log('   Root Links:', topo.links ? topo.links.length : 'none');
console.log('   Root Edges:', topo.edges ? topo.edges.length : 'none');
console.log('   Submap map_flame_road links/edges:', topo.maps.map_flame_road.links.length, '/', topo.maps.map_flame_road.edges.length);

console.log('\n2. Node Sovereignty (All 18 Nodes across All Maps):');
const allNodes = [];
for (const mId in topo.maps) {
  (topo.maps[mId].nodes || []).forEach(n => allNodes.push({ ...n, mapId: mId }));
}
allNodes.forEach(n => {
  console.log(`   [${n.mapId}] Node ${n.id.padEnd(23)} -> factionId=${n.factionId || 'none'}`);
});

console.log('\n3. Quest 1 Schema & Crucible:');
const q1 = camp.entities.quests[0];
console.log('   ID:', q1.id);
console.log('   Name:', q1.name);
console.log('   Description:', q1.description);
console.log('   Notes preview:\n' + q1.notes.slice(0, 350) + '...\n');

console.log('4. Item Notes (Checking Staff & Rod):');
const staff = camp.entities.items.find(i => i.id === 'ITM_FLYING_DRAGON_STAFF');
console.log('   Staff specs:', staff.specs);
console.log('   Staff notes:', staff.notes);

console.log('\n5. Citation Patterns Scan in Output:');
const citeRegex = /\b(?:ch\s*\d+|p\.\s*\d+|note\s*\d+\.\d+|Yu\s+note|JW\s*\d+|this pack)\b/i;
let hits = 0;
const scanObj = (val, p) => {
  if (typeof val === 'string') {
    if (citeRegex.test(val)) {
      console.log(`   [!] Citation found in ${p}: ${val.slice(0, 70)}`);
      hits++;
    }
  } else if (Array.isArray(val)) {
    val.forEach((item, i) => scanObj(item, `${p}[${i}]`));
  } else if (val && typeof val === 'object') {
    Object.entries(val).forEach(([k, v]) => scanObj(v, `${p}.${k}`));
  }
};
scanObj(camp, 'campaign.json');
scanObj(topo, 'topology.json');
if (hits === 0) {
  console.log('   [PASS] ZERO citation patterns found across campaign.json and topology.json!');
} else {
  console.log(`   [FAIL] ${hits} citation patterns detected.`);
}
