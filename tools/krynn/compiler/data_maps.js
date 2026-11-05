/**
 * Shared Multi-Scale Ansalon Topology & 12 Tactical Submaps
 * Part of the Deep-Module Compiler for The Chronicles of Krynn (Workstation 2.6)
 */
'use strict';

function makeMacroNode({
  id, name, displayName, x, y, cat = 'Standard POI', culture = 'Hierarchy',
  shape = 'circle', adj = [], infBy = [], childMapId = null, odv = [2, 2, 2],
  faction = 'neutral', factionPresence = [], demographics, partyRapport,
  modules = [], provides = [], requires = [], customNotes = '', visible = true
}) {
  return {
    id,
    name,
    displayName: displayName || name,
    x,
    y,
    coordinates: { x, y },
    cat,
    culture,
    shape: childMapId ? 'pentagon' : shape,
    adj,
    infBy,
    hubEligibility: 'candidate',
    eligible: true,
    wave: 1,
    tier: 2,
    childMapId,
    customNotes,
    locked: true,
    visible,
    color: null,
    modules,
    provides,
    requires,
    modData: {},
    odv,
    odvOverridden: true,
    faction,
    factionPresence,
    demographics: demographics || {
      primary: { name: 'Abanasinian Human', percentage: 75 },
      minorities: [
        { name: 'Hill Dwarf', percentage: 15, traits: 'Craftfolk & smiths' },
        { name: 'Kender', percentage: 10, traits: 'Wanderers & handlers' }
      ],
      social_friction_notes: 'Post-Cataclysm suspicion of arcane magic and outsiders.',
      tags: ['Human', 'Dwarf', 'Kender']
    },
    partyRapport: partyRapport || { stance: 0, notes: 'Wary frontier neutrality.' },
    layerId: 'layer-nodes'
  };
}

