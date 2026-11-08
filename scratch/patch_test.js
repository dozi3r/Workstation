const fs = require('fs');
let txt = fs.readFileSync('test/run_tests.js', 'utf8');

txt = txt.replace(/path\.join\(ROOT_DIR, 'campaigns', 'Diablo1', 'topology\.json'\)/g,
  "(fs.existsSync(path.join(ROOT_DIR, 'campaigns', 'DIablo', 'topology.json')) ? path.join(ROOT_DIR, 'campaigns', 'DIablo', 'topology.json') : path.join(ROOT_DIR, 'campaigns', 'Diablo1', 'topology.json'))");

txt = txt.replace(/path\.join\(ROOT_DIR, 'campaigns', 'Diablo1', 'creatures', 'evidence\.json'\)/g,
  "(fs.existsSync(path.join(ROOT_DIR, 'campaigns', 'DIablo', 'creatures', 'evidence.json')) ? path.join(ROOT_DIR, 'campaigns', 'DIablo', 'creatures', 'evidence.json') : path.join(ROOT_DIR, 'campaigns', 'Diablo1', 'creatures', 'evidence.json'))");

txt = txt.replace(/path\.join\(ROOT_DIR, 'campaigns\/Diablo1\/topology\.json'\)/g,
  "(fs.existsSync(path.join(ROOT_DIR, 'campaigns/DIablo/topology.json')) ? path.join(ROOT_DIR, 'campaigns/DIablo/topology.json') : path.join(ROOT_DIR, 'campaigns/Diablo1/topology.json'))");

txt = txt.replace(/path\.join\(ROOT_DIR, 'campaigns\/Diablo1\/creatures\/evidence\.json'\)/g,
  "(fs.existsSync(path.join(ROOT_DIR, 'campaigns/DIablo/creatures/evidence.json')) ? path.join(ROOT_DIR, 'campaigns/DIablo/creatures/evidence.json') : path.join(ROOT_DIR, 'campaigns/Diablo1/creatures/evidence.json'))");

fs.writeFileSync('test/run_tests.js', txt, 'utf8');
console.log('Successfully patched test/run_tests.js');
