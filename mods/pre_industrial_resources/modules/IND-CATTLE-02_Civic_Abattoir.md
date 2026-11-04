---
id: "IND-CATTLE-02"
title: "Civic Abattoir"
set: "Set_A_Infrastructure_and_Engineering"
category: "Pastoral_and_Animal_Products"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CATTLE"
chain_stage: 2
chain_role: "refining"
provides:
  - "Food: Raw-Beef"
  - "Animal: Raw-Hides"
  - "Animal: Tallow"
requires:
  - "Livestock: Cattle"
---
# Civic Abattoir (`IND-CATTLE-02`)
> **Industry Chain**: `CHAIN-CATTLE` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
A stone-paved, channeled drainage building situated near a swift river comprises slaughter pens, hoisting gantries, and boiling cauldrons. Guild butchers process incoming cattle swiftly, harvesting edible meat, stripping raw hides for tanneries, and rendering fat into tallow. This sanitary civic facility converts living livestock into perishable food stores and vital industrial raw materials.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 0, 2]` (pick integers -3 to +3) — **Hierarchy** (`Hierarchy`).
- **Sociological Rationale**: Dealing with biohazardous waste and strict municipal health ordinances, the abattoir enforces strict sanitary protocols and rigid batch accountability.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Butcher Barnaby Cull"
  role: "Chief Abattoir Inspector and Slaughter Master"
  disposition: "[1, 0, 2]"
  motivation: "Ensure zero waste contamination of the municipal water supply while maximizing hide yield."
- name: "Flayer Jessamyn Thorne"
  role: "Hide Curing and Tallow Boiler"
  disposition: "[0, -1, 1]"
  motivation: "Extract unblemished hides for the tannery without knife-gouge blemishes."

### Material Stocks & Items (Item Prototypes)
- **Hoisting Gantry and Tackle** (`Tool`): Heavy wooden pulley rig used to suspend carcasses for efficient bleeding and skinning.
- **Rendering Vats** (`Tool`): Large cast-iron cauldrons for melting animal fat into usable industrial tallow.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Sanitation and Drainage` (`0–10`)**: At `0–3`, bloodclogged drains attract vermin and threaten city health inspectors. At `8–10`, over-processing overwhelms the boiling vats, creating foul stenches that spark neighborhood riots.
- **Quest Hook — *The Blocked Sluice* ***: Waste clogs the abattoir's primary river sluice just as a massive cattle drive arrives from the ranches. Barnaby and Jessamyn must clear the organic blockage before civic magistrates suspend their operating charter.
