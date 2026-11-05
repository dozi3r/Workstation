/**
 * Edition-Adapted Quests & Segmented Threat Clocks (with Cascading Consequences)
 * Part of the Deep-Module Compiler for The Chronicles of Krynn (Workstation 2.6)
 */
'use strict';

function buildTrackers(editionMode) {
  const isV1 = editionMode === 'V1_HEROES_351';
  const isV2 = editionMode === 'V2_SHADOWS_351';
  const isV3 = editionMode === 'V3_346_AC';

  const trackers = [];

  // 1. AUTONOMOUS COMPANION ODYSSEY CLOCK (Active in V2 & V3 so the Heroes of the Lance move across the map!)
  if (isV2 || isV3) {
    const companionIds = [
      'npc_tanis', 'npc_sturm', 'npc_caramon', 'npc_raistlin',
      'npc_goldmoon', 'npc_riverwind', 'npc_tasslehoff', 'npc_flint'
    ];
    const moveAllCompanions = (nodeId, submapId = 'map_ansalon_continent') =>
      companionIds.map(id => ({ op: 'move_npc', id, nodeId, submapId }));

    trackers.push({
      id: 'TRK_COMPANIONS_ODYSSEY',
      nodeId: 'N_SOLACE',
      submapId: 'map_ansalon_continent',
      name: 'The Heroes of the Lance Odyssey Clock (Autonomous Mode B)',
      type: 'Threat Clock',
      scopeTier: 'world',
      maxTicks: 12,
      currentTicks: isV2 ? 1 : 0,
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      showOnCanvas: true,
      notes: 'Tracks the autonomous movement of the canonical Heroes of the Lance across Ansalon in Versions 2 & 3. Advancing each tick triggers Clock Threshold Consequences that physically relocate Tanis, Raistlin, Caramon, Sturm, Goldmoon, Riverwind, Tas, and Flint (and their carried artifacts!) across the pointcrawl nodes. Intercept them at any node to aid, rival, or ambush them!',
      triggerRefs: [
        { entityType: 'quest', entityId: 'Q_AUT_01' },
        { entityType: 'quest', entityId: 'Q_AUT_02' },
        { entityType: 'quest', entityId: 'Q_AUT_03' },
        { entityType: 'quest', entityId: 'Q_WIN_01' },
        { entityType: 'quest', entityId: 'Q_WIN_02' },
        { entityType: 'quest', entityId: 'Q_WIN_04' },
        { entityType: 'quest', entityId: 'Q_SPR_03' }
      ],
      consequences: [
        {
          tick: 1,
          description: 'Tick 1 (Reunion at Solace): The Companions reunite at the Inn of the Last Home as Goldmoon reveals the Blue Crystal Staff.',
          triggered: isV2,
          operations: moveAllCompanions('N_SOLACE', 'map_sub_solace_inn')
        },
        {
          tick: 2,
          description: 'Tick 2 (Descent into Xak Tsaroth): The Companions cross Darken Wood into drowned Xak Tsaroth to confront Khisanth for the Disks of Mishakal.',
          triggered: false,
          operations: moveAllCompanions('N_XAK_TSAROTH', 'map_sub_xak_tsaroth')
        },
        {
          tick: 3,
          description: 'Tick 3 (Capture & Flight to Qualinost): Captured in burned Solace, the Companions are rescued at Gateway by Gilthanas and enter Qualinost.',
          triggered: false,
          operations: moveAllCompanions('N_QUALINOST', 'map_ansalon_continent')
        },
        {
          tick: 4,
          description: 'Tick 4 (Infiltration of Pax Tharkas): The Companions creep through the Sla-Mori into Verminaard\'s fortress of Pax Tharkas.',
          triggered: false,
          operations: moveAllCompanions('N_PAX_THARKAS', 'map_sub_pax_tharkas')
        },
        {
          tick: 5,
          description: 'Tick 5 (Skullcap & Gates of Thorbardin): Leading 800 freed refugees, the Companions delve Derkin\'s Tomb and recover the Hammer of Kharas in Thorbardin.',
          triggered: false,
          operations: moveAllCompanions('N_THORBARDIN', 'map_ansalon_continent')
        },
        {
          tick: 6,
          description: 'Tick 6 (Ambush in Landlocked Tarsis): Kitiara\'s Blue Wing strafes the Red Dragon Inn in Tarsis, threatening to split the Fellowship.',
          triggered: false,
          operations: moveAllCompanions('N_TARSIS', 'map_sub_tarsis_square')
        },
        {
          tick: 7,
          description: 'Tick 7 (The Two Theaters — Silvanesti & Icewall): Tanis and Raistlin enter Lorac\'s Nightmare in Silvanesti while Sturm, Laurana, Flint, and Tas assault Feal-Thas at Icewall.',
          triggered: false,
          operations: [
            { op: 'move_npc', id: 'npc_tanis', nodeId: 'N_SILVANESTI' },
            { op: 'move_npc', id: 'npc_raistlin', nodeId: 'N_SILVANESTI' },
            { op: 'move_npc', id: 'npc_caramon', nodeId: 'N_SILVANESTI' },
            { op: 'move_npc', id: 'npc_goldmoon', nodeId: 'N_SILVANESTI' },
            { op: 'move_npc', id: 'npc_riverwind', nodeId: 'N_SILVANESTI' },
            { op: 'move_npc', id: 'npc_sturm', nodeId: 'N_ICEWALL' },
            { op: 'move_npc', id: 'npc_laurana', nodeId: 'N_ICEWALL' },
            { op: 'move_npc', id: 'npc_flint', nodeId: 'N_ICEWALL' },
            { op: 'move_npc', id: 'npc_tasslehoff', nodeId: 'N_ICEWALL' }
          ]
        },
        {
          tick: 8,
          description: 'Tick 8 (Southern Ergoth & The Whitestone Council): Silvara guides the southern company to Foghaven Valley to forge the Dragonlances before sailing to Sancrist.',
          triggered: false,
          operations: [
            { op: 'move_npc', id: 'npc_sturm', nodeId: 'N_SANCRIST' },
            { op: 'move_npc', id: 'npc_laurana', nodeId: 'N_SANCRIST' },
            { op: 'move_npc', id: 'npc_flint', nodeId: 'N_SANCRIST' },
            { op: 'move_npc', id: 'npc_tasslehoff', nodeId: 'N_SANCRIST' }
          ]
        },
        {
          tick: 9,
          description: 'Tick 9 (Siege of the High Clerist\'s Tower): Sturm, Laurana, Flint, and Tas hold the High Clerist\'s Tower against Kitiara\'s Blue Wing.',
          triggered: false,
          operations: [
            { op: 'move_npc', id: 'npc_sturm', nodeId: 'N_HIGH_CLERIST_TOWER' },
            { op: 'move_npc', id: 'npc_laurana', nodeId: 'N_HIGH_CLERIST_TOWER' },
            { op: 'move_npc', id: 'npc_flint', nodeId: 'N_HIGH_CLERIST_TOWER' },
            { op: 'move_npc', id: 'npc_tasslehoff', nodeId: 'N_HIGH_CLERIST_TOWER' }
          ]
        },
        {
          tick: 10,
          description: 'Tick 10 (Blood Sea Maelstrom & Black Robes): Tanis\'s company is sucked into the Blood Sea of Istar; Raistlin dons the Black Robes and teleports to Astinus in Palanthas.',
          triggered: false,
          operations: [
            { op: 'move_npc', id: 'npc_tanis', nodeId: 'N_BLOOD_SEA' },
            { op: 'move_npc', id: 'npc_caramon', nodeId: 'N_BLOOD_SEA' },
            { op: 'move_npc', id: 'npc_raistlin', nodeId: 'N_PALANTHAS' },
            { op: 'move_npc', id: 'npc_berem', nodeId: 'N_BLOOD_SEA' }
          ]
        },
        {
          tick: 11,
          description: 'Tick 11 (Kalaman & The Egg Vaults of Sanction): Laurana leads the northern liberation at Kalaman while Silvara and Gilthanas infiltrate Sanction\'s Temple of Luerkhisis.',
          triggered: false,
          operations: [
            { op: 'move_npc', id: 'npc_laurana', nodeId: 'N_KALAMAN' },
            { op: 'move_npc', id: 'npc_tanis', nodeId: 'N_KALAMAN' },
            { op: 'move_npc', id: 'npc_silvara', nodeId: 'N_SANCTION' },
            { op: 'move_npc', id: 'npc_gilthanas', nodeId: 'N_SANCTION' }
          ]
        },
        {
          tick: 12,
          description: 'Tick 12 (Convergence at the Temple of Neraka): All surviving Companions, Highlords, Raistlin, and Berem the Everman converge on Neraka for the Night of the Eye.',
          triggered: false,
          operations: [
            ...moveAllCompanions('N_NERAKA', 'map_sub_neraka_temple'),
            { op: 'move_npc', id: 'npc_laurana', nodeId: 'N_NERAKA' },
            { op: 'move_npc', id: 'npc_berem', nodeId: 'N_NERAKA' },
            { op: 'move_npc', id: 'npc_kitiara', nodeId: 'N_NERAKA' }
          ]
        }
      ]
    });
  }

  // 2. SHARED REGIONAL & WORLD THREAT CLOCKS
  trackers.push(
    {
      id: 'TRK_SOULFORGE_STRAIN',
      nodeId: 'N_WAYRETH',
      submapId: 'map_sub_wayreth_tower',
      name: 'The Soulforge Crucible & Fistandantilus Pact',
      type: 'Threat Clock',
      scopeTier: 'quest',
      maxTicks: 6,
      currentTicks: isV3 ? 0 : 2,
      faction: 'The Orders of High Sorcery (Conclave of Wizards)',
      showOnCanvas: isV3,
      notes: 'Tracks the psychic and physical toll of the Test of High Sorcery at Wayreth. At 4/6 ticks, Fistandantilus offers the Bloodstone bargain to save Raistlin from dragonfire. At 6/6 ticks, the Soul-Mirror illusion of Caramon manifests in the final chamber.',
      triggerRefs: [{ entityType: 'quest', entityId: isV3 ? 'Q_PRE_01' : 'Q_ECHO_01' }],
      consequences: [
        {
          tick: 4,
          description: 'Fistandantilus whispers from the Bloodstone inside the Chamber of the Test, offering arcane survival in exchange for a future life-tithe.',
          triggered: !isV3,
          operations: []
        },
        {
          tick: 6,
          description: 'The Soul-Mirror manifests the illusion of Caramon effortlessly wielding magic.',
          triggered: false,
          operations: []
        }
      ]
    },
    {
      id: 'TRK_HOPES_END_SIEGE',
      nodeId: 'N_HOPES_END',
      submapId: 'map_sub_hopes_end_siege',
      name: 'Siege of Hope\'s End & Immolatus\'s Descent (347 AC)',
      type: 'Threat Clock',
      scopeTier: 'settlement',
      maxTicks: 6,
      currentTicks: isV3 ? 0 : 3,
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      showOnCanvas: isV3,
      notes: 'Tracks Baron Ivor\'s mercenary bombardment and the Red Dragon Immolatus\'s secret seizure of the Silver Dragon Clutch. At 6/6 ticks, Immolatus vitrifies the valley walls into black dragon-glass.',
      triggerRefs: [{ entityType: 'quest', entityId: isV3 ? 'Q_PRE_02' : 'Q_ECHO_02' }],
      consequences: [
        {
          tick: 6,
          description: 'The Red Dragon Immolatus descends in fire, fusing the walls of Hope\'s End into black dragon-glass while the Silver Clutch is spirited toward Sanction.',
          triggered: false,
          operations: [
            { op: 'update_node', id: 'N_HOPES_END', faction: 'fac_red_dragonarmy' }
          ]
        }
      ]
    },
    {
      id: 'TRK_VERMINAARD_ABANASINIA',
      nodeId: 'N_PAX_THARKAS',
      submapId: 'map_ansalon_continent',
      name: 'Verminaard\'s Abanasinian Crusade & Qualinost Assault',
      type: 'Threat Clock',
      scopeTier: 'faction',
      maxTicks: 8,
      currentTicks: isV3 ? 0 : 2,
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      showOnCanvas: true,
      notes: 'Advances when road checkpoints are tripped or the party delays in Darken Wood and Xak Tsaroth. At 4/8 ticks, Solace is burned and the townsfolk are marched in iron cages toward Pax Tharkas. At 8/8 ticks, Verminaard\'s Red Wing launches a full aerial blitz against the Qualinesti Exodus before the elven fleet can sail.',
      triggerRefs: [
        { entityType: 'quest', entityId: 'Q_AUT_01' },
        { entityType: 'quest', entityId: 'Q_AUT_02' },
        { entityType: 'quest', entityId: 'Q_AUT_03' }
      ],
      consequences: [
        {
          tick: 4,
          description: 'Solace is occupied by Verminaard\'s Red Wing; the townsfolk are marched in iron cages toward Pax Tharkas.',
          triggered: false,
          operations: [
            { op: 'update_node', id: 'N_SOLACE', faction: 'fac_red_dragonarmy' }
          ]
        },
        {
          tick: 8,
          description: 'Verminaard launches the full Red Wing aerial blitz against the Qualinesti Exodus.',
          triggered: false,
          operations: [
            { op: 'update_node', id: 'N_QUALINOST', faction: 'fac_red_dragonarmy' }
          ]
        }
      ]
    },
    {
      id: 'TRK_TOWER_SIEGE_BREACH',
      nodeId: 'N_HIGH_CLERIST_TOWER',
      submapId: 'map_sub_high_clerist_tower',
      name: 'Blue Wing Siege of the High Clerist\'s Tower',
      type: 'Threat Clock',
      scopeTier: 'settlement',
      maxTicks: 8,
      currentTicks: 0,
      faction: 'The Blue Dragonarmy (Wing of the Blue Lady)',
      showOnCanvas: true,
      notes: 'Tracks Kitiara and Bakaris\'s assault on the West Gate Pass of Palanthas. At 4/8 ticks, Derek Crownguard\'s sally is routed outside the West Gate. At 6/8 ticks, Kitiara and Skie dive toward Sturm Brightblade on the sunlit parapet. At 8/8 ticks, if the Dragon Orb in the lower vault is not mastered, the High Clerist\'s Tower falls.',
      triggerRefs: [{ entityType: 'quest', entityId: 'Q_WIN_04' }],
      consequences: [
        {
          tick: 6,
          description: 'Highlord Kitiara and the blue dragon Skie dive upon Sturm Brightblade on the western parapet while Laurana contests the Dragon Orb below.',
          triggered: false,
          operations: []
        }
      ]
    },
    {
      id: 'TRK_METALLIC_DRAGON_AWAKENING',
      nodeId: 'N_SANCTION',
      submapId: 'map_ansalon_continent',
      name: 'Awakening of the Metallic Dragon Flights',
      type: 'Threat Clock',
      scopeTier: 'world',
      maxTicks: 6,
      currentTicks: 0,
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      showOnCanvas: true,
      notes: 'Tracks the gathering of forensic proof—from the Scorched Silver Dragon Eggshell Shard at Hope\'s End to the infiltration of the volcanic Temple of Luerkhisis in Sanction—proving that Takhisis broke her hostage oath by mutating Good Dragon eggs into Draconians. At 6/6 ticks, the Gold, Silver, Bronze, Brass, and Copper Dragons enter the war.',
      triggerRefs: [{ entityType: 'quest', entityId: 'Q_SPR_02' }],
      consequences: [
        {
          tick: 6,
          description: 'The Metallic Dragons shatter their coerced neutrality oath and descend upon the skies of Ansalon carrying Solamnic Dragonlance Riders.',
          triggered: false,
          operations: [
            { op: 'update_node', id: 'N_KALAMAN', faction: 'fac_solamnia' }
          ]
        }
      ]
    },
    {
      id: 'TRK_TAKHISIS_MANIFESTATION',
      nodeId: 'N_NERAKA',
      submapId: 'map_sub_neraka_temple',
      name: 'Night of the Eye: Takhisis\'s Planar Manifestation',
      type: 'Threat Clock',
      scopeTier: 'world',
      maxTicks: 10,
      currentTicks: 2,
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      showOnCanvas: true,
      notes: 'Master apocalyptic countdown in the Temple of Darkness at Neraka. Advances as the three moons align on the Night of the Eye. Stopped permanently only when Berem the Everman seals the Foundation Stone or Raistlin turns against the Dark Queen.',
      triggerRefs: [{ entityType: 'quest', entityId: 'Q_SPR_03' }],
      consequences: [
        {
          tick: 10,
          description: 'The Foundation Stone ruptures—Takhisis manifests in the mortal sky unless Berem\'s Green Gemstone seals the threshold.',
          triggered: false,
          operations: []
        }
      ]
    }
  );

  return trackers;
}