function buildMacroAnsalonMap(eraMode) {
  const is346 = eraMode === '346_AC';

  const nodes = [
    makeMacroNode({
      id: 'N_SOLACE',
      name: 'Solace (The Valleys of the Trees)',
      displayName: 'Solace & Inn of the Last Home',
      x: 240, y: 310,
      cat: 'Bastion',
      culture: 'Clan',
      childMapId: 'map_sub_solace_inn',
      odv: [3, 2, 2],
      faction: is346 ? 'fac_seeker_theocracy' : 'contested',
      factionPresence: is346
        ? ['fac_companions', 'fac_seeker_theocracy']
        : ['fac_companions', 'fac_seeker_theocracy', 'fac_red_dragonarmy'],
      demographics: {
        primary: { name: 'Abanasinian Human', percentage: 78 },
        minorities: [
          { name: 'Neidar Hill Dwarf', percentage: 12, traits: 'Master woodworkers & smiths (Flint Fireforge)' },
          { name: 'Kender', percentage: 6, traits: 'Itinerant curiosity-seekers' },
          { name: 'Baaz Draconian (351 AC)', percentage: 4, traits: 'Hooded Seeker garrison checkpoint guards' }
        ],
        social_friction_notes: is346
          ? 'Seeker magistrates enforce religious taxation while young twins Raistlin and Caramon prepare for the Wayreth summons.'
          : 'High Theocrat Hederick and Fewmaster Toede patrol the elevated boardwalks hunting the Blue Crystal Staff.',
        tags: ['Human', 'Neidar Dwarf', 'Kender', 'Draconian']
      },
      partyRapport: { stance: 2, notes: 'Home sanctuary of the Companions at Otik Sandath\'s Inn of the Last Home.' },
      modules: ['MOD_T2_VALLEY_TREES_SOLACE', 'MOD_T4_DRACONIAN_CHECKPOINTS'],
      provides: ['spiced_potatoes_provisions', 'fellowship_sanctuary', 'abanasinia_rumor_network'],
      requires: ['timber_bridge_maintenance'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Colossal autumnal vallenwood trees cradling buildings in gold-and-scarlet boughs; suspended rope walkways creaking forty feet above leaf-mulched earth; cast-iron skillets sizzling with Otik\'s spiced potatoes.\n' +
        '- *Behaviors:* Townsfolk ascending rope ladders at dusk; hooded strangers checking satchels at the crossroads.\n' +
        '- *Relationships:* Deep tavern kinship around [[NPC:npc_otik]] and [[NPC:npc_tika]] strained by [[NPC:npc_hederick]]\'s Seeker inquisition.\n' +
        '- *Attitudes:* Nostalgic warmth colliding with post-Cataclysm cynicism toward the old gods.\n' +
        '- *Values:* Hospitality of the hearth versus theocratic conformity.\n' +
        'Portal submap: [[Map:map_sub_solace_inn]]. Connected to [[Node:N_HAVEN]], [[Node:N_CRYSTALMIR]], and [[Node:N_PAX_THARKAS]].'
    }),
    makeMacroNode({
      id: 'N_HAVEN',
      name: 'Haven (Seat of the High Seekers)',
      displayName: 'Haven Council City',
      x: 165, y: 295,
      cat: 'Bastion',
      culture: 'Hierarchy',
      odv: [1, 2, 4],
      faction: 'fac_seeker_theocracy',
      factionPresence: ['fac_seeker_theocracy', 'fac_high_sorcery', 'fac_red_dragonarmy'],
      demographics: {
        primary: { name: 'Abanasinian Human', percentage: 88 },
        minorities: [
          { name: 'Seeker Clerisy & Sellswords', percentage: 12, traits: 'Tax collectors, charlatan priests, and Master Theobald\'s school' }
        ],
        social_friction_notes: 'In 344-346 AC, Widow Judith\'s Belzor cult and Master Theobald\'s mediocre magic school dominate the stone squares.',
        tags: ['Human', 'Seeker Clerisy']
      },
      partyRapport: { stance: 0, notes: 'Bureaucratic Seeker capital; Antimodes maintains a suite at the Whitestone Inn.' },
      modules: ['MOD_T1_SEEKER_THEOCRACY_NETWORK'],
      provides: ['seeker_safe_conduct_writ', 'steel_coin_treasury', 'arcane_primer_scrolls'],
      requires: ['tithe_grain_shipments'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Whitewashed stone villas, cobble squares smelling of tallow candles, flash-powder sulfur from Belzor\'s shrine (`CRUC-02`), and wet wool.\n' +
        '- *Behaviors:* Seeker magistrates weighing steel coins; apprentices reciting rote cantrips under [[NPC:npc_theobald]].\n' +
        '- *Relationships:* [[NPC:npc_antimodes]] secretly funding [[NPC:npc_raistlin]]\'s schooling while [[NPC:npc_widow_judith]] stirs fanaticism.\n' +
        '- *Attitudes:* Complacent mercantile piety masking cowardly appeasement of [[Faction:fac_red_dragonarmy]].\n' +
        '- *Values:* Respectability, coin, and dogmatic orthodoxy.'
    }),
    makeMacroNode({
      id: 'N_CRYSTALMIR',
      name: 'Crystalmir Lake & Queer Idol Shore',
      displayName: 'Crystalmir Lake',
      x: 260, y: 350,
      cat: 'Standard POI',
      culture: 'Clan',
      odv: [3, 1, 1],
      faction: 'neutral',
      factionPresence: ['fac_companions', 'fac_red_dragonarmy'],
      provides: ['freshwater_ferry_route'],
      requires: [],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Cold mirror-dark alpine water reflecting autumn vallenwoods; the soot-blackened stone idol where [[NPC:npc_goldmoon]]\'s [[Item:ITM-BLUE-STAFF]] blazes against [[NPC:npc_toede]]\'s goblin ambush.\n' +
        '- *Behaviors:* Ferrymen poling flatboats through morning mist; Baaz draconians turning to crumbling stone when slain (`Q_AUT_01`).'
    }),
    makeMacroNode({
      id: 'N_DARKEN_WOOD',
      name: 'Darken Wood (Domain of the Forestmaster)',
      displayName: 'Darken Wood',
      x: 315, y: 340,
      cat: 'Hazard',
      culture: 'Clan',
      odv: [4, 1, 2],
      faction: 'fac_companions',
      factionPresence: ['fac_companions'],
      demographics: {
        primary: { name: 'Spectral Centaur & Woodland Guardians', percentage: 60 },
        minorities: [{ name: 'Unicorn Herd of the Forestmaster', percentage: 40, traits: 'Celestial arbiters of purity' }],
        social_friction_notes: 'Hostile to all defilers and undead restlessness until the Forestmaster grants passage.',
        tags: ['Centaur', 'Unicorn', 'Spectral']
      },
      partyRapport: { stance: 1, notes: 'The Forestmaster recognizes the true faith of Mishakal.' },
      provides: ['unicorn_blessing', 'east_mountain_bypass'],
      requires: [],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Ancient, lightless canopy smelling of crushed wintergreen, ozone, and centuries-old moss; silver moonlight pooling in the clearing of [[NPC:npc_forestmaster]].\n' +
        '- *Behaviors:* Spectral guardians testing the courage of travelers before opening the eastern pass toward [[Node:N_XAK_TSAROTH]].'
    }),
    makeMacroNode({
      id: 'N_XAK_TSAROTH',
      name: 'Xak Tsaroth (The Drowned Ruin)',
      displayName: 'Xak Tsaroth Swamp & Chasm',
      x: 395, y: 315,
      cat: 'Hazard',
      culture: 'Adhocracy',
      childMapId: 'map_sub_xak_tsaroth',
      odv: [2, 4, 1],
      faction: 'fac_red_dragonarmy',
      factionPresence: ['fac_red_dragonarmy', 'fac_companions'],
      demographics: {
        primary: { name: 'Aghar Gully Dwarf (Bulps)', percentage: 65 },
        minorities: [
          { name: 'Baaz & Kapak Draconian', percentage: 30, traits: 'Swamp raiding garrison' },
          { name: 'Black Dragon Lair (Khisanth)', percentage: 5, traits: 'Acid-breathing guardian of the Disks' }
        ],
        social_friction_notes: 'Gully dwarf clans (Highbulp Phudge) scavenge beneath the tyranny of Khisanth and draconian taskmasters.',
        tags: ['Aghar Gully Dwarf', 'Baaz Draconian', 'Kapak Draconian', 'Black Dragon']
      },
      partyRapport: { stance: -2, notes: 'Lair of the Black Dragon Khisanth (Onyx); Bupu is friendly to Raistlin.' },
      modules: ['MOD_T2_DROWNED_RUIN_XAK_TSAROTH', 'MOD_T3_AGHAR_LIFT_HYDRAULICS'],
      provides: ['disks_of_mishakal_liturgy', 'fistandantilus_sunken_grimoire', 'aghar_express_chute_access'],
      requires: ['blue_crystal_staff_charge'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Rotting cypress swamp hissing with black-dragon acid; wicker draconian idols; tilted marble colonnades plunging into a cavernous abyss around the rusted Great Lift chain (`CRUC-08`, `CRUC-09`, `CRUC-28`).\n' +
        '- *Behaviors:* [[NPC:npc_bupu]] clutching her dead dried lizard and emerald; [[NPC:npc_khisanth]] coiled around the platinum [[Item:ITM-DISKS-MISHAKAL]].\n' +
        'Portal submap: [[Map:map_sub_xak_tsaroth]].'
    }),
    makeMacroNode({
      id: 'N_WAYRETH',
      name: 'Tower of High Sorcery at Wayreth',
      displayName: 'Tower of Wayreth',
      x: 205, y: 455,
      cat: 'Bastion',
      culture: 'Hierarchy',
      childMapId: 'map_sub_wayreth_tower',
      odv: [2, 3, 4],
      faction: 'fac_high_sorcery',
      factionPresence: ['fac_high_sorcery'],
      demographics: {
        primary: { name: 'Wizards of the Three Robes', percentage: 100 },
        minorities: [],
        social_friction_notes: 'Absolute neutrality under the Three Moons (Solinari, Lunitari, Nuitari); non-initiates cannot locate the forest unless summoned.',
        tags: ['White Robes', 'Red Robes', 'Black Robes']
      },
      partyRapport: { stance: 1, notes: 'Par-Salian and the Conclave test initiates and observe the war across the moons.' },
      modules: ['MOD_T2_WAYRETH_SHIFTING_GROVE', 'MOD_T5_SOULFORGE_CRUCIBLE'],
      provides: ['staff_of_magius_attunement', 'high_sorcery_conclave_mandate', 'soulforge_memory_projection'],
      requires: ['arcane_primer_scrolls'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Polished obsidian spires rising from a sentient, teleporting forest; the smell of ozone, old parchment, and burned flesh in the Chamber of the Test (`CRUC-03`, `CRUC-04`).\n' +
        '- *Behaviors:* [[NPC:npc_par_salian]] watching through silver mirrors as [[NPC:npc_fistandantilus]] whispers through [[Item:ITM-BLOODSTONE]] to [[NPC:npc_raistlin]].\n' +
        'Portal submap: [[Map:map_sub_wayreth_tower]].'
    }),
    makeMacroNode({
      id: 'N_LANGTREE',
      name: 'Langtree & Baron Ivor\'s Mustering Grounds',
      displayName: 'Langtree Mercenary Camp',
      x: 295, y: 245,
      cat: 'Standard POI',
      culture: 'Market',
      odv: [1, 4, 2],
      faction: is346 ? 'neutral' : 'fac_red_dragonarmy',
      factionPresence: ['fac_red_dragonarmy', 'fac_companions'],
      provides: ['mercenary_sellsword_contracts', 'siege_wagons'],
      requires: ['steel_coin_treasury'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Muddy stockade churned by heavy warhorse hooves; smell of wet leather, cheap ale, and whetstones (`Q_PRE_02`).\n' +
        '- *Behaviors:* [[NPC:npc_baron_ivor]] and [[NPC:npc_horkin]] drilling mercenary companies while young [[NPC:npc_raistlin]] and [[NPC:npc_caramon]] learn battlefield magic-and-steel tactics.'
    }),
    makeMacroNode({
      id: 'N_HOPES_END',
      name: is346 ? 'Hope\'s End (Besieged Valley Stronghold)' : 'Hope\'s End (Vitrified Dragon-Glass Ruins)',
      displayName: 'Hope\'s End',
      x: 350, y: 265,
      cat: is346 ? 'Bastion' : 'Hazard',
      culture: 'Clan',
      childMapId: 'map_sub_hopes_end_siege',
      odv: [3, 3, 2],
      faction: is346 ? 'contested' : 'fac_red_dragonarmy',
      factionPresence: ['fac_red_dragonarmy', 'fac_blue_dragonarmy', 'fac_companions'],
      modules: ['MOD_T3_MERCENARY_SIEGE_LINES', 'MOD_T4_SILVER_CLUTCH_BETRAYAL'],
      provides: ['silver_clutch_eggshell_evidence', 'khalkist_smuggler_pass'],
      requires: ['mercenary_sellsword_contracts'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Steep box-canyon walls fused into black volcanic dragon-glass by [[NPC:npc_immolatus]]\'s fire breath; subterranean ice-vaults where the stolen Silver Dragon Eggs (`CRUC-05`, `CRUC-06`, `CRUC-07`) were held before being shipped to [[Node:N_SANCTION]].\n' +
        '- *Relationships:* Where [[NPC:npc_kitiara]] seduced [[NPC:npc_bakaris]] and forged her pact with the Dragonarmies.\n' +
        'Portal submap: [[Map:map_sub_hopes_end_siege]].'
    }),
    makeMacroNode({
      id: 'N_GATEWAY',
      name: 'Gateway & Nightlund Border Road',
      displayName: 'Gateway Ambush Crossing',
      x: 225, y: 380,
      cat: 'Standard POI',
      culture: 'Market',
      odv: [2, 3, 2],
      faction: 'fac_red_dragonarmy',
      factionPresence: ['fac_red_dragonarmy', 'fac_qualinesti_silvanesti'],
      provides: ['prison_caravan_intercept'],
      requires: [],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Charred border tollhouse; iron slave-cages creaking down the muddy ruts toward Pax Tharkas until [[NPC:npc_gilthanas]]\'s elven archers strike at dawn (`Q_AUT_03`).'
    }),
    makeMacroNode({
      id: 'N_QUALINOST',
      name: 'Qualinost (Radiant City of the Sun Speaker)',
      displayName: 'Qualinost Elven Capital',
      x: 195, y: 415,
      cat: 'Bastion',
      culture: 'Hierarchy',
      odv: [3, 1, 4],
      faction: 'fac_qualinesti_silvanesti',
      factionPresence: ['fac_qualinesti_silvanesti', 'fac_companions'],
      demographics: {
        primary: { name: 'Qualinesti Elf', percentage: 95 },
        minorities: [{ name: 'Half-Elf & Diplomatic Guests', percentage: 5, traits: 'Marginally tolerated outsiders (Tanis)' }],
        social_friction_notes: 'Elven pride vs. urgent evacuation before Verminaard\'s Red Wing.',
        tags: ['Qualinesti Elf']
      },
      partyRapport: { stance: 1, notes: 'Speaker Solostaran, Porthios, Gilthanas, and Laurana organize the Great Exodus.' },
      provides: ['sla_mori_royal_key', 'qualinesti_longbow_support'],
      requires: [],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Spires of rose-quartz and gilded glass linked by silver-filigree arches over aspen groves; the Hall of the Sky open to the stars (`CRUC-11`).\n' +
        '- *Relationships:* [[NPC:npc_laurana]]\'s fierce devotion to [[NPC:npc_tanis]] clashing with Porthios\'s dynastic protection.'
    }),
    makeMacroNode({
      id: 'N_SLA_MORI',
      name: 'The Sla-Mori (Secret Royal Crypt Tunnel)',
      displayName: 'The Sla-Mori & Great Chain',
      x: 245, y: 440,
      cat: 'Hazard',
      culture: 'Hierarchy',
      childMapId: 'map_sub_sla_mori',
      odv: [2, 2, 4],
      faction: 'contested',
      factionPresence: ['fac_companions', 'fac_red_dragonarmy'],
      provides: ['pax_tharkas_undercroft_breach'],
      requires: ['sla_mori_royal_key'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Silent elven kings entombed in obsidian alcoves; Giant Slug slime trails; the deafening roar of molten iron chutes beneath the sixty-foot bronze Great Chain.\n' +
        'Portal submap: [[Map:map_sub_sla_mori]].'
    }),
    makeMacroNode({
      id: 'N_PAX_THARKAS',
      name: 'Pax Tharkas (Fortress of Peace / Red Wing Citadel)',
      displayName: 'Pax Tharkas Citadel',
      x: 265, y: 470,
      cat: 'Bastion',
      culture: 'Hierarchy',
      childMapId: 'map_sub_pax_tharkas',
      odv: [1, 3, 4],
      faction: is346 ? 'neutral' : 'fac_red_dragonarmy',
      factionPresence: ['fac_red_dragonarmy', 'fac_companions', 'fac_thorbardin'],
      demographics: {
        primary: { name: 'Enslaved Abanasinian Human Refugees', percentage: 60 },
        minorities: [
          { name: 'Red Dragonarmy Draconians & Hobgoblins', percentage: 35, traits: 'Verminaard\'s iron-mine garrison' },
          { name: 'Red Dragons (Pyros & Flamestrike)', percentage: 5, traits: 'Aerial siege wyrms' }
        ],
        social_friction_notes: '250 hostage children held in the upper nursery under senile Flamestrike to keep 500 parents docile in the iron mines.',
        tags: ['Human Refugees', 'Baaz Draconian', 'Bozak Draconian', 'Red Dragon']
      },
      partyRapport: { stance: -2, notes: 'Seat of Dragon Highlord Verminaard and his mace Nightbringer.' },
      modules: ['MOD_T3_PAX_THARKAS_SLAVE_MINES', 'MOD_T4_REFUGEE_EXODUS_COLUMN'],
      provides: ['pax_tharkas_iron_ore', 'liberated_800_refugees', 'everman_berem_release'],
      requires: ['pax_tharkas_undercroft_breach', 'disks_of_mishakal_liturgy'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Colossal twin curtain walls blocking the mountain pass; coal-smoke from the iron smelters; the nursery echoing with [[NPC:npc_flamestrike]]\'s wheezing cough (`CRUC-10`).\n' +
        '- *Relationships:* [[NPC:npc_verminaard]] preaching dark fatalism while [[NPC:npc_elistan]] receives [[Item:ITM-DISKS-MISHAKAL]] and [[NPC:npc_berem]] flees the subterranean cells.\n' +
        'Portal submap: [[Map:map_sub_pax_tharkas]].'
    }),
    makeMacroNode({
      id: 'N_DERKIN_TOMB',
      name: 'Skullcap & Derkin\'s Tomb',
      displayName: 'Skullcap Fortress Ruins',
      x: 280, y: 525,
      cat: 'Hazard',
      culture: 'Adhocracy',
      childMapId: 'map_sub_derkin_skullcap',
      odv: [1, 4, 2],
      faction: 'contested',
      factionPresence: ['fac_thorbardin', 'fac_high_sorcery', 'fac_red_dragonarmy'],
      modules: ['MOD_T2_KHAROLIS_WINTER_PASSES'],
      provides: ['helm_of_grallen_relic', 'thorbardin_secret_gate_map'],
      requires: [],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* A mountain peak melted into a colossal green-glass skull where [[NPC:npc_fistandantilus]] detonated the Dwarfgate armies; spectral dwarven legions clashing in the mist (`Q_WIN_01`, `CRUC-12`).\n' +
        'Portal submap: [[Map:map_sub_derkin_skullcap]].'
    }),
    makeMacroNode({
      id: 'N_THORBARDIN',
      name: 'Thorbardin (Underground Kingdom of the Dwarves)',
      displayName: 'Thorbardin Dwarven Realm',
      x: 265, y: 565,
      cat: 'Bastion',
      culture: 'Hierarchy',
      odv: [2, 1, 4],
      faction: 'fac_thorbardin',
      factionPresence: ['fac_thorbardin', 'fac_companions', 'fac_red_dragonarmy'],
      demographics: {
        primary: { name: 'Hylar & Daewar Mountain Dwarf', percentage: 75 },
        minorities: [
          { name: 'Theiwar & Klar Dwarf', percentage: 20, traits: 'Subterranean conspirators & wildsmiths' },
          { name: 'Aghar Gully Dwarf (Sestun)', percentage: 5, traits: 'Maintenance drudges around the Life Tree' }
        ],
        social_friction_notes: 'Seven dwarven clans deadlocked without a High King until the Hammer of Kharas is restored.',
        tags: ['Hylar Dwarf', 'Theiwar Dwarf', 'Daewar Dwarf', 'Aghar Dwarf']
      },
      partyRapport: { stance: 0, notes: 'Returning the Hammer of Kharas opens sanctuary for the 800 Solace refugees.' },
      modules: ['MOD_T3_THORBARDIN_LIFE_TREE_SEAL'],
      provides: ['hammer_of_kharas_authority', 'refugee_winter_sanctuary', 'dwarven_heavy_infantry'],
      requires: ['helm_of_grallen_relic'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* The gigantic stalagmite-stalactite column of the Life Tree suspended over an underground sea; the rhythmic clang of a thousand forges (`Q_WIN_01`).'
    }),
    makeMacroNode({
      id: 'N_TARSIS',
      name: 'Tarsis the Beautiful (Landlocked Dust-Port)',
      displayName: 'Tarsis the Beautiful',
      x: 365, y: 600,
      cat: 'Bastion',
      culture: 'Market',
      childMapId: 'map_sub_tarsis_square',
      odv: [1, 3, 3],
      faction: 'contested',
      factionPresence: ['fac_blue_dragonarmy', 'fac_red_dragonarmy', 'fac_companions', 'fac_qualinesti_silvanesti'],
      modules: ['MOD_T2_LANDLOCKED_TARSIS_DUSTBOWL', 'MOD_T4_BLUE_WING_AERIAL_BLITZ'],
      provides: ['icewall_expedition_charts', 'silvanesti_griffon_escort', 'dragon_orb_lore_clue'],
      requires: [],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Sun-bleached marble arcades half-buried in red prairie dust; dry-rotted hulls of ancient swan-ships marooned forty miles from the sea; blue lightning and red dragonfire shattering the Red Dragon Inn (`Q_WIN_02`, `CRUC-24`).\n' +
        'Portal submap: [[Map:map_sub_tarsis_square]].'
    }),
    makeMacroNode({
      id: 'N_ICEWALL',
      name: 'Icewall Castle & Glacial Spire',
      displayName: 'Icewall Castle',
      x: 345, y: 715,
      cat: 'Hazard',
      culture: 'Hierarchy',
      childMapId: 'map_sub_icewall_castle',
      odv: [1, 3, 3],
      faction: 'fac_white_dragonarmy',
      factionPresence: ['fac_white_dragonarmy', 'fac_companions'],
      demographics: {
        primary: { name: 'Ice Folk Barbarians & Than-Kar', percentage: 70 },
        minorities: [
          { name: 'White Dragonarmy & Winter Wolves', percentage: 25, traits: 'Highlord Feal-Thas\'s pack' },
          { name: 'White Dragon Sleet', percentage: 5, traits: 'Glacial apex predator' }
        ],
        social_friction_notes: 'Ice Folk sail ice-boats across the glacier to topple Dark Elf Highlord Feal-Thas.',
        tags: ['Ice Folk', 'Than-Kar', 'Winter Wolf', 'White Dragon']
      },
      modules: ['MOD_T2_ICEWALL_GLACIAL_SPIRE'],
      provides: ['icewall_dragon_orb', 'golden_general_reputation'],
      requires: ['icewall_expedition_charts'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Blue-green glacial ice carved into razor battlements; howling sub-zero gales; the howling of [[NPC:npc_feal_thas]]\'s winter wolves (`Q_WIN_03B`, `CRUC-14`, `CRUC-25`).\n' +
        'Portal submap: [[Map:map_sub_icewall_castle]].'
    }),
    makeMacroNode({
      id: 'N_SILVANESTI',
      name: 'Silvanesti (The Nightmare Forest of King Lorac)',
      displayName: 'Silvanesti Nightmare Wood',
      x: 545, y: 615,
      cat: 'Hazard',
      culture: 'Clan',
      childMapId: 'map_sub_silvanesti_dream',
      odv: [4, 4, 1],
      faction: 'fac_green_black_wings',
      factionPresence: ['fac_green_black_wings', 'fac_qualinesti_silvanesti', 'fac_companions'],
      modules: ['MOD_T5_LORAC_DREAMSCAPE_MATRIX'],
      provides: ['silvanesti_dragon_orb', 'starjewel_of_alhana'],
      requires: ['silvanesti_griffon_escort'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Weeping trees bleeding crimson sap; green chlorine fog exhaled by [[NPC:npc_cyan_bloodbane]] coiled around the dying throne of [[NPC:npc_lorac]]; reality twisting into personal nightmares (`Q_WIN_03A`, `CRUC-16`).\n' +
        'Portal submap: [[Map:map_sub_silvanesti_dream]].'
    }),
    makeMacroNode({
      id: 'N_SOUTHERN_ERGOTH',
      name: 'Southern Ergoth & Foghaven Valley (Tomb of Huma)',
      displayName: 'Southern Ergoth & Foghaven',
      x: 95, y: 410,
      cat: 'Bastion',
      culture: 'Clan',
      odv: [4, 2, 2],
      faction: 'fac_qualinesti_silvanesti',
      factionPresence: ['fac_qualinesti_silvanesti', 'fac_companions'],
      modules: ['MOD_T3_ERGOTH_DRAGONMETAL_FORGE'],
      provides: ['forged_true_dragonlances', 'silver_dragon_alliance_seed'],
      requires: ['hammer_of_kharas_authority', 'icewall_dragon_orb'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Shrouded mist-canyon concealing the colossal silver dragon statue of Huma\'s Tomb; [[NPC:npc_theros]] hammering white-hot dragonmetal with [[Item:ITM-SILVER-ARM]] and [[Item:ITM-HAMMER-KHARAS]] beside [[NPC:npc_silvara]] (`Q_WIN_03B`, `CRUC-18`).'
    }),
    makeMacroNode({
      id: 'N_SANCRIST',
      name: 'Sancrist Isle (Castle Gunthar & The Whitestone Glade)',
      displayName: 'Sancrist & Whitestone Council',
      x: 115, y: 245,
      cat: 'Bastion',
      culture: 'Hierarchy',
      odv: [3, 1, 4],
      faction: 'fac_solamnia',
      factionPresence: ['fac_solamnia', 'fac_qualinesti_silvanesti', 'fac_thorbardin', 'fac_companions'],
      modules: ['MOD_T1_WHITESTONE_COUNCIL_DIPLOMACY'],
      provides: ['whitestone_alliance_treaty', 'gnome_catapult_schematics'],
      requires: ['forged_true_dragonlances'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* A towering white quartz boulder in awindswept meadow cleaved cleanly in two by [[NPC:npc_tasslehoff]] and [[NPC:npc_fizban]]; Solamnic banners snapping above [[NPC:npc_gunthar]]\'s council hall (`CRUC-15`).'
    }),
    makeMacroNode({
      id: 'N_PALANTHAS',
      name: 'Palanthas (The Ancient City & Great Library of Astinus)',
      displayName: 'Palanthas & Great Library',
      x: 285, y: 120,
      cat: 'Bastion',
      culture: 'Hierarchy',
      odv: [2, 2, 4],
      faction: 'fac_solamnia',
      factionPresence: ['fac_solamnia', 'fac_high_sorcery', 'fac_companions'],
      modules: ['MOD_T5_ASTINUS_CHRONICLE_VAULT'],
      provides: ['astinus_chronicle_prophecy', 'palanthas_dragon_orb_vault', 'tower_of_palanthas_key'],
      requires: [],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Gleaming white marble avenues radiating like a wagon wheel around the cursed black-gated Tower of High Sorcery (`Shoikan Grove`); the silent scriptorium where [[NPC:npc_astinus]] writes with an unblinking quill (`Q_SPR_01`).'
    }),
    makeMacroNode({
      id: 'N_HIGH_CLERIST_TOWER',
      name: 'The High Clerist\'s Tower (West Gate Pass)',
      displayName: 'High Clerist\'s Tower',
      x: 325, y: 165,
      cat: 'Bastion',
      culture: 'Hierarchy',
      childMapId: 'map_sub_high_clerist_tower',
      odv: [2, 1, 4],
      faction: 'fac_solamnia',
      factionPresence: ['fac_solamnia', 'fac_blue_dragonarmy', 'fac_companions'],
      modules: ['MOD_T3_HIGH_CLERIST_DRAGON_TRAP', 'MOD_T4_SOLAMNIC_SCHISM_MEASURE'],
      provides: ['blue_wing_broken_siege', 'parapet_of_sturm_legacy'],
      requires: ['forged_true_dragonlances', 'whitestone_alliance_treaty'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Grim grey-granite fortress engineered as a symmetrical dragon-trap; wind whistling through narrow kill-corridors; the sunlit western parapet where [[NPC:npc_sturm]] raises [[Item:ITM-BRIGHTBLADE]] against [[NPC:npc_kitiara]] and [[NPC:npc_skie]] (`Q_WIN_04`, `CRUC-13`, `CRUC-17`, `CRUC-26`).\n' +
        'Portal submap: [[Map:map_sub_high_clerist_tower]].'
    }),
    makeMacroNode({
      id: 'N_KALAMAN',
      name: 'Kalaman (Northern Port & Allied War Headquarters)',
      displayName: 'Kalaman Port Fortress',
      x: 470, y: 155,
      cat: 'Bastion',
      culture: 'Market',
      odv: [2, 3, 3],
      faction: 'contested',
      factionPresence: ['fac_solamnia', 'fac_blue_dragonarmy', 'fac_companions'],
      provides: ['northern_offensive_supply_line', 'captured_bakaris_leverage'],
      requires: ['blue_wing_broken_siege'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Salt-sprayed stone seawalls overlooking the Turbidus Ocean; flying citadels casting eclipsing shadows over the harbor where [[NPC:npc_laurana]] is lured into [[NPC:npc_lord_soth]]\'s trap (`Q_SPR_02`).'
    }),
    makeMacroNode({
      id: 'N_DARGAARD_KEEP',
      name: 'Dargaard Keep (Citadel of the Death Knight)',
      displayName: 'Dargaard Keep',
      x: 420, y: 185,
      cat: 'Hazard',
      culture: 'Hierarchy',
      odv: [1, 1, 4],
      faction: 'fac_blue_dragonarmy',
      factionPresence: ['fac_blue_dragonarmy'],
      modules: ['MOD_T5_DARGAARD_DEATH_KNIGHT_PACT'],
      provides: ['soth_death_knight_cavalry'],
      requires: [],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Charred black-rose keep perched on a jagged crag in Nightlund; thirteen banshees wailing the curse of [[NPC:npc_lord_soth]] every midnight (`CRUC-21`).'
    }),
    makeMacroNode({
      id: 'N_FLOTSAM',
      name: 'Flotsam (Lawless Blood Sea Corsair Port)',
      displayName: 'Flotsam Port',
      x: 545, y: 235,
      cat: 'Standard POI',
      culture: 'Adhocracy',
      odv: [1, 4, 1],
      faction: 'fac_blue_dragonarmy',
      factionPresence: ['fac_blue_dragonarmy', 'fac_companions'],
      provides: ['perechon_smuggler_berth'],
      requires: [],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Ramshackle taverns smelling of bilge water, pickled herring, and draconian sweat; the docked caravel *Perechon* preparing to sail into the Blood Sea (`Q_SPR_01`).'
    }),
    makeMacroNode({
      id: 'N_BLOOD_SEA',
      name: 'The Blood Sea of Istar (Maelstrom & Sunken Temple)',
      displayName: 'Blood Sea Maelstrom',
      x: 615, y: 280,
      cat: 'Hazard',
      culture: 'Adhocracy',
      childMapId: 'map_sub_neraka_temple', // Note: submap nodes & underwater rooms tracked cleanly
      odv: [3, 4, 2],
      faction: 'contested',
      factionPresence: ['fac_high_sorcery', 'fac_blue_dragonarmy', 'fac_companions'],
      modules: ['MOD_T2_BLOOD_SEA_VORTEX'],
      provides: ['black_robe_transfiguration', 'berem_everman_revelation'],
      requires: ['perechon_smuggler_berth'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Churning crimson whirlpool sucking warships down toward the cracked marble domes of drowned Istar; [[NPC:npc_raistlin]] turning his robes pitch-black under Nuitari\'s gaze (`Q_SPR_01`).'
    }),
    makeMacroNode({
      id: 'N_SANCTION',
      name: 'Sanction (City of the Lords of Doom & Egg Vats)',
      displayName: 'Sanction & Temple of Luerkhisis',
      x: 410, y: 365,
      cat: 'Bastion',
      culture: 'Hierarchy',
      odv: [1, 4, 4],
      faction: 'fac_red_dragonarmy',
      factionPresence: ['fac_red_dragonarmy', 'fac_blue_dragonarmy', 'fac_companions'],
      modules: ['MOD_T3_SANCTION_EGG_FOUNDRIES', 'MOD_T3_LUERKHISIS_CORRUPTION_VATS'],
      provides: ['draconian_army_reinforcements', 'metallic_dragon_oath_breaker'],
      requires: ['silver_clutch_eggshell_evidence'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* Three active volcanoes (Lords of Doom) spewing rivers of orange magma through obsidian canals; the sulfurous vats of the Temple of Luerkhisis where Wyrllish and Dracart corrupt Good Dragon eggs into Draconians (`Q_SPR_02`, `Q_PRE_03`).'
    }),
    makeMacroNode({
      id: 'N_NERAKA',
      name: 'Neraka (The Temple of Darkness & Imperial Encampment)',
      displayName: 'Neraka & Temple of Darkness',
      x: 475, y: 335,
      cat: 'Bastion',
      culture: 'Hierarchy',
      childMapId: 'map_sub_neraka_temple',
      odv: [1, 4, 4],
      faction: 'fac_red_dragonarmy',
      factionPresence: ['fac_red_dragonarmy', 'fac_blue_dragonarmy', 'fac_white_dragonarmy', 'fac_green_black_wings', 'fac_companions'],
      modules: ['MOD_T1_HIGHLORD_COUNCIL_CONCLAVE', 'MOD_T5_NERAKA_FOUNDATION_PORTAL'],
      provides: ['crown_of_power_dominion', 'sealed_abyssal_foundation_gate'],
      requires: ['berem_everman_revelation', 'metallic_dragon_oath_breaker'],
      customNotes:
        '**5D Sensory Pentagon:**\n' +
        '- *Physical:* A twisted, shifting gothic cathedral of black obsidian wrenched from old Istar; 200,000 Dragonarmy soldiers camped across the volcanic valley; the cracked subterranean [[Item:ITM-FOUNDATION-STONE]] pulsing with the five-headed shadow of [[NPC:npc_takhisis]] (`Q_SPR_03`, `CRUC-19`..`CRUC-23`).\n' +
        'Portal submap: [[Map:map_sub_neraka_temple]].'
    })
  ];

  // Calibrate all 25 continental node coordinates to the 2304x1536 Dragonlance Nexus Ansalon map
  // with generous inter-node spacing so pills, Threat Clocks, and titles never collide
  const calibratedCoords = {
    N_SANCRIST:          { x: 295,  y: 625 },
    N_SOUTHERN_ERGOTH:   { x: 580,  y: 830 },
    N_PALANTHAS:         { x: 855,  y: 300 },
    N_HIGH_CLERIST_TOWER:{ x: 925,  y: 415 },
    N_KALAMAN:           { x: 1275, y: 270 },
    N_DARGAARD_KEEP:     { x: 1155, y: 395 },
    N_LANGTREE:          { x: 1120, y: 525 },
    N_HOPES_END:         { x: 1365, y: 465 },
    N_FLOTSAM:           { x: 1700, y: 415 },
    N_BLOOD_SEA:         { x: 1935, y: 520 },
    N_SANCTION:          { x: 1275, y: 690 },
    N_NERAKA:            { x: 1475, y: 625 },
    N_HAVEN:             { x: 735,  y: 840 },
    N_SOLACE:            { x: 910,  y: 790 },
    N_CRYSTALMIR:        { x: 855,  y: 685 },
    N_DARKEN_WOOD:       { x: 985,  y: 885 },
    N_XAK_TSAROTH:       { x: 1130, y: 815 },
    N_GATEWAY:           { x: 1095, y: 945 },
    N_QUALINOST:         { x: 775,  y: 975 },
    N_WAYRETH:           { x: 675,  y: 1095 },
    N_SLA_MORI:          { x: 875,  y: 1055 },
    N_PAX_THARKAS:       { x: 995,  y: 1125 },
    N_DERKIN_TOMB:       { x: 825,  y: 1190 },
    N_THORBARDIN:        { x: 865,  y: 1295 },
    N_TARSIS:            { x: 1065, y: 1290 },
    N_ICEWALL:           { x: 1105, y: 1445 },
    N_SILVANESTI:        { x: 1660, y: 1115 }
  };
  nodes.forEach(n => {
    if (calibratedCoords[n.id]) {
      n.x = calibratedCoords[n.id].x;
      n.y = calibratedCoords[n.id].y;
      n.coordinates = { x: n.x, y: n.y };
    }
  });

  // Fix N_BLOOD_SEA childMapId so all 12 submaps have unique 1:1 parent portals
  const bloodSeaNode = nodes.find(n => n.id === 'N_BLOOD_SEA');
  if (bloodSeaNode) {
    bloodSeaNode.childMapId = null;
    bloodSeaNode.shape = 'diamond';
  }

  // Define 38 undirected / directed corridor pairs
  const edgePairs = [
    ['N_HAVEN', 'N_SOLACE', '35 miles', 'Packed gravel Seeker highway', false, 'Patrolled by Seeker guards and Baaz checkpoints.'],
    ['N_SOLACE', 'N_CRYSTALMIR', '6 miles', 'Autumn vallenwood forest trail', false, 'Escape path from the Inn of the Last Home.'],
    ['N_CRYSTALMIR', 'N_DARKEN_WOOD', '18 miles', 'Misty alpine ridge', false, 'Guarded by spectral centaurs of the Forestmaster.'],
    ['N_DARKEN_WOOD', 'N_XAK_TSAROTH', '28 miles', 'Subterranean mountain pass & black swamp', false, 'Unicorn-guided path into the drowned ruins.'],
    ['N_SOLACE', 'N_GATEWAY', '40 miles', 'Southern plains wagon road', false, 'Route of the Dragonarmy slave-cage caravan.'],
    ['N_GATEWAY', 'N_QUALINOST', '32 miles', 'Qualinesti forest border canopy', false, 'Guarded by Porthios and Gilthanas\'s elven archers.'],
    ['N_HAVEN', 'N_WAYRETH', '75 miles', 'Shifting enchanted forest tracks', false, 'Only opens to those summoned by the Conclave of Wizards.'],
    ['N_SOLACE', 'N_LANGTREE', '55 miles', 'Northern Abanasinian grassland road', false, 'Mercenary recruitment road to Baron Ivor\'s camp.'],
    ['N_LANGTREE', 'N_HOPES_END', '45 miles', 'Khalkist foothill box-canyon pass', false, 'Scorched by the Red Dragon Immolatus in 347 AC.'],
    ['N_QUALINOST', 'N_SLA_MORI', '22 miles', 'Hidden mountain ridge trail', false, 'Requires the royal key or Gilthanas\'s guidance.'],
    ['N_SLA_MORI', 'N_PAX_THARKAS', '3 miles', 'Subterranean crypt & bronze Great Chain', false, 'Bypasses the impregnable curtain walls of Pax Tharkas.'],
    ['N_GATEWAY', 'N_PAX_THARKAS', '48 miles', 'Fortified iron-mine valley highway', true, 'Blocked by Verminaard\'s Red Dragonarmy main gate.'],
    ['N_PAX_THARKAS', 'N_DERKIN_TOMB', '38 miles', 'Kharolis high mountain snow-pass', false, 'Refugee exodus trail pursued by Red Wing scouts.'],
    ['N_PAX_THARKAS', 'N_HOPES_END', '50 miles', 'Mountain valley smuggling track', false, 'Links the Kharolis passes to the scorched frontier.'],
    ['N_DERKIN_TOMB', 'N_THORBARDIN', '15 miles', 'Subterranean Northgate causeway', false, 'Sealed by the dwarven thanes until the Hammer of Kharas returns.'],
    ['N_THORBARDIN', 'N_TARSIS', '110 miles', 'Dust-swept Plains of Dust caravan track', false, 'Ancient trade road to the landlocked port.'],
    ['N_TARSIS', 'N_ICEWALL', '180 miles', 'Frozen southern sea & glacial pack-ice', false, 'Crossed via Ice Folk ice-boats.'],
    ['N_TARSIS', 'N_SILVANESTI', '160 miles', 'Eastern prairie &griffon sky-corridor', false, 'Flown on Alhana Starbreeze\'s griffons.'],
    ['N_ICEWALL', 'N_SOUTHERN_ERGOTH', '240 miles', 'Storm-tossed Sirrion Sea current', false, 'Shipwreck route landing near Foghaven Valley.'],
    ['N_QUALINOST', 'N_SOUTHERN_ERGOTH', '130 miles', 'Straits of Algoni evacuation sea-lane', false, 'Route of the Qualinesti refugee fleet.'],
    ['N_SOUTHERN_ERGOTH', 'N_SANCRIST', '95 miles', 'White-capped western ocean channel', false, 'Voyage of Silvara and Theros Ironfeld to the Whitestone Council.'],
    ['N_SANCRIST', 'N_PALANTHAS', '150 miles', 'Solamnic naval convoy lane', false, 'Protected by the Knights of Solamnia.'],
    ['N_PALANTHAS', 'N_HIGH_CLERIST_TOWER', '30 miles', 'Palanthas-Vingaard mountain pass', false, 'Strategic bottleneck defending Palanthas from the Blue Wing.'],
    ['N_HIGH_CLERIST_TOWER', 'N_KALAMAN', '115 miles', 'Vingaard River campaign highway', false, 'Route of the Golden General\'s counter-offensive.'],
    ['N_HIGH_CLERIST_TOWER', 'N_DARGAARD_KEEP', '65 miles', 'Blighted Nightlund crag-road', false, 'Haunted by Lord Soth\'s skeletal cavaliers.'],
    ['N_KALAMAN', 'N_DARGAARD_KEEP', '55 miles', 'Nightlund border marsh', false, 'Ambush vector for Kitiara\'s Flying Citadel.'],
    ['N_KALAMAN', 'N_FLOTSAM', '85 miles', 'Blood Sea coastal smuggler road', false, 'Occupied by Blue and Red Dragonarmy patrols.'],
    ['N_FLOTSAM', 'N_BLOOD_SEA', '60 miles', 'Crimson whirlpool sea-lane', false, 'Sailed aboard the caravel Perechon.'],
    ['N_BLOOD_SEA', 'N_PALANTHAS', '210 miles', 'Arcane teleportation / coastal return', false, 'Raistlin\'s black-robe escape vector to Astinus\'s Library.'],
    ['N_HOPES_END', 'N_SANCTION', '65 miles', 'Volcanic Khalkist lava-pass', false, 'Secret route used to transport stolen Silver Dragon eggs.'],
    ['N_XAK_TSAROTH', 'N_SANCTION', '55 miles', 'New Sea cliffside military road', false, 'Supply corridor from Sanction to the eastern swamp wings.'],
    ['N_SANCTION', 'N_NERAKA', '48 miles', 'Imperial Dragonarmy highway', false, 'Main artery between the egg vats of Luerkhisis and the Temple of Darkness.'],
    ['N_FLOTSAM', 'N_NERAKA', '90 miles', 'Khalkist high mountain gorge', false, 'Infiltration trail into the Imperial encampment.'],
    ['N_SILVANESTI', 'N_NERAKA', '190 miles', 'Cyan Bloodbane\'s sky-route north', false, 'Aerial corridor linking the green nightmare forest to Neraka.']
  ];

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const links = [];
  const edgeData = {};
  const edgeNotes = {};

  for (const [u, v, distance, terrain, blocked, notes] of edgePairs) {
    const uNode = nodeMap.get(u);
    const vNode = nodeMap.get(v);
    if (!uNode || !vNode) continue;
    if (!uNode.adj.includes(v)) uNode.adj.push(v);
    if (!vNode.adj.includes(u)) vNode.adj.push(u);
    if (!uNode.infBy.includes(v)) uNode.infBy.push(v);
    if (!vNode.infBy.includes(u)) vNode.infBy.push(u);

    links.push({ from: u, to: v, type: 'twoway', layer: 'both' });
    const key = [u, v].sort().join('-');
    edgeData[key] = {
      blocked: !!blocked,
      condition: notes,
      distance,
      terrain,
      conduits: ['Supply Road', 'Patrol Corridor'],
      demographics: { tags: ['Travelers', 'Draconian Scouts'] },
      factionPresence: [uNode.faction, vNode.faction].filter(f => f && f !== 'neutral' && f !== 'contested')
    };
    edgeNotes[key] = `${distance} (${terrain}) — ${notes}`;
  }

  const nodeSlottedModules = {};
  nodes.forEach(n => {
    nodeSlottedModules[n.id] = [...(n.modules || [])];
  });

  return {
    id: 'map_ansalon_continent',
    name: 'Ansalon Continental Pointcrawl (Chronicles of Krynn)',
    scaleTier: 'continent',
    parentMapId: null,
    parentNodeId: null,
    mapMetadata: {
      id: 'map_ansalon_continent',
      name: 'map_ansalon_continent_bg.jpg',
      assetPath: 'assets/map_ansalon_continent_bg.jpg',
      width: 2304,
      height: 1536,
      naturalWidth: 1536,
      naturalHeight: 1024,
      scale: 1,
      x: 0,
      y: 0,
      lockAspect: true,
      opacity: 0.88
    },
    nodes,
    links,
    nodeSlottedModules,
    edgeSlottedModules: {},
    edgeData,
    edgeNotes,
    layers: [
      { id: 'layer-bg', name: 'Background Layer', zIndex: 0, visible: true, locked: false, opacity: 1 },
      { id: 'layer-edges', name: 'Transit Corridors', zIndex: 10, visible: true, locked: false, opacity: 1 },
      { id: 'layer-nodes', name: 'Pointcrawl Nodes', zIndex: 20, visible: true, locked: false, opacity: 1 },
      { id: 'layer-annotations', name: 'GM Annotations', zIndex: 30, visible: true, locked: false, opacity: 1 }
    ],
    shapes: []
  };
}

function makeSubmap(id, name, scaleTier, parentNodeId, roomDefs) {
  const nodes = roomDefs.map((r, idx) => makeMacroNode({
    id: r.id,
    name: r.name,
    displayName: r.name,
    x: r.x || (250 + (idx % 3) * 350),
    y: r.y || (260 + Math.floor(idx / 3) * 300),
    cat: r.cat || 'Standard POI',
    culture: r.culture || 'Hierarchy',
    shape: r.shape || 'circle',
    odv: r.odv || [2, 2, 2],
    faction: r.faction || 'neutral',
    customNotes: r.notes || ''
  }));

  const links = [];
  const edgeData = {};
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  roomDefs.forEach(r => {
    (r.connectsTo || []).forEach(targetId => {
      const u = nodeMap.get(r.id);
      const v = nodeMap.get(targetId);
      if (!u || !v) return;
      if (!u.adj.includes(targetId)) u.adj.push(targetId);
      if (!v.adj.includes(r.id)) v.adj.push(r.id);
      const key = [r.id, targetId].sort().join('-');
      if (!edgeData[key]) {
        links.push({ from: r.id, to: targetId, type: 'twoway', layer: 'transit' });
        edgeData[key] = {
          blocked: false,
          condition: 'Tactical Dungeon / Site Passage',
          distance: 'Interior Corridor',
          terrain: 'Stone / Timber',
          conduits: ['Tactical Chokepoint'],
          demographics: { tags: [] },
          factionPresence: []
        };
      }
    });
  });

  return {
    id,
    name,
    scaleTier,
    parentMapId: 'map_ansalon_continent',
    parentNodeId,
    mapMetadata: {
      id,
      name: `${id}_bg.jpg`,
      assetPath: `assets/${id}_bg.jpg`,
      width: 1200,
      height: 800,
      naturalWidth: 1200,
      naturalHeight: 800,
      scale: 1,
      x: 0,
      y: 0,
      lockAspect: true,
      opacity: 0.88
    },
    nodes,
    links,
    nodeSlottedModules: {},
    edgeSlottedModules: {},
    edgeData,
    edgeNotes: {},
    layers: [
      { id: 'layer-bg', name: 'Background Layer', zIndex: 0, visible: true, locked: false, opacity: 1 },
      { id: 'layer-edges', name: 'Corridors', zIndex: 10, visible: true, locked: false, opacity: 1 },
      { id: 'layer-nodes', name: 'Chambers', zIndex: 20, visible: true, locked: false, opacity: 1 }
    ],
    shapes: []
  };
}

function buildAllSubmaps() {
  return {
    map_sub_solace_inn: makeSubmap('map_sub_solace_inn', 'Solace: The Inn of the Last Home', 'building', 'N_SOLACE', [
      { id: 'SOL-01', name: 'Vallenwood Rope Walkways', x: 250, y: 260, connectsTo: ['SOL-02', 'SOL-04'], notes: 'Suspended rope-and-plank bridges forty feet above the forest floor; Seeker checkpoint below.' },
      { id: 'SOL-02', name: 'Common Taproom & Hearth', x: 600, y: 260, connectsTo: ['SOL-01', 'SOL-03'], notes: 'Otik\'s polished bar, Tika\'s frying pan, and the boulder-hearth where Hederick tumbles into the coals (`Q_AUT_01`).' },
      { id: 'SOL-03', name: 'Otik\'s Kitchen & Root Chute', x: 950, y: 260, connectsTo: ['SOL-02', 'SOL-04'], notes: 'Smells of spiced potatoes and fried onions; secret garbage chute drops 40 feet into the brush for emergency escapes.' },
      { id: 'SOL-04', name: 'Crystalmir Boat Dock Trail', x: 600, y: 560, connectsTo: ['SOL-01', 'SOL-03'], notes: 'Moonlit path leading to the flatbottom ferry across Crystalmir Lake.' }
    ]),
    map_sub_wayreth_tower: makeSubmap('map_sub_wayreth_tower', 'Tower of High Sorcery at Wayreth (The Soulforge)', 'site', 'N_WAYRETH', [
      { id: 'WAY-01', name: 'The Shifting Forest Threshold', x: 250, y: 260, connectsTo: ['WAY-02'], notes: 'Sentient pine and oak trees that part only for Conclave guests (`Q_PRE_01`, `Q_ECHO_01`).' },
      { id: 'WAY-02', name: 'Hall of the Mages & Conclave Mirror', x: 600, y: 260, connectsTo: ['WAY-01', 'WAY-03', 'WAY-04'], notes: 'Par-Salian\'s viewing chamber where Caramon watches Raistlin\'s ordeal.' },
      { id: 'WAY-03', name: 'Spiral of the Three Axioms', x: 950, y: 260, connectsTo: ['WAY-02', 'WAY-04'], notes: 'Dark elves, Liam\'s fireball ambush, and Fistandantilus\'s whispered bargain (`CRUC-03`).' },
      { id: 'WAY-04', name: 'The Soul-Mirror Crucible Chamber', x: 600, y: 560, connectsTo: ['WAY-02', 'WAY-03'], notes: 'The final illusion of Caramon casting magic effortlessly—where Raistlin\'s jealousy is forged (`CRUC-04`).' }
    ]),
    map_sub_hopes_end_siege: makeSubmap('map_sub_hopes_end_siege', 'Hope\'s End: Besieged Valley & Egg Vault', 'site', 'N_HOPES_END', [
      { id: 'HOP-01', name: 'Baron Ivor\'s Siege Lines', x: 250, y: 260, connectsTo: ['HOP-02'], notes: 'Mercenary trebuchets and Horkin\'s command tent (`Q_PRE_02`, `Q_ECHO_02`, `CRUC-05`).' },
      { id: 'HOP-02', name: 'East Gate & Vitrified Ramparts', x: 600, y: 260, connectsTo: ['HOP-01', 'HOP-03', 'HOP-04'], notes: 'Walls melted to black dragon-glass by the ancient red wyrm Immolatus (`CRUC-06`).' },
      { id: 'HOP-03', name: 'Lord Bakaris\'s Keep & Parley Hall', x: 950, y: 260, connectsTo: ['HOP-02', 'HOP-04'], notes: 'Where Kitiara seduces Bakaris and pivots toward Ariakas\'s banner.' },
      { id: 'HOP-04', name: 'Subterranean Silver Clutch Vault', x: 600, y: 560, connectsTo: ['HOP-02', 'HOP-03'], notes: 'Cold stone cellar containing the stolen Silver Dragon Eggshells (`ITM-SILVER-SHARD`, `CRUC-07`).' }
    ]),
    map_sub_xak_tsaroth: makeSubmap('map_sub_xak_tsaroth', 'Xak Tsaroth: The Drowned Ruin & Cavern', 'site', 'N_XAK_TSAROTH', [
      { id: 'XAK-01', name: 'Swamp Causeway & Wicker Dragon Trap', x: 240, y: 240, connectsTo: ['XAK-02'], notes: 'Baaz draconian ambush around a woven reed dragon effigy.' },
      { id: 'XAK-02', name: 'Surface Temple of Mishakal', x: 600, y: 240, connectsTo: ['XAK-01', 'XAK-03'], notes: 'White marble statue of the Goddess of Healing (`CRUC-08`).' },
      { id: 'XAK-03', name: 'The Rusted Chain & Express Trash Chute', x: 960, y: 240, connectsTo: ['XAK-02', 'XAK-04', 'XAK-05'], notes: 'Iron mining buckets descending into the chasm (`CRUC-28`).' },
      { id: 'XAK-04', name: 'Court of Highbulp Phudge & Sunken Library', x: 400, y: 560, connectsTo: ['XAK-03', 'XAK-05'], notes: 'Aghar clan throne room; Bupu leads Raistlin to Fistandantilus\'s spellbook (`CRUC-09`).' },
      { id: 'XAK-05', name: 'Drowned Plaza & Lair of Khisanth', x: 800, y: 560, connectsTo: ['XAK-03', 'XAK-04'], notes: 'Acid-flooded cathedral where Khisanth coils around the Platinum Disks of Mishakal (`Q_AUT_02`).' }
    ]),
    map_sub_sla_mori: makeSubmap('map_sub_sla_mori', 'The Sla-Mori: Secret Royal Crypts', 'building', 'N_SLA_MORI', [
      { id: 'SLA-01', name: 'Camouflaged Cliffside Portal', x: 250, y: 400, connectsTo: ['SLA-02'], notes: 'Seamless counterweighted stone door in the Kharolis rockface.' },
      { id: 'SLA-02', name: 'Hall of the Silent Kings & Slug Lair', x: 600, y: 400, connectsTo: ['SLA-01', 'SLA-03'], notes: 'Elven sarcophagi and the corrosive Giant Slug chokepoint.' },
      { id: 'SLA-03', name: 'The Molten Ore Chasm & Great Bronze Chain', x: 950, y: 400, connectsTo: ['SLA-02'], notes: 'Sixty-foot vertical climb up a heat-slick bronze chain into Pax Tharkas\'s lower furnace room.' }
    ]),
    map_sub_pax_tharkas: makeSubmap('map_sub_pax_tharkas', 'Pax Tharkas: Red Dragonarmy Fortress', 'site', 'N_PAX_THARKAS', [
      { id: 'PAX-01', name: 'Curtain Wall & Great Gate Winch', x: 340, y: 250, connectsTo: ['PAX-02', 'PAX-03'], notes: 'Counterweighted portcullis blocking the mountain pass (`Q_AUT_03`).' },
      { id: 'PAX-02', name: 'Upper Tower Nursery (Flamestrike\'s Roost)', x: 860, y: 250, connectsTo: ['PAX-01', 'PAX-04'], notes: '250 Solace children guarded by the senile red dragon Flamestrike (`CRUC-10`).' },
      { id: 'PAX-03', name: 'Subterranean Iron Mines & Slave Pens', x: 340, y: 550, connectsTo: ['PAX-01', 'PAX-04'], notes: 'Where Elistan and Berem the Everman are held in iron cages.' },
      { id: 'PAX-04', name: 'Highlord Verminaard\'s Audience Sanctum', x: 860, y: 550, connectsTo: ['PAX-02', 'PAX-03'], notes: 'Dark altar where Verminaard wields Nightbringer beside the red dragon Pyros.' }
    ]),
    map_sub_derkin_skullcap: makeSubmap('map_sub_derkin_skullcap', 'Skullcap & Derkin\'s Tomb', 'site', 'N_DERKIN_TOMB', [
      { id: 'DRK-01', name: 'Vitrified Green-Glass Crater', x: 250, y: 400, connectsTo: ['DRK-02'], notes: 'Fistandantilus\'s blast crater haunted by spectral Dwarfgate soldiers (`Q_WIN_01`).' },
      { id: 'DRK-02', name: 'Shadow-Guardian Causeway', x: 600, y: 400, connectsTo: ['DRK-01', 'DRK-03'], notes: 'Where Eben Shatterstone signals the Red Wing ambush (`CRUC-12`).' },
      { id: 'DRK-03', name: 'Vault of the Helm of Grallen', x: 950, y: 400, connectsTo: ['DRK-02'], notes: 'Contains the dwarven royal helm that unlocks Thorbardin\'s trust.' }
    ]),
    map_sub_tarsis_square: makeSubmap('map_sub_tarsis_square', 'Tarsis: Market Square & Red Dragon Inn', 'district', 'N_TARSIS', [
      { id: 'TAR-01', name: 'Dry-Rotted Harbor & Dust Hulls', x: 250, y: 260, connectsTo: ['TAR-02'], notes: 'Ancient galleons marooned in red prairie sand.' },
      { id: 'TAR-02', name: 'Market Square & Magistrate\'s Courthouse', x: 600, y: 260, connectsTo: ['TAR-01', 'TAR-03', 'TAR-04'], notes: 'Where Tas discovers the cracked Dragon Orb in the library basement.' },
      { id: 'TAR-03', name: 'The Red Dragon Inn (Besieged)', x: 950, y: 260, connectsTo: ['TAR-02', 'TAR-04'], notes: 'Strafed by Blue and Red Dragons; the crucible of the Fellowship split (`CRUC-24`).' },
      { id: 'TAR-04', name: 'Alhana\'s Rooftop Griffon Aerie', x: 600, y: 560, connectsTo: ['TAR-02', 'TAR-03'], notes: 'Aerial extraction point toward Silvanesti.' }
    ]),
    map_sub_icewall_castle: makeSubmap('map_sub_icewall_castle', 'Icewall Castle: Glacial Citadel of Feal-Thas', 'site', 'N_ICEWALL', [
      { id: 'ICE-01', name: 'Glacial Crevasse & Walrus-Tusk Tunnels', x: 250, y: 400, connectsTo: ['ICE-02'], notes: 'Slippery ice-tunnels used by the Ice Folk raiders.' },
      { id: 'ICE-02', name: 'Courtyard of the Winter Wolves & Sleet', x: 600, y: 400, connectsTo: ['ICE-01', 'ICE-03'], notes: 'Patrolled by Feal-Thas\'s white wolf pack and the white dragon Sleet (`CRUC-25`).' },
      { id: 'ICE-03', name: 'The Crystal Spire Pedestal (Icewall Orb)', x: 950, y: 400, connectsTo: ['ICE-02'], notes: 'Houses the intact Icewall Dragon Orb (`ITM-DRAGON-ORB-ICEWALL`, `CRUC-14`).' }
    ]),
    map_sub_silvanesti_dream: makeSubmap('map_sub_silvanesti_dream', 'Silvanesti: Lorac\'s Nightmare Tower', 'site', 'N_SILVANESTI', [
      { id: 'SIL-01', name: 'The Bleeding Grove of Hallucinations', x: 250, y: 400, connectsTo: ['SIL-02'], notes: 'Trees weeping blood and conjuring the phantom deaths of the Companions.' },
      { id: 'SIL-02', name: 'Twisted Spire of the Stars', x: 600, y: 400, connectsTo: ['SIL-01', 'SIL-03'], notes: 'Warped quartz tower filled with chlorine gas.' },
      { id: 'SIL-03', name: 'Throne of King Lorac & Cyan Bloodbane', x: 950, y: 400, connectsTo: ['SIL-02'], notes: 'Cyan Bloodbane whispers through the Silvanesti Dragon Orb (`CRUC-16`).' }
    ]),
    map_sub_high_clerist_tower: makeSubmap('map_sub_high_clerist_tower', 'The High Clerist\'s Tower (Dragon-Trap Fortress)', 'site', 'N_HIGH_CLERIST_TOWER', [
      { id: 'HCT-01', name: 'West Gate Field (Derek\'s Folly)', x: 250, y: 260, connectsTo: ['HCT-02'], notes: 'Killing ground outside the gate where Derek Crownguard leads his doomed sally.' },
      { id: 'HCT-02', name: 'Symmetrical Dragon-Trap Kill Corridors', x: 600, y: 260, connectsTo: ['HCT-01', 'HCT-03', 'HCT-04'], notes: 'Narrow stone funnels where lured Blue Dragons are impaled by Dragonlances.' },
      { id: 'HCT-03', name: 'The Sunlit Western Parapet (Sturm\'s Stand)', x: 950, y: 260, connectsTo: ['HCT-02'], notes: 'Where Sturm Brightblade faces Kitiara and Skie against the rising sun (`CRUC-13`).' },
      { id: 'HCT-04', name: 'Lower Vault of the Dragon Orb', x: 600, y: 560, connectsTo: ['HCT-02'], notes: 'Where Laurana battles the mind of the Dragon Orb and Tas guards the crystal (`CRUC-17`, `CRUC-26`).' }
    ]),
    map_sub_neraka_temple: makeSubmap('map_sub_neraka_temple', 'Neraka: The Warped Temple of Darkness', 'site', 'N_NERAKA', [
      { id: 'NER-01', name: 'Dragonarmy Encampment & Highlord Pavilions', x: 250, y: 260, connectsTo: ['NER-02'], notes: 'Kitiara\'s Blue Wing tent and Lord Soth\'s black guard (`CRUC-23`, `CRUC-27`).' },
      { id: 'NER-02', name: 'Great Council Amphitheater (Crown of Power)', x: 600, y: 260, connectsTo: ['NER-01', 'NER-03', 'NER-04'], notes: 'Emperor Ariakas sits enthroned beneath the Crown of Power (`CRUC-19`, `CRUC-21`).' },
      { id: 'NER-03', name: 'Dungeons of Torture & Gakhan\'s Cells', x: 950, y: 260, connectsTo: ['NER-02', 'NER-04'], notes: 'Spiral stairways plunging toward the foundation vaults (`CRUC-29`).' },
      { id: 'NER-04', name: 'Vault of the Cracked Foundation Stone', x: 600, y: 560, connectsTo: ['NER-02', 'NER-03'], notes: 'The evergreen emerald pillar where Jasla\'s spirit waits for Berem to seal Takhisis\'s portal (`CRUC-20`, `CRUC-22`).' }
    ])
  };
}

module.exports = {
  buildMacroAnsalonMap,
  buildAllSubmaps
};
