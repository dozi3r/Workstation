const fs = require('fs');
const camp = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/campaign.json', 'utf8'));

console.log('=== NPC SOCIAL RELATIONS & ROSTER DEPTH ===');
camp.entities.npcs.forEach(n => {
  const rels = n.relationships || n.relationalTies || [];
  console.log(`NPC ${n.name} (${n.id}):`);
  console.log('  Relationships:', rels.length, JSON.stringify(rels));
  console.log('  Wants:', n.wants, '| Needs:', n.needs, '| Wounds:', n.wounds);
  console.log('  Dialogue Hooks:', n.dialogueHooks);
});
