const fs = require('fs');
const camp = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/campaign.json', 'utf8'));

console.log('=== QUESTS AUDIT ===');
camp.entities.quests.forEach((q, idx) => {
  console.log(`\n================== QUEST ${idx+1}: ${q.name || q.title} (${q.id}) ==================`);
  console.log('Node:', q.nodeId, '| Giver:', q.giverNpcId, '| Target:', q.targetNpcId);
  console.log('Description:', q.description);
  console.log('Crucible:', JSON.stringify(q.crucible, null, 2));
  console.log('Notes / Canonical Outcome:\n', q.notes);
});
