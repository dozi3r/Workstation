# REGIONAL VISUAL ASSET DATABASE
## Human-Navigable Taxonomy, Building Metadata & Scene Reference Index

> **Total Visual Assets:** 344 | **Taxonomy Categories:** 8 | **Subdirectories:** 26
> **Database File:** [`regional_image_catalog.json`](regional_image_catalog.json)
> **Interactive Browser:** [`regional_image_browser.html`](regional_image_browser.html)
> **CLI Scene Finder:** `Find-RegionalImage.ps1` | **Synchronizer:** `Update-RegionalImageCatalog.ps1`

---

### Human Folder Structure in Windows Explorer
All image assets reside in `regions/images/` and are organized strictly by geography and feature type so humans and GMs can browse them directly without needing web apps or hardcoded zone numbers:

```text
regions/images/
  +-- mountains_and_highlands/
  |     +-- granite_domes  (3 images - Granite Domes & Cliffs)
  |     +-- alpine_foothills_and_scree  (30 images - Alpine Foothills & Scree)
  |     +-- glaciated_peaks  (16 images - Glaciated Peaks & Horns)
  +-- valleys_and_canyons/
  |     +-- valley_roads_and_bridges  (2 images - Valley Roads & Arched Bridges)
  |     +-- river_gorges_and_canyons  (3 images - River Gorges & Canyons)
  |     +-- cliffs_and_escarpments  (12 images - Cliffs & Interior Escarpments)
  +-- waters_and_wetlands/
  |     +-- waterfalls_and_cascades  (25 images - Waterfalls & Cascades)
  |     +-- streams_and_creeks  (6 images - Streams & Creeks)
  |     +-- rivers_and_rapids  (26 images - Rivers & Rapids)
  |     +-- swamps_and_mangroves  (16 images - Swamps & Mangroves)
  |     +-- lakes_and_tarns  (10 images - Lakes & High Tarns)
  +-- forests_and_woodlands/
  |     +-- ancient_fey_woods  (2 images - Ancient & Fey Woods)
  |     +-- redwoods_and_tall_canopy  (3 images - Redwoods & Tall Canopy)
  |     +-- temperate_forests  (13 images - Temperate & Mixed Forests)
  +-- plains_and_grasslands/
  |     +-- savanna_and_plains  (6 images - Savanna & Open Plains)
  +-- coasts_and_islands/
  |     +-- sea_caves_and_coves  (9 images - Sea Caves & Corsair Coves)
  |     +-- beaches_and_bluffs  (39 images - Beaches & Chalk Bluffs)
  |     +-- rocky_surf_and_headlands  (1 images - Rocky Surf & Headlands)
  |     +-- islands_and_lagoons  (2 images - Islands & Tidal Lagoons)
  +-- settlements_and_bastions/
  |     +-- castles_and_fortresses  (32 images - Castles & Fortresses)
  |     +-- walled_towns_and_citadels  (28 images - Walled Towns & Citadels)
  |     +-- temples_monasteries_and_shrines  (32 images - Temples, Monasteries & Shrines)
  |     +-- harbors_and_lighthouses  (4 images - Harbors & Lighthouses)
  +-- ancient_ruins_and_vaults/
  |     +-- overgrown_ruins_and_pyramids  (18 images - Overgrown Ruins & Pyramids)
  |     +-- subterranean_vaults_and_caves  (6 images - Subterranean Vaults & Cisterns)
```

---

### Building & Infrastructure Taxonomy
Every image has been tagged with building presence, count, and architectural classification so dynamic campaigns can pin appropriate visual scenes to any node:

| Building Category | Assets | Typical Structures & Architectural Features |
| :--- | :---: | :--- |
| **Wilderness (`none_wilderness`)** | 185 | Pristine natural landscape, zero buildings (wild rivers, glaciers, virgin redwoods, scree). |
| **Isolated Structure (`isolated_structure`)** | 76 | Lone castles, hillforts, hermit bothies, mountain chapels, cliffside watchtowers. |
| **Civil Infrastructure (`civil_infrastructure`)** | 60 | Stone arch bridges, wooden swamp boardwalks, mountain switchbacks, harbor lighthouses. |
| **Dense Settlement (`dense_settlement`)** | 28 | Walled citadels, coastal port towns, cliffside villages, canal districts. |
| **Ancient Ruins (`ancient_ruins`)** | 19 | Overgrown cyclopean pyramids, carved stepwells, neolithic stone circles, cliff tombs. |
| **Subterranean Vault (`subterranean_vault`)** | 4 | Flooded marble cisterns, cavern crypts, underground lakes, carved cliff chambers. |

---

### CLI Recommendation Queries
Agents and GMs can query images dynamically during scene generation:

```powershell
# Find a stream in the alpine foothills with no buildings:
.\regions\Find-RegionalImage.ps1 -Environment waters -Tags stream -BuildingCategory none_wilderness

# Find an isolated castle or keep:
.\regions\Find-RegionalImage.ps1 -BuildingType castle -BuildingCategory isolated_structure

# Find a river gorge with a bridge:
.\regions\Find-RegionalImage.ps1 -Environment valleys -Tags bridge
```

---

## Mountains & Highlands (49 Assets)

### Granite Domes & Cliffs (`granite_domes`, 3 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0168` | `granite_dome_clark_range_sierra.png` | Wilderness | none (0) | Clark Range, Sierra Nevada, Yose... | stone_mountain, stone, mountain, dome | [View](images/mountains_and_highlands/granite_domes/granite_dome_clark_range_sierra.png) |
| `IMG-0169` | `granite_dome_stone_arch_bridge_three_natural_bridges.png` | Civil Infra | stone_arch_bridge (1) | Three Natural Bridges, Wulong Ka... | stone_mountain, stone, mountain, dome | [View](images/mountains_and_highlands/granite_domes/granite_dome_stone_arch_bridge_three_natural_bridges.png) |
| `IMG-0344` | `granite_dome_roque_agando_canary.png` | Wilderness | none (0) | Roque de Agando, Canary Islands | stone_mountain, stone, mountain, dome | [View](images/mountains_and_highlands/granite_domes/granite_dome_roque_agando_canary.png) |

### Alpine Foothills & Scree (`alpine_foothills_and_scree`, 30 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0228` | `highlands_foothills_highlands.png` | Wilderness | none (0) | - | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_highlands.png) |
| `IMG-0230` | `highlands_foothills_higghlands.png` | Wilderness | none (0) | - | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_higghlands.png) |
| `IMG-0231` | `highlands_foothills_hiking_trail_above.png` | Wilderness | none (0) | Hiking trail above Ponta Delgada... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_hiking_trail_above.png) |
| `IMG-0232` | `highlands_foothills_highlands_dargavs.jpg` | Wilderness | none (0) | - | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_highlands_dargavs.jpg) |
| `IMG-0233` | `highlands_foothills_highlands_denalidall.jpg` | Wilderness | none (0) | - | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_highlands_denalidall.jpg) |
| `IMG-0234` | `highlands_foothills_highlands_view_hopevalley.jpg` | Wilderness | none (0) | - | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_highlands_view_hopevalley.jpg) |
| `IMG-0236` | `highlands_foothills_cocora_valley_colombia.png` | Wilderness | none (0) | Cocora Valley, Colombia | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_cocora_valley_colombia.png) |
| `IMG-0238` | `highlands_foothills_arenal_volcano_seen.png` | Wilderness | none (0) | Arenal Volcano seen from Monteve... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_arenal_volcano_seen.png) |
| `IMG-0239` | `highlands_foothills_back_click_again.png` | Wilderness | none (0) | to go back Click again Switzerla... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_back_click_again.png) |
| `IMG-0240` | `highlands_foothills_view.png` | Wilderness | none (0) | - | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_view.png) |
| `IMG-0241` | `highlands_foothills_view_02.png` | Wilderness | none (0) | - | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_view_02.png) |
| `IMG-0242` | `highlands_foothills_apada_diamantina_bahia.png` | Wilderness | none (0) | apada Diamantina in Bahia, | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_apada_diamantina_bahia.png) |
| `IMG-0243` | `highlands_foothills_upper_geyser_basin.png` | Wilderness | none (0) | Upper Geyser Basin in Yellowston... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_upper_geyser_basin.png) |
| `IMG-0244` | `highlands_foothills_orde1heide_ndem_stills.png` | Wilderness | none (0) | orde1heide/TÄNDEM stills * Motio... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_orde1heide_ndem_stills.png) |
| `IMG-0245` | `highlands_foothills_ing.png` | Wilderness | none (0) | ing united states | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_ing.png) |
| `IMG-0246` | `highlands_foothills_cameron_highlands_tea.png` | Wilderness | none (0) | Cameron Highlands tea plantation... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_cameron_highlands_tea.png) |
| `IMG-0247` | `highlands_foothills_view_03.png` | Wilderness | none (0) | - | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_view_03.png) |
| `IMG-0248` | `highlands_foothills_mages_bing_khom.png` | Wilderness | none (0) | I mages) (Bing Khom\yaklGeW (0 p... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_mages_bing_khom.png) |
| `IMG-0249` | `highlands_foothills_view_04.png` | Wilderness | none (0) | ed States) | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_view_04.png) |
| `IMG-0250` | `highlands_foothills_boundary_trail_mount.png` | Wilderness | none (0) | Boundary Trail in Mount St. Hele... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_boundary_trail_mount.png) |
| `IMG-0251` | `highlands_foothills_sikkim_india.png` | Wilderness | none (0) | Sikkim, India | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_sikkim_india.png) |
| `IMG-0253` | `highlands_foothills_aksun_faroe_islan.png` | Wilderness | none (0) | >aKsun, Faroe Islan ds, Denmark ... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_aksun_faroe_islan.png) |
| `IMG-0254` | `highlands_foothills_superbloom_carrizo_plain.png` | Wilderness | none (0) | Superbloom in Carrizo Plain Nati... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_superbloom_carrizo_plain.png) |
| `IMG-0255` | `highlands_foothills_noninsula.png` | Wilderness | none (0) | _ . , _k noninsula, Scotland | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_noninsula.png) |
| `IMG-0256` | `highlands_foothills_mountain_stone_bothy_ordesa_monte_perdido.png` | Isolated (1) | mountain_stone_bothy (1) | ordesa y Monte perdido National ... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_mountain_stone_bothy_ordesa_monte_perdido.png) |
| `IMG-0257` | `highlands_foothills_jan.png` | Wilderness | none (0) | Jan W United States) | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_jan.png) |
| `IMG-0258` | `highlands_foothills_puez_geisler_nature.png` | Wilderness | none (0) | Puez-Geisler Nature Park in Sout... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_puez_geisler_nature.png) |
| `IMG-0259` | `highlands_foothills_miguel_island_azores.png` | Wilderness | none (0) | Säo Miguel Island, Azores | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_miguel_island_azores.png) |
| `IMG-0260` | `highlands_foothills_farming_terraces_mach.png` | Wilderness | none (0) | Farming terraces at Machü Picchu... | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_farming_terraces_mach.png) |
| `IMG-0327` | `highlands_foothills_cocora_valley_colombia_02.png` | Wilderness | none (0) | Cocora Valley, Colombia | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/alpine_foothills_and_scree/highlands_foothills_cocora_valley_colombia_02.png) |

