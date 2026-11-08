const fs = require('fs');
const path = require('path');

const campPath = 'C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/campaign.json';
const topoPath = 'C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/topology.json';

const camp = JSON.parse(fs.readFileSync(campPath, 'utf8'));
const topo = JSON.parse(fs.readFileSync(topoPath, 'utf8'));

console.log('====================================================');
console.log('CAMPAIGN AUDIT: JTTW 5 - FLAMING MOUNTAINS');
console.log('====================================================');
console.log('Title:', camp.title || camp.name);
console.log('Synopsis:', (camp.description || camp.synopsis || '').slice(0, 150));
console.log('Entities:');
console.log('  Items:', (camp.entities.items || []).length);
console.log('  Quests:', (camp.entities.quests || []).length);
console.log('  NPCs:', (camp.entities.npcs || []).length);
console.log('  Factions:', (camp.entities.factions || []).length);
console.log('  Trackers:', (camp.entities.trackers || []).length);

console.log('\n--- 1. ITEMS DETAILED INSPECTION ---');
(camp.entities.items || []).forEach(i => {
  console.log(`\n[Item] ${i.name} (${i.id})`);
  console.log(`  Category: ${i.category || i.type}`);
  console.log(`  Specs: ${i.specs}`);
  console.log(`  Notes: ${i.notes}`);
  console.log(`  Owner: ${i.ownerNpcId || 'None (Stored)'} | Node: ${i.nodeId} | Quests: [${(i.questIds || []).join(', ')}]`);
});

console.log('\n--- 2. QUESTS DETAILED INSPECTION ---');
(camp.entities.quests || []).forEach(q => {
  console.log(`\n[Quest] ${q.name || q.title} (${q.id})`);
  console.log(`  Anchor Node: ${q.nodeId} | Giver: ${q.giverNpcId} | Target: ${q.targetNpcId}`);
  console.log(`  Description: ${q.description}`);
  console.log(`  Notes snippet: ${(q.notes || '').slice(0, 200)}...`);
  console.log(`  Crucible snippet: ${JSON.stringify(q.crucible || {}).slice(0, 150)}...`);
  console.log(`  Item IDs: [${(q.itemIds || []).join(', ')}]`);
});

console.log('\n--- 3. FACTIONS & NODES DISPOSITION / SEC VECTORS ---');
console.log('FACTIONS:');
(camp.entities.factions || []).forEach(f => {
  console.log(`  Faction: ${f.name} (${f.id}) -> ODV: ${JSON.stringify(f.odv || f.disposition)} | Quadrant: ${f.quadrant || f.cvfQuadrant}`);
});

console.log('\nNODES:');
const topoNodes = Array.isArray(topo.nodes) ? topo.nodes : Object.values(topo.nodes || {});
topoNodes.forEach(n => {
  console.log(`  Node: ${n.label || n.name || n.id} (${n.id}) -> ODV: ${JSON.stringify(n.odv)} | Faction: ${n.factionId || n.faction}`);
});

console.log('\n--- 4. NPCS DISPOSITION & INHERITANCE ---');
(camp.entities.npcs || []).forEach(n => {
  console.log(`  NPC: ${n.name} (${n.id}) -> ODV: ${JSON.stringify(n.odv)} | Faction: ${n.factionId || n.faction} | Node: ${n.nodeId}`);
  console.log(`    Motivation: ${(n.motivation || '').slice(0, 100)}`);
  console.log(`    Wants/Needs: Wants=${n.wants || n.want || 'none'}, Needs=${n.needs || n.need || 'none'}`);
  console.log(`    Dialogue: ${(n.dialogueHooks || []).slice(0, 1)}`);
});
