const fs = require('fs');
const topo = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/topology.json', 'utf8'));
const camp = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/campaign.json', 'utf8'));

console.log('=== NODES ODV & QUADRANTS ===');
const nodes = Array.isArray(topo.nodes) ? topo.nodes : Object.values(topo.nodes || {});
nodes.forEach(n => {
  console.log(`${(n.id || '').padEnd(25)} ODV: ${String(JSON.stringify(n.odv)).padEnd(20)} Faction: ${n.factionId || n.faction || 'none'}`);
});

console.log('\n=== FACTIONS ODV & DIPLOMACY ===');
camp.entities.factions.forEach(f => {
  console.log(`${f.name} (${f.id}):`);
  console.log('  ODV:', f.odv, '| Quadrant:', f.quadrant || f.cvfQuadrant);
  console.log('  Diplomacy:', JSON.stringify(f.diplomaticStances || f.relationships || {}));
});
