---
id: "IND-FLAX-02"
title: "Retting & Scutching Basin"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-FLAX"
chain_stage: 2
chain_role: "refining"
provides:
  - "Textile: Flax-Fiber"
  - "Oil: Linseed-Oil"
requires:
  - "Crop: Raw-Flax"
---
# Retting & Scutching Basin (`IND-FLAX-02`)
> **Industry Chain**: `CHAIN-FLAX` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
Raw flax bundles are submerged in slow-moving stream basins where bacterial action rots away the woody outer bark (retting). Once softened, dried stalks are crushed with wooden breaking mallets and beaten against vertical scutching boards with wooden blades to strip away shives and release long, silky bast fibers. This chemical and mechanical refining converts raw stalks into spinning-ready flax fiber. Before retting, the ripe seed bolls are stripped from the stalks with a coarse rippling comb, and the seed is roasted, bagged, and hammered in a wedge press until raw linseed oil runs out.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, -1, 0]` — **Executioner** (`Market`).
- **Sociological Rationale**: Stinky, labor-intensive water retting and aggressive scutching demand resilient, pragmatic workers who tolerate harsh chemical stenches and repetitive physical strain.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Scutcher Branick"
  role: "Fiber Processor"
  disposition: "[0, -1, +1]"
  motivation: "Extract the cleanest, longest line fibers without snapping the delicate strands."
- name: "Rigger Nesta Reed"
  role: "Basin Tender"
  disposition: "[-1, -1, 0]"
  motivation: "Monitor retting duration accurately to prevent bacterial over-rotting of the harvest."

### Material Stocks & Items (Item Prototypes)
- **Flax-Fiber** (`Commodity`): Clean, combed bundles of golden bast fibers ready for spinning wheels.
- **Scutching Knife** (`Tool`): A flat wooden blade used to scrape away broken woody core fragments.
- **Linseed Oil** (`Commodity`): Raw golden seed oil pressed from rippled flax seed, used as a binder for paint, putty, varnish and printing ink.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Retting Saturation (`0–10`)**: At `0–3`, under-retted stalks remain bonded to woody shives, ruining the batch. At `8–10`, optimal bacterial breakdown allows effortless fiber separation.
- **Quest Hook — *The Foul Basin Poisoning***: When industrial runoff contaminates the retting ponds and kills the softening bacteria, Branick must purge the basin upstream before the entire regional linen supply rots.
