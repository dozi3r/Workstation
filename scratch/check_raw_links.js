const fs = require('fs');
const topo = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/extraction/raw_topology.json', 'utf8'));

console.log('topo.links count:', (topo.links || []).length);
console.log('sample links:', (topo.links || []).slice(0, 5));
