const fs = require('fs');
const topo = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/topology.json', 'utf8'));

console.log('=== MAPS & TOPOLOGY ===');
console.log('Topology Maps keys:', Object.keys(topo.maps || {}));
console.log('Total root nodes:', (Array.isArray(topo.nodes) ? topo.nodes : Object.values(topo.nodes || {})).length);
console.log('Total root edges:', (topo.edges || []).length);

Object.entries(topo.maps || {}).forEach(([mId, mMap]) => {
  const mNodes = Array.isArray(mMap.nodes) ? mMap.nodes : Object.values(mMap.nodes || {});
  console.log(`Submap ${mId}: ${(mMap.name || mMap.label || mId)} -> Nodes: ${mNodes.length}, Edges: ${(mMap.edges || []).length}`);
});