function buildQuests(editionMode) {
  const isV1 = editionMode === 'V1_HEROES_351';
  const isV2 = editionMode === 'V2_SHADOWS_351';
  const isV3 = editionMode === 'V3_346_AC';

  const triVectorNote = (allyText, rivalText, dragonarmyText) =>
    isV1
      ? ''
      : `\n\n**Allegiance Approaches (Non-Canonical Cohort):**\n` +
        `- *Shadow Ally:* ${allyText}\n` +
        `- *Freebooter / Conclave:* ${rivalText}\n` +
        `- *Dragonarmy Vanguard:* ${dragonarmyText}`;

  const preQuestsV3 = [
    {
      id: 'Q_PRE_01',
      nodeId: 'N_WAYRETH',
      submapId: 'map_sub_wayreth_tower',
      title: 'Book 1 (346 AC): The Soulforge of Wayreth & Belzor\'s Cult',
      name: 'Book 1 (346 AC): The Soulforge of Wayreth & Belzor\'s Cult',
      type: 'Arcane Crucible',
      threat: 'Severe',
      status: 'Active',
      notes:
        '**Objective:** Expose Widow Judith\'s mechanical Belzor idol in Haven alongside young Raistlin and Caramon, travel with Antimodes\'s letter through the shifting forest of Wayreth, and survive the fateful night of the Test of High Sorcery.\n' +
        '- **World Context:** Before the return of the true gods, charlatan cults rule Haven with flash-powder miracles while the Conclave of Wizards enforces the lethal Test at Wayreth—where the ancient spirit of Fistandantilus awaits a desperate apprentice.' +
        triVectorNote(
          'Guard Caramon and intercept Liam\'s hired saboteurs outside the testing chambers.',
          'Bargain with Par-Salian and Antimodes for Conclave recognition and a share of Fistandantilus\'s lore.',
          'Aid Liam\'s ambush or recruit renegade mages for the northern warlords.'
        ),
      giverNpcId: 'npc_par_salian',
      targetNpcId: 'npc_fistandantilus',
      npcIds: ['npc_raistlin', 'npc_caramon', 'npc_par_salian', 'npc_antimodes', 'npc_widow_judith', 'npc_liam', 'npc_fistandantilus'],
      itemIds: ['ITM-STAFF-MAGIUS', 'ITM-BLOODSTONE'],
      trackerIds: ['TRK_SOULFORGE_STRAIN'],
      steps: [
        { id: 's1', title: 'Expose Belzor\'s Flash-Powder Fraud in Haven', text: 'Investigate Widow Judith\'s temple in Haven and uncover the hidden mechanical bellows before the fanatic mob turns.', completed: false, triggerTrackerId: 'TRK_SOULFORGE_STRAIN', tickDelta: 2 },
        { id: 's2', title: 'Enter the Shifting Forest of Wayreth', text: 'Navigate the sentient forest to the obsidian Tower of High Sorcery as Raistlin faces Liam\'s ambush and Fistandantilus\'s blood-pact.', completed: false, triggerTrackerId: 'TRK_SOULFORGE_STRAIN', tickDelta: 2 },
        { id: 's3', title: 'The Soul-Mirror Finale', text: 'Witness or intervene in the aftermath of the illusory fratricide and claim the Staff of Magius and Bloodstone Pendant.', completed: false, triggerTrackerId: 'TRK_SOULFORGE_STRAIN', tickDelta: 2 }
      ]
    },
    {
      id: 'Q_PRE_02',
      nodeId: 'N_HOPES_END',
      submapId: 'map_sub_hopes_end_siege',
      title: 'Book 2 (347 AC): Brothers in Arms — Siege of Hope\'s End',
      name: 'Book 2 (347 AC): Brothers in Arms — Siege of Hope\'s End',
      type: 'Military Siege & Heist',
      threat: 'Severe',
      status: 'Active',
      notes:
        '**Objective:** Muster at Langtree under Captain Horkin and Mad Baron Ivor, march into the Siege of Hope\'s End alongside young Raistlin and Caramon, and uncover the secret subterranean vault holding the stolen Silver Dragon Clutch.\n' +
        '- **World Context:** While Baron Ivor\'s mercenaries batter the rebel valley of Hope\'s End for coin, Kitiara, Bakaris, and the ancient Red Dragon Immolatus use the siege as cover to seize D\'Argent\'s silver dragon eggs—the very eggs later corrupted into the first Draconians in Sanction.' +
        triVectorNote(
          'Join Horkin, Raistlin, and Caramon in mutinying against Baron Ivor to save the civilians of Hope\'s End.',
          'Secure the Scorched Silver Dragon Eggshell Shard from the cellar vault as priceless leverage.',
          'Side with Kitiara, Bakaris, and Immolatus to deliver the Silver Dragon clutch to Sanction\'s vats.'
        ),
      giverNpcId: 'npc_horkin',
      targetNpcId: 'npc_immolatus',
      npcIds: ['npc_raistlin', 'npc_caramon', 'npc_kitiara', 'npc_horkin', 'npc_baron_ivor', 'npc_bakaris', 'npc_immolatus'],
      itemIds: ['ITM-SILVER-SHARD'],
      trackerIds: ['TRK_HOPES_END_SIEGE'],
      steps: [
        { id: 's1', title: 'Drill at Langtree & March on Hope\'s End', text: 'Complete Captain Horkin\'s combined-arms trials at Langtree and breach the outer siege lines of Hope\'s End.', completed: false, triggerTrackerId: 'TRK_HOPES_END_SIEGE', tickDelta: 2 },
        { id: 's2', title: 'The Mercenary Mutiny vs. Baron Ivor', text: 'Decide whether to switch sides with Horkin and the twins to defend the townsfolk or enforce Baron Ivor\'s assault.', completed: false, triggerTrackerId: 'TRK_HOPES_END_SIEGE', tickDelta: 2 },
        { id: 's3', title: 'Immolatus\'s Fire & The Silver Clutch Vault', text: 'Survive Immolatus\'s dragonfire, confront Kitiara and Bakaris in the cellar vault, and recover the Scorched Silver Dragon Eggshell Shard.', completed: false, triggerTrackerId: 'TRK_HOPES_END_SIEGE', tickDelta: 2 }
      ]
    },
    {
      id: 'Q_PRE_03',
      nodeId: 'N_SANCTION',
      submapId: 'map_ansalon_continent',
      title: 'Interlude (348–350 AC): The Four-Year Shadow Bridge',
      name: 'Interlude (348–350 AC): The Four-Year Shadow Bridge',
      type: 'Era Transition Bridge',
      threat: 'Moderate',
      status: 'Active',
      notes:
        '**Objective:** Bridge the four-year gap between the fall of Hope\'s End (347 AC) and the Companions\' reunion at the Inn of the Last Home (Autumn 351 AC).\n' +
        '- **Choose Your Four-Year Enterprise:**\n' +
        '  1. *Whitestone Frontier Scouts:* Fortify the border roads around Solace and Qualinost.\n' +
        '  2. *Conclave & Smuggler Brokers:* Establish intelligence caches and steel supply lines in Haven and Tarsis.\n' +
        '  3. *Dragonarmy Officer Cadre:* Rise through the ranks under Kitiara\'s Blue Wing or Verminaard\'s Red Wing as the first Draconians hatch in Sanction.',
      giverNpcId: 'npc_antimodes',
      targetNpcId: 'npc_kitiara',
      npcIds: ['npc_raistlin', 'npc_caramon', 'npc_kitiara', 'npc_tanis', 'npc_antimodes'],
      itemIds: ['ITM-SILVER-SHARD'],
      trackerIds: ['TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'Commit Your Four-Year Enterprise (348–350 AC)', text: 'Establish your faction network in Sanction, Haven, or Solace and advance to Autumn 351 AC as the Companions reunite at the Inn of the Last Home.', completed: false, triggerTrackerId: 'TRK_COMPANIONS_ODYSSEY', tickDelta: 1 }
      ]
    }
  ];

  const echoQuestsV1V2 = [
    {
      id: 'Q_ECHO_01',
      nodeId: 'N_WAYRETH',
      submapId: 'map_sub_wayreth_tower',
      title: 'Memory Crucible I (346 AC Echo): The Soulforge of Wayreth',
      name: 'Memory Crucible I (346 AC Echo): The Soulforge of Wayreth',
      type: 'Temporal Memory Crucible',
      threat: 'Severe',
      status: 'Active',
      notes:
        '**Temporal Flashback (346 AC):** Touching the Bloodstone Pendant or resting inside the shifting grove of Wayreth projects the party backward in time into the Chamber of the Test on the night young Raistlin faced Liam\'s ambush, Fistandantilus\'s blood-pact, and the illusory murder of Caramon.\n' +
        '- **351 AC Campaign Payoff:** Mastering the memory echo unlocks Fistandantilus\'s True Command Word, granting decisive psychic armor against Cyan Bloodbane\'s nightmare in Silvanesti.',
      giverNpcId: 'npc_par_salian',
      targetNpcId: 'npc_fistandantilus',
      npcIds: ['npc_raistlin', 'npc_caramon', 'npc_par_salian', 'npc_liam', 'npc_fistandantilus'],
      itemIds: ['ITM-STAFF-MAGIUS', 'ITM-BLOODSTONE'],
      trackerIds: ['TRK_SOULFORGE_STRAIN'],
      steps: [
        { id: 's1', title: 'Attune to the Bloodstone & Wayreth Mirror (Project to 346 AC)', text: 'Enter the temporal memory projection of the Spiral of the Three Axioms in 346 AC Wayreth.', completed: false, triggerTrackerId: 'TRK_SOULFORGE_STRAIN', tickDelta: 1 },
        { id: 's2', title: 'Navigate Fistandantilus\'s Bargain & The Soul-Mirror', text: 'Survive the crucible of the Test and claim Fistandantilus\'s True Command Word back in 351 AC.', completed: false, triggerTrackerId: 'TRK_SOULFORGE_STRAIN', tickDelta: 1 }
      ]
    },
    {
      id: 'Q_ECHO_02',
      nodeId: 'N_HOPES_END',
      submapId: 'map_sub_hopes_end_siege',
      title: 'Memory Crucible II (347 AC Echo): Ashes of the Silver Clutch',
      name: 'Memory Crucible II (347 AC Echo): Ashes of the Silver Clutch',
      type: 'Temporal Memory Crucible',
      threat: 'Severe',
      status: 'Active',
      notes:
        '**Temporal Flashback (347 AC):** Investigating the vitrified black dragon-glass battlements of Hope\'s End or recovering the Scorched Silver Dragon Eggshell Shard projects the party into the final 48 hours of Mad Baron Ivor\'s Siege of Hope\'s End.\n' +
        '- **351 AC Campaign Payoff:** Witnessing Immolatus\'s seizure of D\'Argent\'s silver clutch and Kitiara\'s bargain with Bakaris unlocks the Sanction Vault Seal, advancing the Awakening of the Metallic Dragon Flights by +2 ticks.',
      giverNpcId: 'npc_horkin',
      targetNpcId: 'npc_immolatus',
      npcIds: ['npc_raistlin', 'npc_caramon', 'npc_kitiara', 'npc_horkin', 'npc_bakaris', 'npc_immolatus'],
      itemIds: ['ITM-SILVER-SHARD'],
      trackerIds: ['TRK_HOPES_END_SIEGE', 'TRK_METALLIC_DRAGON_AWAKENING'],
      steps: [
        { id: 's1', title: 'Touch the Vitrified Dragon-Glass of Hope\'s End (Project to 347 AC)', text: 'Project into the 347 AC mercenary mutiny alongside Captain Horkin, young Caramon, and Raistlin.', completed: false, triggerTrackerId: 'TRK_HOPES_END_SIEGE', tickDelta: 1 },
        { id: 's2', title: 'Uncover the Subterranean Silver Clutch Vault', text: 'Secure the Sanction Vault Seal before Immolatus incinerates the keep, advancing the Metallic Dragon Awakening in 351 AC.', completed: false, triggerTrackerId: 'TRK_METALLIC_DRAGON_AWAKENING', tickDelta: 2 }
      ]
    }
  ];

  const mainWarQuests = [
    {
      id: 'Q_AUT_01',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      title: 'Autumn Twilight I: Flight from Solace & The Blue Crystal Staff',
      name: 'Autumn Twilight I: Flight from Solace & The Blue Crystal Staff',
      type: 'Main Objective',
      threat: 'Moderate',
      status: 'Active',
      notes:
        '**Objective:** Escape Solace after High Theocrat Hederick\'s burned hand is miraculously healed at the Inn of the Last Home, cross Crystalmir Lake, and earn the Forestmaster\'s blessing in Darken Wood.\n' +
        '- **Key Stakes:** Goldmoon\'s Blue Crystal Staff reveals the first true divine magic on Krynn since the Cataclysm, drawing Fewmaster Toede\'s goblins and stone-turning Baaz draconian search-squads down upon Solace.' +
        triVectorNote(
          'Hold the vallenwood rope-bridges and Crystalmir dock against Fewmaster Toede\'s goblins so Goldmoon and the Companions escape.',
          'Smuggle rare spell-scrolls and steel out of Solace before the Seeker lockdown.',
          'Lead the Baaz draconian search-squad into the Inn of the Last Home to corner the Blue Crystal Staff bearer.'
        ),
      giverNpcId: 'npc_goldmoon',
      targetNpcId: 'npc_toede',
      npcIds: ['npc_tanis', 'npc_goldmoon', 'npc_riverwind', 'npc_raistlin', 'npc_caramon', 'npc_sturm', 'npc_tasslehoff', 'npc_flint', 'npc_hederick', 'npc_toede', 'npc_forestmaster'],
      itemIds: ['ITM-BLUE-STAFF'],
      trackerIds: isV1 ? ['TRK_VERMINAARD_ABANASINIA'] : ['TRK_VERMINAARD_ABANASINIA', 'TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'The Incident at the Inn of the Last Home', text: 'Survive the confrontation with High Theocrat Hederick and Fewmaster Toede\'s guards on the elevated vallenwood walkways.', completed: false, triggerTrackerId: 'TRK_VERMINAARD_ABANASINIA', tickDelta: 1 },
        { id: 's2', title: 'Cross Crystalmir Lake & Enter Darken Wood', text: 'Repel the Baaz draconian ambush on the northern shore and answer the Spectral Centaurs of the Forestmaster.', completed: false, triggerTrackerId: isV1 ? 'TRK_VERMINAARD_ABANASINIA' : 'TRK_COMPANIONS_ODYSSEY', tickDelta: 1 }
      ]
    },
    {
      id: 'Q_AUT_02',
      nodeId: 'N_XAK_TSAROTH',
      submapId: 'map_sub_xak_tsaroth',
      title: 'Autumn Twilight II: The Drowned Spire of Xak Tsaroth',
      name: 'Autumn Twilight II: The Drowned Spire of Xak Tsaroth',
      type: 'Dungeon Delve & Boss Lair',
      threat: 'Severe',
      status: 'Active',
      notes:
        '**Objective:** Descend the Great Chain iron cauldron lift into the sunken ruins of Xak Tsaroth, win the aid of Bupu and the Aghar gully dwarves, confront the Black Dragon Khisanth, and haul the Platinum Disks of Mishakal out of the collapsing chasm.\n' +
        '- **Treasures of the Abyss:** Beyond the Disks of Mishakal in the lower treasury, the flooded library holds the Sunken Spellbook of Fistandantilus and the Glasses of True Seeing.' +
        triVectorNote(
          'Hold the Great Chain winch against Kapak reinforcements while Goldmoon confronts Khisanth.',
          'Race Raistlin to the Sunken Library to claim Fistandantilus\'s Grimoire or the Glasses of True Seeing.',
          'Sabotage the Great Lift chains or ambush the exhausted Companions as they emerge from the chasm.'
        ),
      giverNpcId: 'npc_forestmaster',
      targetNpcId: 'npc_khisanth',
      npcIds: ['npc_goldmoon', 'npc_raistlin', 'npc_bupu', 'npc_khisanth', 'npc_tanis', 'npc_caramon'],
      itemIds: ['ITM-BLUE-STAFF', 'ITM-DISKS-MISHAKAL', 'ITM-FISTANDANTILUS-GRIMOIRE', 'ITM-GLASSES-TRUE-SEEING'],
      trackerIds: isV1 ? ['TRK_VERMINAARD_ABANASINIA'] : ['TRK_VERMINAARD_ABANASINIA', 'TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'Breach the Wicker Dragon Swamp & Temple of Mishakal', text: 'Clear the Baaz wicker-dragon ambush on the marsh boardwalks and receive Mishakal\'s blessing at the surface statue.', completed: false, triggerTrackerId: 'TRK_VERMINAARD_ABANASINIA', tickDelta: 1 },
        { id: 's2', title: 'Bupu\'s Lift & The Sunken Library', text: 'Navigate Highbulp Phudge\'s court with Bupu and recover Fistandantilus\'s sunken grimoire.', completed: false, triggerTrackerId: 'TRK_VERMINAARD_ABANASINIA', tickDelta: 1 },
        { id: 's3', title: 'Confront Khisanth for the Disks of Mishakal', text: 'Defeat Khisanth with the Blue Crystal Staff and extract the 85-lb Platinum Disks before the cavern collapses.', completed: false, triggerTrackerId: isV1 ? 'TRK_VERMINAARD_ABANASINIA' : 'TRK_COMPANIONS_ODYSSEY', tickDelta: 2 }
      ]
    },
    {
      id: 'Q_AUT_03',
      nodeId: 'N_PAX_THARKAS',
      submapId: 'map_sub_pax_tharkas',
      title: 'Autumn Twilight III: The Sla-Mori & Liberation of Pax Tharkas',
      name: 'Autumn Twilight III: The Sla-Mori & Liberation of Pax Tharkas',
      type: 'Fortress Infiltration & Siege',
      threat: 'Extreme',
      status: 'Active',
      notes:
        '**Objective:** Infiltrate Pax Tharkas through the secret elven Sla-Mori crypts and the sixty-foot bronze Great Chain, free the 250 hostage children from the senile red dragon Flamestrike\'s nursery, ordain Elistan with the Disks of Mishakal, and bring down Highlord Verminaard.\n' +
        '- **Key Turning Points:** Claiming Kith-Kanan\'s ancient greatsword Wyrmslayer in the Sla-Mori crypts and freeing the mute prisoner Berem the Everman from the lower slave pens.' +
        triVectorNote(
          'Hold the Sla-Mori tunnel rear-guard and sabotage the Great Gate winch while Tanis and Laurana free the nursery.',
          'Spring Berem the Everman from the subterranean cells to learn the secret of his Green Gemstone first.',
          'Reinforce Highlord Verminaard and Pyros in the audience sanctum or redirect the Red Wing against the Qualinesti fleet.'
        ),
      giverNpcId: 'npc_gilthanas',
      targetNpcId: 'npc_verminaard',
      npcIds: ['npc_tanis', 'npc_laurana', 'npc_gilthanas', 'npc_elistan', 'npc_fizban', 'npc_sestun', 'npc_berem', 'npc_verminaard', 'npc_flamestrike', 'npc_pyros'],
      itemIds: ['ITM-WYRMSLAYER', 'ITM-DISKS-MISHAKAL', 'ITM-NIGHTBRINGER', 'ITM-GREEN-GEMSTONE-BEREM'],
      trackerIds: isV1 ? ['TRK_VERMINAARD_ABANASINIA'] : ['TRK_VERMINAARD_ABANASINIA', 'TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'Traverse the Sla-Mori & Claim Wyrmslayer', text: 'Unlock the secret elven crypts, claim Wyrmslayer from Kith-Kanan\'s tomb, and ascend the molten bronze Great Chain.', completed: false, triggerTrackerId: 'TRK_VERMINAARD_ABANASINIA', tickDelta: 1 },
        { id: 's2', title: 'Liberate the Nursery & Ordain Elistan', text: 'Soothe Flamestrike in the upper nursery and deliver the Disks of Mishakal to Elistan in the iron mine slave pens.', completed: false, triggerTrackerId: 'TRK_VERMINAARD_ABANASINIA', tickDelta: 1 },
        { id: 's3', title: 'Fall of Highlord Verminaard', text: 'Slay Verminaard in the audience hall as Flamestrike attacks Pyros, leading 800 freed refugees into the Kharolis mountains.', completed: false, triggerTrackerId: isV1 ? 'TRK_VERMINAARD_ABANASINIA' : 'TRK_COMPANIONS_ODYSSEY', tickDelta: 1 }
      ]
    },
    {
      id: 'Q_WIN_01',
      nodeId: 'N_THORBARDIN',
      submapId: 'map_sub_derkin_skullcap',
      title: 'Winter Night I: Skullcap, Eben\'s Treason & The Hammer of Kharas',
      name: 'Winter Night I: Skullcap, Eben\'s Treason & The Hammer of Kharas',
      type: 'Expedition & Diplomacy',
      threat: 'Severe',
      status: 'Active',
      notes:
        '**Objective:** Brave the vitrified green-glass ruins of Skullcap, recover the ancient Helm of Grallen from Derkin\'s Tomb, foil Eben Shatterstone\'s betrayal, and win winter sanctuary and the Hammer of Kharas inside subterranean Thorbardin.' +
        triVectorNote(
          'Track and intercept Eben Shatterstone\'s Red Wing signal-team in the Kharolis snow passes.',
          'Negotiate directly with the Hylar and Theiwar thanes around the Life Tree for dwarven steel and passage.',
          'Coordinate with Eben Shatterstone to spring the Red Dragonarmy pincer on the refugee camp.'
        ),
      giverNpcId: 'npc_elistan',
      targetNpcId: 'npc_eben',
      npcIds: ['npc_flint', 'npc_tanis', 'npc_sestun', 'npc_eben', 'npc_elistan'],
      itemIds: ['ITM-HELM-GRALLEN', 'ITM-HAMMER-KHARAS'],
      trackerIds: isV1 ? [] : ['TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'Delve Skullcap & Foil Eben\'s Betrayal', text: 'Recover the Helm of Grallen from the sunken tomb chamber and confront Eben Shatterstone at the shadow-guardian causeway.', completed: false, triggerTrackerId: null, tickDelta: 1 },
        { id: 's2', title: 'Restore the Hammer of Kharas in Thorbardin', text: 'Present the Helm of Grallen to the Council of Thanes and secure the Hammer of Kharas and refugee sanctuary.', completed: false, triggerTrackerId: isV1 ? null : 'TRK_COMPANIONS_ODYSSEY', tickDelta: 1 }
      ]
    },
    {
      id: 'Q_WIN_02',
      nodeId: 'N_TARSIS',
      submapId: 'map_sub_tarsis_square',
      title: 'Winter Night II: The Burning of Landlocked Tarsis',
      name: 'Winter Night II: The Burning of Landlocked Tarsis',
      type: 'Urban Ambush & Crossroads',
      threat: 'Severe',
      status: 'Active',
      notes:
        '**Objective:** Discover the landlocked hulls of Tarsis on the Plains of Dust, uncover the ancient Dragon Orb clue in the basement library, and survive Kitiara and Bakaris\'s Blue Wing blitz on the Red Dragon Inn.\n' +
        '- **Pivotal Crossroads:** During the burning of Tarsis, decide whether the Fellowship splits into two theaters (Silvanesti and Icewall) as in the novels, or rallies around Alhana Starbreeze\'s griffons to hold together as a unified company.' +
        triVectorNote(
          'Hold the Red Dragon Inn courtyard and secure Alhana\'s griffons so the entire Fellowship escapes intact.',
          'Extract the ancient navigation charts to Icewall and Ergoth from the burning magistrate\'s hall.',
          'Lead the Blue Wing street sweep alongside Lord Bakaris to split or capture the Heroes at the Red Dragon Inn.'
        ),
      giverNpcId: 'npc_alhana',
      targetNpcId: 'npc_bakaris',
      npcIds: ['npc_tanis', 'npc_laurana', 'npc_sturm', 'npc_raistlin', 'npc_tasslehoff', 'npc_alhana', 'npc_kitiara', 'npc_bakaris', 'npc_derek'],
      itemIds: ['ITM-STARJEWEL'],
      trackerIds: isV1 ? [] : ['TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'Uncover the Cracked Dragon Orb Clue in Tarsis', text: 'Investigate the dry-rotted harbor and the basement library before the city watch locks the gates.', completed: false, triggerTrackerId: null, tickDelta: 1 },
        { id: 's2', title: 'The Red Dragon Inn Blitz (Split vs. Unified Stand)', text: 'Survive the Blue and Red Dragon strafing run and choose whether the Fellowship splits into two tracks or stands unified.', completed: false, triggerTrackerId: isV1 ? null : 'TRK_COMPANIONS_ODYSSEY', tickDelta: 1 }
      ]
    },
    {
      id: 'Q_WIN_03A',
      nodeId: 'N_SILVANESTI',
      submapId: 'map_sub_silvanesti_dream',
      title: 'Winter Night III-A: Lorac\'s Nightmare in Silvanesti',
      name: 'Winter Night III-A: Lorac\'s Nightmare in Silvanesti',
      type: 'Psychic Dreamscape Delve',
      threat: 'Extreme',
      status: 'Active',
      notes:
        '**Objective:** Traverse the bleeding hallucination-forest of Silvanesti, overcome your party\'s phantom death-visions, banish the green dragon Cyan Bloodbane from the Tower of the Stars, and claim the Silvanesti Dragon Orb.\n' +
        '- **Memory Synergy:** If the party completed the Soulforge of Wayreth (or its 346 AC Memory Crucible), Fistandantilus\'s True Command Word shields the company from the nightmare\'s psychic drain.',
      giverNpcId: 'npc_alhana',
      targetNpcId: 'npc_cyan_bloodbane',
      npcIds: ['npc_tanis', 'npc_raistlin', 'npc_caramon', 'npc_alhana', 'npc_lorac', 'npc_cyan_bloodbane', 'npc_fistandantilus'],
      itemIds: ['ITM-DRAGON-ORB-SILVANESTI', 'ITM-STARJEWEL'],
      trackerIds: [],
      steps: [
        { id: 's1', title: 'Walk the Bleeding Grove of Hallucinations', text: 'Pierce the personal nightmare illusions conjured by the Silvanesti Dragon Orb.', completed: false, triggerTrackerId: null, tickDelta: 1 },
        { id: 's2', title: 'Banish Cyan Bloodbane & Claim the Silvanesti Orb', text: 'Confront Cyan Bloodbane at Speaker Lorac\'s crystal throne and master the Silvanesti Dragon Orb.', completed: false, triggerTrackerId: null, tickDelta: 1 }
      ]
    },
    {
      id: 'Q_WIN_03B',
      nodeId: 'N_ICEWALL',
      submapId: 'map_sub_icewall_castle',
      title: 'Winter Night III-B: Icewall, Foghaven & Forging the Dragonlances',
      name: 'Winter Night III-B: Icewall, Foghaven & Forging the Dragonlances',
      type: 'Glacial Assault & Artifact Forging',
      threat: 'Severe',
      status: 'Active',
      notes:
        '**Objective:** Storm Icewall Castle to slay Highlord Feal-Thas and recover the Icewall Dragon Orb, journey with Silvara and Theros Ironfeld to the Tomb of Huma on Southern Ergoth to forge the True Dragonlances, and present them before the Whitestone Council on Sancrist Isle.',
      giverNpcId: 'npc_silvara',
      targetNpcId: 'npc_feal_thas',
      npcIds: ['npc_laurana', 'npc_sturm', 'npc_flint', 'npc_tasslehoff', 'npc_gilthanas', 'npc_silvara', 'npc_theros', 'npc_feal_thas', 'npc_sleet', 'npc_gunthar', 'npc_derek', 'npc_fizban'],
      itemIds: ['ITM-DRAGON-ORB-ICEWALL', 'ITM-SILVER-ARM', 'ITM-HAMMER-KHARAS', 'ITM-DRAGONLANCE-FOOT', 'ITM-DRAGONLANCE-MOUNTED'],
      trackerIds: isV1 ? [] : ['TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'Storm Icewall Castle & Claim the Dragon Orb', text: 'Defeat Highlord Feal-Thas and the white wyrm Sleet in the throne hall and secure the intact Icewall Dragon Orb.', completed: false, triggerTrackerId: null, tickDelta: 1 },
        { id: 's2', title: 'Forge the True Dragonlances in Foghaven Valley', text: 'Escort Silvara and Theros Ironfeld to the Tomb of Huma on Southern Ergoth to unite the Silver Arm and Hammer of Kharas.', completed: false, triggerTrackerId: null, tickDelta: 1 },
        { id: 's3', title: 'Unite the Whitestone Council on Sancrist', text: 'Present the forged Dragonlances before Lord Gunthar\'s council and dispatch reinforcements to the High Clerist\'s Tower.', completed: false, triggerTrackerId: isV1 ? null : 'TRK_COMPANIONS_ODYSSEY', tickDelta: 2 }
      ]
    },
    {
      id: 'Q_WIN_04',
      nodeId: 'N_HIGH_CLERIST_TOWER',
      submapId: 'map_sub_high_clerist_tower',
      title: 'Winter Night IV: Siege of the High Clerist\'s Tower',
      name: 'Winter Night IV: Siege of the High Clerist\'s Tower',
      type: 'Fortress Defense & Climax Crucible',
      threat: 'Extreme',
      status: 'Active',
      notes:
        '**Objective:** Uncover the architectural secret of the High Clerist\'s Tower as a giant Dragon-Trap, arm the narrow stone kill-corridors with Dragonlances, and master the Dragon Orb in the lower vault as Kitiara\'s Blue Wing storms the pass.\n' +
        '- **The Sunlit Parapet Crucible:** Follow the poignant novel canon where Sturm Brightblade\'s sacrifice shatters Solamnic factionalism and crowns Laurana as the Golden General—or trigger the divergent branch by reinforcing the West Gate and parrying Kitiara\'s dive with Brightblade so Sturm survives as Lord of the Rose.' +
        triVectorNote(
          'Brace the Dragonlance kill-corridors or stand shoulder-to-shoulder with Sturm on the western parapet so he survives Kitiara\'s dive.',
          'Guard Tasslehoff and Laurana in the Lower Orb Vault against draconian sappers.',
          'Fly with Highlord Kitiara and Bakaris to shatter the Dragon Orb and break the Palanthas pass.'
        ),
      giverNpcId: 'npc_sturm',
      targetNpcId: 'npc_kitiara',
      npcIds: ['npc_sturm', 'npc_laurana', 'npc_flint', 'npc_tasslehoff', 'npc_derek', 'npc_kitiara', 'npc_bakaris', 'npc_skie'],
      itemIds: ['ITM-BRIGHTBLADE', 'ITM-DRAGON-ORB-ICEWALL', 'ITM-DRAGONLANCE-FOOT'],
      trackerIds: isV1 ? ['TRK_TOWER_SIEGE_BREACH'] : ['TRK_TOWER_SIEGE_BREACH', 'TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'Survive Derek\'s Folly & Arm the Kill-Corridors', text: 'Decipher the tower\'s dragon-trap geometry with Tasslehoff and arm the narrow stone funnels with Dragonlances.', completed: false, triggerTrackerId: 'TRK_TOWER_SIEGE_BREACH', tickDelta: 4 },
        { id: 's2', title: 'The Sunlit Parapet & The Dragon Orb', text: 'Hold the western parapet with Sturm against Kitiara and Skie while Laurana activates the Dragon Orb to lure the Blue Dragons into the lance traps.', completed: false, triggerTrackerId: isV1 ? 'TRK_TOWER_SIEGE_BREACH' : 'TRK_COMPANIONS_ODYSSEY', tickDelta: 1 }
      ]
    },
    {
      id: 'Q_SPR_01',
      nodeId: 'N_BLOOD_SEA',
      submapId: 'map_ansalon_continent',
      title: 'Spring Dawning I: The Blood Sea Maelstrom & Library of Palanthas',
      name: 'Spring Dawning I: The Blood Sea Maelstrom & Library of Palanthas',
      type: 'Naval Hazard & Arcane Turn',
      threat: 'Severe',
      status: 'Active',
      notes:
        '**Objective:** Sail from Flotsam aboard the Perechon, survive Kitiara\'s aerial boarding strike over the crimson whirlpool of the Blood Sea of Istar, uncover the ancient origin of Berem\'s Green Gemstone in the sunken ruins, and witness Raistlin don the Black Robes and claim the Tower of Palanthas before the chronicler Astinus.',
      giverNpcId: 'npc_tanis',
      targetNpcId: 'npc_astinus',
      npcIds: ['npc_tanis', 'npc_caramon', 'npc_raistlin', 'npc_berem', 'npc_astinus', 'npc_kitiara'],
      itemIds: ['ITM-DRAGON-ORB-SILVANESTI', 'ITM-GREEN-GEMSTONE-BEREM', 'ITM-STAFF-MAGIUS'],
      trackerIds: isV1 ? [] : ['TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'Sail from Flotsam into the Blood Sea Maelstrom', text: 'Evade Kitiara\'s boarding strike aboard the Perechon as Raistlin dons the Black Robes and teleports to Palanthas.', completed: false, triggerTrackerId: null, tickDelta: 1 },
        { id: 's2', title: 'Learn Berem\'s Secret in Sunken Istar & Palanthas', text: 'Uncover how Berem\'s Green Gemstone was pried from the Foundation Stone and witness Astinus greet Raistlin in Palanthas.', completed: false, triggerTrackerId: isV1 ? null : 'TRK_COMPANIONS_ODYSSEY', tickDelta: 1 }
      ]
    },
    {
      id: 'Q_SPR_02',
      nodeId: 'N_SANCTION',
      submapId: 'map_ansalon_continent',
      title: 'Spring Dawning II: Sanction\'s Egg Vats & Awakening of the Good Dragons',
      name: 'Spring Dawning II: Sanction\'s Egg Vats & Awakening of the Good Dragons',
      type: 'Covert Infiltration & Aerial War',
      threat: 'Extreme',
      status: 'Active',
      notes:
        '**Objective:** Infiltrate Sanction\'s volcanic Temple of Luerkhisis with Silvara, Gilthanas, and Fizban to expose the draconian corruption of the Good Dragon eggs, shattering the Metallic Dragons\' coerced neutrality oath while Kitiara and Death Knight Lord Soth abduct Laurana from Kalaman.',
      giverNpcId: 'npc_silvara',
      targetNpcId: 'npc_lord_soth',
      npcIds: ['npc_silvara', 'npc_gilthanas', 'npc_fizban', 'npc_laurana', 'npc_tanis', 'npc_kitiara', 'npc_bakaris', 'npc_lord_soth'],
      itemIds: ['ITM-SILVER-SHARD', 'ITM-DRAGONLANCE-MOUNTED'],
      trackerIds: isV1 ? ['TRK_METALLIC_DRAGON_AWAKENING'] : ['TRK_METALLIC_DRAGON_AWAKENING', 'TRK_COMPANIONS_ODYSSEY'],
      steps: [
        { id: 's1', title: 'Breach the Volcanic Temple of Luerkhisis in Sanction', text: 'Guide Silvara, Gilthanas, and Fizban through the Mount Terk lava ducts to expose the Draconian egg corruption vats.', completed: false, triggerTrackerId: 'TRK_METALLIC_DRAGON_AWAKENING', tickDelta: 4 },
        { id: 's2', title: 'Unleash the Metallic Dragon Flights & March on Neraka', text: 'Shatter the Good Dragons\' neutrality oath and ride north as Kitiara summons Tanis to Neraka for the captive Laurana.', completed: false, triggerTrackerId: isV1 ? 'TRK_METALLIC_DRAGON_AWAKENING' : 'TRK_COMPANIONS_ODYSSEY', tickDelta: 1 }
      ]
    },
    {
      id: 'Q_SPR_03',
      nodeId: 'N_NERAKA',
      submapId: 'map_sub_neraka_temple',
      title: 'Spring Dawning III: The Temple of Darkness at Neraka',
      name: 'Spring Dawning III: The Temple of Darkness at Neraka',
      type: 'Campaign Climax',
      threat: 'Extreme',
      status: 'Active',
      notes:
        '**Objective:** Infiltrate the warped Temple of Darkness at Neraka on the Night of the Eye as all five Dragonarmies assemble before Emperor Ariakas.\n' +
        '- **Five Playable Climax Outcomes:**\n' +
        '  1. *Canonical Triumph:* Raistlin drops Ariakas\'s arcane ward, Tanis slays Ariakas and rejects the Crown of Power, Berem seals the Foundation Stone in the lower vault, Laurana denies Lord Soth, and the Temple of Darkness collapses.\n' +
        '  2. *The Dragon Emperor:* Claim the Crown of Power to rule Ansalon beside Highlord Kitiara.\n' +
        '  3. *The Dragon Empress:* Aid Kitiara and Lord Soth in overthrowing Ariakas to unite all five Dragonarmies under the Blue Wing.\n' +
        '  4. *The Black Godhead:* Aid Black-Robe Raistlin in stepping through the unsealed Foundation Gate to challenge Takhisis in the Abyss.\n' +
        '  5. *Age of Darkness:* Deliver Berem the Everman to High Cleric Dracart\'s altar so Takhisis manifests in the skies of Krynn.',
      giverNpcId: 'npc_tanis',
      targetNpcId: 'npc_takhisis',
      npcIds: ['npc_tanis', 'npc_laurana', 'npc_raistlin', 'npc_caramon', 'npc_berem', 'npc_kitiara', 'npc_ariakas', 'npc_lord_soth', 'npc_dracart', 'npc_gakhan', 'npc_takhisis', 'npc_cyan_bloodbane'],
      itemIds: ['ITM-CROWN-POWER', 'ITM-FOUNDATION-STONE', 'ITM-GREEN-GEMSTONE-BEREM', 'ITM-WYRMSLAYER', 'ITM-STAFF-MAGIUS'],
      trackerIds: ['TRK_TAKHISIS_MANIFESTATION'],
      steps: [
        { id: 's1', title: 'Infiltrate the Council Amphitheater & Slay Emperor Ariakas', text: 'Coordinate with Black-Robe Raistlin or Highlord Kitiara to drop Ariakas\'s force-shield and seize the Crown of Power.', completed: false, triggerTrackerId: 'TRK_TAKHISIS_MANIFESTATION', tickDelta: 3 },
        { id: 's2', title: 'Escort Berem to the Foundation Stone Vault', text: 'Battle Gakhan and High Cleric Dracart in the lower vaults so Berem reunites the Green Gemstone with Jasla\'s spirit—or claim the portal.', completed: false, triggerTrackerId: 'TRK_TAKHISIS_MANIFESTATION', tickDelta: 3 },
        { id: 's3', title: 'Escape the Collapsing Temple of Darkness', text: 'Break Laurana free of Lord Soth\'s claim, resolve the Crown of Power, and witness Raistlin ascend astride Cyan Bloodbane as Master of Past and Present.', completed: false, triggerTrackerId: null, tickDelta: 0 }
      ]
    }
  ];

  if (isV3) {
    return [...preQuestsV3, ...mainWarQuests];
  }
  return [...echoQuestsV1V2, ...mainWarQuests];
}

module.exports = {
  buildTrackers,
  buildQuests
};
