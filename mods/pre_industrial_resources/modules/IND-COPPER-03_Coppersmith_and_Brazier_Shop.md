---
id: "IND-COPPER-03"
title: "Coppersmith & Brazier Shop"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-COPPER"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Metal: Forged-Copper"
requires:
  - "Metal: Copper-Ingot"
  - "Fuel: Charcoal-or-Coal"
---
</Agent System Instructions>
<Coppersmith & Brazier Shop (`IND-COPPER-03`)>
> **Industry Chain**: `CHAIN-COPPER` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
Heavy copper ingots are reheated in forge hearths and hammered on polished anvils into sheets, vessels, and intricate mechanical components. Craftsmen anneal the metal repeatedly to relieve work-hardening stress, shaping the malleable copper into seamless kettles, alembics, and structural brackets.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+1, +1, +1]` — **Artisanal Master** (`Clan`).
- **Sociological Rationale**: Shaping copper requires a delicate balance of brute hammer force and precise metallurgical intuition, fostering proud guild traditions and master-apprentice lineages.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Smith Gareth Sterling"
  role: "Lead Coppersmith"
  disposition: "[+1, +1, +1]"
  motivation: "Craft flawless, leak-proof alembics and vessels for alchemical workshops."
- name: "Hammer Apprentice Tolly Vance"
  role: "Striker"
  disposition: "[0, +1, 0]"
  motivation: "Strike the hot anvil precisely in rhythm with the master's lead hammer."

### Material Stocks & Items (Item Prototypes)
- **Forged Copperware** (`Commodity`): Hammered sheet-copper vessels, piping, and mechanical fittings.
- **Raising Hammer** (`Tool`): Polished steel-faced hammer designed for sinking sheet metal into hollow forms.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Annealing Cycles` (`0–10`)**: At `0–3`, unannealed copper work-hardens and shatters under the hammer. At `8–10`, over-heating melts delicate soldered seams.
- **Quest Hook — *The Fractured Alembic***: When a crucial royal distillation helm cracks during final shaping, Gareth must reweld and anneal the vessel before the morning cargo deadline.