### Glaciated Peaks & Horns (`glaciated_peaks`, 16 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0229` | `peak_exit_glacier_kenai.jpg` | Wilderness | none (0) | - | highlands, the, bleak, foothills | [View](images/mountains_and_highlands/glaciated_peaks/peak_exit_glacier_kenai.jpg) |
| `IMG-0261` | `peak_foggy_valley_dolomite.png` | Wilderness | none (0) | Foggy valley in the Dolomite mou... | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_foggy_valley_dolomite.png) |
| `IMG-0262` | `peak_view.png` | Wilderness | none (0) | - | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_view.png) |
| `IMG-0265` | `peak_ama_dablam_mountain.png` | Wilderness | none (0) | Ama Dablam mountain in the Himal... | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_ama_dablam_mountain.png) |
| `IMG-0266` | `peak_ama_dablam_mountain_02.png` | Wilderness | none (0) | Ama Dablam mountain in the Himal... | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_ama_dablam_mountain_02.png) |
| `IMG-0267` | `peak_bugaboos_british_columbia.png` | Wilderness | none (0) | The Bugaboos, British Columbia, ... | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_bugaboos_british_columbia.png) |
| `IMG-0268` | `peak_view_02.png` | Wilderness | none (0) | - | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_view_02.png) |
| `IMG-0269` | `peak_last_light_half.png` | Wilderness | none (0) | Last light on Half Dome, Yosemit... | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_last_light_half.png) |
| `IMG-0270` | `peak_mount_logan_kluane.png` | Wilderness | none (0) | Mount Logan in Kluane National P... | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_mount_logan_kluane.png) |
| `IMG-0271` | `peak_oeak_nepal.png` | Wilderness | none (0) | , oeak, Nepal | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_oeak_nepal.png) |
| `IMG-0272` | `peak_mount_everest.png` | Wilderness | none (0) | Mount Everest | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_mount_everest.png) |
| `IMG-0273` | `peak_alpenglow_half_dome.png` | Wilderness | none (0) | Alpenglow on Half Dome, Yosemite... | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_alpenglow_half_dome.png) |
| `IMG-0274` | `peak_peitlerkofel_south_tyrol.png` | Wilderness | none (0) | Peitlerkofel in South Tyrol, Ita... | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_peitlerkofel_south_tyrol.png) |
| `IMG-0275` | `peak_ama_dablam_peak.png` | Wilderness | none (0) | Ama Dablam peak, Nepal | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_ama_dablam_peak.png) |
| `IMG-0276` | `peak_mount_shasta_rony.png` | Wilderness | none (0) | Mount Shasta 1 of 20 rony Sarno ... | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_mount_shasta_rony.png) |
| `IMG-0278` | `peak_summit_snowfuji.jpg` | Wilderness | none (0) | - | matterhorn, the, glacial, peak | [View](images/mountains_and_highlands/glaciated_peaks/peak_summit_snowfuji.jpg) |

## Valleys & Canyons (17 Assets)

### Valley Roads & Arched Bridges (`valley_roads_and_bridges`, 2 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0113` | `mountain_road_stone_arch_bridge_gorge_bridge_sautdubrot.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/valleys_and_canyons/valley_roads_and_bridges/mountain_road_stone_arch_bridge_gorge_bridge_sautdubrot.jpg) |
| `IMG-0114` | `mountain_road_stone_arch_bridge_gorge_djurdjevicabridge.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/valleys_and_canyons/valley_roads_and_bridges/mountain_road_stone_arch_bridge_gorge_djurdjevicabridge.jpg) |

### River Gorges & Canyons (`river_gorges_and_canyons`, 3 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0135` | `canyon_gorge_tunnel_view_yosemite.png` | Wilderness | none (0) | Tunnel View, Yosemite, Californi... | valley_road, canyon, road, river | [View](images/valleys_and_canyons/river_gorges_and_canyons/canyon_gorge_tunnel_view_yosemite.png) |
| `IMG-0335` | `canyon_gorge_cerros_mavecure_colombia.png` | Wilderness | none (0) | Cerros de Mavecure, Colombia | valley_road, canyon, road, river | [View](images/valleys_and_canyons/river_gorges_and_canyons/canyon_gorge_cerros_mavecure_colombia.png) |
| `IMG-0345` | `canyon_gorge_tunnel_view_yosemite_02.png` | Wilderness | none (0) | Tunnel View, Yosemite, Californi... | valley_road, canyon, road, river | [View](images/valleys_and_canyons/river_gorges_and_canyons/canyon_gorge_tunnel_view_yosemite_02.png) |

### Cliffs & Interior Escarpments (`cliffs_and_escarpments`, 12 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0136` | `cliff_escarpment_engineered_switchback_road_cliff_path_walterswiggles.jpg` | Civil Infra | engineered_switchback_road (1) | - | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_cliff_path_walterswiggles.jpg) |
| `IMG-0137` | `cliff_escarpment_engineered_switchback_road_ronda_laga.png` | Civil Infra | engineered_switchback_road (1) | Ronda in the Province of Mälaga,... | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_ronda_laga.png) |
| `IMG-0139` | `cliff_escarpment_engineered_switchback_road_cliffs_irohazakaroad.jpg` | Civil Infra | engineered_switchback_road (1) | - | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_cliffs_irohazakaroad.jpg) |
| `IMG-0140` | `cliff_escarpment_engineered_switchback_road_devils_postpile_california.png` | Civil Infra | engineered_switchback_road (1) | Devils Postpile National Monumen... | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_devils_postpile_california.png) |
| `IMG-0141` | `cliff_escarpment_engineered_switchback_road_sch_llenen_gorge.png` | Civil Infra | engineered_switchback_road (1) | Schöllenen Gorge, Switzerland | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_sch_llenen_gorge.png) |
| `IMG-0143` | `cliff_escarpment_engineered_switchback_road_astellfollit_roca_catalonia.png` | Civil Infra | engineered_switchback_road (1) | astellfollit de la Roca, catalon... | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_astellfollit_roca_catalonia.png) |
| `IMG-0144` | `cliff_escarpment_engineered_switchback_road_click_again.png` | Civil Infra | engineered_switchback_road (1) | to go Click again | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_click_again.png) |
| `IMG-0145` | `cliff_escarpment_mountain_monastery_roussanou_monastery_meteora.png` | Isolated (1) | mountain_monastery (1) | Roussanou Monastery, Meteora, Th... | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_mountain_monastery_roussanou_monastery_meteora.png) |
| `IMG-0146` | `cliff_escarpment_engineered_switchback_road_view.png` | Civil Infra | engineered_switchback_road (1) | United States) | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_view.png) |
| `IMG-0148` | `cliff_escarpment_engineered_switchback_road_zion_utah_simon.png` | Civil Infra | engineered_switchback_road (1) | Zion National Park, Utah (O Simo... | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_zion_utah_simon.png) |
| `IMG-0149` | `cliff_escarpment_engineered_switchback_road_view_02.png` | Civil Infra | engineered_switchback_road (1) | - | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_engineered_switchback_road_view_02.png) |
| `IMG-0320` | `cliff_escarpment_guoliang_tunnel_cliff.jpg` | Wilderness | none (0) | Guoliang Tunnel / Cliff Shelf | cliffs, the, interior, escarpment | [View](images/valleys_and_canyons/cliffs_and_escarpments/cliff_escarpment_guoliang_tunnel_cliff.jpg) |

## Waters & Wetlands (83 Assets)

