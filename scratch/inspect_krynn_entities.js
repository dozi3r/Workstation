const fs = require('fs');
const camp = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Sources/krynn/Krynn_V1_Heroes_of_the_Lance/campaign.json', 'utf8'));

console.log('=== KRYNN V1 SAMPLE QUESTS ===');
camp.entities.quests.slice(0, 3).forEach(q => {
  console.log(`\nQuest: ${q.name || q.title} (${q.id})`);
  console.log(`  Description: ${q.description}`);
  console.log(`  Notes: ${q.notes}`);
  console.log(`  Steps:`, q.steps);
  console.log(`  Crucible:`, q.crucible);
});

console.log('\n=== KRYNN V1 SAMPLE ITEMS ===');
camp.entities.items.slice(0, 3).forEach(i => {
  console.log(`\nItem: ${i.name} (${i.id})`);
  console.log(`  Specs: ${i.specs}`);
  console.log(`  Notes: ${i.notes}`);
  console.log(`  Quests:`, i.questIds);
});
