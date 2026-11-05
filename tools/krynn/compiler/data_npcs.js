/**
 * Shared Dramatis Personae & Companions (42 Canonical Characters & Wyrms)
 * Part of the Deep-Module Compiler for The Chronicles of Krynn (Workstation 2.6)
 */
'use strict';

function makeNpc({
  id, name, role, faction, factionId, culture = 'Clan', nodeId, submapId = 'map_ansalon_continent',
  motivation, status = 'Active', dispositionToParty = 0, fourCornersRole = 'Ally',
  odv = { s: 2, e: 2, c: 2 }, secrets = [], vulnerability, bribe,
  dialogueHooks = [], relationships = [], carriedItemIds = [], notes = ''
}) {
  return {
    id,
    nodeId,
    submapId,
    name,
    role,
    faction,
    factionId,
    culture,
    motivation,
    status,
    dispositionToParty,
    fourCornersRole,
    odv,
    secretsKnown: secrets.map(s => ({ secret: s, revealed: false })),
    leverage: {
      vulnerability: vulnerability || 'Bound by personal code and past scars.',
      bribe: bribe || 'Unmoved by mundane coin; responds to alignment leverage.'
    },
    dialogueHooks,
    relationships: relationships.map(r => ({
      targetNpcId: r.targetNpcId,
      relationshipType: r.type,
      relationship: r.type,
      type: r.type,
      sentiment: r.sentiment,
      notes: r.notes
    })),
    carriedItemIds,
    questIds: [],
    notes
  };
}