### Waterfalls & Cascades (`waterfalls_and_cascades`, 25 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0086` | `waterfall_000_best_mountan.jpg` | Wilderness | none (0) | - | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_000_best_mountan.jpg) |
| `IMG-0087` | `waterfall_anciem_stills.png` | Wilderness | none (0) | anciem stills + United states) | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_anciem_stills.png) |
| `IMG-0088` | `waterfall_waterfall_skaftafell_vatnaj.png` | Wilderness | none (0) | Waterfall in Skaftafell, Vatnajö... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_waterfall_skaftafell_vatnaj.png) |
| `IMG-0089` | `waterfall_view.png` | Wilderness | none (0) | - | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_view.png) |
| `IMG-0090` | `waterfall_ciletuh_palabuhanratu_geopark.png` | Wilderness | none (0) | Ciletuh-Palabuhanratu Geopark, I... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_ciletuh_palabuhanratu_geopark.png) |
| `IMG-0091` | `waterfall_waterfall_rio_arazas.png` | Wilderness | none (0) | Waterfall on the Rio Arazas in O... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_waterfall_rio_arazas.png) |
| `IMG-0092` | `waterfall_view_02.png` | Wilderness | none (0) | - | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_view_02.png) |
| `IMG-0094` | `waterfall_whangarei_falls_near.png` | Wilderness | none (0) | Whangarei Falls near the city of... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_whangarei_falls_near.png) |
| `IMG-0095` | `waterfall_three_musketeers_falls.png` | Wilderness | none (0) | Three Musketeers Falls at Iguazü... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_three_musketeers_falls.png) |
| `IMG-0096` | `waterfall_aerial_view_chur.png` | Wilderness | none (0) | Aerial view of Churün Merü water... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_aerial_view_chur.png) |
| `IMG-0097` | `waterfall_sk6gafoss_waterfall_iceland.png` | Wilderness | none (0) | Sk6gafoss waterfall, Iceland | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_sk6gafoss_waterfall_iceland.png) |
| `IMG-0098` | `waterfall_unag_gorge_gwer.png` | Wilderness | none (0) | unag Wi\d-üfe Gorge, gwer C ownb... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_unag_gorge_gwer.png) |
| `IMG-0099` | `waterfall_taughannock_falls_trumansburg.png` | Wilderness | none (0) | Taughannock Falls State Park in ... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_taughannock_falls_trumansburg.png) |
| `IMG-0100` | `waterfall_view_03.png` | Wilderness | none (0) | " 'G' United states) | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_view_03.png) |
| `IMG-0102` | `waterfall_view_04.png` | Wilderness | none (0) | ) | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_view_04.png) |
| `IMG-0103` | `waterfall_waterfall_aldeyjarfoss.jpg` | Wilderness | none (0) | - | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_waterfall_aldeyjarfoss.jpg) |
| `IMG-0104` | `waterfall_ciletuh_palabuhanratu_geopark_02.png` | Wilderness | none (0) | Ciletuh-Palabuhanratu Geopark, I... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_ciletuh_palabuhanratu_geopark_02.png) |
| `IMG-0105` | `waterfall_waterfall_base.png` | Wilderness | none (0) | - | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_waterfall_base.png) |
| `IMG-0106` | `waterfall_gafoss_waterfall_southern.png` | Wilderness | none (0) | Skögafoss waterfall in southern ... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_gafoss_waterfall_southern.png) |
| `IMG-0133` | `waterfall_stone_arch_bridge_stone_canyon_river.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_stone_arch_bridge_stone_canyon_river.jpg) |
| `IMG-0235` | `waterfall_oco_ribeira_ferreiro.png` | Wilderness | none (0) | 'oco da Ribeira do Ferreiro, Flo... | highlands, the, bleak, foothills | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_oco_ribeira_ferreiro.png) |
| `IMG-0277` | `waterfall_reichenbachfalls.jpg` | Wilderness | none (0) | - | matterhorn, the, glacial, peak | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_reichenbachfalls.jpg) |
| `IMG-0295` | `waterfall_forest_waterfall_huaymaekhamin.jpg` | Wilderness | none (0) | - | forest_reserve, forests, the, quarantine | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_forest_waterfall_huaymaekhamin.jpg) |
| `IMG-0301` | `waterfall_waterfall_olympic_washington.png` | Wilderness | none (0) | A waterfall in Olympic National ... | forest_reserve, forests, the, quarantine | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_waterfall_olympic_washington.png) |
| `IMG-0346` | `waterfall_letchworth_new_york.png` | Wilderness | none (0) | Letchworth State Park, New York | waterfall, the, great, cascade | [View](images/waters_and_wetlands/waterfalls_and_cascades/waterfall_letchworth_new_york.png) |

### Streams & Creeks (`streams_and_creeks`, 6 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0093` | `stream_panther_creek_falls.png` | Wilderness | none (0) | Panther Creek Falls in spring, G... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/streams_and_creeks/stream_panther_creek_falls.png) |
| `IMG-0101` | `stream_rangle_creek_falls.png` | Wilderness | none (0) | rangle Creek Falls in Jasper Nat... | waterfall, the, great, cascade | [View](images/waters_and_wetlands/streams_and_creeks/stream_rangle_creek_falls.png) |
| `IMG-0118` | `stream_stone_arch_bridge_hyalite_creek_custer.png` | Civil Infra | stone_arch_bridge (1) | Hyalite Creek in the Custer Gall... | valley_road, canyon, road, river | [View](images/waters_and_wetlands/streams_and_creeks/stream_stone_arch_bridge_hyalite_creek_custer.png) |
| `IMG-0299` | `stream_coastal_redwoods_and.png` | Wilderness | none (0) | Coastal redwoods and wood sorrel... | forest_reserve, forests, the, quarantine | [View](images/waters_and_wetlands/streams_and_creeks/stream_coastal_redwoods_and.png) |
| `IMG-0309` | `stream_alpine_valley.jpg` | Wilderness | none (0) | Alpine Valley | highlands, the, bleak, foothills | [View](images/waters_and_wetlands/streams_and_creeks/stream_alpine_valley.jpg) |
| `IMG-0310` | `stream_yosemite_valley_california.png` | Wilderness | none (0) | Yosemite Valley, California | highlands, the, bleak, foothills | [View](images/waters_and_wetlands/streams_and_creeks/stream_yosemite_valley_california.png) |

### Rivers & Rapids (`rivers_and_rapids`, 26 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0107` | `river_stone_arch_bridge_aerial_view_winding.png` | Civil Infra | stone_arch_bridge (1) | Aerial view of a winding road in... | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_aerial_view_winding.png) |
| `IMG-0108` | `river_stone_arch_bridge_road.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_road.jpg) |
| `IMG-0109` | `river_stone_arch_bridge_road2.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_road2.jpg) |
| `IMG-0110` | `river_stone_arch_bridge_1768866583472.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_1768866583472.jpg) |
| `IMG-0111` | `river_stone_arch_bridge_sch_llenen_gorge.png` | Civil Infra | stone_arch_bridge (1) | Schöllenen Gorge, Switzerland | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_sch_llenen_gorge.png) |
| `IMG-0112` | `river_stone_arch_bridge_gorge_bbnpgrande.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_gorge_bbnpgrande.jpg) |
| `IMG-0115` | `river_stone_arch_bridge_gorge.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_gorge.jpg) |
| `IMG-0116` | `river_stone_arch_bridge_katmai_and_ilajkl.png` | Civil Infra | stone_arch_bridge (1) | be ar in Katmai National Park an... | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_katmai_and_ilajkl.png) |
| `IMG-0117` | `river_stone_arch_bridge_river_victoria_australia.png` | Civil Infra | stone_arch_bridge (1) | River in Victoria, Australia | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_river_victoria_australia.png) |
| `IMG-0119` | `river_stone_arch_bridge_view.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_view.jpg) |
| `IMG-0120` | `river_stone_arch_bridge_view.png` | Civil Infra | stone_arch_bridge (1) | united states) | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_view.png) |
| `IMG-0121` | `river_stone_arch_bridge_kinderdijk_windmills_south.png` | Civil Infra | stone_arch_bridge (1) | Kinderdijk windmills in South Åo... | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_kinderdijk_windmills_south.png) |
| `IMG-0122` | `river_stone_arch_bridge_view_02.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_view_02.jpg) |
| `IMG-0123` | `river_stone_arch_bridge_calcite_springs_overlook.png` | Civil Infra | stone_arch_bridge (1) | Calcite Springs Overlook and Yel... | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_calcite_springs_overlook.png) |
| `IMG-0124` | `river_stone_arch_bridge_view_03.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_view_03.jpg) |
| `IMG-0125` | `river_stone_arch_bridge_view_02.png` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_view_02.png) |
| `IMG-0126` | `river_stone_arch_bridge_punch_bowl_river.png` | Civil Infra | stone_arch_bridge (1) | The Punch Bowl on the River Quoi... | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_punch_bowl_river.png) |
| `IMG-0127` | `river_stone_arch_bridge_nathee_kluaythong_getw.png` | Civil Infra | stone_arch_bridge (1) | nathee kluaythong/Getw united st... | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_nathee_kluaythong_getw.png) |
| `IMG-0130` | `river_stone_arch_bridge_river_valley_goldrushyukon.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_river_valley_goldrushyukon.jpg) |
| `IMG-0131` | `river_stone_arch_bridge_semucchampey.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_semucchampey.jpg) |
| `IMG-0134` | `river_stone_arch_bridge_valley_serramalagueta.jpg` | Civil Infra | stone_arch_bridge (1) | - | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_stone_arch_bridge_valley_serramalagueta.jpg) |
| `IMG-0170` | `river_forest_river.png` | Wilderness | none (0) | - | fey_forest, the, fey, forest | [View](images/waters_and_wetlands/rivers_and_rapids/river_forest_river.png) |
| `IMG-0188` | `river_wooden_plank_boardwalk_river_marsh_canadadaycanoeing.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/rivers_and_rapids/river_wooden_plank_boardwalk_river_marsh_canadadaycanoeing.jpg) |
| `IMG-0191` | `river_wooden_plank_boardwalk_swamp_river_pinelogsp.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/rivers_and_rapids/river_wooden_plank_boardwalk_swamp_river_pinelogsp.jpg) |
| `IMG-0336` | `river_river_banks.png` | Wilderness | none (0) | National Park, Turkiye | valley_road, canyon, road, river | [View](images/waters_and_wetlands/rivers_and_rapids/river_river_banks.png) |
| `IMG-0337` | `river_appenzell_innerrhoden.png` | Wilderness | none (0) | Appenzell Innerrhoden, Switzerla... | highlands, the, bleak, foothills | [View](images/waters_and_wetlands/rivers_and_rapids/river_appenzell_innerrhoden.png) |

