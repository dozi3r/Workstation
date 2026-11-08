const fs = require('fs');
const factionsRaw = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/synthesis/enriched_factions.json', 'utf8'));
const factions = Array.isArray(factionsRaw) ? factionsRaw : Object.values(factionsRaw.factions || factionsRaw);
console.log('FACTIONS:');
factions.forEach(f => {
  console.log(`- ${f.id}: ${f.name} (HQ: ${f.headquartersNodeId || f.headquarters})`);
});

const nodes = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/synthesis/enriched_nodes.json', 'utf8'));
console.log('\nENRICHED NODES KEYS:', Object.keys(nodes));

