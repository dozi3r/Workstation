const fs = require('fs');
const camp = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/INSTALLED/diablo/output/Diablo1/campaign.json', 'utf8'));

console.log('=== DIABLO 1 NPCS ===');
camp.entities.npcs.forEach(n => {
  console.log(`NPC: ${n.name.padEnd(30)} ID: ${n.id.padEnd(20)} ODV: ${JSON.stringify(n.odv || null)}`);
});