### Swamps & Mangroves (`swamps_and_mangroves`, 16 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0172` | `swamp_wooden_plank_boardwalk_swamp.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_swamp.jpg) |
| `IMG-0173` | `swamp_wooden_plank_boardwalk_swamp_out.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_swamp_out.jpg) |
| `IMG-0174` | `swamp_wooden_plank_boardwalk_swamp_out2.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_swamp_out2.jpg) |
| `IMG-0175` | `swamp_wooden_plank_boardwalk_bahia_blanca_argentina.png` | Civil Infra | wooden_plank_boardwalk (1) | Bahia Blanca, Argentina | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_bahia_blanca_argentina.png) |
| `IMG-0176` | `swamp_wooden_plank_boardwalk_motion_bing_stilts.png` | Civil Infra | wooden_plank_boardwalk (1) | States) Motion) (Bing Stilts * a... | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_motion_bing_stilts.png) |
| `IMG-0177` | `swamp_wooden_plank_boardwalk_nick.png` | Civil Infra | wooden_plank_boardwalk (1) | (0 Nick United states) | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_nick.png) |
| `IMG-0178` | `swamp_wooden_plank_boardwalk_mangrove_abu_dhabi.png` | Civil Infra | wooden_plank_boardwalk (1) | Mangrove park in Abu Dhabi. unit... | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_mangrove_abu_dhabi.png) |
| `IMG-0179` | `swamp_wooden_plank_boardwalk_view.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_view.jpg) |
| `IMG-0181` | `swamp_wooden_plank_boardwalk_pantanal_brazil.png` | Civil Infra | wooden_plank_boardwalk (1) | The Pantanal, Brazil | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_pantanal_brazil.png) |
| `IMG-0182` | `swamp_wooden_plank_boardwalk_georgia.png` | Civil Infra | wooden_plank_boardwalk (1) | Georgia (O | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_georgia.png) |
| `IMG-0184` | `swamp_wooden_plank_boardwalk_mangrove_forest_phang.png` | Civil Infra | wooden_plank_boardwalk (1) | Mangrove forest in Phang Nga Bay... | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_mangrove_forest_phang.png) |
| `IMG-0185` | `swamp_wooden_plank_boardwalk_view.png` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_view.png) |
| `IMG-0186` | `swamp_wooden_plank_boardwalk_mistyforest.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_mistyforest.jpg) |
| `IMG-0189` | `swamp_wooden_plank_boardwalk_swamp_mainewetland.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_swamp_mainewetland.jpg) |
| `IMG-0190` | `swamp_wooden_plank_boardwalk_swamp_mtcradle.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_swamp_mtcradle.jpg) |
| `IMG-0342` | `swamp_wooden_plank_boardwalk_torres_del_paine.png` | Civil Infra | wooden_plank_boardwalk (1) | Torres del Paine National Park, ... | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/swamps_and_mangroves/swamp_wooden_plank_boardwalk_torres_del_paine.png) |

### Lakes & High Tarns (`lakes_and_tarns`, 10 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0180` | `lake_wooden_plank_boardwalk_wilderness_near_hydraulic.png` | Civil Infra | wooden_plank_boardwalk (1) | .4 Wilderness near Hydraulic Lak... | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/lakes_and_tarns/lake_wooden_plank_boardwalk_wilderness_near_hydraulic.png) |
| `IMG-0183` | `lake_wooden_plank_boardwalk_avalanche_lake_trail.png` | Civil Infra | wooden_plank_boardwalk (1) | Avalanche Lake Trail at Adironda... | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/lakes_and_tarns/lake_wooden_plank_boardwalk_avalanche_lake_trail.png) |
| `IMG-0187` | `lake_wooden_plank_boardwalk_raised_walkway_plitvice.jpg` | Civil Infra | wooden_plank_boardwalk (1) | - | swamp, the, sunken, marsh | [View](images/waters_and_wetlands/lakes_and_tarns/lake_wooden_plank_boardwalk_raised_walkway_plitvice.jpg) |
| `IMG-0237` | `lake_gsvatn_lake_island.png` | Wilderness | none (0) | Sørvégsvatn lake, island of Véga... | highlands, the, bleak, foothills | [View](images/waters_and_wetlands/lakes_and_tarns/lake_gsvatn_lake_island.png) |
| `IMG-0263` | `lake_medicine_lake.png` | Wilderness | none (0) | Medicine Lake, Canada | matterhorn, the, glacial, peak | [View](images/waters_and_wetlands/lakes_and_tarns/lake_medicine_lake.png) |
| `IMG-0264` | `lake_abraham_lake.png` | Wilderness | none (0) | Abraham Lake, Canada | matterhorn, the, glacial, peak | [View](images/waters_and_wetlands/lakes_and_tarns/lake_abraham_lake.png) |
| `IMG-0306` | `lake_mountain_stone_bothy_wooden_path_kennedy.png` | Isolated (1) | mountain_stone_bothy (1) | Wooden path to Kennedy Lake, Van... | forest_reserve, forests, the, quarantine | [View](images/waters_and_wetlands/lakes_and_tarns/lake_mountain_stone_bothy_wooden_path_kennedy.png) |
| `IMG-0326` | `lake_hohe_tauern.png` | Wilderness | none (0) | Hohe Tauern National Park, Austr... | highlands, the, bleak, foothills | [View](images/waters_and_wetlands/lakes_and_tarns/lake_hohe_tauern.png) |
| `IMG-0330` | `lake_vorderer_gosausee.png` | Wilderness | none (0) | Vorderer Gosausee, Austria | lake, the, sacred, temple | [View](images/waters_and_wetlands/lakes_and_tarns/lake_vorderer_gosausee.png) |
| `IMG-0331` | `lake_lake_inari.png` | Wilderness | none (0) | Lake Inari, Finland | lake, the, sacred, temple | [View](images/waters_and_wetlands/lakes_and_tarns/lake_lake_inari.png) |

## Forests & Woodlands (18 Assets)

### Ancient & Fey Woods (`ancient_fey_woods`, 2 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0171` | `fey_forest_tasmans_arch_tasmania.png` | Wilderness | none (0) | Tasmans Arch, Tasmania, Australi... | fey_forest, the, fey, forest | [View](images/forests_and_woodlands/ancient_fey_woods/fey_forest_tasmans_arch_tasmania.png) |
| `IMG-0291` | `fey_forest_fey_path_roanrhododendron.jpg` | Wilderness | none (0) | - | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/ancient_fey_woods/fey_forest_fey_path_roanrhododendron.jpg) |

### Redwoods & Tall Canopy (`redwoods_and_tall_canopy`, 3 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0279` | `redwood_canopy_stone_arch_bridge_giant_sequoias_sequoia.png` | Civil Infra | stone_arch_bridge (1) | Giant sequoias, Sequoia National... | tall_woods, the, tall, woods | [View](images/forests_and_woodlands/redwoods_and_tall_canopy/redwood_canopy_stone_arch_bridge_giant_sequoias_sequoia.png) |
| `IMG-0280` | `redwood_canopy_stone_arch_bridge_grove_redwoods_redwood.png` | Civil Infra | stone_arch_bridge (1) | Grove of redwoods in Redwood Nat... | tall_woods, the, tall, woods | [View](images/forests_and_woodlands/redwoods_and_tall_canopy/redwood_canopy_stone_arch_bridge_grove_redwoods_redwood.png) |
| `IMG-0281` | `redwood_canopy_stone_arch_bridge_suspension_bridge_tambopata.png` | Civil Infra | stone_arch_bridge (1) | Suspension bridge in Tambopata N... | tall_woods, the, tall, woods | [View](images/forests_and_woodlands/redwoods_and_tall_canopy/redwood_canopy_stone_arch_bridge_suspension_bridge_tambopata.png) |

### Temperate & Mixed Forests (`temperate_forests`, 13 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0292` | `forest_forest_fanalmadeira.jpg` | Wilderness | none (0) | - | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_forest_fanalmadeira.jpg) |
| `IMG-0293` | `forest_forest_mountain_siguniangshan.jpg` | Wilderness | none (0) | - | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_forest_mountain_siguniangshan.jpg) |
| `IMG-0294` | `forest_forest_fireweed_ncfireweed.jpg` | Wilderness | none (0) | - | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_forest_fireweed_ncfireweed.jpg) |
| `IMG-0296` | `forest_forst_gorgewatkinsglen.jpg` | Wilderness | none (0) | - | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_forst_gorgewatkinsglen.jpg) |
| `IMG-0297` | `forest_white_trilliums_blooming.png` | Wilderness | none (0) | White trilliums blooming in Onta... | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_white_trilliums_blooming.png) |
| `IMG-0298` | `forest_maritime_forest_cumberland.png` | Wilderness | none (0) | Maritime forest in Cumberland Is... | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_maritime_forest_cumberland.png) |
| `IMG-0300` | `forest_deer_stag_caledonian.png` | Wilderness | none (0) | ed deer stag in the caledonian F... | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_deer_stag_caledonian.png) |
| `IMG-0302` | `forest_ancient_beech_tree.png` | Wilderness | none (0) | Ancient beech tree, Glenariff Fo... | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_ancient_beech_tree.png) |
| `IMG-0303` | `forest_gespensterwald_nienhagen_mecklenburg.png` | Wilderness | none (0) | Gespensterwald, Nienhagen, Meckl... | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_gespensterwald_nienhagen_mecklenburg.png) |
| `IMG-0304` | `forest_zon_rainforest_rhett.png` | Wilderness | none (0) | zon rainforest, peru Rhett Ayers... | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_zon_rainforest_rhett.png) |
| `IMG-0305` | `forest_forest_path_great.png` | Wilderness | none (0) | Forest path in Great Smoky Mount... | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_forest_path_great.png) |
| `IMG-0307` | `forest_view.png` | Wilderness | none (0) | - | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_view.png) |
| `IMG-0308` | `forest_serra_rramuntana_range.png` | Wilderness | none (0) | the serra -rramuntana range, Maj... | forest_reserve, forests, the, quarantine | [View](images/forests_and_woodlands/temperate_forests/forest_serra_rramuntana_range.png) |

## Plains & Grasslands (6 Assets)

