# AdventureCAD Modular Loot System Specification & G1 Contract (`SYS-LOOT-01` / `SYS-LOOT-02`)

Status: **G1 FROZEN CONTRACT** (Ratified 2026-11-09 across Coordinator, Team A Host, and Team B Mod)  
Authority: `docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md`, `docs/adr/0022-coauthoring-architecture-and-rejected-patterns.md`

---

## 1. Host–Mod Adapter Contract (`window.CreatorStudio.lootHostAdapter` / `CreatorStudio` methods)

Host API Version: `"1.0.0"` (`CONTRACT_VERSION = "loot-host-v1"`).  
All mutating and lookup operations return structured envelopes: `{ ok: boolean, data?: any, error?: string, code?: string, warnings?: string[], batchId?: string, durability?: { memory: boolean, localStorage: boolean, diskScheduled: boolean } }`.

### 1.1 Exact Adapter Methods

| Method | Signature / Input | Return Envelope & Guarantees |
| :--- | :--- | :--- |
| `getLootCapabilities()` | `()` | `{ ok: true, data: { contractVersion: "loot-host-v1", hostApiVersion: "1.0.0", supportsCreateOnlyBatch: true, supportsExtensionsPersistence: true, supportsSplitStack: true, supportsReciprocalSync: true, inlineExtensionByteLimit: 262144 } }` |
| `readCampaignContext()` | `()` | `{ ok: true, data: { campaignId, campaignName, sessionGeneration, stateRevision, activeMapId, selectedNodeId, selectedNpcId } }`. `sessionGeneration` increments on every campaign load/unload/reset/SaveAs; `stateRevision` increments on every mutation/save. |
| `resolveItemReference(ref)` | `{ scope: "prototype" \| "active_item", id: string, namespace?: string }` | `{ ok: boolean, status: "found" \| "missing" \| "deleted", data?: ClonedItemSnapshot }`. Never falls back to display-name matching. |
| `readModState(namespace)` | `namespace = "loot_simulator"` | `{ ok: true, data: { schemaVersion: number, data: Object } \| null }`. Reads deep-cloned state from `Workstation.activeTopology.extensions[namespace]`. |
| `commitModState(request)` | `{ namespace: "loot_simulator", expectedCampaignId, expectedGeneration, expectedRevision?, schemaVersion, data }` | Validates context guards (`STALE_CAMPAIGN`, `STALE_REVISION`), rejects prototype-polluting keys (`__proto__`, `constructor`, `prototype`), enforces `inlineExtensionByteLimit` (262,144 bytes UTF-8), writes `Workstation.activeTopology.extensions[namespace]`, calls `saveActiveCampaign()`, increments `stateRevision`, and returns `{ ok: true, data: { stateRevision }, durability }`. |
| `commitLootAcceptance(request)` | See Section 1.2 | Atomic all-or-nothing create-only item instantiation, receipt recording in `extensions.loot_simulator.receipts`, Sovereign Invariant #5 reciprocal foreign-key wiring, single undoable `CampaignMutationEngine` changelog batch, and persistence. |
| `splitItemStack(request)` | `{ expectedCampaignId, expectedGeneration, itemId, splitQuantity, targetNodeId?, targetSubmapId?, targetOwnerNpcId?, targetQuestId? }` | Splits `splitQuantity` ($1 \le \text{splitQuantity} < \text{item.quantity}$) off an existing stack (`item.quantity -= splitQuantity`), creates a new independent item entity with `quantity = splitQuantity` (preserving provenance snapshot and assigning a fresh ID + reciprocal links) in a single undoable batch. |
| `inspectItem(ref)` | `{ itemId?: string, snapshot?: Object }` | Opens native Item Inspector / CRUD modal if `itemId` exists in active roster, or invokes registered knowledge detail fallback. |

### 1.2 `commitLootAcceptance(request)` Schema & Idempotency Rules

