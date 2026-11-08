const fs = require('fs');
const topo = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/extraction/raw_topology.json', 'utf8'));

console.log('raw_topology.json keys:', Object.keys(topo));
console.log('nodes count:', (topo.nodes || []).length);
console.log('edges count:', (topo.edges || []).length);
console.log('edges:', topo.edges);
