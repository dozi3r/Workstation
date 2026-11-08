const fs = require('fs');
const trackers = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/synthesis/enriched_trackers.json', 'utf8'));

console.log('Trackers count:', trackers.length);
trackers.forEach(t => {
  console.log(`Tracker: ${t.name} (${t.id}) -> maxTicks: ${t.maxTicks}, defaultTicks: ${t.defaultTicks}`);
  console.log(`  Notes: ${t.notes}`);
  console.log(`  Consequences:`, t.consequences);
});