**Request**:
```json
{
  "contractVersion": "loot-host-v1",
  "expectedCampaignId": "the_elder_scrolls_iv__oblivion",
  "expectedGeneration": 4,
  "expectedRevision": 12,
  "rollId": "roll_01",
  "results": [
    {
      "resultId": "res_01",
      "idempotencyKey": "roll_01:res_01",
      "name": "Chipped Emerald",
      "category": "Gem / Socketable",
      "specs": "Socketable Gem (Tier 1). Weapons: +3-4 Poison Damage over 3s; Shields: +12% Poison Resist; Armor/Helms: +3 to Dexterity.",
      "notes": "Source: Diablo II: Lord of Destruction (1.10+). Dropped from Act I Treasure Class.",
      "quantity": 2,
      "destination": {
        "possessionMode": "stored",
        "nodeId": "N_ANVIL_HARBOR",
        "submapId": "map_cyrodiil",
        "ownerNpcId": null,
        "questId": null
      },
      "lootMetadata": {
        "schemaVersion": 1,
        "definitionRef": { "namespace": "diablo2_lod", "definitionId": "def_chipped_emerald", "packVersion": "1.0.0", "contentHash": "fnv1a64:..." },
        "provenance": { "sourceId": "diablo2_lod", "tableId": "tbl_act1_gems", "entryId": "ent_chipped_emerald", "edition": "Diablo II: Lord of Destruction v1.10+" },
        "rollId": "roll_01",
        "resultId": "res_01",
        "acceptedAt": "2026-11-09T19:00:00.000Z",
        "acceptedSnapshot": { "name": "Chipped Emerald", "category": "Gem / Socketable", "specs": "...", "notes": "...", "tags": ["gem", "emerald", "poison"], "originalValues": { "qlvl": 5, "tier": "Chipped" } },
        "updateHistory": []
      }
    }
  ]
}
```

**Execution Guarantees**:
1. **Context Guard**: If `expectedCampaignId !== currentCampaignId` or `expectedGeneration !== sessionGeneration`, reject immediately with `{ ok: false, code: "STALE_CAMPAIGN" }`. If `expectedRevision !== undefined && expectedRevision !== stateRevision`, reject with `{ ok: false, code: "STALE_REVISION" }`.
2. **Pre-Validation (All-or-Nothing)**: Validate every row before mutating state:
   - `name` non-empty string; `quantity` finite integer $\ge 1$ (max 999,999).
   - Destination check: if `nodeId` is supplied, verify node exists on `submapId` or active topology; if `possessionMode === "carried"`, verify `ownerNpcId` exists in `topology.npcs`; if `possessionMode === "stored"`, enforce `ownerNpcId = null`; if `questId` is supplied, verify quest exists in `topology.quests`.
   - If any row is invalid, return `{ ok: false, code: "INVALID_BATCH_ROW" }` with zero state changes.
3. **Row-Level Idempotency**:
   - Check `extensions.loot_simulator.receipts[idempotencyKey]`.
   - If already accepted and the referenced `itemId` still exists in `topology.items`, include `{ resultId, itemId, quantity, alreadyAccepted: true }` in the receipt response without creating a duplicate item.
   - For rows not yet accepted, create a **fresh item entity** using create-only semantics (`options.createOnly = true`), never matching existing items by `name` or `prototypeId`.
4. **Sovereign Invariant #5 Reciprocal Foreign-Key Wiring**:
   - When `nodeId` is set: append `newItem.id` to `targetNode.itemIds[]` (deduplicated) on both `Workstation.activeTopology.nodes` (if on active map) and `maps[targetSubmapId].nodes` (recorded in batch changelog).
   - When `possessionMode === "carried"` and `ownerNpcId` is set: append `newItem.id` to `ownerNpc.carriedItemIds[]` (recorded in batch changelog).
   - When `questId` is set: append `newItem.id` to `quest.itemIds[]` (recorded in batch changelog).