function buildNpcs(editionMode) {
  const is346 = editionMode === 'V3_346_AC';

  return [
    // --- CORE EIGHT HEROES OF THE LANCE ---
    makeNpc({
      id: 'npc_tanis',
      name: 'Tanis Half-Elven (Tanthalas)',
      role: 'Reluctant Fellowship Leader & Half-Elven Ranger',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: is346 ? 'N_SOLACE' : 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      motivation: 'Wound: Bastard child of rape rejected by Qualinost. Lie: He belongs to neither world. Want: Hold the fellowship together. Need: Choose authentic commitment (Laurana) over passionate chaos (Kitiara).',
      dispositionToParty: 2,
      fourCornersRole: 'Protagonist',
      odv: { s: 3, e: 2, c: 2 },
      secrets: [
        'Still harbors agonizing guilt over his secret affair with Kitiara before the Five-Year separation.',
        'Was viewed as a bastard outcast ("human in elven eyes, elf in human eyes") in Speaker Solostaran\'s court.'
      ],
      vulnerability: 'Divided heart between Laurana\'s light and Kitiara\'s dark magnetism (`CRUC-19`, `CRUC-27`).',
      bribe: 'Safe passage for the innocent refugees or Laurana\'s freedom.',
      dialogueHooks: [
        'Spoken: "We keep moving together, or we die piecemeal in the trees." | Subtext: I am terrified that my next command will get another friend killed.',
        'Spoken: "Raistlin may be cold, Sturm, but he has saved our lives twice today."'
      ],
      relationships: [
        { targetNpcId: 'npc_laurana', type: 'Ally', sentiment: 95, notes: 'True heart\'s anchor and Golden General.' },
        { targetNpcId: 'npc_kitiara', type: 'Rival', sentiment: 25, notes: 'Former lover, now Blue Dragon Highlord (`CRUC-27`).' },
        { targetNpcId: 'npc_flint', type: 'Ally', sentiment: 100, notes: 'Lifelong mentor and father-figure in Solace.' },
        { targetNpcId: 'npc_sturm', type: 'Ally', sentiment: 90, notes: 'Sworn brother-in-arms.' }
      ]
    }),
    makeNpc({
      id: 'npc_sturm',
      name: 'Sturm Brightblade',
      role: 'Squire of the Crown & Defender of the Measure',
      faction: 'The Knights of Solamnia (Crown, Sword & Rose)',
      factionId: 'fac_solamnia',
      culture: 'Hierarchy',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      motivation: 'Wound: Exile of his father\'s house after the peasant uprising at Castle Brightblade. Lie: Rigid adherence to the written Measure equals true honor. Want: Knighthood restoration. Need: Live and die by the spirit of Est Sularus oth Mithas (`CRUC-13`).',
      dispositionToParty: 2,
      fourCornersRole: 'Protagonist',
      odv: { s: 2, e: 1, c: 4 },
      secrets: [
        'Has never actually been formally knighted by the Solamnic Council despite wearing his father\'s armor and mustache.',
        'Shared a strange, fateful moonlit journey north with Kitiara five years ago.'
      ],
      vulnerability: 'Cannot retreat when common soldiers or allies require a rearguard (`CRUC-13`).',
      bribe: 'Vindication of his father\'s name before the Knighthood.',
      carriedItemIds: ['ITM-BRIGHTBLADE'],
      dialogueHooks: [
        'Spoken: "Est Sularus oth Mithas—my honor is my life." | Subtext: Without this code, I am only an orphaned exile in borrowed plate.',
        'Spoken: "I do not trust the mage\'s hourglass eyes, Tanis."'
      ],
      relationships: [
        { targetNpcId: 'npc_tanis', type: 'Ally', sentiment: 90, notes: 'Closest comrade despite philosophical friction.' },
        { targetNpcId: 'npc_raistlin', type: 'Rival', sentiment: -60, notes: 'Deep moral suspicion of Raistlin\'s dark ambition.' },
        { targetNpcId: 'npc_derek', type: 'Rival', sentiment: -75, notes: 'Accused of dishonor by Lord Derek Crownguard.' },
        { targetNpcId: 'npc_alhana', type: 'Ally', sentiment: 85, notes: 'Bearer of Alhana\'s Starjewel.' }
      ]
    }),
    makeNpc({
      id: 'npc_raistlin',
      name: 'Raistlin Majere',
      role: 'Mage of the Red (later Black) Robes',
      faction: 'The Orders of High Sorcery (Conclave of Wizards)',
      factionId: 'fac_high_sorcery',
      culture: 'Adhocracy',
      nodeId: is346 ? 'N_WAYRETH' : 'N_SOLACE',
      submapId: is346 ? 'map_sub_wayreth_tower' : 'map_sub_solace_inn',
      motivation: 'Wound: Frail body shattered in the Soulforge and lifelong resentment of Caramon\'s effortless strength. Lie: Power over life and death will silence his vulnerability. Want: Master Fistandantilus\'s arcane legacy. Need: Empathy for the weak (Bupu) and recognition of his brother\'s love.',
      dispositionToParty: 1,
      fourCornersRole: 'Shadow',
      odv: { s: 1, e: 4, c: 3 },
      secrets: [
        'Accepted the life-saving blood-pact of the ancient archmage Fistandantilus during the Test at Wayreth (`CRUC-03`).',
        'Murdered the illusory projection of his twin brother Caramon in the final chamber of the Test (`CRUC-04`).'
      ],
      vulnerability: 'Crippling paroxysms of blood-coughing; genuine tenderness toward downtrodden outcasts like Bupu (`Q_AUT_02`).',
      bribe: 'Ancient spellbooks of Fistandantilus (`ITM-FISTANDANTILUS-GRIMOIRE`) and arcane autonomy.',
      carriedItemIds: ['ITM-STAFF-MAGIUS', 'ITM-BLOODSTONE'],
      dialogueHooks: [
        'Spoken (whispered rasp): "Look upon me with your healthy eyes, brother, and tell me what I owe their mercy." | Subtext: Every breath I draw is bought with pain you cannot fathom.',
        'Spoken: "Shirak."'
      ],
      relationships: [
        { targetNpcId: 'npc_caramon', type: 'Family', sentiment: 40, notes: 'Twin brother: fiercely resented yet indispensable shield (`CRUC-04`).' },
        { targetNpcId: 'npc_fistandantilus', type: 'Handler', sentiment: -30, notes: 'Parasitic ancient soul sharing his mind (`CRUC-16`).' },
        { targetNpcId: 'npc_bupu', type: 'Ally', sentiment: 85, notes: 'Gentle compassion for the gully dwarf girl in Xak Tsaroth.' },
        { targetNpcId: 'npc_kitiara', type: 'Family', sentiment: 60, notes: 'Half-sister who respects his ruthless ambition.' }
      ]
    }),
    makeNpc({
      id: 'npc_caramon',
      name: 'Caramon Majere',
      role: 'Veteran Heavy Warrior & Twin Guardian',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: is346 ? 'N_WAYRETH' : 'N_SOLACE',
      submapId: is346 ? 'map_sub_wayreth_tower' : 'map_sub_solace_inn',
      motivation: 'Wound: Witnessing Raistlin\'s broken body at Wayreth and his own repressed horror at what he saw in the Test mirror. Lie: If he just hovers closer, he can save Raistlin\'s soul. Want: Protect Raistlin and win Tika\'s heart. Need: Stand as his own man even when Raistlin walks into the dark.',
      dispositionToParty: 2,
      fourCornersRole: 'Protagonist',
      odv: { s: 4, e: 1, c: 2 },
      secrets: [
        'Represses the memory of watching Raistlin incinerate his illusion inside the Chamber of the Test (`CRUC-04`).'
      ],
      vulnerability: 'Paralyzed whenever forced to choose between the Fellowship\'s survival and Raistlin\'s safety.',
      bribe: 'Herbal tea for Raistlin\'s cough or Otik\'s spiced potatoes.',
      dialogueHooks: [
        'Spoken: "Here, Raist, lean on my arm—I\'ve got the herbal brew simmering." | Subtext: Please don\'t slip away to a place my sword can\'t reach.',
        'Spoken: "Tika? Since when did you learn to swing an iron skillet like that?"'
      ],
      relationships: [
        { targetNpcId: 'npc_raistlin', type: 'Family', sentiment: 95, notes: 'Devoted twin brother.' },
        { targetNpcId: 'npc_tika', type: 'Ally', sentiment: 95, notes: 'True love from the Inn of the Last Home.' },
        { targetNpcId: 'npc_kitiara', type: 'Family', sentiment: 70, notes: 'Half-sister who taught him swordplay.' }
      ]
    }),
    makeNpc({
      id: 'npc_goldmoon',
      name: 'Goldmoon (Chieftain\'s Daughter of the Que-Shu)',
      role: 'First True Cleric of Mishakal',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      motivation: 'Wound: Stoned and exiled by her own Que-Shu tribe when Riverwind presented the Blue Crystal Staff. Lie: She is merely a mortal princess unworthy of divine burden. Want: Prove the truth of the Staff. Need: Become the vessel of Mishakal\'s faith (`CRUC-08`).',
      dispositionToParty: 2,
      fourCornersRole: 'Protagonist',
      odv: { s: 4, e: 1, c: 3 },
      secrets: [
        'Fears that the Blue Crystal Staff will demand Riverwind\'s life or her own in Xak Tsaroth.'
      ],
      vulnerability: 'Unwavering devotion to Riverwind and refusal to leave the wounded behind.',
      carriedItemIds: ['ITM-BLUE-STAFF'],
      dialogueHooks: [
        'Spoken: "The ancient gods did not abandon Krynn—mortals turned their faces from them." | Subtext: If this faith fails in the dark, everything my tribe died for is ash.'
      ],
      relationships: [
        { targetNpcId: 'npc_riverwind', type: 'Family', sentiment: 100, notes: 'Beloved betrothed and sworn protector.' },
        { targetNpcId: 'npc_elistan', type: 'Ally', sentiment: 90, notes: 'Passes the Disks of Mishakal to ordain Elistan.' }
      ]
    }),
    makeNpc({
      id: 'npc_riverwind',
      name: 'Riverwind of the Que-Shu',
      role: 'Plainsman Ranger & Bearer of the Staff from Xak Tsaroth',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      motivation: 'Wound: Delirious fever-journey back from drowned Xak Tsaroth only to be stoned by his people. Want: Shield Goldmoon from both Seekers and Dragonarmies.',
      dispositionToParty: 2,
      fourCornersRole: 'Protagonist',
      odv: { s: 3, e: 1, c: 3 },
      secrets: [
        'Survived the Black Dragon\'s swamp once before through Mishakal\'s intervention, though the fever erased the exact path until Darken Wood.'
      ],
      dialogueHooks: [
        'Spoken: "Keep your hand off the Staff, priest, or lose the arm." | Subtext: I have carried this burden through black acid and death; no charlatan will touch her.'
      ],
      relationships: [
        { targetNpcId: 'npc_goldmoon', type: 'Family', sentiment: 100, notes: 'Sworn love and life-partner.' }
      ]
    }),
    makeNpc({
      id: 'npc_tasslehoff',
      name: 'Tasslehoff Burrfoot',
      role: 'Kender Handler, Cartographer & Accidental Hero',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Adhocracy',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      motivation: 'Wound: Kender immunity to fear masking the crushing sorrow of watching friends die (Flint, Sturm). Want: Map every corner of Ansalon and protect his friends. Need: Learn that some fragile things—and mortal lives—cannot be put back together once broken.',
      dispositionToParty: 2,
      fourCornersRole: 'Protagonist',
      odv: { s: 4, e: 4, c: 1 },
      secrets: [
        'Inadvertently "borrowed" the teleportation ring, Glasses of True Seeing, and key maps that unlock half the campaign\'s bottlenecks.'
      ],
      carriedItemIds: ['ITM-HOOPAK-TAS'],
      dialogueHooks: [
        'Spoken: "Oh, is that yours? It must have fallen into my pouch so you wouldn\'t lose it!" | Subtext: Please don\'t leave me behind—you are my whole family.'
      ],
      relationships: [
        { targetNpcId: 'npc_flint', type: 'Ally', sentiment: 100, notes: 'Inseparable grumpy-dwarf and kender duo.' },
        { targetNpcId: 'npc_fizban', type: 'Ally', sentiment: 100, notes: 'Best friend of the befuddled old wizard in the battered hat.' }
      ]
    }),
    makeNpc({
      id: 'npc_flint',
      name: 'Flint Fireforge',
      role: 'Neidar Hill Dwarf Metalsmith & Elder Companion',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'N_SOLACE',
      submapId: 'map_sub_solace_inn',
      motivation: 'Wound: Trauma from the Dwarfgate War and being trapped in a rotting boat on Crystalmir Lake. Want: Keep "the youngsters" alive while grumbling about every step.',
      dispositionToParty: 2,
      fourCornersRole: 'Protagonist',
      odv: { s: 3, e: 1, c: 3 },
      secrets: [
        'Suffers from a worsening heart condition (`rheumatiz`) as the march approaches Godshome and Neraka.'
      ],
      dialogueHooks: [
        'Spoken: "Bah! Half-baked elves, doorknob-stealing kender, and a leaking tub of a boat!" | Subtext: I would die on this shore before letting a hair on their heads be harmed.'
      ],
      relationships: [
        { targetNpcId: 'npc_tanis', type: 'Ally', sentiment: 100, notes: 'Treated Tanis as a son in Solace.' },
        { targetNpcId: 'npc_tasslehoff', type: 'Ally', sentiment: 100, notes: 'Beloved kender companion.' }
      ]
    }),

    // --- EXPANDED COMPANIONS & KEY ALLIES ---
    makeNpc({
      id: 'npc_laurana',
      name: 'Laurana (Lauralanthalasa / The Golden General)',
      role: 'Qualinesti Princess & Supreme Allied Commander',
      faction: 'The Elven Kingdoms in Exile (Qualinesti & Silvanesti)',
      factionId: 'fac_qualinesti_silvanesti',
      culture: 'Clan',
      nodeId: 'N_QUALINOST',
      submapId: 'map_ansalon_continent',
      motivation: 'Wound: Dismissed as a spoiled royal child by Tanis and her brothers. Growth: Evolves through the fires of Pax Tharkas, Icewall (`CRUC-25`), and the High Clerist\'s Tower (`CRUC-17`) into the Golden General of the Whitestone armies.',
      dispositionToParty: 2,
      fourCornersRole: 'Protagonist',
      odv: { s: 4, e: 3, c: 3 },
      secrets: [
        'Only her fierce love and desperate anger allow her to overpower the Icewall Dragon Orb (`CRUC-17`).'
      ],
      dialogueHooks: [
        'Spoken: "Do not speak to me as a child in Qualinost—I have buried my friends in the snow of the Tower." | Subtext: Even if Tanis breaks my heart, I will not let these soldiers die.'
      ],
      relationships: [
        { targetNpcId: 'npc_tanis', type: 'Ally', sentiment: 95, notes: 'Childhood betrothed and adult equal.' },
        { targetNpcId: 'npc_sturm', type: 'Ally', sentiment: 95, notes: 'Fought side-by-side at the High Clerist\'s Tower.' },
        { targetNpcId: 'npc_kitiara', type: 'Rival', sentiment: -100, notes: 'Mortal military and romantic nemesis (`CRUC-21`).' }
      ]
    }),
    makeNpc({
      id: 'npc_tika',
      name: 'Tika Waylan',
      role: 'Barmaid-Turned-Shieldmaiden of Solace',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'SOL-02',
      submapId: 'map_sub_solace_inn',
      motivation: 'Defend her home at the Inn of the Last Home, survive the slave caravan, and help Caramon grow beyond Raistlin\'s shadow.',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 4, e: 2, c: 1 },
      dialogueHooks: [
        'Spoken: "Keep your eyes on the draconians, Caramon, or you\'ll taste this skillet next!"'
      ],
      relationships: [
        { targetNpcId: 'npc_caramon', type: 'Ally', sentiment: 95, notes: 'Beloved warrior partner.' },
        { targetNpcId: 'npc_otik', type: 'Superior', sentiment: 90, notes: 'Adoptive father at the Inn of the Last Home.' }
      ]
    }),
    makeNpc({
      id: 'npc_gilthanas',
      name: 'Gilthanas',
      role: 'Qualinesti Prince, Fighter/Mage & Envoy to Sanction',
      faction: 'The Elven Kingdoms in Exile (Qualinesti & Silvanesti)',
      factionId: 'fac_qualinesti_silvanesti',
      culture: 'Hierarchy',
      nodeId: 'N_QUALINOST',
      submapId: 'map_ansalon_continent',
      motivation: 'Save his people during the Qualinesti exodus and uncover the secret of the corrupted Good Dragon eggs in Sanction alongside Silvara (`Q_SPR_02`).',
      dispositionToParty: 1,
      fourCornersRole: 'Ally',
      odv: { s: 3, e: 2, c: 3 },
      relationships: [
        { targetNpcId: 'npc_silvara', type: 'Ally', sentiment: 100, notes: 'Falls in love with the silver dragon Silvara.' },
        { targetNpcId: 'npc_laurana', type: 'Family', sentiment: 90, notes: 'Protective older brother.' }
      ]
    }),
    makeNpc({
      id: 'npc_silvara',
      name: 'Silvara (D\'Argent\'s Sister — Silver Dragon)',
      role: 'Silver Dragon in Kagonesti Elven Guise',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'N_SOUTHERN_ERGOTH',
      submapId: 'map_ansalon_continent',
      motivation: 'Guide the heroes to the Tomb of Huma (`CRUC-18`) and infiltrate Sanction\'s Temple of Luerkhisis to free the Metallic Dragons from their coerced neutrality oath (`Q_SPR_02`).',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 4, e: 3, c: 2 },
      secrets: [
        'Is in truth a gleaming adult Silver Dragon whose sister D\'Argent\'s eggs were stolen at Hope\'s End (`Q_PRE_02`, `Q_ECHO_02`).'
      ],
      dialogueHooks: [
        'Spoken: "Our children are held hostage beneath the smoking mountains—if we fly to war, they die."'
      ],
      relationships: [
        { targetNpcId: 'npc_gilthanas', type: 'Ally', sentiment: 100, notes: 'Star-crossed love between elf and silver dragon.' }
      ]
    }),
    makeNpc({
      id: 'npc_fizban',
      name: 'Fizban the Fabulous (Paladine\'s Mortal Avatar)',
      role: 'Befuddled Old Wizard in a Battered Mouse-Colored Hat',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Adhocracy',
      nodeId: 'PAX-03',
      submapId: 'map_sub_pax_tharkas',
      motivation: 'Nudge mortal free will at key fulcrums (Pax Tharkas, the Whitestone Council, and Sanction) without violating the High God\'s cosmic compact against direct divine tyranny.',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 4, e: 4, c: 1 },
      secrets: [
        'Is the earthly avatar of Paladine (the Platinum Dragon), opposite number to Takhisis.'
      ],
      dialogueHooks: [
        'Spoken: "Fireball! Wait—no, how does that feather-fall word go again? My hat!" | Subtext: Every apparent accident places the exact stone where destiny requires it.'
      ],
      relationships: [
        { targetNpcId: 'npc_tasslehoff', type: 'Ally', sentiment: 100, notes: 'Kindred spirit and protector of Tas.' }
      ]
    }),
    makeNpc({
      id: 'npc_elistan',
      name: 'Elistan',
      role: 'Former Seeker High Elder & First Patriarch of Paladine',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'PAX-03',
      submapId: 'map_sub_pax_tharkas',
      motivation: 'Seek authentic truth beyond the hollow Seeker bureaucracy, convert upon reading the Disks of Mishakal (`Q_AUT_03`), and shepherd the 800 Solace refugees.',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 4, e: 2, c: 3 },
      dialogueHooks: [
        'Spoken: "All my life I sought the gods in taxes and parchment, and found them in a slave cage."'
      ]
    }),
    makeNpc({
      id: 'npc_theros',
      name: 'Theros Ironfeld',
      role: 'Silver-Armed Master Blacksmith of Solace',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'N_SOUTHERN_ERGOTH',
      submapId: 'map_ansalon_continent',
      motivation: 'Use the Silver Arm of Ergoth and the Hammer of Kharas to forge the True Dragonlances (`Q_WIN_03B`) and throw the first lance through the Whitestone on Sancrist (`CRUC-15`).',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 3, e: 2, c: 3 },
      carriedItemIds: ['ITM-SILVER-ARM']
    }),
    makeNpc({
      id: 'npc_alhana',
      name: 'Princess Alhana Starbreeze',
      role: 'Regent of the Exiled Silvanesti & Griffon Commander',
      faction: 'The Elven Kingdoms in Exile (Qualinesti & Silvanesti)',
      factionId: 'fac_qualinesti_silvanesti',
      culture: 'Hierarchy',
      nodeId: 'TAR-04',
      submapId: 'map_sub_tarsis_square',
      motivation: 'Rescue her father King Lorac from the nightmare forest of Silvanesti (`Q_WIN_03A`) and preserve the Silvanesti line.',
      dispositionToParty: 1,
      fourCornersRole: 'Ally',
      odv: { s: 2, e: 1, c: 4 },
      carriedItemIds: ['ITM-STARJEWEL'],
      relationships: [
        { targetNpcId: 'npc_lorac', type: 'Family', sentiment: 100, notes: 'Devoted daughter of Speaker Lorac.' },
        { targetNpcId: 'npc_sturm', type: 'Ally', sentiment: 85, notes: 'Bestows the Starjewel upon Sturm.' }
      ]
    }),
    makeNpc({
      id: 'npc_lorac',
      name: 'Speaker Lorac Caladon',
      role: 'Tragic Speaker of the Stars of Silvanesti',
      faction: 'The Elven Kingdoms in Exile (Qualinesti & Silvanesti)',
      factionId: 'fac_qualinesti_silvanesti',
      culture: 'Hierarchy',
      nodeId: 'SIL-03',
      submapId: 'map_sub_silvanesti_dream',
      motivation: 'Free his mind from Cyan Bloodbane\'s Dragon Orb nightmare before dying in his daughter\'s arms (`Q_WIN_03A`, `CRUC-16`).',
      dispositionToParty: 1,
      fourCornersRole: 'Outcast',
      odv: { s: 3, e: 1, c: 4 },
      carriedItemIds: ['ITM-DRAGON-ORB-SILVANESTI']
    }),
    makeNpc({
      id: 'npc_bupu',
      name: 'Bupu of the Bulp Clan',
      role: 'Aghar Gully Dwarf Guide of Xak Tsaroth',
      faction: 'The Kingdom of Thorbardin (Council of Thanes)',
      factionId: 'fac_thorbardin',
      culture: 'Clan',
      nodeId: 'XAK-04',
      submapId: 'map_sub_xak_tsaroth',
      motivation: 'Help the "pretty gold-skin man" (Raistlin) who spoke kindly to her find the secret lift and Fistandantilus\'s spellbook (`Q_AUT_02`, `CRUC-09`).',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 4, e: 2, c: 1 }
    }),
    makeNpc({
      id: 'npc_sestun',
      name: 'Sestun',
      role: 'Outcast Gully Dwarf Guide of Pax Tharkas & Thorbardin',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'PAX-03',
      submapId: 'map_sub_pax_tharkas',
      motivation: 'Guide the Companions through the furnace chutes of Pax Tharkas and the hidden Northgate of Thorbardin (`Q_AUT_03`, `Q_WIN_01`).',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 4, e: 2, c: 1 }
    }),
    makeNpc({
      id: 'npc_berem',
      name: 'Berem the Everman (The Green Gemstone Man)',
      role: 'Immortal Mute Wanderer & Living Key to Takhisis\'s Portal',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'PAX-03',
      submapId: 'map_sub_pax_tharkas',
      motivation: 'Flee the Dragonarmies until he learns that his sister Jasla\'s spirit waits at the Foundation Stone in Neraka, where his willing death will seal Takhisis out of Krynn (`CRUC-22`, `CRUC-29`).',
      dispositionToParty: 1,
      fourCornersRole: 'Outcast',
      odv: { s: 3, e: 3, c: 1 },
      carriedItemIds: ['ITM-GREEN-GEMSTONE-BEREM'],
      secrets: [
        'Three hundred years ago, in greed, he pried an emerald from the Foundation Stone in Istar, accidentally killing his devout sister Jasla; her forgiving spirit blocks Takhisis\'s entry so long as Berem stays away—or until they reunite in forgiveness (`Q_SPR_03`).'
      ]
    }),
    makeNpc({
      id: 'npc_otik',
      name: 'Otik Sandath',
      role: 'Proprietor of the Inn of the Last Home',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'SOL-02',
      submapId: 'map_sub_solace_inn',
      motivation: 'Keep the hearth warm in Solace, protect his adoptive daughter Tika, and serve the finest spiced potatoes in Abanasinia.',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 3, e: 1, c: 2 }
    }),
    makeNpc({
      id: 'npc_forestmaster',
      name: 'The Forestmaster of Darken Wood',
      role: 'Immortal Unicorn Monarch of Darken Wood',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Clan',
      nodeId: 'N_DARKEN_WOOD',
      submapId: 'map_ansalon_continent',
      motivation: 'Test the bearers of the Blue Crystal Staff and speed them across the mountains to Xak Tsaroth before Verminaard\'s armies close the net (`Q_AUT_01`).',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 4, e: 1, c: 3 }
    }),
    makeNpc({
      id: 'npc_par_salian',
      name: 'Par-Salian',
      role: 'Head of the White Robes & Master of the Conclave',
      faction: 'The Orders of High Sorcery (Conclave of Wizards)',
      factionId: 'fac_high_sorcery',
      culture: 'Hierarchy',
      nodeId: 'WAY-02',
      submapId: 'map_sub_wayreth_tower',
      motivation: 'Forge a mage ruthless enough to stand against the coming Dark Queen—even at the cost of shattering young Raistlin\'s body and letting Fistandantilus touch his soul (`Q_PRE_01`, `Q_ECHO_01`, `CRUC-03`).',
      dispositionToParty: 1,
      fourCornersRole: 'Ally',
      odv: { s: 2, e: 2, c: 4 },
      secrets: [
        'Deliberately permitted Fistandantilus\'s vestige into Raistlin\'s Test of High Sorcery and gave Raistlin hourglass eyes so he would learn compassion for the dying.'
      ]
    }),
    makeNpc({
      id: 'npc_antimodes',
      name: 'Antimodes',
      role: 'White Robe Wizard & Secret Patron of Raistlin',
      faction: 'The Orders of High Sorcery (Conclave of Wizards)',
      factionId: 'fac_high_sorcery',
      culture: 'Clan',
      nodeId: 'N_HAVEN',
      submapId: 'map_ansalon_continent',
      motivation: 'Sponsor Raistlin\'s tuition in Haven, investigate the dark rumors in the north, and guide the twins to Wayreth (`Q_PRE_01`).',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 3, e: 2, c: 3 }
    }),
    makeNpc({
      id: 'npc_astinus',
      name: 'Astinus of Palanthas',
      role: 'Immortal Chronicler of the Great Library (Gilean\'s Avatar)',
      faction: 'The Orders of High Sorcery (Conclave of Wizards)',
      factionId: 'fac_high_sorcery',
      culture: 'Hierarchy',
      nodeId: 'N_PALANTHAS',
      submapId: 'map_ansalon_continent',
      motivation: 'Record every breath of time in the Iconochronos without interference—while recognizing Raistlin as the returning shadow of Fistandantilus ("Greetings, old friend") (`Q_SPR_01`).',
      dispositionToParty: 0,
      fourCornersRole: 'Outcast',
      odv: { s: 1, e: 1, c: 4 }
    }),
    makeNpc({
      id: 'npc_gunthar',
      name: 'Lord Gunthar Uth Wistan',
      role: 'Lord of the Rose & Leader of the Solamnic Reformers',
      faction: 'The Knights of Solamnia (Crown, Sword & Rose)',
      factionId: 'fac_solamnia',
      culture: 'Hierarchy',
      nodeId: 'N_SANCRIST',
      submapId: 'map_ansalon_continent',
      motivation: 'Vindicate Sturm Brightblade\'s honor, outmaneuver Derek Crownguard\'s rigid faction, and forge the Whitestone Alliance with elves and dwarves (`CRUC-15`).',
      dispositionToParty: 2,
      fourCornersRole: 'Ally',
      odv: { s: 3, e: 2, c: 4 }
    }),
    makeNpc({
      id: 'npc_horkin',
      name: 'Captain Horkin',
      role: 'Veteran Mercenary Commander at Langtree & Hope\'s End',
      faction: 'The Heroes of the Lance & Whitestone Vanguard',
      factionId: 'fac_companions',
      culture: 'Market',
      nodeId: 'N_LANGTREE',
      submapId: 'map_ansalon_continent',
      motivation: 'Drill raw recruits (including young Caramon and Raistlin) into disciplined war-fighters and mutiny against Baron Ivor when ordered to butcher the innocents of Hope\'s End (`Q_PRE_02`, `CRUC-05`).',
      dispositionToParty: 1,
      fourCornersRole: 'Ally',
      odv: { s: 2, e: 3, c: 3 }
    }),

    // --- DRAGON HIGHLORDS, ANTAGONISTS & FOILS ---
    makeNpc({
      id: 'npc_kitiara',
      name: 'Dragon Highlord Kitiara Uth Matar (The Blue Lady)',
      role: 'Commander of the Blue Dragonarmy & Half-Sister to the Twins',
      faction: 'The Blue Dragonarmy (Wing of the Blue Lady)',
      factionId: 'fac_blue_dragonarmy',
      culture: 'Market',
      nodeId: is346 ? 'HOP-03' : 'N_DARGAARD_KEEP',
      submapId: is346 ? 'map_sub_hopes_end_siege' : 'map_ansalon_continent',
      motivation: 'Wound: Poverty after Gregor Uth Matar\'s abandonment and Rosamun\'s trances. Want: Supreme military command of Ansalon (`CRUC-23`) and possessive dominion over Tanis (`CRUC-27`) while protecting her twin brothers in her own ruthless way.',
      dispositionToParty: -1,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 3 },
      secrets: [
        'Struck a secret bargain with the Red Dragon Immolatus at Hope\'s End in 347 AC (`CRUC-06`) and later forged a soul-trade pact with Lord Soth (`CRUC-21`) to overthrow Emperor Ariakas.'
      ],
      dialogueHooks: [
        'Spoken (Crooked smile): "Come ride beside me on Skie, Tanis—why die for ungrateful elves when we can rule the world?"'
      ],
      relationships: [
        { targetNpcId: 'npc_raistlin', type: 'Family', sentiment: 70, notes: 'Raised Raistlin and respects his cold intellect.' },
        { targetNpcId: 'npc_caramon', type: 'Family', sentiment: 70, notes: 'Trained Caramon with the blade.' },
        { targetNpcId: 'npc_tanis', type: 'Rival', sentiment: 50, notes: 'Possessive former lover (`CRUC-27`).' },
        { targetNpcId: 'npc_ariakas', type: 'Superior', sentiment: -80, notes: 'Secretly plotting to assassinate Emperor Ariakas (`CRUC-23`).' },
        { targetNpcId: 'npc_lord_soth', type: 'Ally', sentiment: 40, notes: 'Promised Laurana\'s soul in exchange for Soth\'s aid (`CRUC-21`).' }
      ]
    }),
    makeNpc({
      id: 'npc_ariakas',
      name: 'Emperor Ariakas',
      role: 'Supreme Commander of the Dragonarmies & Wearer of the Crown of Power',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Hierarchy',
      nodeId: 'NER-02',
      submapId: 'map_sub_neraka_temple',
      motivation: 'Rule Ansalon as Takhisis\'s mortal Emperor, hunt down the Green Gemstone Man (`CRUC-29`), and crush any rival Highlord (`Q_SPR_03`, `CRUC-19`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 4 },
      carriedItemIds: ['ITM-CROWN-POWER'],
      secrets: [
        'His impenetrable arcane force-field in the Council Hall can be dropped instantly by a Black Robe counter-sigil known to Raistlin.'
      ]
    }),
    makeNpc({
      id: 'npc_verminaard',
      name: 'Dragon Highlord Verminaard of Nidus',
      role: 'Dark Cleric of Takhisis & Commander of the Red Wing at Pax Tharkas',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Hierarchy',
      nodeId: 'PAX-04',
      submapId: 'map_sub_pax_tharkas',
      motivation: 'Extinguish the Blue Crystal Staff, enslave Abanasinia in the Pax Tharkas iron mines, and crush Qualinost before Ariakas questions his zeal (`Q_AUT_03`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 2, c: 4 },
      carriedItemIds: ['ITM-NIGHTBRINGER'],
      secrets: [
        'His fanatical arrogance blinds him to Pyros\'s growing resentment and the secret Sla-Mori bronze chain entrance.'
      ]
    }),
    makeNpc({
      id: 'npc_feal_thas',
      name: 'Dragon Highlord Feal-Thas',
      role: 'Silvanesti Dark-Elf Necromancer & White Highlord of Icewall',
      faction: 'The White Dragonarmy (Glacial Wing)',
      factionId: 'fac_white_dragonarmy',
      culture: 'Hierarchy',
      nodeId: 'ICE-02',
      submapId: 'map_sub_icewall_castle',
      motivation: 'Guard the Icewall Dragon Orb with his winter wolf packs and Sleet (`Q_WIN_03B`, `CRUC-14`, `CRUC-25`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 3, c: 3 },
      carriedItemIds: ['ITM-DRAGON-ORB-ICEWALL']
    }),
    makeNpc({
      id: 'npc_bakaris',
      name: 'Lord Bakaris',
      role: 'Corrupt Noble of Hope\'s End & Blue Wing Sub-Commander',
      faction: 'The Blue Dragonarmy (Wing of the Blue Lady)',
      factionId: 'fac_blue_dragonarmy',
      culture: 'Market',
      nodeId: is346 ? 'HOP-03' : 'TAR-03',
      submapId: is346 ? 'map_sub_hopes_end_siege' : 'map_sub_tarsis_square',
      motivation: 'Betray Hope\'s End for Kitiara\'s favor (`Q_PRE_02`), lead the street arrests in Tarsis (`Q_WIN_02`), and claim Laurana as his personal trophy (`Q_SPR_02`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 2 }
    }),
    makeNpc({
      id: 'npc_lord_soth',
      name: 'Lord Loren Soth (Knight of the Black Rose)',
      role: 'Undead Death Knight of Dargaard Keep',
      faction: 'The Blue Dragonarmy (Wing of the Blue Lady)',
      factionId: 'fac_blue_dragonarmy',
      culture: 'Hierarchy',
      nodeId: 'N_DARGAARD_KEEP',
      submapId: 'map_ansalon_continent',
      motivation: 'Possess the radiant elven soul of Laurana to spite his ancient curse and Kitiara\'s bargain (`Q_SPR_02`, `CRUC-21`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 1, c: 4 }
    }),
    makeNpc({
      id: 'npc_toede',
      name: 'Fewmaster Toede',
      role: 'Cowardly Hobgoblin Fewmaster (later Dragon Highlord of Flotsam)',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Market',
      nodeId: 'N_SOLACE',
      submapId: 'map_ansalon_continent',
      motivation: 'Avoid Verminaard\'s mace while hunting the Blue Crystal Staff and failing upward into high command.',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 3, c: 2 }
    }),
    makeNpc({
      id: 'npc_hederick',
      name: 'High Theocrat Hederick of Solace',
      role: 'Pompous Seeker Magistrate of Solace',
      faction: 'The High Seekers of Haven & Cult of Belzor',
      factionId: 'fac_seeker_theocracy',
      culture: 'Hierarchy',
      nodeId: 'SOL-02',
      submapId: 'map_sub_solace_inn',
      motivation: 'Enforce Seeker orthodoxy until Goldmoon heals his burned hands at the Inn of the Last Home (`Q_AUT_01`).',
      dispositionToParty: -1,
      fourCornersRole: 'Outcast',
      odv: { s: 1, e: 1, c: 4 }
    }),
    makeNpc({
      id: 'npc_derek',
      name: 'Lord Derek Crownguard',
      role: 'Knight of the Rose & Legalist Rival to Sturm',
      faction: 'The Knights of Solamnia (Crown, Sword & Rose)',
      factionId: 'fac_solamnia',
      culture: 'Hierarchy',
      nodeId: 'N_TARSIS',
      submapId: 'map_sub_tarsis_square',
      motivation: 'Seize the Grand Mastership from Gunthar, disgrace Sturm Brightblade, and lead a glory-charge outside the High Clerist\'s Tower (`CRUC-13`, `CRUC-15`).',
      dispositionToParty: -1,
      fourCornersRole: 'Shadow',
      odv: { s: 1, e: 1, c: 4 }
    }),
    makeNpc({
      id: 'npc_eben',
      name: 'Eben Shatterstone',
      role: 'Dispossessed Noble & Secret Red Wing Traitor',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Market',
      nodeId: 'PAX-03',
      submapId: 'map_sub_pax_tharkas',
      motivation: 'Infiltrate the Pax Tharkas refugee march, steal the Helm of Grallen, and sell Berem and the Companions to Verminaard (`CRUC-12`).',
      dispositionToParty: 0,
      fourCornersRole: 'Shadow',
      odv: { s: 1, e: 4, c: 1 },
      secrets: [
        'Is on Verminaard\'s payroll and secretly marks the mountain trail toward Derkin\'s Tomb for Red Wing trackers (`CRUC-12`).'
      ]
    }),
    makeNpc({
      id: 'npc_fistandantilus',
      name: 'Fistandantilus (The Ancient Dark One)',
      role: 'Spectral Archmage Vestige in the Soulforge & Skullcap',
      faction: 'The Orders of High Sorcery (Conclave of Wizards)',
      factionId: 'fac_high_sorcery',
      culture: 'Adhocracy',
      nodeId: 'WAY-03',
      submapId: 'map_sub_wayreth_tower',
      motivation: 'Anchor his immortal soul inside young Raistlin Majere during the Test of High Sorcery (`CRUC-03`) and consume Raistlin\'s ego in Silvanesti (`CRUC-16`).',
      dispositionToParty: -2,
      fourCornersRole: 'Shadow',
      odv: { s: 1, e: 4, c: 4 }
    }),
    makeNpc({
      id: 'npc_baron_ivor',
      name: 'Mad Baron Ivor of Langtree',
      role: 'Ruthless Mercenary Warlord of the 347 AC Hope\'s End Campaign',
      faction: 'The High Seekers of Haven & Cult of Belzor',
      factionId: 'fac_seeker_theocracy',
      culture: 'Hierarchy',
      nodeId: 'HOP-01',
      submapId: 'map_sub_hopes_end_siege',
      motivation: 'Crush the tax revolt at Hope\'s End regardless of civilian slaughter while unknowingly serving as a distraction for the Red Dragon Immolatus (`Q_PRE_02`, `CRUC-05`).',
      dispositionToParty: -1,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 3, c: 4 }
    }),
    makeNpc({
      id: 'npc_widow_judith',
      name: 'Widow Judith of Haven',
      role: 'Fanatical High Priestess of the False God Belzor',
      faction: 'The High Seekers of Haven & Cult of Belzor',
      factionId: 'fac_seeker_theocracy',
      culture: 'Hierarchy',
      nodeId: 'N_HAVEN',
      submapId: 'map_ansalon_continent',
      motivation: 'Use flash-powder miracles to rule Haven and persecute the Majere family until exposed by young Raistlin (`Q_PRE_01`, `CRUC-02`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 2, c: 4 }
    }),
    makeNpc({
      id: 'npc_theobald',
      name: 'Master Theobald',
      role: 'Mediocre Schoolmaster of Magic in Haven',
      faction: 'The Orders of High Sorcery (Conclave of Wizards)',
      factionId: 'fac_high_sorcery',
      culture: 'Hierarchy',
      nodeId: 'N_HAVEN',
      submapId: 'map_ansalon_continent',
      motivation: 'Suppress young Raistlin\'s frightening natural genius beneath rote memorization (`CRUC-01`).',
      dispositionToParty: -1,
      fourCornersRole: 'Outcast',
      odv: { s: 1, e: 1, c: 4 }
    }),
    makeNpc({
      id: 'npc_liam',
      name: 'Liam of Haven',
      role: 'Arrogant Rival Apprentice at the Test of Wayreth',
      faction: 'The Orders of High Sorcery (Conclave of Wizards)',
      factionId: 'fac_high_sorcery',
      culture: 'Market',
      nodeId: 'WAY-03',
      submapId: 'map_sub_wayreth_tower',
      motivation: 'Destroy Raistlin during the Test of High Sorcery—forcing Raistlin into Fistandantilus\'s bargain (`Q_PRE_01`, `CRUC-03`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 2 }
    }),
    makeNpc({
      id: 'npc_dracart',
      name: 'High Cleric Dracart & Gakhan',
      role: 'Chief Torturer & Dark Inquisitor of Neraka',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Hierarchy',
      nodeId: 'NER-03',
      submapId: 'map_sub_neraka_temple',
      motivation: 'Extract the Green Gemstone from Berem\'s chest on the Foundation Altar (`CRUC-22`, `CRUC-29`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 3, c: 4 }
    }),
    makeNpc({
      id: 'npc_gakhan',
      name: 'Gakhan',
      role: 'Sadistic Shadow-Assassin of Neraka',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Adhocracy',
      nodeId: 'NER-03',
      submapId: 'map_sub_neraka_temple',
      motivation: 'Hunt intruders in the subterranean corridors between the torture cells and the Foundation Stone (`Q_SPR_03`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 2 }
    }),

    // --- NAMED DRAGONS & COSMIC POWERS ---
    makeNpc({
      id: 'npc_khisanth',
      name: 'Khisanth (Onyx — Ancient Black Dragon)',
      role: 'Guardian of the Sunken Plaza of Xak Tsaroth',
      faction: 'The Green & Black Dragonarmies (Swamp & Dream Wings)',
      factionId: 'fac_green_black_wings',
      culture: 'Adhocracy',
      nodeId: 'XAK-05',
      submapId: 'map_sub_xak_tsaroth',
      motivation: 'Guard the Disks of Mishakal in the acid-flooded plaza until confronted by Goldmoon\'s Blue Crystal Staff (`Q_AUT_02`, `CRUC-08`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 1 }
    }),
    makeNpc({
      id: 'npc_flamestrike',
      name: 'Flamestrike (Matafleur — Senile Ancient Red Dragon)',
      role: 'Maternal Guardian of the Pax Tharkas Hostage Nursery',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Adhocracy',
      nodeId: 'PAX-02',
      submapId: 'map_sub_pax_tharkas',
      motivation: 'Protect the 250 Solace children whom her senile mind believes are her own lost wyrmlings (`Q_AUT_03`, `CRUC-10`).',
      dispositionToParty: -1,
      fourCornersRole: 'Outcast',
      odv: { s: 2, e: 4, c: 1 }
    }),
    makeNpc({
      id: 'npc_pyros',
      name: 'Pyros (Ember — Ancient Red Dragon of Verminaard)',
      role: 'Verminaard\'s Imperial War-Mount & Advisor',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Hierarchy',
      nodeId: 'PAX-04',
      submapId: 'map_sub_pax_tharkas',
      motivation: 'Enforce Takhisis\'s strategic timeline in Abanasinia (`Q_AUT_03`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 4 }
    }),
    makeNpc({
      id: 'npc_immolatus',
      name: 'Immolatus (Ancient Red Wyrm of the Khalkists)',
      role: 'Architect of the 347 AC Hope\'s End Egg Heist',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Hierarchy',
      nodeId: 'HOP-02',
      submapId: 'map_sub_hopes_end_siege',
      motivation: 'Incinerate Hope\'s End, seize the hidden Silver Dragon Eggs for Sanction\'s vats, and test Kitiara\'s mettle (`Q_PRE_02`, `Q_ECHO_02`, `CRUC-05`, `CRUC-06`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 3 }
    }),
    makeNpc({
      id: 'npc_skie',
      name: 'Skie (Khellendros — Ancient Blue Dragon)',
      role: 'Bonded War-Mount of Highlord Kitiara',
      faction: 'The Blue Dragonarmy (Wing of the Blue Lady)',
      factionId: 'fac_blue_dragonarmy',
      culture: 'Market',
      nodeId: 'HCT-03',
      submapId: 'map_sub_high_clerist_tower',
      motivation: 'Serve Kitiara with fierce personal loyalty from the High Clerist\'s Tower (`CRUC-13`) to Neraka (`Q_SPR_03`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 3 }
    }),
    makeNpc({
      id: 'npc_sleet',
      name: 'Sleet (White Dragon of Icewall)',
      role: 'Glacial Guardian of Feal-Thas',
      faction: 'The White Dragonarmy (Glacial Wing)',
      factionId: 'fac_white_dragonarmy',
      culture: 'Adhocracy',
      nodeId: 'ICE-02',
      submapId: 'map_sub_icewall_castle',
      motivation: 'Freeze intruders in the courtyard of Icewall Castle (`Q_WIN_03B`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 3, c: 2 }
    }),
    makeNpc({
      id: 'npc_cyan_bloodbane',
      name: 'Cyan Bloodbane (Ancient Green Dragon)',
      role: 'Dream-Whisperer of Silvanesti & Later Mount of Raistlin',
      faction: 'The Green & Black Dragonarmies (Swamp & Dream Wings)',
      factionId: 'fac_green_black_wings',
      culture: 'Adhocracy',
      nodeId: 'SIL-03',
      submapId: 'map_sub_silvanesti_dream',
      motivation: 'Torture King Lorac through the Silvanesti Dragon Orb (`Q_WIN_03A`, `CRUC-16`) before bowing to Raistlin at Neraka (`Q_SPR_03`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 2 }
    }),
    makeNpc({
      id: 'npc_takhisis',
      name: 'Takhisis (The Queen of Darkness / Five-Headed Dragon)',
      role: 'Supreme Goddess of Evil Seeking Entry at Neraka',
      faction: 'The Red Dragonarmy & Imperial Command of Neraka',
      factionId: 'fac_red_dragonarmy',
      culture: 'Hierarchy',
      nodeId: 'NER-04',
      submapId: 'map_sub_neraka_temple',
      motivation: 'Slay or corrupt Berem the Everman so the Foundation Stone portal opens wide enough for her to conquer Krynn (`Q_SPR_03`, `CRUC-20`, `CRUC-22`).',
      dispositionToParty: -2,
      fourCornersRole: 'Opponent',
      odv: { s: 1, e: 4, c: 4 }
    })
  ];
}

module.exports = {
  buildNpcs
};
