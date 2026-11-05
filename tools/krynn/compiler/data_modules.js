/**
 * Shared 5-Tier Worldbuilding Modules (28 Authoritative Modules across Tiers 1..5)
 * Part of the Deep-Module Compiler for The Chronicles of Krynn (Workstation 2.6)
 */
'use strict';

// Legacy (pre-v2) renderer, kept only for diffing against the v2 output.
function renderModuleMarkdownLegacy(m) {
  const providesStr = JSON.stringify(m.provides || []);
  const requiresStr = JSON.stringify(m.requires || []);
  return `---
id: "${m.id}"
title: "${m.title}"
set: "${m.set}"
tier: "Tier ${m.pipeline_tier}"
pipeline_tier: ${m.pipeline_tier}
culture: "${m.culture}"
color: "${m.color}"
provides: ${providesStr}
requires: ${requiresStr}
summary: "${m.summary.replace(/"/g, "'")}"
yields: "${(m.provides && m.provides[0]) || 'narrative_leverage'}"
standalone_fallback: "${m.standalone_fallback.replace(/"/g, "'")}"
---
# MODULE ${m.id}: ${m.title}

## 1. Executive Summary & Egri Premise
${m.summary}

- **Pipeline Tier:** Tier ${m.pipeline_tier}
- **Provides:** ${(m.provides || []).map(p => '`' + p + '`').join(', ') || 'None'}
- **Requires:** ${(m.requires || []).map(r => '`' + r + '`').join(', ') || 'None (Root Producer)'}
- **Standalone Fallback Mode:** ${m.standalone_fallback}

## 2. 5D Sensory Pentagon (James Wood Serious Noticing)
- **Physical Environment:** ${m.sensory.physical}
- **Behaviors:** ${m.sensory.behaviors}
- **Relationships:** ${m.sensory.relationships}
- **Attitudes:** ${m.sensory.attitudes}
- **Values:** ${m.sensory.values}

## 3. Four-Corner Opposition Web
- Establishment: "${m.four_corners.establishment}"
- Opponent: "${m.four_corners.opponent}"
- Shadow: "${m.four_corners.shadow}"
- Outcast: "${m.four_corners.outcast}"

## 4. Four-Level Output Dials
- Level 1: "${m.dials[0]}"
- Level 2: "${m.dials[1]}"
- Level 3: "${m.dials[2]}"
- Level 4: "${m.dials[3]}"

## 5. Severance & Escalation Threat Clock
- **${m.clockName} Clock [6 Ticks]:** ${m.clockNotes}
`;
}

// ---------------------------------------------------------------------------
// v2.0 renderer (ADR 0023 Unified Module Schema).
// Derived fields (heuristic, deterministic, not authored lore):
//   - [S,E,C] baseline from the CVF quadrant (culture) and pipeline tier
//   - operational_profile from [S,C]
//   - NPC prototype dispositions from the four-corner role offsets
// ---------------------------------------------------------------------------
const QUADRANT_SE = { Hierarchy: [1, 1], Market: [2, 3], Clan: [3, 1], Adhocracy: [3, 3] };

function clamp14(n) { return Math.max(1, Math.min(4, n)); }

function deriveBaseline(m) {
  const se = QUADRANT_SE[m.culture] || [2, 2];
  const c = m.pipeline_tier <= 2 ? 1 : (m.pipeline_tier >= 4 ? 3 : 2);
  return [se[0], se[1], c];
}

function operationalProfile(s, c) {
  if (s <= 2) return c <= 2 ? 'Produce' : 'Deliver';
  return c <= 2 ? 'Design' : 'Service';
}

function yq(str) { return JSON.stringify(String(str == null ? '' : str)); }