### Savanna & Open Plains (`savanna_and_plains`, 6 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0150` | `grassland_savanna_getty_mages_bing.png` | Wilderness | none (0) | United States) k/Getty \ mages) ... | grasslands, the, razor, sedge | [View](images/plains_and_grasslands/savanna_and_plains/grassland_savanna_getty_mages_bing.png) |
| `IMG-0152` | `grassland_savanna_stand_slash_pines.png` | Wilderness | none (0) | A stand of slash pines and sawgr... | grasslands, the, razor, sedge | [View](images/plains_and_grasslands/savanna_and_plains/grassland_savanna_stand_slash_pines.png) |
| `IMG-0153` | `grassland_savanna_scotts_bluff_gering.png` | Wilderness | none (0) | Scotts Bluff National Monument i... | grasslands, the, razor, sedge | [View](images/plains_and_grasslands/savanna_and_plains/grassland_savanna_scotts_bluff_gering.png) |
| `IMG-0154` | `grassland_savanna_view.png` | Wilderness | none (0) | - | grasslands, the, razor, sedge | [View](images/plains_and_grasslands/savanna_and_plains/grassland_savanna_view.png) |
| `IMG-0155` | `grassland_savanna_mountain_stone_bothy_mount_kilimanjaro_with.png` | Isolated (1) | mountain_stone_bothy (1) | Mount Kilimanjaro with Cape buff... | grasslands, the, razor, sedge | [View](images/plains_and_grasslands/savanna_and_plains/grassland_savanna_mountain_stone_bothy_mount_kilimanjaro_with.png) |
| `IMG-0156` | `grassland_savanna_rainbow_over_wasson.png` | Wilderness | none (0) | Rainbow over Wasson Peak, Saguar... | grasslands, the, razor, sedge | [View](images/plains_and_grasslands/savanna_and_plains/grassland_savanna_rainbow_over_wasson.png) |

## Coasts & Islands (51 Assets)

### Sea Caves & Corsair Coves (`sea_caves_and_coves`, 9 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0157` | `sea_cave_cove_cave_moondogs.jpg` | Wilderness | none (0) | - | pirates_cove, pirate, cove, lagoon | [View](images/coasts_and_islands/sea_caves_and_coves/sea_cave_cove_cave_moondogs.jpg) |
| `IMG-0158` | `sea_cave_cove_brei_amerkurj_kull.png` | Wilderness | none (0) | Breiöamerkurjökull glacier caves... | pirates_cove, pirate, cove, lagoon | [View](images/coasts_and_islands/sea_caves_and_coves/sea_cave_cove_brei_amerkurj_kull.png) |
| `IMG-0159` | `sea_cave_cove_cave_from_above.png` | Wilderness | none (0) | Cave from above, in the Algarve,... | pirates_cove, pirate, cove, lagoon | [View](images/coasts_and_islands/sea_caves_and_coves/sea_cave_cove_cave_from_above.png) |
| `IMG-0160` | `sea_cave_cove_cave3.png` | Wilderness | none (0) | - | pirates_cove, pirate, cove, lagoon | [View](images/coasts_and_islands/sea_caves_and_coves/sea_cave_cove_cave3.png) |
| `IMG-0161` | `sea_cave_cove_cli_again_ayia.png` | Wilderness | none (0) | Cliü again to öo båck Ayia Napa,... | pirates_cove, pirate, cove, lagoon | [View](images/coasts_and_islands/sea_caves_and_coves/sea_cave_cove_cli_again_ayia.png) |
| `IMG-0162` | `sea_cave_cove_cove_caves_apostleislands.jpg` | Wilderness | none (0) | - | pirates_cove, pirate, cove, lagoon | [View](images/coasts_and_islands/sea_caves_and_coves/sea_cave_cove_cove_caves_apostleislands.jpg) |
| `IMG-0163` | `sea_cave_cove_cove.png` | Wilderness | none (0) | - | pirates_cove, pirate, cove, lagoon | [View](images/coasts_and_islands/sea_caves_and_coves/sea_cave_cove_cove.png) |
| `IMG-0164` | `sea_cave_cove_mountain_stone_bothy_manarola_cinque_terre.png` | Isolated (1) | mountain_stone_bothy (1) | Manarola, Cinque Terre National ... | pirates_cove, pirate, cove, lagoon | [View](images/coasts_and_islands/sea_caves_and_coves/sea_cave_cove_mountain_stone_bothy_manarola_cinque_terre.png) |
| `IMG-0165` | `sea_cave_cove_mountain_stone_bothy_mikolaj_niemczewski_shutterstock.png` | Isolated (1) | mountain_stone_bothy (1) | ly (O Mikolaj Niemczewski/Shutte... | pirates_cove, pirate, cove, lagoon | [View](images/coasts_and_islands/sea_caves_and_coves/sea_cave_cove_mountain_stone_bothy_mikolaj_niemczewski_shutterstock.png) |

### Beaches & Chalk Bluffs (`beaches_and_bluffs`, 39 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0193` | `beach_bluffs_stokksnes_headland_and.png` | Wilderness | none (0) | Stokksnes headland and Vestrahor... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_stokksnes_headland_and.png) |
| `IMG-0194` | `beach_bluffs_beach.png` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_beach.png) |
| `IMG-0195` | `beach_bluffs_kefalonia.png` | Wilderness | none (0) | Kefalonia, Greece | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_kefalonia.png) |
| `IMG-0196` | `beach_bluffs_beach_cliffs_brighteye.jpg` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_beach_cliffs_brighteye.jpg) |
| `IMG-0197` | `beach_bluffs_beach_cliffs_ottercliff.jpg` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_beach_cliffs_ottercliff.jpg) |
| `IMG-0198` | `beach_bluffs_beach_ladigue_seychelles.jpg` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_beach_ladigue_seychelles.jpg) |
| `IMG-0199` | `beach_bluffs_beach_rocks_rocksseychelles.jpg` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_beach_rocks_rocksseychelles.jpg) |
| `IMG-0200` | `beach_bluffs_anse_source_argent.png` | Wilderness | none (0) | Anse Source d'Argent, Seychelles | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_anse_source_argent.png) |
| `IMG-0201` | `beach_bluffs_valdovifio.png` | Wilderness | none (0) | Valdovifio, Spain | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_valdovifio.png) |
| `IMG-0202` | `beach_bluffs_cliffs_moher.png` | Wilderness | none (0) | Cliffs of Moher, Ireland | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_cliffs_moher.png) |
| `IMG-0203` | `beach_bluffs_coasts.png` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_coasts.png) |
| `IMG-0204` | `beach_bluffs_marimurtra_botanical_garden.png` | Wilderness | none (0) | Marimurtra Botanical Garden, Spa... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_marimurtra_botanical_garden.png) |
| `IMG-0205` | `beach_bluffs_porto_katsiki_beach.png` | Wilderness | none (0) | Porto Katsiki beach on Lefkada i... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_porto_katsiki_beach.png) |
| `IMG-0206` | `beach_bluffs_view.png` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_view.png) |
| `IMG-0207` | `beach_bluffs_lagui_australia.png` | Wilderness | none (0) | lagui, Australia | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_lagui_australia.png) |
| `IMG-0208` | `beach_bluffs_pgerve.png` | Wilderness | none (0) | pgerve, peru | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_pgerve.png) |
| `IMG-0209` | `beach_bluffs_anse_source_dargent.png` | Wilderness | none (0) | Anse Source dArgent beach on La ... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_anse_source_dargent.png) |
| `IMG-0210` | `beach_bluffs_view_02.png` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_view_02.png) |
| `IMG-0211` | `beach_bluffs_gif_discovery_coast.png` | Wilderness | none (0) | .gif, Discovery Coast, Brazil | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_gif_discovery_coast.png) |
| `IMG-0212` | `beach_bluffs_prince_christian_sound.png` | Wilderness | none (0) | Prince Christian Sound in southe... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_prince_christian_sound.png) |
| `IMG-0213` | `beach_bluffs_red_mangrove_tree.png` | Wilderness | none (0) | Red mangrove tree seedlings in G... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_red_mangrove_tree.png) |
| `IMG-0214` | `beach_bluffs_beach_cala_luna.png` | Wilderness | none (0) | The beach at Cala Luna, Sardinia... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_beach_cala_luna.png) |
| `IMG-0215` | `beach_bluffs_chalk_cliffs_tretat.png` | Wilderness | none (0) | The chalk cliffs of Étretat, Nor... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_chalk_cliffs_tretat.png) |
| `IMG-0216` | `beach_bluffs_blue_lagoon_pulau.png` | Wilderness | none (0) | Blue lagoon at Pulau Ay, Banda I... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_blue_lagoon_pulau.png) |
| `IMG-0217` | `beach_bluffs_again_gypack_phillip.png` | Wilderness | none (0) | again gypack• Phillip Island, Au... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_again_gypack_phillip.png) |
| `IMG-0218` | `beach_bluffs_nse_source_dargent.png` | Wilderness | none (0) | nse Source dArgent beach, La Dig... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_nse_source_dargent.png) |
| `IMG-0219` | `beach_bluffs_island_shoreline.jpg` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_island_shoreline.jpg) |
| `IMG-0221` | `beach_bluffs_nocalicoast.jpg` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_nocalicoast.jpg) |
| `IMG-0222` | `beach_bluffs_north_cliffs_ledge.jpg` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_north_cliffs_ledge.jpg) |
| `IMG-0224` | `beach_bluffs_north_cliffs_tiered.jpg` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_north_cliffs_tiered.jpg) |
| `IMG-0225` | `beach_bluffs_overall.png` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_overall.png) |
| `IMG-0226` | `beach_bluffs_beachy_head_south.png` | Wilderness | none (0) | Beachy Head in South Downs Natio... | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_beachy_head_south.png) |
| `IMG-0227` | `beach_bluffs_rocky_beach_inlet.png` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_rocky_beach_inlet.png) |
| `IMG-0312` | `beach_bluffs_anse_source_argent_02.png` | Wilderness | none (0) | Anse Source d'Argent, Seychelles | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_anse_source_argent_02.png) |
| `IMG-0313` | `beach_bluffs_source_argent_seychelles.png` | Wilderness | none (0) | Source d'Argent, Seychelles | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_source_argent_seychelles.png) |
| `IMG-0317` | `beach_bluffs_marimurtra_garden.png` | Wilderness | none (0) | Marimurtra Garden, Spain | beach, shimmering, cliffs, sea_view | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_marimurtra_garden.png) |
| `IMG-0318` | `beach_bluffs_portada.png` | Wilderness | none (0) | La Portada, Chile | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_portada.png) |
| `IMG-0322` | `beach_bluffs_mountain_stone_bothy_valle_della_luna.png` | Isolated (1) | mountain_stone_bothy (1) | Valle della Luna, Sardinia | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_mountain_stone_bothy_valle_della_luna.png) |
| `IMG-0339` | `beach_bluffs_valdovino.png` | Wilderness | none (0) | Valdovino, Spain | beach, shimmering, cliffs, ocean_surf | [View](images/coasts_and_islands/beaches_and_bluffs/beach_bluffs_valdovino.png) |

