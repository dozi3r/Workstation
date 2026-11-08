const fs = require('fs');

function inspectCamp(name, path) {
  if (!fs.existsSync(path)) return console.log(name, 'not found at', path);
  const camp = JSON.parse(fs.readFileSync(path, 'utf8'));
  const npcs = camp.entities.npcs || [];
  const withOdv = npcs.filter(n => n.odv && (n.odv.s !== undefined || Array.isArray(n.odv)));
  console.log(`=== ${name} ===`);
  console.log(`Total NPCs: ${npcs.length}, With bespoke ODV: ${withOdv.length} (${Math.round(withOdv.length/npcs.length*100)}%)`);
  console.log('Sample with ODV:', withOdv.slice(0, 5).map(n => `${n.name}: [${n.odv.s ?? n.odv[0]}, ${n.odv.e ?? n.odv[1]}, ${n.odv.c ?? n.odv[2]}]`));
}

inspectCamp('DCC Book 1', 'C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/INSTALLED/dcc_01_dungeon_crawler_carl/output/DungeonCrawlerCarl_Book1/campaign.json');
inspectCamp('Oblivion', 'C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/INSTALLED/oblivion/output/TheElderScrolls_Oblivion/campaign.json');
inspectCamp('Diablo 1', 'C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/INSTALLED/diablo/output/Diablo1/campaign.json');
inspectCamp('JTTW 5', 'C:/Users/Milo/Documents/Claude/Campaign Converter/conversions/jttw_5_flaming_mountains/output/jttw_5_flaming_mountains/campaign.json');
inspectCamp('Krynn V1', 'C:/Users/Milo/Documents/Antigravity/AdventureCAD/campaigns/Krynn_V1_Heroes_of_the_Lance/campaign.json');
