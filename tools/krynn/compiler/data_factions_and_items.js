/**
 * Shared First-Class Factions (10) & Relics / Items (30)
 * Part of the Deep-Module Compiler for The Chronicles of Krynn (Workstation 2.6)
 */
'use strict';

function buildFactions() {
  return [
    {
      id: 'fac_companions',
      name: 'The Heroes of the Lance & Whitestone Vanguard',
      type: 'Fellowship & Liberation Coalition',
      cvfQuadrant: 'Clan',
      colorIdentity: 'WG',
      leaderNpcId: 'npc_tanis',
      headquartersNodeId: 'N_SOLACE',
      controlledNodeIds: ['N_SOLACE', 'N_DARKEN_WOOD'],
      territoryNodeIds: ['N_SOLACE', 'N_DARKEN_WOOD'],
      memberNpcIds: [
        'npc_tanis', 'npc_sturm', 'npc_caramon', 'npc_raistlin', 'npc_goldmoon',
        'npc_riverwind', 'npc_tasslehoff', 'npc_flint', 'npc_laurana', 'npc_tika',
        'npc_gilthanas', 'npc_silvara', 'npc_fizban', 'npc_elistan', 'npc_theros',
        'npc_sestun', 'npc_berem', 'npc_otik', 'npc_forestmaster'
      ],
      diplomaticStances: {
        fac_solamnia: 'Allied',
        fac_qualinesti_silvanesti: 'Allied',
        fac_thorbardin: 'Friendly',
        fac_high_sorcery: 'Neutral',
        fac_seeker_theocracy: 'Rival',
        fac_red_dragonarmy: 'Hostile',
        fac_blue_dragonarmy: 'Hostile',
        fac_white_dragonarmy: 'Hostile',
        fac_green_black_wings: 'Hostile'
      },
      disposition: [4, 2, 2],
      odv: { s: 4, e: 2, c: 2 },
      description: 'The disparate fellowship bound by the Five-Year Oath at the Inn of the Last Home who recover the true gods of Good, liberate the Pax Tharkas slaves, and forge the Whitestone coalition.',
      notes: 'Parley Matrix: Moves on loyalty, personal sacrifice, and protection of the innocent. Taboo: Abandoning friends or trading lives for strategic expediency.'
    },
    {
      id: 'fac_solamnia',
      name: 'The Knights of Solamnia (Crown, Sword & Rose)',
      type: 'Chivalric Military Order',
      cvfQuadrant: 'Hierarchy',
      colorIdentity: 'W',
      leaderNpcId: 'npc_gunthar',
      headquartersNodeId: 'N_SANCRIST',
      controlledNodeIds: ['N_SANCRIST', 'N_PALANTHAS', 'N_HIGH_CLERIST_TOWER'],
      territoryNodeIds: ['N_SANCRIST', 'N_PALANTHAS', 'N_HIGH_CLERIST_TOWER', 'N_KALAMAN'],
      memberNpcIds: ['npc_gunthar', 'npc_sturm', 'npc_derek'],
      diplomaticStances: {
        fac_companions: 'Allied',
        fac_qualinesti_silvanesti: 'Rival',
        fac_thorbardin: 'Neutral',
        fac_high_sorcery: 'Rival',
        fac_red_dragonarmy: 'Hostile',
        fac_blue_dragonarmy: 'Hostile'
      },
      disposition: [2, 1, 4],
      odv: { s: 2, e: 1, c: 4 },
      description: 'Ancient knighthood bound by Est Sularus oth Mithas ("My Honor is My Life") and the thirty-volume Measure, fractured between Lord Gunthar Uth Wistan\'s reformers and Derek Crownguard\'s rigid legalists.',
      notes: 'Whitestone Parley Matrix: Gunthar\'s bloc votes for unified command if presented with the forged Dragonlances; Derek\'s bloc demands strict adherence to the Measure and distrusts elves and Red/Black Robe wizards.'
    },
    {
      id: 'fac_high_sorcery',
      name: 'The Orders of High Sorcery (Conclave of Wizards)',
      type: 'Arcane Tri-Moon Conclave',
      cvfQuadrant: 'Hierarchy',
      colorIdentity: 'UBR',
      leaderNpcId: 'npc_par_salian',
      headquartersNodeId: 'N_WAYRETH',
      controlledNodeIds: ['N_WAYRETH'],
      territoryNodeIds: ['N_WAYRETH', 'N_PALANTHAS'],
      memberNpcIds: ['npc_par_salian', 'npc_raistlin', 'npc_fistandantilus', 'npc_antimodes', 'npc_theobald', 'npc_liam'],
      diplomaticStances: {
        fac_companions: 'Friendly',
        fac_solamnia: 'Neutral',
        fac_red_dragonarmy: 'Rival',
        fac_blue_dragonarmy: 'Rival'
      },
      disposition: [2, 3, 4],
      odv: { s: 2, e: 3, c: 4 },
      description: 'The sovereign brotherhood of White (Solinari), Red (Lunitari), and Black (Nuitari) Robe mages holding the Law of Magic above all mundane thrones and enforcing the lethal Test of High Sorcery at Wayreth.',
      notes: 'Conclave Parley Matrix: Unmoved by political borders; immediately unites against un-tested renegades or any threat to the balance of the Three Moons.'
    },
    {
      id: 'fac_red_dragonarmy',
      name: 'The Red Dragonarmy & Imperial Command of Neraka',
      type: 'Theocratic Invasion Legion',
      cvfQuadrant: 'Hierarchy',
      colorIdentity: 'BR',
      leaderNpcId: 'npc_ariakas',
      headquartersNodeId: 'N_NERAKA',
      controlledNodeIds: ['N_NERAKA', 'N_SANCTION', 'N_PAX_THARKAS', 'N_XAK_TSAROTH', 'N_GATEWAY'],
      territoryNodeIds: ['N_NERAKA', 'N_SANCTION', 'N_PAX_THARKAS', 'N_XAK_TSAROTH', 'N_GATEWAY', 'N_HOPES_END'],
      memberNpcIds: [
        'npc_ariakas', 'npc_verminaard', 'npc_toede', 'npc_pyros', 'npc_flamestrike',
        'npc_immolatus', 'npc_eben', 'npc_dracart', 'npc_gakhan', 'npc_takhisis'
      ],
      diplomaticStances: {
        fac_blue_dragonarmy: 'Rival',
        fac_white_dragonarmy: 'Allied',
        fac_green_black_wings: 'Allied',
        fac_seeker_theocracy: 'Friendly',
        fac_companions: 'Hostile',
        fac_solamnia: 'Hostile',
        fac_qualinesti_silvanesti: 'Hostile',
        fac_thorbardin: 'Hostile'
      },
      disposition: [1, 4, 4],
      odv: { s: 1, e: 4, c: 4 },
      description: 'The largest of the five Dragonarmies, forged around the volcanic egg-vats of Sanction and commanded by Emperor Ariakas in Neraka and Highlord Verminaard in Abanasinia.',
      notes: 'Highlord Council Parley Matrix: Ruled by Takhisis\'s Darwinian law—treason is expected if it succeeds, fatal if it fails. Ariakas guards the Crown of Power behind an arcane shield.'
    },
    {
      id: 'fac_blue_dragonarmy',
      name: 'The Blue Dragonarmy (Wing of the Blue Lady)',
      type: 'Elite Aerial & Shock Legion',
      cvfQuadrant: 'Market',
      colorIdentity: 'UB',
      leaderNpcId: 'npc_kitiara',
      headquartersNodeId: 'N_DARGAARD_KEEP',
      controlledNodeIds: ['N_DARGAARD_KEEP', 'N_FLOTSAM'],
      territoryNodeIds: ['N_DARGAARD_KEEP', 'N_FLOTSAM', 'N_TARSIS', 'N_KALAMAN'],
      memberNpcIds: ['npc_kitiara', 'npc_bakaris', 'npc_skie', 'npc_lord_soth'],
      diplomaticStances: {
        fac_red_dragonarmy: 'Rival',
        fac_companions: 'Hostile',
        fac_solamnia: 'Hostile'
      },
      disposition: [1, 4, 3],
      odv: { s: 1, e: 4, c: 3 },
      description: 'Highlord Kitiara Uth Matar\'s disciplined, fiercely loyal northern wing, backed by the ancient blue dragon Skie, Flying Citadels, and a dark compact with Death Knight Lord Soth.',
      notes: 'Blue Wing Parley Matrix: Kitiara respects audacity, martial competence, and personal leverage over Ariakas; she harbors conflicted possessive feelings toward Tanis and her twin brothers.'
    },
    {
      id: 'fac_white_dragonarmy',
      name: 'The White Dragonarmy (Glacial Wing)',
      type: 'Sub-Zero Pack Legion',
      cvfQuadrant: 'Hierarchy',
      colorIdentity: 'UB',
      leaderNpcId: 'npc_feal_thas',
      headquartersNodeId: 'N_ICEWALL',
      controlledNodeIds: ['N_ICEWALL'],
      territoryNodeIds: ['N_ICEWALL'],
      memberNpcIds: ['npc_feal_thas', 'npc_sleet'],
      diplomaticStances: {
        fac_red_dragonarmy: 'Allied',
        fac_companions: 'Hostile'
      },
      disposition: [1, 3, 3],
      odv: { s: 1, e: 3, c: 3 },
      description: 'Smallest of the five wings, garrisoning Icewall Castle under the Silvanesti dark-elf necromancer Feal-Thas, his winter wolf packs, Walrus-men (Than-Kar), and the white wyrm Sleet.',
      notes: 'Guards the Icewall Dragon Orb in the southern glacial spire.'
    },
    {
      id: 'fac_green_black_wings',
      name: 'The Green & Black Dragonarmies (Swamp & Dream Wings)',
      type: 'Psychological & Subterranean Wings',
      cvfQuadrant: 'Adhocracy',
      colorIdentity: 'BG',
      leaderNpcId: 'npc_cyan_bloodbane',
      headquartersNodeId: 'N_SILVANESTI',
      controlledNodeIds: ['N_SILVANESTI'],
      territoryNodeIds: ['N_SILVANESTI', 'N_XAK_TSAROTH'],
      memberNpcIds: ['npc_cyan_bloodbane', 'npc_khisanth'],
      diplomaticStances: {
        fac_red_dragonarmy: 'Allied',
        fac_qualinesti_silvanesti: 'Hostile',
        fac_companions: 'Hostile'
      },
      disposition: [1, 4, 2],
      odv: { s: 1, e: 4, c: 2 },
      description: 'Anchored by the ancient green dragon Cyan Bloodbane (corrupting King Lorac\'s dream through the Silvanesti Orb) and the black dragon Khisanth in the sunken ruins of Xak Tsaroth.',
      notes: 'Operates via poison gas, acid swamps, and hallucinatory psychological terror.'
    },
    {
      id: 'fac_qualinesti_silvanesti',
      name: 'The Elven Kingdoms in Exile (Qualinesti & Silvanesti)',
      type: 'Ancestral Woodland Kingdoms',
      cvfQuadrant: 'Hierarchy',
      colorIdentity: 'GW',
      leaderNpcId: 'npc_alhana',
      headquartersNodeId: 'N_QUALINOST',
      controlledNodeIds: ['N_QUALINOST', 'N_SOUTHERN_ERGOTH'],
      territoryNodeIds: ['N_QUALINOST', 'N_SOUTHERN_ERGOTH', 'N_SILVANESTI'],
      memberNpcIds: ['npc_laurana', 'npc_gilthanas', 'npc_alhana', 'npc_lorac'],
      diplomaticStances: {
        fac_companions: 'Allied',
        fac_solamnia: 'Rival',
        fac_thorbardin: 'Rival',
        fac_red_dragonarmy: 'Hostile',
        fac_green_black_wings: 'Hostile'
      },
      disposition: [3, 1, 4],
      odv: { s: 3, e: 1, c: 4 },
      description: 'The estranged eastern (Silvanesti) and western (Qualinesti) elven houses, forced out of their ancient homelands onto Southern Ergoth and united through the courage of Laurana and Alhana Starbreeze.',
      notes: 'Sun Council & Exile Parley Matrix: Distrusts humans and dwarves; won over only when Laurana recovers the Dragon Orb and Silvara reveals the Tomb of Huma.'
    },
    {
      id: 'fac_thorbardin',
      name: 'The Kingdom of Thorbardin (Council of Thanes)',
      type: 'Subterranean Dwarven Holds',
      cvfQuadrant: 'Hierarchy',
      colorIdentity: 'RW',
      leaderNpcId: 'npc_flint',
      headquartersNodeId: 'N_THORBARDIN',
      controlledNodeIds: ['N_THORBARDIN'],
      territoryNodeIds: ['N_THORBARDIN', 'N_DERKIN_TOMB'],
      memberNpcIds: ['npc_flint', 'npc_sestun', 'npc_bupu'],
      diplomaticStances: {
        fac_companions: 'Friendly',
        fac_solamnia: 'Neutral',
        fac_qualinesti_silvanesti: 'Rival',
        fac_red_dragonarmy: 'Hostile'
      },
      disposition: [2, 1, 4],
      odv: { s: 2, e: 1, c: 4 },
      description: 'The sealed mountain kingdom of Hylar, Daewar, Theiwar, Klar, and Neidar dwarves beneath the Kharolis peaks, scarred by the memory of Fistandantilus\'s Dwarfgate War.',
      notes: 'Council of Thanes Parley Matrix: Refuses to open the Northgate to surface refugees unless the Hammer of Kharas (`ITM-HAMMER-KHARAS`) or Helm of Grallen (`ITM-HELM-GRALLEN`) is presented.'
    },
    {
      id: 'fac_seeker_theocracy',
      name: 'The High Seekers of Haven & Cult of Belzor',
      type: 'Collaborator Bureaucratic Theocracy',
      cvfQuadrant: 'Market',
      colorIdentity: 'WB',
      leaderNpcId: 'npc_hederick',
      headquartersNodeId: 'N_HAVEN',
      controlledNodeIds: ['N_HAVEN'],
      territoryNodeIds: ['N_HAVEN', 'N_SOLACE', 'N_LANGTREE'],
      memberNpcIds: ['npc_hederick', 'npc_widow_judith', 'npc_baron_ivor'],
      diplomaticStances: {
        fac_red_dragonarmy: 'Friendly',
        fac_companions: 'Hostile',
        fac_high_sorcery: 'Rival'
      },
      disposition: [1, 2, 4],
      odv: { s: 1, e: 2, c: 4 },
      description: 'The hollow post-Cataclysm priesthood that purports to "seek" new gods while taxing Abanasinia and collaborating with Verminaard\'s Red Dragonarmy to preserve their own wealth.',
      notes: 'Collapses when Hederick witnesses true divine miracles or when Verminaard discards them at Pax Tharkas.'
    }
  ];
}