### Rocky Surf & Headlands (`rocky_surf_and_headlands`, 1 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0323` | `coastal_surf_marmaris.png` | Wilderness | none (0) | Marmaris, Turkiye | coast, coastal, perimeter, breakwaters | [View](images/coasts_and_islands/rocky_surf_and_headlands/coastal_surf_marmaris.png) |

### Islands & Tidal Lagoons (`islands_and_lagoons`, 2 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0329` | `island_lagoon_wayag_islands_raja.png` | Wilderness | none (0) | Wayag Islands, Raja Ampat | pirates_cove, pirate, cove, azure_shoals | [View](images/coasts_and_islands/islands_and_lagoons/island_lagoon_wayag_islands_raja.png) |
| `IMG-0341` | `island_lagoon_atlantic_sea_stack.png` | Wilderness | none (0) | Atlantic Sea Stack | pirates_cove, pirate, cove, open_water | [View](images/coasts_and_islands/islands_and_lagoons/island_lagoon_atlantic_sea_stack.png) |

## Settlements & Bastions (96 Assets)

### Castles & Fortresses (`castles_and_fortresses`, 32 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0002` | `castle_fortress_castle_fortress_monastery_rousanou_meteora.png` | Isolated (1) | castle_fortress (1) | Monastery of Rousanou, Meteora, ... | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_monastery_rousanou_meteora.png) |
| `IMG-0003` | `castle_fortress_castle_fortress_bobolice_castle_poland.png` | Isolated (1) | castle_fortress (1) | Bobolice Castle, Poland | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_bobolice_castle_poland.png) |
| `IMG-0004` | `castle_fortress_castle_fortress_bastion_roccacalascio.jpg` | Isolated (1) | castle_fortress (1) | - | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_bastion_roccacalascio.jpg) |
| `IMG-0005` | `castle_fortress_castle_fortress_bastion_santajusta.jpg` | Isolated (1) | castle_fortress (1) | - | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_bastion_santajusta.jpg) |
| `IMG-0006` | `castle_fortress_castle_fortress_cork.png` | Isolated (1) | castle_fortress (1) | in cork, Ireland | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_cork.png) |
| `IMG-0007` | `castle_fortress_castle_fortress_haghartsin_monastery_armenia.png` | Isolated (1) | castle_fortress (1) | Haghartsin Monastery, Armenia | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_haghartsin_monastery_armenia.png) |
| `IMG-0008` | `castle_fortress_castle_fortress_desert_fort.png` | Isolated (1) | castle_fortress (1) | - | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_desert_fort.png) |
| `IMG-0009` | `castle_fortress_castle_fortress_geghardmonastery.jpg` | Isolated (1) | castle_fortress (1) | - | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_geghardmonastery.jpg) |
| `IMG-0010` | `castle_fortress_castle_fortress_guj_hachiman_castle.png` | Isolated (1) | castle_fortress (1) | GujÖ Hachiman Castle, Gifu prefe... | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_guj_hachiman_castle.png) |
| `IMG-0011` | `castle_fortress_castle_fortress_castle_zempl_mountains.png` | Isolated (1) | castle_fortress (1) | Füzér Castle in the Zemplén Moun... | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_castle_zempl_mountains.png) |
| `IMG-0012` | `castle_fortress_castle_fortress_castle_tioram.png` | Isolated (1) | castle_fortress (1) | Castle Tioram, Scotland | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_castle_tioram.png) |
| `IMG-0014` | `castle_fortress_castle_fortress_urquhart_castle.png` | Isolated (1) | castle_fortress (1) | Urquhart Castle, Scotland | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_urquhart_castle.png) |
| `IMG-0015` | `castle_fortress_castle_fortress_daghartsin_monastery_armenia.png` | Isolated (1) | castle_fortress (1) | daghartsin Monastery, Armenia | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_daghartsin_monastery_armenia.png) |
| `IMG-0016` | `castle_fortress_castle_fortress_mountain_bastion_guaitatower.jpg` | Isolated (1) | castle_fortress, watchtower (1) | - | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_mountain_bastion_guaitatower.jpg) |
| `IMG-0017` | `castle_fortress_castle_fortress_outpost_vietnamstairs.jpg` | Isolated (1) | castle_fortress (1) | - | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_outpost_vietnamstairs.jpg) |
| `IMG-0018` | `castle_fortress_castle_fortress_tengbochemonastery.jpg` | Isolated (1) | castle_fortress (1) | - | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_tengbochemonastery.jpg) |
| `IMG-0019` | `castle_fortress_castle_fortress_rifugio_locatelli_dolomites.png` | Isolated (1) | castle_fortress (1) | Rifugio Locatelli in the Dolomit... | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_rifugio_locatelli_dolomites.png) |
| `IMG-0021` | `castle_fortress_castle_fortress_monemvasia.png` | Isolated (1) | castle_fortress (1) | Monemvasia, Greece | coast, coastal, perimeter, breakwaters | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_monemvasia.png) |
| `IMG-0022` | `castle_fortress_castle_fortress_iwi.jpg` | Isolated (1) | castle_fortress (1) | IWI | coast, coastal, perimeter, breakwaters | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_iwi.jpg) |
| `IMG-0026` | `castle_fortress_castle_fortress_hohenzollern_castle_sahara.png` | Isolated (1) | castle_fortress (1) | Hohenzollern Castle, Germany (O ... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_hohenzollern_castle_sahara.png) |
| `IMG-0027` | `castle_fortress_castle_fortress_fort_latte.png` | Isolated (1) | castle_fortress (1) | Fort-la-Latte, France | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_fort_latte.png) |
| `IMG-0028` | `castle_fortress_castle_fortress_dunluce_castle_antrim.png` | Isolated (1) | castle_fortress (1) | Dunluce Castle, County Antrim, N... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_dunluce_castle_antrim.png) |
| `IMG-0036` | `castle_fortress_castle_fortress_outpost_fort_wooded.png` | Isolated (1) | castle_fortress (1) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_outpost_fort_wooded.png) |
| `IMG-0037` | `castle_fortress_castle_fortress_outpost_fortenossa.jpg` | Isolated (1) | castle_fortress (1) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_outpost_fortenossa.jpg) |
| `IMG-0064` | `castle_fortress_castle_fortress_kilchurn_castle_reflected.png` | Isolated (1) | castle_fortress (1) | Kilchurn Castle reflected in Loc... | lake, the, sacred, temple | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_kilchurn_castle_reflected.png) |
| `IMG-0068` | `castle_fortress_castle_fortress_cloughoughter_castle_lough.png` | Isolated (1) | castle_fortress (1) | Cloughoughter Castle in Lough Ou... | lake, the, sacred, temple | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_cloughoughter_castle_lough.png) |
| `IMG-0311` | `castle_fortress_castle_fortress_european_water_castle.png` | Isolated (1) | castle_fortress, defensive_moat (1) | European Water Castle | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_european_water_castle.png) |
| `IMG-0315` | `castle_fortress_castle_fortress_mont_saint_michel.png` | Isolated (1) | castle_fortress (1) | Mont-Saint-Michel, France | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_mont_saint_michel.png) |
| `IMG-0324` | `castle_fortress_castle_fortress_jahili_fort_uae.png` | Isolated (1) | castle_fortress, watchtower (1) | Al Jahili Fort, UAE | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_jahili_fort_uae.png) |
| `IMG-0325` | `castle_fortress_castle_fortress_gulf_girolata.png` | Isolated (1) | castle_fortress, watchtower (1) | Gulf of Girolata, France | pirates_cove, pirate, cove, sheltered_bay | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_gulf_girolata.png) |
| `IMG-0328` | `castle_fortress_castle_fortress_branik_castle_slovenia.png` | Isolated (1) | castle_fortress (1) | Branik Castle, Slovenia | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_branik_castle_slovenia.png) |
| `IMG-0340` | `castle_fortress_castle_fortress_fort_latte_02.png` | Isolated (1) | castle_fortress (1) | Fort-la-Latte, France | bastion, bastions, fortified, enclaves | [View](images/settlements_and_bastions/castles_and_fortresses/castle_fortress_castle_fortress_fort_latte_02.png) |

