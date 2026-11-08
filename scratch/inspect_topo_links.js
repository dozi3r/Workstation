const fs = require('fs');
const topo = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/topology.json', 'utf8'));

console.log('topology.json root links:', topo.links ? topo.links.length : 'none');
for (const k in topo.maps) {
  console.log(`topo.maps[${k}].links:`, topo.maps[k].links ? topo.maps[k].links.length : 'none');
}
