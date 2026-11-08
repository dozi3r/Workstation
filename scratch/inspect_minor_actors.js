const fs = require('fs');
const actors = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/synthesis/enriched_actors.json', 'utf8'));

['npc_palm_leaf_gate_maid', 'npc_hoard_thunder_captain', 'npc_rice_pudding_peddler', 'npc_guardian_dharma_diffusion', 'npc_guardian_victorious_ultimate', 'npc_guardian_great_strength', 'npc_guardian_ever_abiding'].forEach(id => {
  console.log(`\nNPC ${id}:`);
  console.log('  Role:', actors[id].fourCornersRole);
  console.log('  Hooks:', actors[id].dialogueHooks);
});