### Walled Towns & Citadels (`walled_towns_and_citadels`, 28 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0023` | `citadel_town_outpost_arrival.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_outpost_arrival.jpg) |
| `IMG-0024` | `citadel_town_outpost_pier.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_outpost_pier.jpg) |
| `IMG-0025` | `citadel_town_outpost.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_outpost.jpg) |
| `IMG-0030` | `citadel_town_view.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_view.jpg) |
| `IMG-0031` | `citadel_town_mont_saint_michel.png` | Settlement | tidal_abbey_citadel, walled_town (many) | Mont-Saint-Michel, Normandy, Fra... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_mont_saint_michel.png) |
| `IMG-0032` | `citadel_town_medieval_city_walls.png` | Settlement | walled_town, stone_ramparts (many) | Medieval city walls, Åvila, Spai... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_medieval_city_walls.png) |
| `IMG-0033` | `citadel_town_baily_lighthouse.png` | Settlement | walled_town, stone_ramparts (many) | Baily Lighthouse, Ireland | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_baily_lighthouse.png) |
| `IMG-0034` | `citadel_town_mountain_cathedral_chapelaiguilhe.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_mountain_cathedral_chapelaiguilhe.jpg) |
| `IMG-0035` | `citadel_town_mountain_staircase_skelligmichael.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_mountain_staircase_skelligmichael.jpg) |
| `IMG-0038` | `citadel_town_outpost_lecastella.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_outpost_lecastella.jpg) |
| `IMG-0039` | `citadel_town_outpost_stmalo.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_outpost_stmalo.jpg) |
| `IMG-0040` | `citadel_town_and_ossa.png` | Settlement | walled_town, stone_ramparts (many) | s and to Ossa de ar, Spain | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_and_ossa.png) |
| `IMG-0041` | `citadel_town_juft_cit_carcassonne.png` | Settlement | walled_town, stone_ramparts (many) | jUfT 1 Cité de Carcassonne in Ca... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_juft_cit_carcassonne.png) |
| `IMG-0042` | `citadel_town_view_toward_san.png` | Settlement | walled_town, stone_ramparts (many) | A view toward San Pietro church ... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_view_toward_san.png) |
| `IMG-0043` | `citadel_town_piazza_dei_miracoli.png` | Settlement | walled_town, stone_ramparts (many) | Piazza dei Miracoli in Pisa, Ita... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_piazza_dei_miracoli.png) |
| `IMG-0044` | `citadel_town_fisgard_lighthouse_esquimalt.png` | Settlement | walled_town, stone_ramparts (many) | Fisgard Lighthouse, Esquimalt Ha... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_fisgard_lighthouse_esquimalt.png) |
| `IMG-0045` | `citadel_town_baily_lighthouse_02.png` | Settlement | walled_town, stone_ramparts (many) | Baily Lighthouse, Ireland | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_baily_lighthouse_02.png) |
| `IMG-0046` | `citadel_town_south_stack_lighthouse.png` | Settlement | walled_town, stone_ramparts (many) | South Stack Lighthouse at sunset... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_south_stack_lighthouse.png) |
| `IMG-0047` | `citadel_town_gsteinen_lighthouse_near.png` | Settlement | walled_town, stone_ramparts (many) | Høgsteinen Lighthouse near Ålesu... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_gsteinen_lighthouse_near.png) |
| `IMG-0048` | `citadel_town_peggy_cove_nova.png` | Settlement | walled_town, stone_ramparts (many) | Peggy's Cove, Nova Scotia, Canad... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_peggy_cove_nova.png) |
| `IMG-0049` | `citadel_town_start_point_lighthouse.png` | Settlement | walled_town, stone_ramparts (many) | Start Point Lighthouse, South De... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_start_point_lighthouse.png) |
| `IMG-0050` | `citadel_town_lighthouse_island_nubblelight.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_lighthouse_island_nubblelight.jpg) |
| `IMG-0051` | `citadel_town_ile_vierge_lighthouse.png` | Settlement | walled_town, stone_ramparts (many) | ile Vierge Lighthouse, France | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_ile_vierge_lighthouse.png) |
| `IMG-0052` | `citadel_town_lighthouse_petitminou.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_lighthouse_petitminou.jpg) |
| `IMG-0053` | `citadel_town_santa_cruz_breakwater.png` | Settlement | walled_town, stone_ramparts (many) | Santa Cruz Breakwater Lighthouse... | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_santa_cruz_breakwater.png) |
| `IMG-0054` | `citadel_town_lighthousewave.jpg` | Settlement | walled_town, stone_ramparts (many) | - | outpost, the, settlement, citadel | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_lighthousewave.jpg) |
| `IMG-0129` | `citadel_town_mountain_valley_town.jpg` | Settlement | mountain_village (many) | - | valley_road, canyon, road, river | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_mountain_valley_town.jpg) |
| `IMG-0132` | `citadel_town_settlements.png` | Settlement | walled_town, stone_ramparts (many) | - | valley_road, canyon, road, river | [View](images/settlements_and_bastions/walled_towns_and_citadels/citadel_town_settlements.png) |

### Temples, Monasteries & Shrines (`temples_monasteries_and_shrines`, 32 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0055` | `monastery_temple_monastery_sanctuary_forest_lake.jpg` | Isolated (1) | monastery_sanctuary (1) | - | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_forest_lake.jpg) |
| `IMG-0056` | `monastery_temple_monastery_sanctuary_lake_carezza_south.png` | Isolated (1) | monastery_sanctuary (1) | Lake Carezza in South Tyrol, Ita... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_lake_carezza_south.png) |
| `IMG-0057` | `monastery_temple_monastery_sanctuary_lake_peho_torres.png` | Isolated (1) | monastery_sanctuary (1) | Lake Pehoé, Torres del Paine Nat... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_lake_peho_torres.png) |
| `IMG-0058` | `monastery_temple_monastery_sanctuary_estock.png` | Isolated (1) | monastery_sanctuary (1) | estock United states) | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_estock.png) |
| `IMG-0059` | `monastery_temple_monastery_sanctuary_emerald_lake_south.png` | Isolated (1) | monastery_sanctuary (1) | Emerald Lake, South Klondike Hig... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_emerald_lake_south.png) |
| `IMG-0060` | `monastery_temple_monastery_sanctuary_bachalpsee.png` | Isolated (1) | monastery_sanctuary (1) | Bachalpsee, Switzerland | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_bachalpsee.png) |
| `IMG-0061` | `monastery_temple_monastery_sanctuary_guanacos_torres_del.png` | Isolated (1) | monastery_sanctuary (1) | Guanacos, Torres del Paine Natio... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_guanacos_torres_del.png) |
| `IMG-0062` | `monastery_temple_monastery_sanctuary_hatterhorn_mountain.png` | Isolated (1) | monastery_sanctuary (1) | hatterhorn mountain, Switzerland | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_hatterhorn_mountain.png) |
| `IMG-0063` | `monastery_temple_monastery_sanctuary_view.png` | Isolated (1) | monastery_sanctuary (1) | - | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_view.png) |
| `IMG-0065` | `monastery_temple_monastery_sanctuary_view_02.png` | Isolated (1) | monastery_sanctuary (1) | - | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_view_02.png) |
| `IMG-0066` | `monastery_temple_monastery_sanctuary_ujita_getty_images.png` | Isolated (1) | monastery_sanctuary (1) | ujita/Getty Images) — United Sta... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_ujita_getty_images.png) |
| `IMG-0067` | `monastery_temple_monastery_sanctuary_atitch_stills.png` | Isolated (1) | monastery_sanctuary (1) | atitch Pi stills United | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_atitch_stills.png) |
| `IMG-0069` | `monastery_temple_monastery_sanctuary_click_restasee.png` | Isolated (1) | monastery_sanctuary (1) | Click to go )restasee, Switzerla... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_click_restasee.png) |
| `IMG-0070` | `monastery_temple_monastery_sanctuary_view_03.png` | Isolated (1) | monastery_sanctuary (1) | So | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_view_03.png) |
| `IMG-0071` | `monastery_temple_monastery_sanctuary_back_click_again.png` | Isolated (1) | monastery_sanctuary (1) | to go back Click again | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_back_click_again.png) |
| `IMG-0072` | `monastery_temple_monastery_sanctuary_moraine_lake.png` | Isolated (1) | monastery_sanctuary (1) | Moraine Lake, Canada | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_moraine_lake.png) |
| `IMG-0073` | `monastery_temple_monastery_sanctuary_knuth_jdsmossen_nature.png` | Isolated (1) | monastery_sanctuary (1) | Knuthöjdsmossen, a nature reserv... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_knuth_jdsmossen_nature.png) |
| `IMG-0074` | `monastery_temple_monastery_sanctuary_kings_mountain_chugach.png` | Isolated (1) | monastery_sanctuary (1) | Kings Mountain, Chugach Mountain... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_kings_mountain_chugach.png) |
| `IMG-0075` | `monastery_temple_monastery_sanctuary_two_jack_lake.png` | Isolated (1) | monastery_sanctuary (1) | Two Jack Lake in Banff National ... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_two_jack_lake.png) |
| `IMG-0076` | `monastery_temple_monastery_sanctuary_view_04.png` | Isolated (1) | monastery_sanctuary (1) | - | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_view_04.png) |
| `IMG-0077` | `monastery_temple_monastery_sanctuary_appenzell_innerrhoden.png` | Isolated (1) | monastery_sanctuary (1) | Appenzell Innerrhoden, Switzerla... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_appenzell_innerrhoden.png) |
| `IMG-0078` | `monastery_temple_monastery_sanctuary_slope_lake_grinnellglacier.jpg` | Isolated (1) | monastery_sanctuary (1) | - | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_slope_lake_grinnellglacier.jpg) |
| `IMG-0081` | `monastery_temple_monastery_sanctuary_temple_lake.png` | Isolated (1) | monastery_sanctuary (1) | - | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_temple_lake.png) |
| `IMG-0083` | `monastery_temple_monastery_sanctuary_qooalp_ark_oland.png` | Isolated (1) | monastery_sanctuary (1) | a Qooalp ark, P Oland | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_qooalp_ark_oland.png) |
| `IMG-0084` | `monastery_temple_monastery_sanctuary_vanoise_nation.png` | Isolated (1) | monastery_sanctuary (1) | Vanoise National Park, France Na... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_vanoise_nation.png) |
| `IMG-0085` | `monastery_temple_monastery_sanctuary_torres_del_paine.png` | Isolated (1) | monastery_sanctuary (1) | Torres del Paine National Park, ... | lake, the, sacred, temple | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_torres_del_paine.png) |
| `IMG-0128` | `monastery_temple_monastery_sanctuary_sligachan_old_bridge.png` | Isolated (1) | monastery_sanctuary (1) | Sligachan Old Bridge, Isle of Sk... | valley_road, canyon, road, river | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_sligachan_old_bridge.png) |
| `IMG-0147` | `monastery_temple_monastery_sanctuary_paro_taktsang_buddhist.png` | Isolated (1) | monastery_sanctuary (1) | Paro Taktsang, a Buddhist monast... | cliffs, the, interior, escarpment | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_paro_taktsang_buddhist.png) |
| `IMG-0151` | `monastery_temple_monastery_sanctuary_lupine_fields_and.png` | Isolated (1) | monastery_sanctuary (1) | Lupine fields and church at sunr... | grasslands, the, razor, sedge | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_lupine_fields_and.png) |
| `IMG-0192` | `monastery_temple_monastery_sanctuary_modhera_sun_temple.png` | Isolated (1) | monastery_sanctuary (1) | Modhera Sun Temple, India | swamp, the, sunken, marsh | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_modhera_sun_temple.png) |
| `IMG-0334` | `monastery_temple_cathedral_basilica_las_lajas_sanctuary.png` | Isolated (1) | cathedral_basilica (1) | Las Lajas Sanctuary, Colombia | cathedral, citadel, keep, canyon_river | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_cathedral_basilica_las_lajas_sanctuary.png) |
| `IMG-0338` | `monastery_temple_monastery_sanctuary_tongtian_avenue_tianmen.png` | Isolated (1) | monastery_sanctuary (1) | Tongtian Avenue, Tianmen Mountai... | cliffs, the, interior, escarpment | [View](images/settlements_and_bastions/temples_monasteries_and_shrines/monastery_temple_monastery_sanctuary_tongtian_avenue_tianmen.png) |

