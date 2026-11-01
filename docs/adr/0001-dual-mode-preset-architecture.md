# 0001: Dual Mode Preset Architecture (Universal Engine Core with Canonical Preset Canon Preset)

## Context
Creator Studio originated from setting-specific development on the Canonical Preset campaign. To achieve universal utility across tabletop RPG systems while retaining verified test datasets, the system needed an architectural strategy balancing setting-agnosticism with rich concrete examples.

## Decision
We decouple the system into a two-layer architecture:
1. A **Universal Engine Core** operating on generic pointcrawl topologies, abstract archetypes, and generalized Tarot sociological profiles.
2. A **First-Party Canonical Preset** ("Canonical Preset") that supplies concrete names, coordinates, and faction distributions as an adapter/preset over the universal core.

Setting-specific geography, faction lore, and historical names must not be hardcoded into core simulation or compilation logic. Instead, they reside strictly within selectable preset manifests and plug-and-play modules.

## Consequences
- Core engines (`Run-NetworkEngine.ps1`, `campaign_studio.html`, `generate_tarot_matrix.js`) must accept arbitrary topologies and deck manifests.
- Canonical Preset remains immediately usable and serves as the primary integration benchmark.
- Adding new campaign settings (e.g., sci-fi, horror, post-apocalyptic) requires only providing a new topology JSON and module manifest, without modifying engine code.