function splitCorner(text) {
  // "Name (`CRUC-20`, detail)" -> clean display name
  return String(text || '')
    .replace(/\s*\((?:[^()]*`[^`]+`[^()]*)\)/g, '')
    .replace(/`/g, '')
    .trim();
}

function renderModuleMarkdown(m) {
  const [s, e, c] = deriveBaseline(m);
  const profile = operationalProfile(s, c);
  const dialKeys = ['level_1', 'level_2', 'level_3', 'level_4'];
  const slug = String(m.clockName).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const yieldsRes = (m.provides || []).join(', ') || 'narrative_leverage';
  const corners = [
    ['establishment', 'Establishment', [s, e, clamp14(c - 1)]],
    ['opponent', 'Main Opponent', [clamp14(s + 1), e, c]],
    ['shadow', 'Thematic Shadow', [s, clamp14(e + 1), clamp14(c + 1)]],
    ['outcast', 'Tertiary Outcast', [clamp14(s + 2), clamp14(e + 1), clamp14(c + 2)]]
  ];
  const npcBlocks = corners.map(([key, role, d], i) =>
    `- name: ${yq(splitCorner(m.four_corners[key]))}\n` +
    `  role: ${yq(role)}\n` +
    `  disposition: "[${d.join(', ')}]"\n` +
    `  motivation: ${yq('Pushes the module toward: ' + splitCorner(m.dials[i]))}`
  ).join('\n');
  const dialYaml = dialKeys.map((k, i) => `    ${k}: ${yq(splitCorner(m.dials[i]))}`).join('\n');

  return `---
id: ${yq(m.id)}
title: ${yq(m.title)}
set: ${yq(m.set)}
tier: ${yq('Tier ' + m.pipeline_tier)}
pipeline_tier: ${m.pipeline_tier}
provides: ${JSON.stringify(m.provides || [])}
requires: ${JSON.stringify(m.requires || [])}
culture_quadrant: ${yq(m.culture)}
operational_profile: ${yq(profile)}
mtg_color: ${yq(m.color)}
summary: ${yq(m.summary.replace(/"/g, "'"))}
standalone_fallback: ${yq(m.standalone_fallback.replace(/"/g, "'"))}
injected_mechanics:
  output_dial:
${dialYaml}
  threat_clocks:
    ${slug}: ${yq(m.clockName + ' Clock [6 Ticks] - ' + m.clockNotes)}
  yields_resource: ${yq(yieldsRes)}
---

# MODULE ${m.id}: ${m.title.toUpperCase()}

## Granular Disposition Baseline ([${s}, ${e}, ${c}])

### 1. Executive Summary & Egri Premise
${m.summary}

- **Pipeline Tier:** Tier ${m.pipeline_tier}
- **Provides:** ${(m.provides || []).map(p => '\`' + p + '\`').join(', ') || 'None'}
- **Requires:** ${(m.requires || []).map(r => '\`' + r + '\`').join(', ') || 'None (Root Producer)'}
- **Standalone Fallback:** ${m.standalone_fallback}

### 2. 5D Sensory Pentagon
- **Physical Environment:** ${m.sensory.physical}
- **Behaviors:** ${m.sensory.behaviors}
- **Relationships:** ${m.sensory.relationships}
- **Attitudes:** ${m.sensory.attitudes}
- **Values:** ${m.sensory.values}

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** ${m.four_corners.establishment}
* **Main Opponent:** ${m.four_corners.opponent}
* **Thematic Shadow:** ${m.four_corners.shadow}
* **Tertiary Outcast:** ${m.four_corners.outcast}

### 4. Severance & Escalation Threat Clock
- **${m.clockName} Clock [6 Ticks]:** ${m.clockNotes}

### Key Personnel (NPC Prototypes)
${npcBlocks}
`;
}

function getModuleDefinitions() {
  const defs = [
    // TIER 1: MACRO NETWORK & GOVERNANCE
    {
      id: 'MOD_T1_SEEKER_THEOCRACY_NETWORK',
      title: 'The High Seeker Bureaucracy & Cult of Belzor',
      set: 'Set_1_Preludes_and_Abanasinia',
      pipeline_tier: 1,
      culture: 'Hierarchy',
      color: 'WB',
      provides: ['seeker_safe_conduct_writ', 'steel_coin_treasury'],
      requires: [],
      summary: 'Post-Cataclysm bureaucratic theocracy in Haven and Solace taxing trade in steel pieces while appeasing Dragonarmy envoys and staging flash-powder miracles (`CRUC-02`).',
      standalone_fallback: 'Operates via local village bailiffs and traveling Seeker inquisitors even if Haven is cut off.',
      sensory: {
        physical: 'Whitewashed council halls smelling of sealing wax, tallow, and sulfur flash-powder.',
        behaviors: 'Clerks weighing steel coins and confiscating unregistered spellbooks.',
        relationships: 'Hederick and Widow Judith vying for council influence while Antimodes watches.',
        attitudes: 'Smug institutional skepticism toward the ancient gods.',
        values: 'Order, steel taxation, and self-preservation.'
      },
      four_corners: {
        establishment: 'High Seeker Council of Haven & High Theocrat Hederick',
        opponent: 'Goldmoon & Bearers of the True Gods',
        shadow: 'Widow Judith\'s Fanatical Cult of Belzor',
        outcast: 'Suspected Renegade Mages & Herbalists (Raistlin Majere)'
      },
      dials: [
        'Lax municipal tolls and theatrical street sermons',
        'Mandatory checkpoint inspections for the Blue Crystal Staff',
        'Inquisitorial book-burnings and Seeker collaboration with Fewmaster Toede',
        'Total capitulation to Red Dragonarmy martial law (`CRUC-02`)'
      ],
      clockName: 'Seeker Theocratic Inquisition',
      clockNotes: 'Advances when divine miracles or arcane magic are displayed openly in Haven or Solace.'
    },
    {
      id: 'MOD_T1_WHITESTONE_COUNCIL_DIPLOMACY',
      title: 'The Whitestone Council & Measure of Solamnia',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 1,
      culture: 'Hierarchy',
      color: 'GW',
      provides: ['whitestone_alliance_treaty', 'gnome_catapult_schematics'],
      requires: ['forged_true_dragonlances'],
      summary: 'Fragile continental war-coalition on Sancrist Isle uniting the fractured Knights of Solamnia, exiled Elves, and Dwarves around the cleaved Whitestone (`CRUC-15`).',
      standalone_fallback: 'Lord Gunthar commands his loyal Solamnic knights independently if the elven/dwarven envoys walk out.',
      sensory: {
        physical: 'Salt wind off Sancrist bay snapping heraldic kingfisher banners around the split white quartz boulder.',
        behaviors: 'Knights citing volume and verse of the thirty-book Measure to block elven proposals.',
        relationships: 'Lord Gunthar leveraging Sturm\'s honor against Derek Crownguard\'s legalist bloc.',
        attitudes: 'Centuries of post-Cataclysm racial resentment melting only before the forged Dragonlances.',
        values: 'Chivalric honor (Est Sularus oth Mithas) versus pragmatic survival.'
      },
      four_corners: {
        establishment: 'Lord Gunthar Uth Wistan & Moderate Knights of the Rose',
        opponent: 'Lord Derek Crownguard\'s Rigid Legalist Faction',
        shadow: 'Porthios & Isolationist Elven Royalists',
        outcast: 'Tasslehoff Burrfoot, Fizban & Theros Ironfeld'
      },
      dials: [
        'Bickering racial delegations deadlocked over command authority',
        'Tasslehoff cracks the Dragon Orb; Fizban calming the chamber',
        'Theros Ironfeld hurls the True Dragonlance cleanly through the Whitestone',
        'Unified Whitestone Armies march under the Golden General (`CRUC-15`)'
      ],
      clockName: 'Coalition Fracture',
      clockNotes: 'Advances when racial insults or military defeats erode trust between Solamnia and the Elves.'
    },
    {
      id: 'MOD_T1_HIGHLORD_COUNCIL_CONCLAVE',
      title: 'The Imperial Highlord Conclave of Neraka',
      set: 'Set_4_Spring_Dawning',
      pipeline_tier: 1,
      culture: 'Hierarchy',
      color: 'BR',
      provides: ['crown_of_power_dominion'],
      requires: ['draconian_army_reinforcements'],
      summary: 'Darwinian military summit of the five Dragonarmies at Neraka where Emperor Ariakas rules via the Crown of Power while Highlord Kitiara plots her coup (`CRUC-19`, `CRUC-23`).',
      standalone_fallback: 'Each Dragonarmy Wing operates as an autonomous regional warlord state if Neraka\'s central command collapses.',
      sensory: {
        physical: 'Five colored dragon banners whipping in volcanic ash above 200,000 armored troops; the ruby glow of the Crown of Power.',
        behaviors: 'Highlords exchanging poisoned compliments while Black Robe mages maintain Ariakas\'s force-shield.',
        relationships: 'Kitiara and Lord Soth conspiring against Ariakas while Raistlin plays both sides.',
        attitudes: 'Ruthless ambition masked as devotion to Takhisis.',
        values: 'Strength, betrayal rewarded by victory, and imperial dominion.'
      },
      four_corners: {
        establishment: 'Emperor Ariakas & The Imperial Red Guard',
        opponent: 'Highlord Kitiara Uth Matar & Lord Soth',
        shadow: 'Raistlin Majere (Black Robe Conspirator)',
        outcast: 'Tanis Half-Elven (Disguised in Dragonarmy Plate)'
      },
      dials: [
        'Tense factional rivalry between the five Dragonarmy Wings',
        'Ariakas orders the public execution of failed commanders and Laurana\'s presentation',
        'Raistlin drops Ariakas\'s arcane ward; Tanis strikes for the Crown of Power (`CRUC-19`)',
        'Total Dragonarmy civil war inside the collapsing Temple of Darkness (`CRUC-23`)'
      ],
      clockName: 'Highlord Civil War',
      clockNotes: 'Advances as Kitiara and Tanis destabilize Ariakas\'s grip on the Crown of Power.'
    },

    // TIER 2: TOPOLOGICAL & BIOME ANCHORS
    {
      id: 'MOD_T2_WAYRETH_SHIFTING_GROVE',
      title: 'The Shifting Enchanted Forest of Wayreth',
      set: 'Set_1_Preludes_and_Abanasinia',
      pipeline_tier: 2,
      culture: 'Hierarchy',
      color: 'U',
      provides: ['high_sorcery_conclave_mandate'],
      requires: [],
      summary: 'Sentient mobile woodland that physically relocates across southern Ansalon to conceal the obsidian Tower of High Sorcery from the uninvited (`Q_PRE_01`).',
      standalone_fallback: 'Manifests as an impenetrable mist-bound pine forest to non-magical travelers.',
      sensory: {
        physical: 'Whispering pine needles, silver-barked oaks moving when unobserved, and polished black obsidian towers.',
        behaviors: 'Forest paths folding back on trespassers while parting for summoned initiates.',
        relationships: 'Neutral sanctuary shared by White, Red, and Black Robe archmages.',
        attitudes: 'Detached arcane vigilance above mortal wars.',
        values: 'Preservation of Magic under the Three Moons.'
      },
      four_corners: {
        establishment: 'Par-Salian & The Conclave of Wizards',
        opponent: 'Renegade Mages & Unsanctioned Warlocks',
        shadow: 'Fistandantilus\'s Lingering Vestige',
        outcast: 'Mundane Guardians & Brothers (Caramon Majere)'
      },
      dials: [
        'Welcoming forest paths guiding summoned initiates to the gates',
        'Disorienting spatial loops delaying uninvited war-parties',
        'Active elemental and illusion wards repelling Dragonarmy scouts',
        'Total planar translocation of the grove to a new region'
      ],
      clockName: 'Wayreth Ward Perturbation',
      clockNotes: 'Advances when high-tier necromancy or Dragon Orb resonance disturbs the forest.'
    },
    {
      id: 'MOD_T2_VALLEY_TREES_SOLACE',
      title: 'The Vallenwood Canopy of Solace',
      set: 'Set_1_Preludes_and_Abanasinia',
      pipeline_tier: 2,
      culture: 'Clan',
      color: 'G',
      provides: ['spiced_potatoes_provisions', 'fellowship_sanctuary', 'timber_bridge_maintenance'],
      requires: [],
      summary: 'Elevated treetop settlement built into giant vallenwood boughs, providing multi-tiered rope-bridge traversal and the hearth of the Inn of the Last Home (`Q_AUT_01`).',
      standalone_fallback: 'Retracting rope ladders isolates the upper vallenwood platforms from ground patrols.',
      sensory: {
        physical: 'Golden autumn leaves, resinous vallenwood bark, and the warm aroma of Otik\'s spiced potatoes.',
        behaviors: 'Townsfolk crossing swaying rope bridges and gathering around the common hearth.',
        relationships: 'Tight-knit frontier solidarity tested by Seeker informants.',
        attitudes: 'Protective love of home and hearth.',
        values: 'Hospitality, loyalty, and peaceful craftsmanship.'
      },
      four_corners: {
        establishment: 'Otik Sandath & Town Militia of Solace',
        opponent: 'Fewmaster Toede\'s Hobgoblin & Baaz Raiders',
        shadow: 'High Theocrat Hederick\'s Seeker Patrols',
        outcast: 'Refugees Fleeing the Northern Burning'
      },
      dials: [
        'Peaceful autumn festival in the vallenwood boughs',
        'Seeker curfews and hooded draconian searches on the walkways',
        'Red Dragon fire-bombing of the lower vallenwood trunks',
        'Occupied ash-ruin patrolled by Baaz garrisons (`Q_AUT_03`)'
      ],
      clockName: 'Solace Occupation',
      clockNotes: 'Advances as Verminaard\'s Red Wing tightens its grip on Abanasinia.'
    },
    {
      id: 'MOD_T2_DROWNED_RUIN_XAK_TSAROTH',
      title: 'The Sunken Swamp & Acid Caverns of Xak Tsaroth',
      set: 'Set_2_Autumn_Twilight',
      pipeline_tier: 2,
      culture: 'Adhocracy',
      color: 'BG',
      provides: ['disks_of_mishakal_liturgy', 'fistandantilus_sunken_grimoire'],
      requires: [],
      summary: 'Cataclysm-tilted city plunged into a subterranean chasm beneath a fetid black swamp, contested by Aghar gully dwarves, Baaz draconians, and the black wyrm Khisanth (`Q_AUT_02`).',
      standalone_fallback: 'Natural swamp miasma and collapsing marble colonnades challenge delves even after Khisanth\'s death.',
      sensory: {
        physical: 'Sulfurous cypress mud, tilted marble columns, and the acrid tang of black-dragon acid.',
        behaviors: 'Aghar Bulps scavenging ancient libraries while draconians weave wicker dragon traps.',
        relationships: 'Highbulp Phudge appeasing Khisanth while Bupu aids Raistlin.',
        attitudes: 'Fatalistic subterranean survival.',
        values: 'Hoarded relics and ancient divine memory.'
      },
      four_corners: {
        establishment: 'Khisanth (Onyx) & Baaz/Kapak Garrison',
        opponent: 'Goldmoon, Riverwind & The Companions',
        shadow: 'Raistlin Seeking Fistandantilus\'s Grimoire (`CRUC-09`)',
        outcast: 'Bupu & The Aghar Gully Dwarf Clans'
      },
      dials: [
        'Dormant swamp mists and scattered wicker-dragon patrols',
        'Active draconian ambushes at the surface Temple of Mishakal',
        'Khisanth stalking the flooded subterranean plaza',
        'Catastrophic cavern collapse triggered by Khisanth\'s death (`CRUC-28`)'
      ],
      clockName: 'Khisanth Cavern Collapse',
      clockNotes: 'Advances during combat in the sunken plaza of Xak Tsaroth.'
    },
    {
      id: 'MOD_T2_KHAROLIS_WINTER_PASSES',
      title: 'The Kharolis Blizzard Passes & Vitrified Skullcap',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 2,
      culture: 'Clan',
      color: 'RW',
      provides: ['helm_of_grallen_relic', 'thorbardin_secret_gate_map'],
      requires: [],
      summary: 'Lethal high-altitude winter mountain passes haunted by the spectral Dwarfgate legions around Fistandantilus\'s melted skull-fortress (`Q_WIN_01`, `CRUC-12`).',
      standalone_fallback: 'Freezing exposure and spectral guardians persist across the mountain trails year-round.',
      sensory: {
        physical: 'Howling whiteout blizzards, green vitrified glass crags, and phantom battle-cries in the snow.',
        behaviors: '800 shivering Solace refugees huddling around pine-needle fires while Eben marks rocks.',
        relationships: 'Elistan holding refugee morale together while Tanis and Flint hunt for Thorbardin\'s gate.',
        attitudes: 'Desperate endurance against starvation and betrayal.',
        values: 'Communal survival.'
      },
      four_corners: {
        establishment: 'Spectral Guardians of Derkin\'s Tomb & Skullcap',
        opponent: 'Red Dragonarmy Pursuit Columns',
        shadow: 'Eben Shatterstone (Internal Traitor, `CRUC-12`)',
        outcast: '800 Starving Pax Tharkas Refugees'
      },
      dials: [
        'Bitter mountain frost slowing wagon movement',
        'Eben\'s trail-markers drawing draconian outriders',
        'Spectral Dwarfgate phalanxes awakening around Skullcap',
        'Full Red Wing pincer ambush in the snow pass (`CRUC-12`)'
      ],
      clockName: 'Refugee Frostbite & Attrition',
      clockNotes: 'Advances each day the 800 refugees remain outside Thorbardin\'s gates.'
    },
    {
      id: 'MOD_T2_LANDLOCKED_TARSIS_DUSTBOWL',
      title: 'The Landlocked Dust-Harbor of Tarsis',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 2,
      culture: 'Market',
      color: 'WR',
      provides: ['icewall_expedition_charts', 'silvanesti_griffon_escort'],
      requires: [],
      summary: 'Once Krynn\'s jewel seaport, left forty miles inland by the Cataclysm where rotting galleons sit in prairie dust under corrupt merchants and Blue Wing occupation (`Q_WIN_02`).',
      standalone_fallback: 'Functions as a black-market caravan hub across the Plains of Dust.',
      sensory: {
        physical: 'Dry red dust swirling around marble colonnades and sun-bleached ship hulls.',
        behaviors: 'Corrupt watchmen arresting outsiders while tavern crowds riot under dragon fire.',
        relationships: 'Lord Bakaris enforcing Kitiara\'s curfew while Alhana Starbreeze seeks allies.',
        attitudes: 'Decadent denial of faded glory.',
        values: 'Mercantile survival and Opportunism.'
      },
      four_corners: {
        establishment: 'Tarsis Merchant Magistrates & City Watch',
        opponent: 'Highlord Kitiara & Lord Bakaris\'s Blue Wing Strike Force',
        shadow: 'The Fellowship of the Lance (`CRUC-24`)',
        outcast: 'Princess Alhana Starbreeze & Her Griffon Guard'
      },
      dials: [
        'Dust-choked markets and suspicious municipal arrests',
        'Tas uncovers the cracked Dragon Orb in the basement library',
        'Blue and Red Dragons strafe the Red Dragon Inn (`CRUC-24`)',
        'Total Dragonarmy martial law across the burning city'
      ],
      clockName: 'Tarsis Street Riot',
      clockNotes: 'Advances when the Dragon Orb is disturbed or Bakaris recognizes the Companions.'
    },
    {
      id: 'MOD_T2_ICEWALL_GLACIAL_SPIRE',
      title: 'The Sub-Zero Glacier & Ice-Boat Wastes of Icewall',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 2,
      culture: 'Adhocracy',
      color: 'WU',
      provides: ['icewall_dragon_orb', 'golden_general_reputation'],
      requires: ['icewall_expedition_charts'],
      summary: 'Blinding southern ice-sheet crossed by sail-rigged ice-boats and contested by Ice Folk barbarians, Than-Kar walrus-men, and Highlord Feal-Thas\'s white wolves (`Q_WIN_03B`).',
      standalone_fallback: 'Extreme cold and crevasse hazards challenge any expedition to the southern pole.',
      sensory: {
        physical: 'Singing steel runners of ice-boats on blue glacial glass; blinding snow-glare; frozen blood on white fur.',
        behaviors: 'Winter wolves stalking through whiteouts while Sleet circles the spire.',
        relationships: 'Laurana rallying the Ice Folk hunters after Sturm and Derek clash.',
        attitudes: 'Stark polar survival.',
        values: 'Courage against the frost.'
      },
      four_corners: {
        establishment: 'Highlord Feal-Thas, Sleet & The White Wing',
        opponent: 'Laurana, Sturm & Ice Folk Raiders (`CRUC-14`, `CRUC-25`)',
        shadow: 'The Sentient Will Inside the Icewall Dragon Orb',
        outcast: 'Than-Kar Walrus-Men Thralls'
      },
      dials: [
        'Howling polar gales and winter wolf scouting packs',
        'Ice-boat skirmishes across the crevasse fields',
        'Assault on the slick ice-tunnels of Icewall Castle',
        'Duel with Feal-Thas and Sleet at the Orb pedestal (`CRUC-14`)'
      ],
      clockName: 'Glacial Freeze & White Wing Alert',
      clockNotes: 'Advances when wolf packs spot approaching ice-boats.'
    },
    {
      id: 'MOD_T2_BLOOD_SEA_VORTEX',
      title: 'The Blood Sea of Istar Maelstrom & Drowned Ruins',
      set: 'Set_4_Spring_Dawning',
      pipeline_tier: 2,
      culture: 'Adhocracy',
      color: 'UR',
      provides: ['black_robe_transfiguration', 'berem_everman_revelation'],
      requires: ['perechon_smuggler_berth'],
      summary: 'Perpetual arterial-red whirlpool above the sunken Cataclysm crater of Istar, pulling ships down into the Dargonesti sea-elf ruins (`Q_SPR_01`).',
      standalone_fallback: 'Red silt storms and corsair patrols hazard all shipping between Flotsam and Kalaman.',
      sensory: {
        physical: 'Roaring funnel of blood-red seawater, groaning ship timbers, and bioluminescent sunken marble domes.',
        behaviors: 'Corsair crews lashing themselves to the wheel as Blue Dragons dive from the clouds.',
        relationships: 'Raistlin abandoning Caramon and Tanis as his robes turn black.',
        attitudes: 'Apocalyptic dread.',
        values: 'Survival and cosmic reckoning.'
      },
      four_corners: {
        establishment: 'Kitiara\'s Blue Wing Aerial Interceptors',
        opponent: 'Tanis, Caramon & Crew of the Perechon',
        shadow: 'Raistlin Majere Embracing Nuitari\'s Black Robes',
        outcast: 'Apoletta, Dargonesti Sea Elves & Berem the Everman'
      },
      dials: [
        'Outer crimson currents pulling the Perechon off course',
        'Skie and Kitiara boarding-strike above the vortex lip',
        'Raistlin teleports away with the Dragon Orb as the ship plunges',
        'Awakening in the air-filled domes of sunken Istar (`Q_SPR_01`)'
      ],
      clockName: 'Maelstrom Hull Crush',
      clockNotes: 'Advances each round the Perechon remains trapped in the vortex funnel.'
    },

    // TIER 3: INFRASTRUCTURAL SUPPLY CHAINS
    {
      id: 'MOD_T3_MERCENARY_SIEGE_LINES',
      title: 'Baron Ivor\'s Mercenary Siege Logistics (347 AC)',
      set: 'Set_1_Preludes_and_Abanasinia',
      pipeline_tier: 3,
      culture: 'Market',
      color: 'BR',
      provides: ['mercenary_sellsword_contracts', 'khalkist_smuggler_pass'],
      requires: ['steel_coin_treasury'],
      summary: 'Combined-arms mercenary siege network pairing battle-magic with heavy infantry at Langtree and Hope\'s End (`Q_PRE_02`, `Q_ECHO_02`, `CRUC-05`).',
      standalone_fallback: 'Veteran sellsword companies hire out to local barons for raw steel barter.',
      sensory: {
        physical: 'Pitch cauldrons, mud-spattered pavilions, and the smell of scorched horsehair.',
        behaviors: 'Horkin\'s sergeants rationing steel pay-chits while sappers dig toward the东 gate.',
        relationships: 'Young Caramon shielding Raistlin as they perfect their sword-and-spell cadence.',
        attitudes: 'Pragmatic professional soldiering recoiling at wanton massacre.',
        values: 'Contract honor versus human conscience (`CRUC-05`).'
      },
      four_corners: {
        establishment: 'Mad Baron Ivor\'s High Command',
        opponent: 'Rebel Garrison & Citizens of Hope\'s End',
        shadow: 'Immolatus & Kitiara\'s Secret Egg Heist (`CRUC-06`)',
        outcast: 'Captain Horkin, Caramon & Raistlin\'s Mutinous Company'
      },
      dials: [
        'Standard siege encirclement and artillery bombardment',
        'Raistlin\'s illusions and sleep spells breaching outer defenses',
        'Horkin and the twins discover Baron Ivor\'s massacre orders (`CRUC-05`)',
        'Immolatus descends in fire to vitrify the valley walls (`CRUC-06`)'
      ],
      clockName: 'Hope\'s End Wall Breach',
      clockNotes: 'Advances as siege engines pound the eastern gate of Hope\'s End.'
    },
    {
      id: 'MOD_T3_SANCTION_EGG_FOUNDRIES',
      title: 'The Volcanic Draconian Hatcheries of Sanction',
      set: 'Set_1_Preludes_and_Abanasinia',
      pipeline_tier: 3,
      culture: 'Hierarchy',
      color: 'BR',
      provides: ['draconian_army_reinforcements'],
      requires: ['silver_clutch_eggshell_evidence'],
      summary: 'Industrial-ritual egg corruption vats inside the volcanic Temple of Luerkhisis where stolen Good Dragon eggs are mutated into Baaz, Kapak, Bozak, Sivak, and Aurak draconians (`Q_PRE_03`, `Q_SPR_02`).',
      standalone_fallback: 'Continues spawning reserve draconian regiments from stockpiled clutches until infiltrated.',
      sensory: {
        physical: 'Geothermal lava conduits heating rows of weeping metallic eggs in black slime vats.',
        behaviors: 'Dark clerics chanting Wyrllish\'s corruption liturgy while red dragon guards patrol the vents.',
        relationships: 'Takhisis\'s priesthood holding the Good Dragons hostage by their own children.',
        attitudes: 'Cold industrial desecration.',
        values: 'Mass-produced shock troops and strategic blackmail.'
      },
      four_corners: {
        establishment: 'High Cleric Wyrllish & Temple of Luerkhisis Guard',
        opponent: 'Silvara, Gilthanas & Fizban\'s Infiltration Team (`Q_SPR_02`)',
        shadow: 'Raistlin\'s Early Forensic Discovery (`CRUC-07`)',
        outcast: 'Captive Unhatched Metallic Dragon Wyrmlings'
      },
      dials: [
        'Secret subterranean incubation of the first Baaz and Kapak clutches (348 AC)',
        'Full wartime production supplying all five Dragonarmy Wings (351 AC)',
        'Silvara and Gilthanas breach the lava vents to witness the horror',
        'Metallic Dragons shatter their neutrality oath and burn the vats (`Q_SPR_02`)'
      ],
      clockName: 'Draconian Clutch Hatching',
      clockNotes: 'Advances to deploy fresh Sivak and Aurak strike teams across Ansalon.'
    },
    {
      id: 'MOD_T3_AGHAR_LIFT_HYDRAULICS',
      title: 'The Great Chain Lift & Express Chutes of Xak Tsaroth',
      set: 'Set_2_Autumn_Twilight',
      pipeline_tier: 3,
      culture: 'Adhocracy',
      color: 'RG',
      provides: ['aghar_express_chute_access'],
      requires: [],
      summary: 'Precarious counterfactual pulley-lift and slick trash-chute network maintained by the Aghar gully dwarves across the vertical tiers of sunken Xak Tsaroth (`Q_AUT_02`, `CRUC-28`).',
      standalone_fallback: 'Counterweight buckets operate manually via gully dwarf crank-teams.',
      sensory: {
        physical: 'Shrieking un-oiled iron links, rusted ore-buckets, and grease-slick stone chutes.',
        behaviors: 'Gully dwarves counting "one, two, many" while pulling levers at random.',
        relationships: 'Bupu guiding the Companions past Highbulp Phudge\'s guards.',
        attitudes: 'Chaotic mechanical improvisation.',
        values: 'Fast vertical escape.'
      },
      four_corners: {
        establishment: 'Highbulp Phudge I\'s Lift Operators',
        opponent: 'Pursuing Baaz & Kapak Draconian Squads',
        shadow: 'Collapsing Cavern Ceiling (`CRUC-28`)',
        outcast: 'Bupu & Tasslehoff Burrfoot at the Winch'
      },
      dials: [
        'Creaking bucket lift operating normally between cavern tiers',
        'Express chute bypass dropping travelers straight to the library',
        'Overloaded chain straining under 85 lbs of Platinum Disks (`CRUC-28`)',
        'Emergency counterweight release flinging the cage to the surface'
      ],
      clockName: 'Lift Chain Structural Failure',
      clockNotes: 'Advances when heavy loads or acid splashes corrode the main hoist.'
    },
    {
      id: 'MOD_T3_PAX_THARKAS_SLAVE_MINES',
      title: 'The Iron Mines, Great Chain & Hostage Nursery of Pax Tharkas',
      set: 'Set_2_Autumn_Twilight',
      pipeline_tier: 3,
      culture: 'Hierarchy',
      color: 'BR',
      provides: ['pax_tharkas_iron_ore', 'liberated_800_refugees', 'everman_berem_release'],
      requires: ['pax_tharkas_undercroft_breach', 'disks_of_mishakal_liturgy'],
      summary: 'Verminaard\'s industrial slave-mining complex where 500 adult prisoners forge Dragonarmy steel while 250 children are held hostage under the senile red dragon Flamestrike (`Q_AUT_03`, `CRUC-10`).',
      standalone_fallback: 'Produces raw iron weapons via hobgoblin labor if the human slaves revolt.',
      sensory: {
        physical: 'Roaring blast-furnaces, clanking ankle-irons, and the suffocating heat of the sixty-foot bronze Great Chain.',
        behaviors: 'Miners passing secret word to Elistan\'s cell while Laurana and Tika infiltrate the nursery.',
        relationships: 'Parents terrorized into submission by threats to their children above.',
        attitudes: 'Crushing despair igniting into righteous revolt.',
        values: 'Family survival and liberation.'
      },
      four_corners: {
        establishment: 'Highlord Verminaard, Pyros & The Red Wing Garrison',
        opponent: 'Tanis, Elistan & The Slave Uprising',
        shadow: 'Flamestrike (Matafleur\'s Maternal Frenzy, `CRUC-10`)',
        outcast: 'Sestun & The Imprisoned Everman Berem'
      },
      dials: [
        'Full iron-ore output under brutal draconian overseers',
        'Sla-Mori infiltrators ascend the bronze Great Chain into the furnace room',
        'Children freed from the nursery; Flamestrike unleashed upon Pyros (`CRUC-10`)',
        'Verminaard slain in the sanctum; 800 refugees march into the Kharolis (`Q_AUT_03`)'
      ],
      clockName: 'Pax Tharkas Garrison Lockdown',
      clockNotes: 'Advances if alarms sound before the hostage children are secured.'
    },
    {
      id: 'MOD_T3_THORBARDIN_LIFE_TREE_SEAL',
      title: 'The Great Northgate & Life Tree Foundations of Thorbardin',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 3,
      culture: 'Hierarchy',
      color: 'RW',
      provides: ['hammer_of_kharas_authority', 'refugee_winter_sanctuary'],
      requires: ['helm_of_grallen_relic'],
      summary: 'Monumental counterweighted stone plug sealing the subterranean dwarven kingdom since the Dwarfgate War, reopened only by the Helm of Grallen and Hammer of Kharas (`Q_WIN_01`).',
      standalone_fallback: 'Remains hermetically sealed on internal subterranean mushroom farms and aquifers.',
      sensory: {
        physical: 'Hundred-foot granite counterbalance blocks and the cavern-spanning column of the Life Tree.',
        behaviors: 'Hylar guards inspecting ancient clan seals while Theiwar plot in the dark.',
        relationships: 'Flint Fireforge confronting his old kinship wounds to win sanctuary for human refugees.',
        attitudes: 'Xenophobic isolationism yielding to ancient honor.',
        values: 'Stone permanence and oaths.'
      },
      four_corners: {
        establishment: 'Hylar & Daewar Council of Thanes',
        opponent: 'Theiwar Savants & Dragonarmy Collaborators',
        shadow: 'Legacy of Fistandantilus\'s Dwarfgate Betrayal',
        outcast: 'Flint Fireforge, Sestun & The 800 Surface Refugees'
      },
      dials: [
        'Hermetically sealed mountain gates ignoring surface wars',
        'Presentation of the Helm of Grallen opens diplomatic parley',
        'Recovery of the Hammer of Kharas unites the dwarven clans',
        'Full winter sanctuary granted to the 800 Pax Tharkas refugees (`Q_WIN_01`)'
      ],
      clockName: 'Thane Council Isolationism',
      clockNotes: 'Advances if Theiwar agitators convince the clans that the refugees bring the plague.'
    },
    {
      id: 'MOD_T3_ERGOTH_DRAGONMETAL_FORGE',
      title: 'The Foghaven Dragonlance Forge of Huma',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 3,
      culture: 'Clan',
      color: 'WU',
      provides: ['forged_true_dragonlances'],
      requires: ['hammer_of_kharas_authority', 'icewall_dragon_orb'],
      summary: 'Sacred forge inside the silver dragon monument of Southern Ergoth where Theros Ironfeld unites the Silver Arm of Ergoth, the Hammer of Kharas, and pure dragonmetal (`Q_WIN_03B`, `CRUC-18`).',
      standalone_fallback: 'Produces masterwork silvered weapons even if one of the two forging artifacts is delayed.',
      sensory: {
        physical: 'White-hot silver sparks, ringing anvil strikes echoing inside a carved stone dragon belly, and cold mountain mist.',
        behaviors: 'Theros hammering tireless rhythms with his living silver arm while Silvara watches the passes.',
        relationships: 'Gilthanas and Silvara falling in love across the mortal-dragon divide.',
        attitudes: 'Sacred craftsmanship.',
        values: 'Hope forged in silver.'
      },
      four_corners: {
        establishment: 'Silvara & The Guardians of Foghaven Valley',
        opponent: 'Sivak Draconian Infiltrators (`CRUC-18`)',
        shadow: 'Hostile Qualinesti & Kagonesti Border Patrols',
        outcast: 'Theros Ironfeld (The Silver-Armed Blacksmith)'
      },
      dials: [
        'Cold, forgotten altar inside the Tomb of Huma',
        'Awakening of the forge-fires with the Silver Arm and Hammer of Kharas',
        'First batch of Footman\'s and Mounted Dragonlances completed',
        'Full armory shipped to Sancrist and the High Clerist\'s Tower (`Q_WIN_04`)'
      ],
      clockName: 'Dragonlance Production',
      clockNotes: 'Advances to arm the Knights of Solamnia before the Blue Wing strikes.'
    },
    {
      id: 'MOD_T3_HIGH_CLERIST_DRAGON_TRAP',
      title: 'The Architectural Dragon-Trap of the High Clerist\'s Tower',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 3,
      culture: 'Hierarchy',
      color: 'W',
      provides: ['blue_wing_broken_siege', 'parapet_of_sturm_legacy'],
      requires: ['forged_true_dragonlances', 'whitestone_alliance_treaty'],
      summary: 'Ancient fortress engineered by Vinas Solamnus not to keep dragons out, but to lure them via a central Dragon Orb into narrow stone kill-chutes lined with Dragonlances (`Q_WIN_04`, `CRUC-13`, `CRUC-17`).',
      standalone_fallback: 'Outer curtain walls hold conventional infantry assaults even without the Dragon Orb active.',
      sensory: {
        physical: 'Symmetrical octagonal stone funnels, portcullis winches greased with tallow, and ozone from Blue Dragon lightning.',
        behaviors: 'Knights bracing sixteen-foot lances behind murder-holes while Laurana focuses on the Orb.',
        relationships: 'Sturm holding the sunlit parapet alone so Laurana and Tas have time below.',
        attitudes: 'Unyielding sacrifice.',
        values: 'Est Sularus oth Mithas (`CRUC-13`).'
      },
      four_corners: {
        establishment: 'Sturm Brightblade, Laurana & The Tower Garrison',
        opponent: 'Highlord Kitiara, Bakaris & 30 Blue Dragons',
        shadow: 'Lord Derek Crownguard\'s Disastrous Field Charge',
        outcast: 'Tasslehoff Burrfoot & Flint in the Orb Vault (`CRUC-26`)'
      },
      dials: [
        'Under-manned garrison freezing on the outer walls after Derek\'s rout',
        'Tasslehoff deciphers the symmetrical dragon-trap floorplan',
        'Sturm duels Kitiara on the parapet (`CRUC-13`); Laurana activates the Orb (`CRUC-17`)',
        'Blue Dragons dive blindly into the stone funnels and are impaled on Dragonlances'
      ],
      clockName: 'High Clerist\'s Tower Breach',
      clockNotes: 'Advances as Bakaris\'s draconians batter the West Gate.'
    },
    {
      id: 'MOD_T3_LUERKHISIS_CORRUPTION_VATS',
      title: 'The Temple of Luerkhisis & Metallic Dragon Awakening',
      set: 'Set_4_Spring_Dawning',
      pipeline_tier: 3,
      culture: 'Clan',
      color: 'WRG',
      provides: ['metallic_dragon_oath_breaker'],
      requires: ['silver_clutch_eggshell_evidence'],
      summary: 'Volcanic covert operation into Sanction\'s Temple of Luerkhisis that exposes the corruption of the Good Dragon eggs and brings the Gold, Silver, Bronze, Brass, and Copper Dragons into the war (`Q_SPR_02`).',
      standalone_fallback: 'Operates via smuggled eggshell proof (`ITM-SILVER-SHARD`) from Hope\'s End.',
      sensory: {
        physical: 'Choking sulfur fumes, glowing magma grates, and the metallic chime of mourning Silver Dragons.',
        behaviors: 'Silvara, Gilthanas, and Fizban creeping through volcanic ducts past Bozak guards.',
        relationships: 'The ancient Gold and Silver Dragons weeping in fury as Takhisis\'s lie is exposed.',
        attitudes: 'Righteous draconic wrath unleashed after centuries of coerced silence.',
        values: 'Protection of the unborn and liberation of Krynn.'
      },
      four_corners: {
        establishment: 'Sanction Temple Guard & Dark Clerics of Takhisis',
        opponent: 'Silvara, Gilthanas & Fizban the Fabulous',
        shadow: 'Draconic Neutrality Oath Enforced by Hostage Fear',
        outcast: 'Mutated First-Generation Draconian Hatchlings'
      },
      dials: [
        'Metallic Dragons bound by Takhisis\'s hostage oath',
        'Infiltration of the lava-ducts beneath Mount Terk',
        'Discovery of the corruption vats inside the Temple of Luerkhisis',
        'Metallic Dragon flights descend across Ansalon carrying Solamnic Lancer Knights (`Q_SPR_02`)'
      ],
      clockName: 'Metallic Dragon Awakening',
      clockNotes: 'Advances as proof of the Sanction egg corruption reaches the northern roosts.'
    },

    // TIER 4: DYNAMIC NARRATIVE SPARKS & CLOCKS
    {
      id: 'MOD_T4_SILVER_CLUTCH_BETRAYAL',
      title: 'The Stolen Silver Clutch of Hope\'s End (347 AC)',
      set: 'Set_1_Preludes_and_Abanasinia',
      pipeline_tier: 4,
      culture: 'Adhocracy',
      color: 'UBR',
      provides: ['silver_clutch_eggshell_evidence'],
      requires: ['mercenary_sellsword_contracts'],
      summary: 'Secret conspiracy beneath the Siege of Hope\'s End where the Red Dragon Immolatus uses Baron Ivor\'s war as a smokescreen to seize a clutch of Silver Dragon eggs (`Q_PRE_02`, `Q_ECHO_02`, `CRUC-07`).',
      standalone_fallback: 'Leaves forensic dragon-glass and eggshell shards (`ITM-SILVER-SHARD`) in the ruined cellars of Hope\'s End.',
      sensory: {
        physical: 'Frost-rimmed silver eggs glowing in a dark stone vault while dragonfire roars overhead.',
        behaviors: 'Kitiara bargaining with Immolatus in the smoke while Raistlin records forensic notes.',
        relationships: 'Kitiara choosing imperial ambition over her mercenary comrades.',
        attitudes: 'Cold calculation amidst a burning town.',
        values: 'Forbidden knowledge as ultimate leverage (`CRUC-07`).'
      },
      four_corners: {
        establishment: 'Immolatus (Ancient Red Wyrm) & Sanction Agents',
        opponent: 'Raistlin, Caramon & Horkin\'s Mutineers',
        shadow: 'Kitiara Uth Matar & Lord Bakaris (`CRUC-06`)',
        outcast: 'D\'Argent (Mother of the Stolen Silver Clutch)'
      },
      dials: [
        'Rumors of strange silver spheres hidden beneath Hope\'s End keep',
        'Bakaris betrays the vault location to Kitiara',
        'Immolatus incinerates the keep to extract the clutch (`CRUC-06`)',
        'Raistlin secures the forensic secret of the Sanction egg trade (`CRUC-07`)'
      ],
      clockName: 'Silver Clutch Extraction',
      clockNotes: 'Advances during the final 48 hours of the Siege of Hope\'s End.'
    },
    {
      id: 'MOD_T4_DRACONIAN_CHECKPOINTS',
      title: 'Hooded Draconian Checkpoints & Death-Throes Ecology',
      set: 'Set_2_Autumn_Twilight',
      pipeline_tier: 4,
      culture: 'Hierarchy',
      color: 'BR',
      provides: ['abanasinia_rumor_network'],
      requires: [],
      summary: 'Roadblock and ambush network across Abanasinia introducing the five Draconian sub-types and their lethal death-throes (Baaz petrification trapping swords, Kapak acid pools, Bozak bone-detonations, Sivak shape-stealing, Aurak arcane blasts).',
      standalone_fallback: 'Patrols operate autonomously along all major transit corridors.',
      sensory: {
        physical: 'Coarse monk robes hiding brassy scales, reptilian snouts, and the clack of stone statues crumbling to dust.',
        behaviors: 'Baaz patrols demanding "the blue crystal staff" at bridges and inns.',
        relationships: 'Fewmaster Toede whipping goblins forward while draconians answer only to Verminaard.',
        attitudes: 'Cruel predatory discipline.',
        values: 'Hunt and capture.'
      },
      four_corners: {
        establishment: 'Baaz & Kapak Checkpoint Squads',
        opponent: 'Travelers & Companions on the Solace Roads',
        shadow: 'Sivak Shapeshifters Mimicking Slain Victims',
        outcast: 'Terrified Local Ferrymen & Woodcutters'
      },
      dials: [
        'Disguised "hooded men" asking questions at crossroads taverns',
        'Open roadblocks seizing weapons and steel coins',
        'Blade-trapping Baaz and venom-blade Kapak kill-squads',
        'Elite Bozak and Sivak hunter-packs with wyvern air support'
      ],
      clockName: 'Draconian Road Dragnet',
      clockNotes: 'Advances whenever checkpoints are alerted or survivors escape.'
    },
    {
      id: 'MOD_T4_REFUGEE_EXODUS_COLUMN',
      title: 'The 800 Refugees of Pax Tharkas & The Traitor Within',
      set: 'Set_2_Autumn_Twilight',
      pipeline_tier: 4,
      culture: 'Clan',
      color: 'WG',
      provides: ['dwarven_heavy_infantry'],
      requires: ['liberated_800_refugees'],
      summary: 'Moving settlement of 800 freed Solace men, women, and children trekking into the Kharolis Mountains while Eben Shatterstone secretly signals Red Wing pursuers (`Q_WIN_01`, `CRUC-12`).',
      standalone_fallback: 'Refugees fortify a hidden mountain box-canyon while scouts search for Thorbardin.',
      sensory: {
        physical: 'Crying infants wrapped in ragged blankets, squeaking handcarts, and Elistan\'s evening prayers.',
        behaviors: 'Families sharing meager rations while Eben slips away to the ridge at night.',
        relationships: 'Tanis and Riverwind rationing food while Goldmoon tends the sick.',
        attitudes: 'Fragile hope tested by hunger.',
        values: 'Leaving no family behind.'
      },
      four_corners: {
        establishment: 'Elistan, Goldmoon & The Refugee Council',
        opponent: 'Pursuing Red Dragonarmy Vanguard',
        shadow: 'Eben Shatterstone (Paid Informant, `CRUC-12`)',
        outcast: 'Brian Donner & Fever-Stricken Elders'
      },
      dials: [
        'Jubilant liberation march out of burning Pax Tharkas',
        'Ration shortages and winter storms in the foothills',
        'Eben Shatterstone steals the Helm of Grallen (`CRUC-12`)',
        'Desperate stand at the gates of Thorbardin (`Q_WIN_01`)'
      ],
      clockName: 'Refugee Column Discovery',
      clockNotes: 'Advances when campfires or Eben\'s signals alert Red Wing dragons.'
    },
    {
      id: 'MOD_T4_BLUE_WING_AERIAL_BLITZ',
      title: 'Kitiara\'s Blue Wing Aerial Blitz & The Tarsis Split',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 4,
      culture: 'Market',
      color: 'UB',
      provides: ['dragon_orb_lore_clue'],
      requires: [],
      summary: 'Coordinated dragon-and-draconian shock assault on Tarsis the Beautiful that shatters the Red Dragon Inn and forces the Fellowship\'s iconic split (`Q_WIN_02`, `CRUC-24`).',
      standalone_fallback: 'Blue Dragon patrols sweep the Plains of Dust and northern ports.',
      sensory: {
        physical: 'Ozone crackle of lightning breath, crashing inn rafters, and screaming griffons on the rooftops.',
        behaviors: 'Bakaris arresting Laurana in the chaos while Tanis covers the stairwell.',
        relationships: 'The agonizing split of the Companions across two halves of the continent (`CRUC-24`).',
        attitudes: 'Shock and tactical improvisation.',
        values: 'Sacrificing formation to save one another.'
      },
      four_corners: {
        establishment: 'Highlord Kitiara & Lord Bakaris\'s Blue Wing',
        opponent: 'The Unified Fellowship at the Red Dragon Inn (`CRUC-24`)',
        shadow: 'Red Wing Dragons Strafing indiscriminately',
        outcast: 'Alhana Starbreeze\'s Griffon Rescue Flight'
      },
      dials: [
        'Covert surveillance of the Companions in Tarsis market',
        'Street brawl and arrest of Tas at the courthouse',
        'Full aerial bombardment of the Red Dragon Inn (`CRUC-24`)',
        'Split extraction: Griffons to Silvanesti vs. Horses to Icewall'
      ],
      clockName: 'Tarsis Aerial Encirclement',
      clockNotes: 'Advances each hour the party lingers in Tarsis after visiting the library.'
    },
    {
      id: 'MOD_T4_SOLAMNIC_SCHISM_MEASURE',
      title: 'The Solamnic Schism: Derek\'s Folly vs. Sturm\'s Honor',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 4,
      culture: 'Hierarchy',
      color: 'W',
      provides: ['northern_offensive_supply_line'],
      requires: ['blue_wing_broken_siege'],
      summary: 'Deadly ideological fracture inside theHigh Clerist\'s Tower between Lord Derek Crownguard\'s glory-seeking charge and Sturm Brightblade\'s selfless defense of the walls (`Q_WIN_04`, `CRUC-13`).',
      standalone_fallback: 'Resolves at the Whitestone war-table if the Tower siege is bypassed.',
      sensory: {
        physical: 'Dented plate armor smeared with blood and ash; Derek\'s broken helm; Sturm\'s saluting blade in the dawn light.',
        behaviors: 'Derek leading knights into a catastrophic field ambush while Sturm holds the inner parapet with three hundred raw recruits.',
        relationships: 'Laurana defying knightly prejudice to command the defense.',
        attitudes: 'Hollow legalism shattered by authentic heroism.',
        values: 'True honor (`CRUC-13`).'
      },
      four_corners: {
        establishment: 'Sturm Brightblade & Laurana\'s Wall Defenders',
        opponent: 'Lord Derek Crownguard\'s Field Faction',
        shadow: 'Kitiara Uth Matar Watching from Skie\'s Saddle (`CRUC-13`)',
        outcast: 'Young Solamnic Footmen & Squires'
      },
      dials: [
        'Bitter court-martial threats against Sturm inside the Tower',
        'Derek marches two-thirds of the garrison into Bakaris\'s trap outside the gate',
        'Derek returns mortally insane; Sturm takes sole command of the parapet (`CRUC-13`)',
        'Sturm\'s stand unites the surviving Knighthood behind the Golden General'
      ],
      clockName: 'Garrison Morale Collapse',
      clockNotes: 'Advances when Derek\'s sally is slaughtered outside the West Gate.'
    },

    // TIER 5: ESOTERIC & ESCHATOLOGICAL ENGINES
    {
      id: 'MOD_T5_SOULFORGE_CRUCIBLE',
      title: 'The Soulforge of Wayreth & Fistandantilus\'s Blood-Pact',
      set: 'Set_1_Preludes_and_Abanasinia',
      pipeline_tier: 5,
      culture: 'Adhocracy',
      color: 'UBR',
      provides: ['staff_of_magius_attunement', 'soulforge_memory_projection'],
      requires: ['high_sorcery_conclave_mandate'],
      summary: 'The lethal Test of High Sorcery inside the Tower of Wayreth where Fistandantilus offers young Raistlin survival at the price of his health, golden skin, and hourglass eyes—and where Raistlin destroys the illusion of Caramon (`Q_PRE_01`, `Q_ECHO_01`, `CRUC-03`, `CRUC-04`).',
      standalone_fallback: 'Triggered as a playable Temporal Memory Crucible (`Q_ECHO_01`) whenever a 351 AC party attunes to the Bloodstone or Staff of Magius.',
      sensory: {
        physical: 'Melting stone walls, dark-elf arrows, emerald soul-fire, and the reflected hourglass pupils in a silver mirror.',
        behaviors: 'Raistlin whispering the bargain to Fistandantilus while Caramon weeps behind Par-Salian\'s one-way glass.',
        relationships: 'The irreversible fracture of the Majere twins\' innocence (`CRUC-04`).',
        attitudes: 'Defiant survival at any cost.',
        values: 'Arcane transcendence versus fraternal love.'
      },
      four_corners: {
        establishment: 'Par-Salian & The Three Orders\' Testing Wards',
        opponent: 'Liam\'s Lethal Fireball & Dark Elf Construct',
        shadow: 'Fistandantilus\'s Soul-Bargain (`CRUC-03`)',
        outcast: 'Caramon Majere (The Illusory Twin & Real Witness, `CRUC-04`)'
      },
      dials: [
        'Trial of the Three Moons and Dark Elf skirmish',
        'Liam\'s lethal arcane ambush leaves Raistlin dying on the stones',
        'Fistandantilus offers the Bloodstone pact (`CRUC-03`)',
        'The Soul-Mirror finale: Raistlin incinerates the illusion of Caramon (`CRUC-04`)'
      ],
      clockName: 'Soulforge Mortality Strain',
      clockNotes: 'Advances through each chamber of the Test of High Sorcery.'
    },
    {
      id: 'MOD_T5_LORAC_DREAMSCAPE_MATRIX',
      title: 'The Silvanesti Dragon Orb Nightmare & Cyan Bloodbane',
      set: 'Set_3_Winter_Night',
      pipeline_tier: 5,
      culture: 'Adhocracy',
      color: 'BG',
      provides: ['silvanesti_dragon_orb', 'starjewel_of_alhana'],
      requires: ['silvanesti_griffon_escort'],
      summary: 'Reality-warping psychic dreamscape generated by the Silvanesti Dragon Orb and the green wyrm Cyan Bloodbane through the dying mind of Speaker Lorac (`Q_WIN_03A`, `CRUC-16`).',
      standalone_fallback: 'Hallucinatory forest zones test each character\'s deepest primal wound and lie.',
      sensory: {
        physical: 'Bleeding silver birch trees, emerald chlorine mist, and phantoms of Sturm, Caramon, and Laurana dying in shifting visions.',
        behaviors: 'Companions fighting their own guilt-ridden nightmares until Raistlin recognizes the illusion.',
        relationships: 'Fistandantilus surging inside Raistlin\'s mind to claim the Orb (`CRUC-16`).',
        attitudes: 'Surreal psychological horror.',
        values: 'Self-knowledge conquering guilt.'
      },
      four_corners: {
        establishment: 'Cyan Bloodbane & The Silvanesti Dragon Orb',
        opponent: 'Tanis, Raistlin & The Silvanesti Expedition',
        shadow: 'Fistandantilus Attempting Full Possession of Raistlin (`CRUC-16`)',
        outcast: 'Dying Speaker Lorac Caladon & Princess Alhana'
      },
      dials: [
        'Subtle forest whispers and bleeding bark along the borders',
        'Full phantasmagoric death-illusions splitting the party\'s senses',
        'Fistandantilus seizes control of Raistlin\'s spellcasting (`CRUC-16`)',
        'Cyan Bloodbane banished from the throne room; Lorac freed in death'
      ],
      clockName: 'Nightmare Psychic Consumption',
      clockNotes: 'Advances each night spent inside the warped forest of Silvanesti.'
    },
    {
      id: 'MOD_T5_ASTINUS_CHRONICLE_VAULT',
      title: 'The Iconochronos of Astinus & Shoikan Grove',
      set: 'Set_4_Spring_Dawning',
      pipeline_tier: 5,
      culture: 'Hierarchy',
      color: 'UB',
      provides: ['astinus_chronicle_prophecy', 'palanthas_dragon_orb_vault', 'tower_of_palanthas_key'],
      requires: ['black_robe_transfiguration'],
      summary: 'The timeless Great Library of Palanthas where Astinus chronicles all mortal history and where Black-Robe Raistlin claims his destiny as Master of Past and Present (`Q_SPR_01`).',
      standalone_fallback: 'Provides historical lore and the third Dragon Orb to scholars who pass the Aesthetic monks.',
      sensory: {
        physical: 'Scratching goose-quill pens in absolute silence; across the street, the terrifying aura of the oak trees of Shoikan Grove.',
        behaviors: 'Astinus looking up from his desk to greet Raistlin as "old friend" (Fistandantilus).',
        relationships: 'Raistlin severing his mortal dependence to claim the cursed Tower of Palanthas.',
        attitudes: 'Cosmic neutrality and inexorable time.',
        values: 'The River of Time.'
      },
      four_corners: {
        establishment: 'Astinus of Palanthas & Order of Aesthetics',
        opponent: 'Raistlin Majere (Claimant of the Black Robes)',
        shadow: 'Unliving Guardians of the Shoikan Grove',
        outcast: 'Caramon & Tanis Searching for Their Lost Companion'
      },
      dials: [
        'Restricted historical archives of the Age of Dreams',
        'Discovery of the third Dragon Orb in the Palanthas vaults',
        'Raistlin arrives from the Blood Sea in Black Robes (`Q_SPR_01`)',
        'The gates of the cursed Tower of Palanthas bow open to the Master of Past and Present'
      ],
      clockName: 'Iconochronos Apotheosis',
      clockNotes: 'Advances as Raistlin unlocks the forbidden volumes of Fistandantilus.'
    },
    {
      id: 'MOD_T5_DARGAARD_DEATH_KNIGHT_PACT',
      title: 'Lord Soth\'s Banshee Curse & The Soul-Trade of Laurana',
      set: 'Set_4_Spring_Dawning',
      pipeline_tier: 5,
      culture: 'Hierarchy',
      color: 'B',
      provides: ['soth_death_knight_cavalry', 'captured_bakaris_leverage'],
      requires: [],
      summary: 'Unholy alliance between Highlord Kitiara and the undead Death Knight Lord Loren Soth of Dargaard Keep, trading Laurana\'s radiant soul for Soth\'s skeletal legions (`Q_SPR_02`, `CRUC-21`).',
      standalone_fallback: 'Dargaard Keep projects a lethal fear-and-chill aura across Nightlund.',
      sensory: {
        physical: 'Two pinpricks of orange flame inside a blackened Solamnic helm; the scent of singed roses; thirteen banshees screaming.',
        behaviors: 'Soth killing with a single whispered word of power (`Power Word Kill`) and chilling even Kitiara\'s dragons.',
        relationships: 'Kitiara bargaining away her rival Laurana to secure Soth\'s aid against Ariakas.',
        attitudes: 'Eternal damned obsession.',
        values: 'Spiteful possession of pure light (`CRUC-21`).'
      },
      four_corners: {
        establishment: 'Lord Loren Soth & His Thirteen Banshees',
        opponent: 'Laurana (The Captured Golden General) & Tanis',
        shadow: 'Highlord Kitiara Uth Matar (Broker of the Pact)',
        outcast: 'Skeletal Cavaliers of Dargaard Keep'
      },
      dials: [
        'Banshees singing Soth\'s curse inside Dargaard Keep',
        'Kitiara and Bakaris abduct Laurana from Kalaman (`Q_SPR_02`)',
        'Soth marches into Neraka as Kitiara\'s personal executioner',
        'Climax confrontation for Laurana\'s body and soul (`CRUC-21`)'
      ],
      clockName: 'Dargaard Soul-Claim',
      clockNotes: 'Advances once Laurana is brought in chains to the Temple of Neraka.'
    },
    {
      id: 'MOD_T5_NERAKA_FOUNDATION_PORTAL',
      title: 'The Cracked Foundation Stone & Takhisis\'s Abyssal Gate',
      set: 'Set_4_Spring_Dawning',
      pipeline_tier: 5,
      culture: 'Hierarchy',
      color: 'WUBRG',
      provides: ['sealed_abyssal_foundation_gate'],
      requires: ['berem_everman_revelation', 'metallic_dragon_oath_breaker'],
      summary: 'The ultimate cosmic climax in the subterranean vaults of Neraka where the five-headed Queen of Darkness strains against the Foundation Stone—decided by Berem the Everman, Raistlin, and the Companions (`Q_SPR_03`, `CRUC-20`, `CRUC-22`, `CRUC-29`).',
      standalone_fallback: 'Operates as the final campaign climax engine across all three campaign editions.',
      sensory: {
        physical: 'A cracked, jewel-encrusted marble pillar humming with Abyssal void-wind; the radiant emerald on Berem\'s chest; five chromatic dragon heads pressing through the veil.',
        behaviors: 'Raistlin blasting Dracart with black lightning while Caramon shields Berem\'s final leap onto the stone.',
        relationships: 'Jasla\'s forgiving spirit embracing her brother Berem after three hundred years of torment.',
        attitudes: 'Cosmic redemption versus total oblivion.',
        values: 'Forgiveness and free will sealing the dark.'
      },
      four_corners: {
        establishment: 'Takhisis (The Dark Queen) & High Cleric Dracart (`CRUC-22`)',
        opponent: 'Berem the Everman, Caramon & Jasla\'s Spirit',
        shadow: 'Raistlin Majere (Defying the Dark Queen to Preserve His Own Ambition, `CRUC-20`)',
        outcast: 'Gakhan & The Collapsing Temple Garrison'
      },
      dials: [
        'Takhisis\'s shadow pressing against the subterranean Foundation Vault',
        'Gakhan and Dracart corner Berem in the lower corridors (`CRUC-29`)',
        'Raistlin turns against Takhisis to clear the path to the stone (`CRUC-20`)',
        'Berem reunites the Green Gemstone with Jasla; the Temple of Darkness implodes (`CRUC-22`)'
      ],
      clockName: 'Takhisis Planar Manifestation',
      clockNotes: 'Advances each round during the Night of the Eye until the Foundation Stone is sealed or corrupted.'
    }
  ];

  return defs.map(d => ({
    ...d,
    // Explorer reads these arrays directly (Mechanics & Clocks tab).
    threat_clocks: [`${d.clockName} Clock [6 Ticks] - ${d.clockNotes}`],
    dials: d.dials.map(splitCorner),
    path: `./modules/${d.id}.md`,
    raw_markdown: renderModuleMarkdown(d)
  }));
}

module.exports = {
  getModuleDefinitions
};
