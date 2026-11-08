const fs = require('fs');
const path = require('path');

const base = 'C:/Users/Milo/Documents/Claude/Sources/krynn';
['Krynn_V1_Heroes_of_the_Lance', 'Krynn_V2_Shadows_of_the_Lance', 'Krynn_V3_Five_Book_Odyssey'].forEach(v => {
  const p = path.join(base, v, 'campaign.json');
  if (!fs.existsSync(p)) return console.log(v, 'not found');
  const camp = JSON.parse(fs.readFileSync(p, 'utf8'));
  const entities = camp.entities || {};
  console.log(`\n=== ${v} ===`);
  console.log('Title:', camp.title || camp.name);
  console.log('Census:');
  console.log('  Quests:', (entities.quests || []).length);
  console.log('  NPCs:', (entities.npcs || []).length);
  console.log('  Items:', (entities.items || []).length);
  console.log('  Factions:', (entities.factions || []).length);
  console.log('  Trackers:', (entities.trackers || []).length);
  
  const npcs = entities.npcs || [];
  const withOdv = npcs.filter(n => n.odv && (n.odv.s !== undefined || Array.isArray(n.odv)));
  console.log(`  NPCs with bespoke ODV: ${withOdv.length} / ${npcs.length}`);

  const quests = entities.quests || [];
  const withCrucible = quests.filter(q => q.crucible || (q.notes && q.notes.includes('What-If')));
  console.log(`  Quests with Crucible: ${withCrucible.length} / ${quests.length}`);
});
