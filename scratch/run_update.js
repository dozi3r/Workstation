const fs = require('fs');
const path = require('path');

const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_bespoke_crucibles.json'), 'utf8'));

function updateNotes(notes, newCrucible) {
  if (!notes) return '**What-If Crucible:**\n' + newCrucible;
  if (notes.includes('**What-If Crucible:**')) {
    return notes.replace(/\*\*What-If Crucible:\*\*[\s\S]*$/, '**What-If Crucible:**\n' + newCrucible);
  }
  return notes.trim() + '\n\n**What-If Crucible:**\n' + newCrucible;
}

// 1. Update AdventureCAD campaign.json
const campPath = path.join(__dirname, '../campaigns/TheElderScrolls_Oblivion/campaign.json');
const camp = JSON.parse(fs.readFileSync(campPath, 'utf8'));
let campUpdated = 0;
camp.entities.quests.forEach(q => {
  if (map[q.id]) {
    q.notes = updateNotes(q.notes, map[q.id]);
    campUpdated++;
  }
});
fs.writeFileSync(campPath, JSON.stringify(camp, null, 2), 'utf8');

// 2. Update AdventureCAD topology.json
const topPath = path.join(__dirname, '../campaigns/TheElderScrolls_Oblivion/topology.json');
const top = JSON.parse(fs.readFileSync(topPath, 'utf8'));
let topQuestsUpdated = 0;
if (top.quests) {
  top.quests.forEach(q => {
    if (map[q.id]) {
      q.notes = updateNotes(q.notes, map[q.id]);
      topQuestsUpdated++;
    }
  });
}
let topEntitiesQuestsUpdated = 0;
if (top.entities && top.entities.quests) {
  top.entities.quests.forEach(q => {
    if (map[q.id]) {
      q.notes = updateNotes(q.notes, map[q.id]);
      topEntitiesQuestsUpdated++;
    }
  });
}
fs.writeFileSync(topPath, JSON.stringify(top, null, 2), 'utf8');

// 3. Update Campaign Converter copy if exists
const ccCampPath = path.join(__dirname, '../../Campaign Converter/conversions/INSTALLED/oblivion/output/TheElderScrolls_Oblivion/campaign.json');
let ccUpdated = 0;
if (fs.existsSync(ccCampPath)) {
  const ccCamp = JSON.parse(fs.readFileSync(ccCampPath, 'utf8'));
  if (ccCamp.entities && ccCamp.entities.quests) {
    ccCamp.entities.quests.forEach(q => {
      if (map[q.id]) {
        q.notes = updateNotes(q.notes, map[q.id]);
        ccUpdated++;
      }
    });
  }
  fs.writeFileSync(ccCampPath, JSON.stringify(ccCamp, null, 2), 'utf8');
}

const ccTopPath = path.join(__dirname, '../../Campaign Converter/conversions/INSTALLED/oblivion/output/TheElderScrolls_Oblivion/topology.json');
let ccTopUpdated = 0;
if (fs.existsSync(ccTopPath)) {
  const ccTop = JSON.parse(fs.readFileSync(ccTopPath, 'utf8'));
  if (ccTop.quests) {
    ccTop.quests.forEach(q => {
      if (map[q.id]) {
        q.notes = updateNotes(q.notes, map[q.id]);
        ccTopUpdated++;
      }
    });
  }
  if (ccTop.entities && ccTop.entities.quests) {
    ccTop.entities.quests.forEach(q => {
      if (map[q.id]) {
        q.notes = updateNotes(q.notes, map[q.id]);
      }
    });
  }
  fs.writeFileSync(ccTopPath, JSON.stringify(ccTop, null, 2), 'utf8');
}

console.log(JSON.stringify({
  campUpdated,
  topQuestsUpdated,
  topEntitiesQuestsUpdated,
  ccUpdated,
  ccTopUpdated
}, null, 2));
