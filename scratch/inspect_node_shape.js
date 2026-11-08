const fs = require('fs');
const rawTopo = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/extraction/raw_topology.json', 'utf8'));
const enrichedNodes = JSON.parse(fs.readFileSync('C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/synthesis/enriched_nodes.json', 'utf8'));

console.log('Sample raw node:', rawTopo.nodes[0]);
console.log('Sample enriched node:', enrichedNodes[rawTopo.nodes[0].id]);