function buildItems() {
  return [
    {
      id: 'ITM-BLUE-STAFF',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      name: 'The Blue Crystal Staff of Mishakal',
      category: 'Artifact',
      specs: '20-charge divine healing & radiant smiting staff; deflects strikes from evil creatures; blazes with azure fire against Khisanth.',
      notes: 'Recovered by Riverwind from the sunken temple of Xak Tsaroth and borne by Goldmoon (`Q_AUT_01`, `Q_AUT_02`, `CRUC-08`).',
      ownerNpcId: 'npc_goldmoon',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-DISKS-MISHAKAL',
      nodeId: 'XAK-05',
      submapId: 'map_sub_xak_tsaroth',
      name: 'The Platinum Disks of Mishakal',
      category: 'Artifact',
      specs: '85-lb spiral-bound concave platinum plates inscribed with the true doctrines of the Gods of Good.',
      notes: 'Guarded by Khisanth in Xak Tsaroth (`CRUC-28`). Reading them ordains Elistan as the first True Cleric of Paladine in 351 AC.',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-STAFF-MAGIUS',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      name: 'The Staff of Magius',
      category: 'Artifact',
      specs: 'Blackwood staff topped with a golden dragon claw clutching a crystal orb; +2 AC, continual light ("Shirak"/"Dulak"), and spell amplification.',
      notes: 'Awarded to Raistlin by Par-Salian after the Test of High Sorcery at Wayreth (`Q_PRE_01`, `Q_ECHO_01`).',
      ownerNpcId: 'npc_raistlin',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-BLOODSTONE',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      name: 'The Bloodstone Pendant of Fistandantilus',
      category: 'Artifact',
      specs: 'Dark green heliotrope flecked with arterial red; psychic soul-conduit linking Raistlin to Fistandantilus; grants temporal memory resonance.',
      notes: 'Touched in `Q_ECHO_01` to trigger *The Soulforge Echo (346 AC)*; central to `CRUC-03` and `CRUC-16`.',
      ownerNpcId: 'npc_raistlin',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-FISTANDANTILUS-GRIMOIRE',
      nodeId: 'XAK-04',
      submapId: 'map_sub_xak_tsaroth',
      name: 'Sunken Spellbook of Fistandantilus',
      category: 'Document',
      specs: 'Silver-runed dragonhide tome readable only through hourglass eyes or Bloodstone attunement.',
      notes: 'Hidden in the sunken library of Xak Tsaroth (`CRUC-09`) and revealed to Raistlin by Bupu.',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-BRIGHTBLADE',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      name: 'Brightblade (Ancestral Two-Handed Sword)',
      category: 'Weapon',
      specs: '+3 Solamnic broadsword engraved with the rose, crown, and kingfisher; unbreakable so long as its wielder\'s honor holds.',
      notes: 'Borne by Sturm Brightblade from Solace to the sunlit parapet of the High Clerist\'s Tower (`CRUC-13`).',
      ownerNpcId: 'npc_sturm',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-WYRMSLAYER',
      nodeId: 'SLA-02',
      submapId: 'map_sub_sla_mori',
      name: 'Wyrmslayer (Sword of Kith-Kanan)',
      category: 'Weapon',
      specs: 'Ancient elven greatsword (+3 vs. Dragons) humming with a warning vibration whenever draconic malice is near.',
      notes: 'Recovered by Tanis from the sarcophagus of Kith-Kanan in the Sla-Mori (`Q_AUT_03`).',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-HOOPAK-TAS',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      name: 'Tasslehoff\'s Hoopak & Pouches of Borrowing',
      category: 'Weapon',
      specs: 'Iron-shod ash sling-staff emitting an eerie bullroarer whir when spun; paired with lockpicks and borrowed curios.',
      notes: 'Carried by Tasslehoff Burrfoot across Ansalon.',
      ownerNpcId: 'npc_tasslehoff',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-GLASSES-TRUE-SEEING',
      nodeId: 'XAK-04',
      submapId: 'map_sub_xak_tsaroth',
      name: 'Glasses of True Seeing',
      category: 'Relic',
      specs: 'Rose-tinted wire spectacles enabling the wearer to read any language or cipher.',
      notes: 'Found by Tasslehoff in Xak Tsaroth (`Q_AUT_02`).',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-SILVER-SHARD',
      nodeId: 'HOP-04',
      submapId: 'map_sub_hopes_end_siege',
      name: 'Scorched Silver Dragon Eggshell Shard',
      category: 'Relic',
      specs: 'Iridescent metallic shell fragment bearing the residue of Sanction\'s dark transmutation.',
      notes: 'Resonant trigger for `Q_ECHO_02` (*Ashes of the Silver Clutch — 347 AC*) and forensic proof for Silvara and the Good Dragons (`CRUC-07`, `Q_SPR_02`).',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-NIGHTBRINGER',
      nodeId: 'PAX-04',
      submapId: 'map_sub_pax_tharkas',
      name: 'Nightbringer (Heavy Mace of Verminaard)',
      category: 'Weapon',
      specs: '+3 black-iron flanged mace of Takhisis that blinds struck foes in utter darkness.',
      notes: 'Wielded by Dragon Highlord Verminaard in the audience hall of Pax Tharkas (`Q_AUT_03`).',
      ownerNpcId: 'npc_verminaard',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-HELM-GRALLEN',
      nodeId: 'DRK-03',
      submapId: 'map_sub_derkin_skullcap',
      name: 'The Helm of Grallen',
      category: 'Relic',
      specs: 'Silver-and-gemstone dwarven war-helm of Prince Grallen; proves noble intent to the Thorbardin thanes.',
      notes: 'Recovered from the spectral ruins of Skullcap / Derkin\'s Tomb (`Q_WIN_01`).',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-HAMMER-KHARAS',
      nodeId: 'N_THORBARDIN',
      submapId: 'map_ansalon_continent',
      name: 'The Hammer of Kharas',
      category: 'Artifact',
      specs: 'Sacred warhammer of the dwarven hero Kharas; the only forging tool capable of shaping pure dragonmetal into True Dragonlances.',
      notes: 'Restored in Thorbardin (`Q_WIN_01`) and carried by Theros Ironfeld to Foghaven Valley (`Q_WIN_03B`).',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-SILVER-ARM',
      nodeId: 'N_SOUTHERN_ERGOTH',
      submapId: 'map_ansalon_continent',
      name: 'The Silver Arm of Ergoth',
      category: 'Artifact',
      specs: 'Articulated prosthetic arm of pure blessed silver; bonds to a master smith to channel Paladine\'s forging fire.',
      notes: 'Grafted onto Theros Ironfeld after losing his arm in Solace (`Q_WIN_03B`).',
      ownerNpcId: 'npc_theros',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-DRAGON-ORB-ICEWALL',
      nodeId: 'ICE-03',
      submapId: 'map_sub_icewall_castle',
      name: 'The Dragon Orb of Icewall',
      category: 'Artifact',
      specs: 'Size-changing crystal sphere housing an ancient dragon intelligence; compels evil dragons to dive into traps if the wielder wins a battle of wills.',
      notes: 'Recovered from Highlord Feal-Thas at Icewall (`CRUC-14`), shattered or mastered at the Whitestone Council / High Clerist\'s Tower (`CRUC-15`, `CRUC-17`, `CRUC-26`).',
      ownerNpcId: 'npc_feal_thas',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-DRAGON-ORB-SILVANESTI',
      nodeId: 'SIL-03',
      submapId: 'map_sub_silvanesti_dream',
      name: 'The Dragon Orb of Silvanesti',
      category: 'Artifact',
      specs: 'Green-misted crystal orb used by Cyan Bloodbane to trap King Lorac in a living nightmare.',
      notes: 'Mastered by Raistlin in Silvanesti (`CRUC-16`) and carried into the Blood Sea and Palanthas (`Q_SPR_01`).',
      ownerNpcId: 'npc_lorac',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-STARJEWEL',
      nodeId: 'TAR-04',
      submapId: 'map_sub_tarsis_square',
      name: 'The Starjewel of Alhana Starbreeze',
      category: 'Relic',
      specs: 'Radiant diamond pendant linking two souls across any distance on Krynn.',
      notes: 'Gifted by Princess Alhana Starbreeze to Sturm Brightblade upon parting in Silvanesti (`Q_WIN_03A`).',
      ownerNpcId: 'npc_alhana',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-DRAGONLANCE-FOOT',
      nodeId: 'N_SOUTHERN_ERGOTH',
      submapId: 'map_ansalon_continent',
      name: 'True Footman\'s Dragonlance of Huma',
      category: 'Weapon',
      specs: '8-foot gleaming silver dragonmetal pike (+4 vs. Dragons, deals wielder\'s full HP on a mounted/braced strike).',
      notes: 'Forged in Foghaven Valley by Theros Ironfeld (`Q_WIN_03B`, `CRUC-18`) and deployed in the kill-corridors of the High Clerist\'s Tower (`Q_WIN_04`).',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-DRAGONLANCE-MOUNTED',
      nodeId: 'N_SOUTHERN_ERGOTH',
      submapId: 'map_ansalon_continent',
      name: 'True Mounted Dragonlance of Huma',
      category: 'Weapon',
      specs: '16-foot balanced silver dragonlance with dragon-wing vamplate designed for aerial dragonback combat.',
      notes: 'Wielded by the Knights of Solamnia and Metallic Dragon riders in `Q_SPR_02` and `Q_SPR_03`.',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-CROWN-POWER',
      nodeId: 'NER-02',
      submapId: 'map_sub_neraka_temple',
      name: 'The Crown of Power (Imperial Diadem of Takhisis)',
      category: 'Artifact',
      specs: 'Five-clawed golden dragon crown set with a blood-red ruby; confers supreme command over all five Dragonarmies.',
      notes: 'Worn by Emperor Ariakas in Neraka (`Q_SPR_03`); contested by Tanis, Kitiara, and the Highlords (`CRUC-19`, `CRUC-23`, `CRUC-27`).',
      ownerNpcId: 'npc_ariakas',
      possessionMode: 'carried',
      status: 'Active'
    },
    {
      id: 'ITM-FOUNDATION-STONE',
      nodeId: 'NER-04',
      submapId: 'map_sub_neraka_temple',
      name: 'The Cracked Foundation Stone of Istar / Neraka',
      category: 'Artifact',
      specs: 'Ancient jeweled temple pillar missing a single green gemstone; serves as Takhisis\'s planar gate into Krynn while incomplete.',
      notes: 'Sealed only when Berem the Everman reunites the green gemstone in his chest with his sister Jasla\'s spirit (`CRUC-20`, `CRUC-22`, `CRUC-29`).',
      ownerNpcId: null,
      possessionMode: 'stored',
      status: 'Active'
    },
    {
      id: 'ITM-GREEN-GEMSTONE-BEREM',
      nodeId: 'PAX-03',
      submapId: 'map_sub_pax_tharkas',
      name: 'The Living Green Gemstone (Chest of the Everman)',
      category: 'Artifact',
      specs: 'Priceless emerald fused into the flesh over Berem\'s heart; grants immortality and resurrection until returned to the Foundation Stone.',
      notes: 'Pried from the Foundation Stone 300 years ago, causing Jasla\'s death and locking Takhisis\'s portal (`Q_SPR_01`, `Q_SPR_03`).',
      ownerNpcId: 'npc_berem',
      possessionMode: 'carried',
      status: 'Active'
    }
  ];
}

module.exports = {
  buildFactions,
  buildItems
};