5. **Compensating Undo (`revertBatch`)**:
   - All newly created items, reciprocal `itemIds` / `carriedItemIds` updates, and `extensions.loot_simulator.receipts` additions are recorded in a single `CampaignMutationEngine` batch (`actor: "Loot Simulator Mod"`).
   - Calling `revertBatch` removes the created items, scrubs `node.itemIds[]`, `npc.carriedItemIds[]`, and `quest.itemIds[]` (via `ENTITY_REFERENCE_DESCRIPTORS`), and restores `extensions.loot_simulator.receipts` so the preview row can be re-accepted.

---

## 2. Deterministic RNG, Canonical Serialization & Pool Math (`MOD-00`)

1. **Seed & PRNG Algorithm (`prngVersion: "xmur3-mulberry32-v1"`)**:
   - User seed strings (or generated seeds) are hashed via `xmur3(String(seed))` to produce a 32-bit unsigned integer seed state, which drives `mulberry32(state)` yielding uniform floats in $[0, 1)$.
   - Integer range draws $[min, max]$ (for `quantity`) consume exactly 1 PRNG draw: `min + Math.floor(rng() * (max - min + 1))` (or `min` without extra branch divergence; consume 1 draw unconditionally per selected slot for quantity so draw count is strictly $2 \times \text{slots}$: 1 draw for entry selection + 1 draw for quantity).
2. **Canonical Ordering & Content Digest (`hashVersion: "fnv1a64-v1"`)**:
   - Eligible entries within each participating source $s$ are sorted deterministically by `${sourceId}\0${tableId}\0${entryId}` (ASCII code-point order, never `localeCompare`).
   - Participating sources are sorted by `sourceId` (ASCII code-point order).
   - Canonical JSON serialization sorts object keys lexicographically and hashes UTF-8 bytes with 64-bit FNV-1a (`fnv1a64:<16-hex-chars>`).
3. **Normalized Probability Equations**:
   - Participating sources: $S^+ = \{ s \mid W_s > 0 \land \sum_{e \in E_s} a_{s,e} > 0 \}$.
   - Source share: $P(s) = \frac{W_s}{\sum_{k \in S^+} W_k}$.
   - Entry probability given source $s$: $P(e \mid s) = \frac{a_{s,e}}{\sum_{j \in E_s} a_{s,j}}$, where $E_s$ is the union of eligible entries across selected tables in $s$ (deduplicated by `tableId + ":" + entryId`).
   - Combined entry probability: $P(e) = P(s) \cdot P(e \mid s)$.
   - **Unique mode**: After drawing entry $e^*$ with canonical definition identity `${sourceId}:${definitionId}`, remove all entries referencing `${sourceId}:${definitionId}` across all selected tables, recompute $S^+$ and $P(e)$ for the next slot.

---

## 3. Starter Source Packs Frozen Scope (`MOD-07`)

1. **`diablo2_lod`**: *Diablo II: Lord of Destruction (v1.10+ / BradyGames & LoD Strategy Guide Corpus)*
   - Tables: Act I–V Weapons & Armor, Socketed Gems & Runes, Horadric & Unique Relics.
   - Declarative Settings: `areaLevel` (integer 1–85), `difficulty` (`"Normal" | "Nightmare" | "Hell"`), `includeRunesAndGems` (boolean).
2. **`oblivion_goty`**: *The Elder Scrolls IV: Oblivion — Game of the Year Edition (UESP & Official Campaign Corpus)*
   - Tables: Cyrodiil Dungeon & Bandit Gear, Mages Guild & Alchemy Spoils, Daedric & Champion Relics.
   - Declarative Settings: `partyLevel` (integer 1–30), `regionFilter` (`"All" | "Cyrodiil" | "Deadlands" | "Shivering Isles"`), `includeDaedricArtifacts` (boolean).
3. **`smash_melee_ntsc`**: *Super Smash Bros. Melee (NTSC v1.02 — Item Spawn & Container Tables)*
   - Tables: Battering & Throwing Weapons, Shooting & Projectile Items, Recovery, Transformation & Container Drops.
   - Declarative Settings: `spawnFrequency` (`"Low" | "Medium" | "High" | "Very High"`), `allowExplosives` (boolean), `allowHealing` (boolean).