### Harbors & Lighthouses (`harbors_and_lighthouses`, 4 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0220` | `lighthouse_harbor_lighthouse_beacon_lighthouse_island_bassrock.jpg` | Isolated (1) | lighthouse_beacon (1) | - | beach, shimmering, cliffs, ocean_surf | [View](images/settlements_and_bastions/harbors_and_lighthouses/lighthouse_harbor_lighthouse_beacon_lighthouse_island_bassrock.jpg) |
| `IMG-0314` | `lighthouse_harbor_monastery_sanctuary_porto_venere.png` | Isolated (1) | monastery_sanctuary (1) | Porto Venere, Italy | lighthouse, the, pier, ocean_surf | [View](images/settlements_and_bastions/harbors_and_lighthouses/lighthouse_harbor_monastery_sanctuary_porto_venere.png) |
| `IMG-0332` | `lighthouse_harbor_lighthouse_beacon_formentor_lighthouse_majorca.png` | Isolated (1) | lighthouse_beacon (1) | Formentor Lighthouse, Majorca | lighthouse, the, pier, ocean_abyss | [View](images/settlements_and_bastions/harbors_and_lighthouses/lighthouse_harbor_lighthouse_beacon_formentor_lighthouse_majorca.png) |
| `IMG-0333` | `lighthouse_harbor_lighthouse_beacon_majorca.png` | Isolated (1) | lighthouse_beacon (1) | Majorca, Spain | lighthouse, the, pier, ocean_surf | [View](images/settlements_and_bastions/harbors_and_lighthouses/lighthouse_harbor_lighthouse_beacon_majorca.png) |

## Ancient Ruins & Subterranean Vaults (24 Assets)

### Overgrown Ruins & Pyramids (`overgrown_ruins_and_pyramids`, 18 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0013` | `ancient_ruins_castle_zafra_guadalajara.png` | Ancient Ruins | carved_stepwell, ancient_ruin (1) | Castle of Zafra, Guadalajara pro... | bastion, bastions, fortified, enclaves | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_castle_zafra_guadalajara.png) |
| `IMG-0029` | `ancient_ruins_ruins_medieval_castle.png` | Ancient Ruins | stone_colonnades, ancient_ruin (1) | Ruins of the medieval castle of ... | outpost, the, settlement, citadel | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_ruins_medieval_castle.png) |
| `IMG-0079` | `ancient_ruins_adalaj_stepwell_india.png` | Ancient Ruins | carved_stepwell, ancient_ruin (1) | Adalaj Stepwell, India | lake, the, sacred, temple | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_adalaj_stepwell_india.png) |
| `IMG-0080` | `ancient_ruins_monastery_sanctuary_gadisar_lake_india.png` | Isolated (1) | monastery_sanctuary (1) | Gadisar Lake, India | lake, the, sacred, temple | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_monastery_sanctuary_gadisar_lake_india.png) |
| `IMG-0082` | `ancient_ruins_temple_mountnemrut.jpg` | Ancient Ruins | monumental_stone_heads, sanctuary_ruin (1) | - | lake, the, sacred, temple | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_temple_mountnemrut.jpg) |
| `IMG-0138` | `ancient_ruins_cliffs_dalyantombs.jpg` | Ancient Ruins | rock_cut_tombs, ancient_ruin (1) | - | cliffs, the, interior, escarpment | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_cliffs_dalyantombs.jpg) |
| `IMG-0166` | `ancient_ruins_neolithic_settlement_skara.png` | Ancient Ruins | neolithic_stone_dwellings, ancient_ruin (2-5) | The Neolithic settlement of Skar... | stone_mountain, stone, mountain, dome | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_neolithic_settlement_skara.png) |
| `IMG-0167` | `ancient_ruins_pueblo_ruins_hovenweep.png` | Ancient Ruins | stone_colonnades, ancient_ruin (1) | Pueblo ruins, Hovenweep National... | stone_mountain, stone, mountain, dome | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_pueblo_ruins_hovenweep.png) |
| `IMG-0252` | `ancient_ruins_castle_zafra_guadalajara_02.png` | Ancient Ruins | carved_stepwell, ancient_ruin (1) | Castle of Zafra, Guadalajara pro... | highlands, the, bleak, foothills | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_castle_zafra_guadalajara_02.png) |
| `IMG-0282` | `ancient_ruins_madame_sherri_forest.png` | Ancient Ruins | cyclopean_pyramid, ancient_ruin (1) | Madame Sherri Forest and the rui... | forest_ruins, forest, ruins, cryo | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_madame_sherri_forest.png) |
| `IMG-0283` | `ancient_ruins_north_gate_angkor.png` | Ancient Ruins | cyclopean_pyramid, ancient_ruin (1) | North Gate of Angkor Thom, Angko... | forest_ruins, forest, ruins, cryo | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_north_gate_angkor.png) |
| `IMG-0284` | `ancient_ruins_mayan_ruins_tikal.png` | Ancient Ruins | cyclopean_pyramid, ancient_ruin (1) | Mayan ruins in Tikal, Guatemala ... | forest_ruins, forest, ruins, cryo | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_mayan_ruins_tikal.png) |
| `IMG-0285` | `ancient_ruins_picchu_dora_dalton.png` | Ancient Ruins | cyclopean_pyramid, ancient_ruin (1) | Picchu, peru (0 Dora Dalton/Gett... | forest_ruins, forest, ruins, cryo | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_picchu_dora_dalton.png) |
| `IMG-0286` | `ancient_ruins_rockfo_ress_central.png` | Ancient Ruins | cyclopean_pyramid, ancient_ruin (1) | a rockfo ress in Central Provinc... | forest_ruins, forest, ruins, cryo | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_rockfo_ress_central.png) |
| `IMG-0287` | `ancient_ruins_old_underground_cellar.png` | Ancient Ruins | cyclopean_pyramid, ancient_ruin (1) | Old underground cellar, Bavaria,... | forest_ruins, forest, ruins, cryo | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_old_underground_cellar.png) |
| `IMG-0288` | `ancient_ruins_maya_site_cop.png` | Ancient Ruins | cyclopean_pyramid, ancient_ruin (1) | Maya site of Copån, Honduras (O ... | forest_ruins, forest, ruins, cryo | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_maya_site_cop.png) |
| `IMG-0289` | `ancient_ruins_aerial_view_corjuem.png` | Ancient Ruins | cyclopean_pyramid, ancient_ruin (1) | Aerial view of Corjuem Fort in G... | forest_ruins, forest, ruins, cryo | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_aerial_view_corjuem.png) |
| `IMG-0290` | `ancient_ruins_wat_tang_sai.png` | Ancient Ruins | cyclopean_pyramid, ancient_ruin (1) | Wat Tang Sai Temple in Ban Krut,... | forest_ruins, forest, ruins, cryo | [View](images/ancient_ruins_and_vaults/overgrown_ruins_and_pyramids/ancient_ruins_wat_tang_sai.png) |

### Subterranean Vaults & Cisterns (`subterranean_vaults_and_caves`, 6 Assets)

| ID | Filename | Building Class | Types & Count | Real-World Subject | Key Tags | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IMG-0020` | `subterranean_vault_underground_lake_ruskeala.jpg` | Subterranean | underground_chamber (1) | - | bastion, bastions, fortified, enclaves | [View](images/ancient_ruins_and_vaults/subterranean_vaults_and_caves/subterranean_vault_underground_lake_ruskeala.jpg) |
| `IMG-0142` | `subterranean_vault_fairy_chimneys_and.png` | Subterranean | carved_cliff_caves (1) | Fairy chimneys and cave dwelling... | cliffs, the, interior, escarpment | [View](images/ancient_ruins_and_vaults/subterranean_vaults_and_caves/subterranean_vault_fairy_chimneys_and.png) |
| `IMG-0223` | `subterranean_vault_north_cliffs_sea.jpg` | Wilderness | none (0) | - | beach, shimmering, cliffs, ocean_surf | [View](images/ancient_ruins_and_vaults/subterranean_vaults_and_caves/subterranean_vault_north_cliffs_sea.jpg) |
| `IMG-0319` | `subterranean_vault_basilica_cistern.png` | Subterranean | pillared_cistern, subterranean_vault (1) | Basilica Cistern, Turkiye | bastion, bastions, fortified, enclaves | [View](images/ancient_ruins_and_vaults/subterranean_vaults_and_caves/subterranean_vault_basilica_cistern.png) |
| `IMG-0321` | `subterranean_vault_cappadocia.png` | Subterranean | carved_cliff_caves (1) | Cappadocia, Turkiye | cliffs, the, interior, escarpment | [View](images/ancient_ruins_and_vaults/subterranean_vaults_and_caves/subterranean_vault_cappadocia.png) |
| `IMG-0343` | `subterranean_vault_tianmen_mountain.jpg` | Wilderness | none (0) | Tianmen Mountain, China | cliffs, the, interior, escarpment | [View](images/ancient_ruins_and_vaults/subterranean_vaults_and_caves/subterranean_vault_tianmen_mountain.jpg) |

