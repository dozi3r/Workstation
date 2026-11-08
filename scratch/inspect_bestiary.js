const fs = require('fs');
const bestiary = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/synthesis/enriched_bestiary.json', 'utf8'));

console.log('Bestiary count:', bestiary.length);
bestiary.forEach(b => {
  console.log(`Creature: ${b.name} (${b.id}) -> Threat: ${b.threatTier}, Dread: ${b.dreadIndex}`);
  console.log('  Tree cues:', (b.gigerenzerBehavior && b.gigerenzerBehavior.fastAndFrugalTree) ? b.gigerenzerBehavior.fastAndFrugalTree.cues.length : 'none');
});
