const fs = require('fs');
const topo = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/topology.json', 'utf8'));

console.log('Edges inspection:');
console.log('topo.edges:', topo.edges);
for (const k in topo.maps) {
  console.log(`topo.maps[${k}].edges:`, topo.maps[k].edges);
  console.log(`topo.maps[${k}].corridors:`, topo.maps[k].corridors);
  console.log(`topo.maps[${k}].conduits:`, topo.maps[k].conduits);
}
