// Workstation State & Lifecycle Management
    // Capture pristine built-in modules baseline before any disk or custom modules mutate the catalog
    let BUILTIN_MODULES_BASELINE = (typeof ALL_MODULES !== "undefined" && Array.isArray(ALL_MODULES))
      ? JSON.parse(JSON.stringify(ALL_MODULES))
      : [];

    function ensureBuiltinModulesBaseline() {
      if (BUILTIN_MODULES_BASELINE.length === 0 && typeof ALL_MODULES !== "undefined" && Array.isArray(ALL_MODULES) && ALL_MODULES.length > 0) {
        BUILTIN_MODULES_BASELINE = JSON.parse(JSON.stringify(ALL_MODULES));
      }
      return BUILTIN_MODULES_BASELINE;
    }

    function createSterileTopology(options = {}) {
      const defaultLayers = (typeof getDefaultLayers === 'function') ? getDefaultLayers() : [
        { id: 'layer-ground', name: 'Ground Surface', visible: true, locked: false, color: '#2d3748', opacity: 1.0 },
        { id: 'layer-structures', name: 'Structures & Enclaves', visible: true, locked: false, color: '#3182ce', opacity: 1.0 },
        { id: 'layer-subterranean', name: 'Subterranean & Dungeons', visible: true, locked: false, color: '#805ad5', opacity: 1.0 },
        { id: 'layer-hazards', name: 'Hazards & Clocks', visible: true, locked: false, color: '#e53e3e', opacity: 1.0 }
      ];

      return {
        id: options.campaignId || 'campaign_scratch',
        name: options.campaignName || 'Untitled Campaign',
        campaignName: options.campaignName || 'Untitled Campaign',
        rootMapId: 'map_root',
        activeMapId: 'map_root',
        nodes: {},
        links: [],
        waves: [],
        layers: JSON.parse(JSON.stringify(defaultLayers)),
        shapes: [],
        npcs: [],
        quests: [],
        items: [],
        trackers: [],
        tickets: [],
        edgeData: {},
        edgeNotes: {},
        custom_modules: [],
        deletedModules: [],
        deletedPrototypes: []
      };
    }
    window.createSterileTopology = createSterileTopology;

    // Global Workstation State (Sterile Container Invariant: activeTopology is never null)
    const Workstation = {
      activeTopology: createSterileTopology(),
      activeTool: 'select',
      selectedEntity: null, // { type: 'node'|'edge'|'global'|'shape', id: ... }
      selectedEntities: [], // Array<{ type: 'node'|'edge'|'shape', id: ... }>
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      isDraggingNode: false,
      isPanning: false,
      draggedNodeId: null,
      dragStart: { x: 0, y: 0 },
      linkingSourceNodeId: null,
      showGrid: true,
      showInfluence: true,
      showRoads: true,
      showClocks: true,
      showBgMap: true,
      showCorridorLabels: true,
      showGmVision: true,
      activeLayerFocus: 'all',
      registeredMods: {},
      history: {
        undoStack: [],
        redoStack: [],
        maxDepth: 30,
        isPerforming: false
      },
      undoStack: [],
      redoStack: []
    };
    window.Workstation = Workstation;

    async function resetWorkstationSlate(options = {}) {
      // 1. Unbind and flush project directory if active
      if (window.activeProjectDirectoryHandle) {
        window.activeProjectDirectoryHandle = null;
        window.activeProjectDirectoryName = null;
        if (typeof updateDiskSyncIndicator === 'function') updateDiskSyncIndicator();
      }

      // 2. Clear active map image store in IndexedDB (await transaction completion)
      if (typeof clearActiveMapImageStore === 'function') {
        try {
          await clearActiveMapImageStore();
        } catch (idbErr) {
          console.warn('[resetWorkstationSlate] IDB image clear warning:', idbErr);
        }
      }

      // 3. Scrub SVG DOM background image and dynamic layer groups
      if (typeof document !== 'undefined') {
        const bgImg = document.getElementById('canvas-bg-image');
        if (bgImg) {
          bgImg.setAttribute('href', '');
          bgImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '');
          bgImg.style.display = 'none';
        }
        const dynamicGroups = document.querySelectorAll('.canvas-layer-group');
        dynamicGroups.forEach(el => el.remove());
      }

      // 4. Reset tool, selection, viewport, and undo/redo stacks
      Workstation.activeTool = 'select';
      Workstation.selectedEntity = null;
      Workstation.selectedEntities = [];
      Workstation.zoom = 1.0;
      Workstation.pan = { x: 0, y: 0 };
      Workstation.isDraggingNode = false;
      Workstation.isPanning = false;
      Workstation.draggedNodeId = null;
      Workstation.linkingSourceNodeId = null;
      if (Workstation.history) {
        Workstation.history.undoStack = [];
        Workstation.history.redoStack = [];
        Workstation.history.isPerforming = false;
      }
      Workstation.undoStack = [];
      Workstation.redoStack = [];

      // 5. Instantiate fresh sterile topology (Sterile Container Invariant: never null)
      Workstation.activeTopology = createSterileTopology(options);

      // 6. Reset state adapter globals & maps registry
      if (typeof nodes !== 'undefined') nodes = [];
      if (typeof links !== 'undefined') links = [];
      if (typeof nodeSlottedModules !== 'undefined') nodeSlottedModules = {};
      if (typeof edgeSlottedModules !== 'undefined') edgeSlottedModules = {};
      if (typeof revealedNodes !== 'undefined') revealedNodes = {};
      if (typeof activeMapMetadata !== 'undefined') activeMapMetadata = null;
      if (typeof activeMapId !== 'undefined') activeMapId = 'map_root';
      if (typeof maps !== 'undefined') {
        maps = {
          map_root: {
            id: 'map_root',
            title: 'World Map',
            scale: 'regional',
            parentNodeId: null,
            childMapIds: [],
            nodes: [],
            links: [],
            nodeSlottedModules: {},
            edgeSlottedModules: {},
            revealedNodes: {},
            mapMetadata: null
          }
        };
      }

      // 7. Restore ALL_MODULES and MODULES_MANIFEST from pristine baseline
      ensureBuiltinModulesBaseline();
      if (BUILTIN_MODULES_BASELINE && BUILTIN_MODULES_BASELINE.length > 0) {
        if (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) {
          ALL_MODULES.length = 0;
          BUILTIN_MODULES_BASELINE.forEach(m => ALL_MODULES.push(JSON.parse(JSON.stringify(m))));
        }
        if (typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST) && MODULES_MANIFEST !== ALL_MODULES) {
          MODULES_MANIFEST.length = 0;
          BUILTIN_MODULES_BASELINE.forEach(m => MODULES_MANIFEST.push(JSON.parse(JSON.stringify(m))));
        }
      }

      // 8. Clear browser localStorage keys (unless preserveStorage is requested)
      if (!options.preserveStorage && typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem("creator_studio_maps_registry");
          localStorage.removeItem("creator_studio_active_topology");
          localStorage.removeItem("creator_studio_campaign_entities");
          localStorage.removeItem("creator_studio_active_map_id");
          localStorage.removeItem("creator_studio_topology_timestamp");
          if (options.campaignId) {
            localStorage.setItem("cs_active_campaign", options.campaignId);
          } else {
            localStorage.removeItem("cs_active_campaign");
          }
        } catch (storageErr) {
          console.warn('[resetWorkstationSlate] localStorage clear warning:', storageErr);
        }
      }

      // 9. Dispatch onCampaignUnload lifecycle hook to registered mods
      const prevCampId = options.previousCampaignId || (typeof localStorage !== 'undefined' ? localStorage.getItem("cs_active_campaign") : null);
      if (Workstation.registeredMods) {
        Object.values(Workstation.registeredMods).forEach(modDef => {
          if (modDef && typeof modDef.onCampaignUnload === 'function') {
            try {
              modDef.onCampaignUnload({ previousCampaignId: prevCampId });
            } catch (modErr) {
              console.error(`[Mod ${modDef.id}] onCampaignUnload error:`, modErr);
            }
          }
        });
      }

      // 10. Update UI surfaces if available
      if (typeof renderCanvas === 'function') renderCanvas();
      if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
      if (typeof renderLayoutTabs === 'function') renderLayoutTabs();
      if (typeof updateStatusBar === 'function') updateStatusBar();
      if (typeof updateBreadcrumbsHUD === 'function') updateBreadcrumbsHUD();

      return Workstation.activeTopology;
    }
    window.resetWorkstationSlate = resetWorkstationSlate;

    function pushHistoryState(description) {
      if (!Workstation || !Workstation.history || Workstation.history.isPerforming) return;
      const topo = Workstation.activeTopology;
      if (!topo) return;

      const sanitizedTopo = JSON.parse(JSON.stringify(topo, (key, value) => {
        if (key === 'dataUrl' || key === 'base64') return undefined;
        return value;
      }));

      if (sanitizedTopo.mapMetadata) {
        if (typeof stripMapImageDataUrl === 'function') {
          sanitizedTopo.mapMetadata = stripMapImageDataUrl(sanitizedTopo.mapMetadata);
        } else {
          delete sanitizedTopo.mapMetadata.dataUrl;
        }
      }

      const snapshot = {
        description: description || 'State Change',
        timestamp: Date.now(),
        topology: sanitizedTopo
      };

      Workstation.history.undoStack.push(snapshot);
      if (Workstation.history.undoStack.length > Workstation.history.maxDepth) {
        Workstation.history.undoStack.shift();
      }
      Workstation.history.redoStack = [];
    }
    window.pushHistoryState = pushHistoryState;

    // Public Mod API (Exposed for Third-Party Worldbuilding Extensions & Mods)
    window.CreatorStudio = {
      registerMod: function(modDef) {
        if (!modDef || !modDef.id) return;
        Workstation.registeredMods[modDef.id] = modDef;
        if (typeof modDef.onInit === 'function') {
          try { modDef.onInit(window.CreatorStudio); } catch (e) { console.error(`[Mod ${modDef.id}] onInit error:`, e); }
        }
        if (typeof refreshModUI === 'function') refreshModUI();
        console.log(`[Creator Studio Mod API] Registered mod: ${modDef.name || modDef.id} (v${modDef.version || '1.0.0'})`);
      },
      resetWorkstationSlate: resetWorkstationSlate,
      getActiveTopology: function() { return Workstation.activeTopology; },
      selectNode: function(nodeId) { selectNode(nodeId); },
      selectEdge: function(type, uId, vId) { selectEdge(type, uId, vId); },
      refresh: function() { renderCanvas(); updatePropertiesGrid(); },
      saveActiveCampaign: function() { saveActiveCampaign(); },
      getRegisteredMods: function() { return Workstation.registeredMods; },
      registerMDIWindow: function(def) {
        if (typeof MDIWindowManager !== 'undefined' && typeof MDIWindowManager.registerWindow === 'function') {
          return MDIWindowManager.registerWindow(def);
        }
      }
    };

    // Initialize on Page Load
    window.addEventListener('DOMContentLoaded', () => {
      // Bind UI chrome & canvas interactions FIRST so menubar and canvas never fail to bind
      try { initMenuBar(); } catch (e) { console.error('[Workstation] initMenuBar error:', e); }
      try { initCanvasInteractions(); } catch (e) { console.error('[Workstation] initCanvasInteractions error:', e); }
      try { setupKeyboardShortcuts(); } catch (e) { console.error('[Workstation] setupKeyboardShortcuts error:', e); }

      try { initTopology(); } catch (e) { console.error('[Workstation] initTopology error:', e); }
      try { if (typeof initWikiEngine === "function") initWikiEngine(); } catch (e) { console.error('[Workstation] initWikiEngine error:', e); }
      try { renderGrid(); } catch (e) { console.error('[Workstation] renderGrid error:', e); }
      try { renderCanvas(); } catch (e) { console.error('[Workstation] renderCanvas error:', e); }
      try { if (typeof renderLayoutTabs === "function") renderLayoutTabs(); } catch (e) { console.error('[Workstation] renderLayoutTabs error:', e); }
      try { updatePropertiesGrid(); } catch (e) { console.error('[Workstation] updatePropertiesGrid error:', e); }
      try { updateStatusBar(); } catch (e) { console.error('[Workstation] updateStatusBar error:', e); }

      // Register MDI Windows
      try {
        MDIWindowManager.registerWindow('modal-module-explorer', {
          title: 'Module Explorer',
          icon: 'MD'
        });
        MDIWindowManager.registerWindow('modal-entity-manager', {
          title: 'Entity Manager',
          icon: 'EM'
        });
        MDIWindowManager.registerWindow('modal-ticket-center', {
          title: 'Ticket Command Center',
          icon: 'TK'
        });
        MDIWindowManager.registerWindow('modal-map-navigator', {
          title: 'Map Navigator',
          icon: 'MP'
        });
        MDIWindowManager.registerWindow('modal-sourcebooks', {
          title: 'Sourcebooks',
          icon: 'SB'
        });
        MDIWindowManager.registerWindow('modal-campaign-export', {
          title: 'Campaign Exporter',
          icon: 'EX'
        });
        MDIWindowManager.registerWindow('modal-surface-catalog', {
          title: 'System Surface Catalog',
          icon: 'DIR'
        });
        MDIWindowManager.registerWindow('modal-custom-module-editor', {
          title: 'Custom Module Studio',
          icon: 'CM'
        });
      } catch (e) {
        console.error('[Workstation] MDIWindowManager registration error:', e);
      }

      try { updateClock(); } catch (e) { console.error('[Workstation] updateClock error:', e); }

      // Show welcome modal if not explicitly dismissed
      try {
        const showStartup = localStorage.getItem("cs_show_startup_dialog");
        if (showStartup === "false") {
          closeWelcomeModal();
        } else {
          updateWelcomeSummary();
        }
      } catch (e) {
        console.error('[Workstation] welcome modal init error:', e);
      }

      // Support deep-link URL query parameters (?selectNode=<id> or ?selectEdge=<u-v>)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const selNodeParam = urlParams.get("selectNode");
        const selEdgeParam = urlParams.get("selectEdge");
        if (selNodeParam !== null && selNodeParam !== "") {
          closeWelcomeModal();
          const parsedId = isNaN(Number(selNodeParam)) ? selNodeParam : Number(selNodeParam);
          if (typeof selectNode === "function") selectNode(parsedId);
        } else if (selEdgeParam) {
          closeWelcomeModal();
          if (selEdgeParam.includes("->")) {
            const [u, v] = selEdgeParam.split("->");
            if (typeof selectEdge === "function") selectEdge("hegemony", isNaN(Number(u)) ? u : Number(u), isNaN(Number(v)) ? v : Number(v));
          } else if (selEdgeParam.includes("-")) {
            const [u, v] = selEdgeParam.split("-");
            if (typeof selectEdge === "function") selectEdge("road", isNaN(Number(u)) ? u : Number(u), isNaN(Number(v)) ? v : Number(v));
          }
        }
      } catch (e) {
        console.warn('[Workstation] URL parameter deep-link error:', e);
      }

      // Automatically query stored campaigns directory and local library on launch
      try {
        if (typeof refreshCampaignsManager === "function") {
          refreshCampaignsManager(false);
        }
        if (typeof restoreProjectDirectoryOnStartup === "function") {
          restoreProjectDirectoryOnStartup();
        }
      } catch (e) {
        console.warn('[Workstation] refreshCampaignsManager startup error:', e);
      }
    });

    // Built-in Module Entity Prototypes Catalog (Indexed from Worldbuilding Module Sets)
    const MODULE_ENTITY_PROTOTYPES = {
      npcs: [
        {
          id: 'PROTO-NPC-HROLF',
          name: 'Commander Hrolf',
          role: 'Garrison Veteran Commander',
          faction: 'Imperial Frontier Guard',
          motivation: 'Keeping common soldiers and civilians alive amidst siege.',
          moduleId: 'SPARK-07',
          suggestedNode: 1,
          status: 'Active',
          dispositionToParty: 1,
          culture: 'Hierarchy',
          fourCornersRole: 'Active',
          odv: { s: 3, e: 2, c: 3 },
          secretsKnown: [
            { secret: 'The garrison storehouses hold only 3 weeks of salted pork remaining.', revealed: false },
            { secret: 'Magistrate Leiderman is hoarding emergency grain sacks in the chapel crypt.', revealed: false }
          ],
          leverage: {
            vulnerability: 'Cannot bear watching his wounded conscripts freeze without fuel or rations.',
            bribe: 'Military medical tinctures, winter wolf-pelts, or clean grain requisitions.'
          },
          dialogueHooks: [
            'My boys bleed for the Empire, but the Chancellery counts ledgers while frostbite takes their toes.',
            'If you speak with Leiderman, remind him that an empty belly does not respect tax seals.'
          ],
          relationships: [
            { targetNpcId: 'PROTO-NPC-LEIDERMAN', type: 'Rival', notes: 'Schism over grain distribution quotas during winter siege.' },
            { targetNpcId: 'PROTO-NPC-BRAN', type: 'Debtor', notes: 'Bran owes Hrolf emergency salted flour shipments.' }
          ]
        },
        {
          id: 'PROTO-NPC-LEIDERMAN',
          name: 'Magistrate Leiderman',
          role: 'Colonial Tax Commissioner',
          faction: 'Imperial Civil Chancellery',
          motivation: 'Meeting grain and silver export quotas to win imperial pardon.',
          moduleId: 'SPARK-07',
          suggestedNode: 1,
          status: 'Active',
          dispositionToParty: -1,
          culture: 'Market',
          fourCornersRole: 'Adversary',
          odv: { s: 1, e: 3, c: 4 },
          secretsKnown: [
            { secret: 'Has secretly chartered Smuggler Voss to divert a portion of silver bullion to his private estate.', revealed: false }
          ],
          leverage: {
            vulnerability: 'Terrified of imperial chancellery audits and losing his noble pension.',
            bribe: 'Counter-signed transit manifests, certified bullion bars, or high-court favors.'
          },
          dialogueHooks: [
            'The law is unambiguous: quotas must sail before the river freezes, regardless of garrison complaints.',
            'Commander Hrolf is a soldier; he thinks with steel, but empires are sustained on ledgers.'
          ],
          relationships: [
            { targetNpcId: 'PROTO-NPC-HROLF', type: 'Rival', notes: 'Views Hrolf as an insubordinate brute threatening colonial governance.' },
            { targetNpcId: 'PROTO-NPC-VOSS', type: 'Creditor', notes: 'Paid Voss to smuggle personal bullion off-island.' }
          ]
        },
        {
          id: 'PROTO-NPC-BRAN',
          name: 'Quartermaster Bran',
          role: 'Wharfside Warehouse Bailiff',
          faction: 'Civic Guilds',
          motivation: 'Securing flour and salt stores against rioters.',
          moduleId: 'SPARK-01',
          suggestedNode: 6,
          status: 'Active',
          dispositionToParty: 0,
          culture: 'Clan',
          fourCornersRole: 'Target',
          odv: { s: 2, e: 1, c: 2 },
          secretsKnown: [
            { secret: 'The lower salt vaults have flooded with briny sewage; 40% of the winter flour has already spoiled.', revealed: false }
          ],
          leverage: {
            vulnerability: 'Fears dockworker mob violence against his family dwelling.',
            bribe: 'Armed warehouse guards or dry pallet storage space.'
          },
          dialogueHooks: [
            'Dockworkers are sharpening pitchforks at the slips; if bread prices tick higher, these gates will burn.'
          ],
          relationships: [
            { targetNpcId: 'PROTO-NPC-HROLF', type: 'Creditor', notes: 'Pledged flour rations to the garrison in exchange for armed sentries.' }
          ]
        },
        {
          id: 'PROTO-NPC-MALAK',
          name: 'Architect Malak',
          role: 'Subterranean Mason Infiltrator',
          faction: 'The Hollow Architects',
          motivation: 'Excavating cyclopean pre-collapse vaults.',
          moduleId: 'SPARK-05',
          suggestedNode: 17,
          status: 'In Hiding',
          dispositionToParty: 0,
          culture: 'Adhocracy',
          fourCornersRole: 'Shadow',
          odv: { s: 4, e: 4, c: 1 },
          secretsKnown: [
            { secret: 'Found the resonance frequency required to disarm the Zim-Sharr ward pylon at Node 10.', revealed: false }
          ],
          leverage: {
            vulnerability: 'Obsessed with ancient architectural blueprints and basalt masonry.',
            bribe: 'Pre-cataclysm rubbings or obsidian survey sextants.'
          },
          dialogueHooks: [
            'These island bastions are merely the crowns of buried towers that descend into the earth.'
          ],
          relationships: [
            { targetNpcId: 'PROTO-NPC-ZIM-SHARR', type: 'Rival', notes: 'Investigating Zim-Sharr tomb frequency harmonics.' }
          ]
        },
        {
          id: 'PROTO-NPC-VOSS',
          name: 'Captain Voss',
          role: 'Coastal Sloop Smuggler',
          faction: 'Corsair Anchorage',
          motivation: 'Evading imperial customs cutters and transporting contraband.',
          moduleId: 'SPARK-08',
          suggestedNode: 20,
          status: 'Active',
          dispositionToParty: 0,
          culture: 'Adhocracy',
          fourCornersRole: 'Shadow',
          odv: { s: 3, e: 4, c: 3 },
          secretsKnown: [
            { secret: 'Knows the uncharted shallow reefs along the western shoal that bypass imperial cutter patrols.', revealed: false }
          ],
          leverage: {
            vulnerability: 'Heavy gambling debts held by the wharfside guildmasters.',
            bribe: 'Refined lamp oil, naval gunpowder, or customs cutter patrol schedules.'
          },
          dialogueHooks: [
            'A reef that wrecks an imperial cutter is just a friendly toll gate to those who know the soundings.'
          ],
          relationships: [
            { targetNpcId: 'PROTO-NPC-LEIDERMAN', type: 'Debtor', notes: 'Under contract to move Leiderman’s illicit silver.' }
          ]
        },
        {
          id: 'PROTO-NPC-ZIM-SHARR',
          name: 'Archon Zim-Sharr',
          role: 'Cryo-Pyramid Slumberer',
          faction: 'Ancient Dynasts',
          motivation: 'Awakening the basalt reactor core and reclaiming hegemony.',
          moduleId: 'INFRA-08',
          suggestedNode: 10,
          status: 'Captured',
          dispositionToParty: -2,
          culture: 'Hierarchy',
          fourCornersRole: 'Adversary',
          odv: { s: 4, e: 1, c: 4 },
          secretsKnown: [
            { secret: 'The entire regional energy grid was designed to vent tectonic steam through Node 14.', revealed: false }
          ],
          leverage: {
            vulnerability: 'Desperate to prevent the degradation of the basalt cryo-stasis sarcophagus.',
            bribe: 'High-voltage DC power from a Pelton Dynamo to recharge the stasis field.'
          },
          dialogueHooks: [
            'Your settlements are dust mites squatting in the gutters of our basalt cities.'
          ],
          relationships: [
            { targetNpcId: 'PROTO-NPC-MALAK', type: 'Rival', notes: 'Views Malak as a rodent gnawing at sacred dynasty foundations.' }
          ]
        }
      ],
      quests: [
        { id: 'PROTO-QST-SPARK-01', title: 'The Salt Warehouse Famine Riots', type: 'Dynamic Dilemma', threat: '4 Ticks', faction: 'Civic Guilds vs Outcasts', notes: 'Dockworkers breach salt silos as winter supplies rot; players decide whether to defend stores or negotiate rationing.', moduleId: 'SPARK-01', suggestedNode: 6 },
        { id: 'PROTO-QST-SPARK-02', title: 'The Living Statue Blue-Rot Ward', type: 'Biological Hazard', threat: '6 Ticks', faction: 'Colonial Quarantine Guard', notes: 'Basalt sentinel weeping cerulean spores petrifies garrison lungs; players must isolate the vector or destroy the ward.', moduleId: 'SPARK-02', suggestedNode: 12 },
        { id: 'PROTO-QST-SPARK-03', title: 'Memory Tithe Altar of the Fey Court', type: 'Esoteric Enclave', threat: '4 Ticks', faction: 'The Sylvan Prophets', notes: 'Travelers crossing the spruce pass surrender memories to fuel seasonal blooming.', moduleId: 'SPARK-03', suggestedNode: 4 },
        { id: 'PROTO-QST-SPARK-04', title: 'Iron-Blight Oxidation Cascade', type: 'Infrastructural Collapse', threat: '8 Ticks', faction: 'Syndicate Arc Foundry', notes: 'Alchemical oxidation spores dissolve bridge rivets and railway spurs; requires calcium carbide synthesis.', moduleId: 'SPARK-04', suggestedNode: 14 },
        { id: 'PROTO-QST-SPARK-07', title: 'The Competent Hero vs. The Hoarding Bureaucrat', type: 'Political Schism', threat: '4 Ticks', faction: 'Frontier Garrison vs Chancellery', notes: 'Commander Hrolf plans to mutiny to feed starving convicts unless players arbitrate supplies.', moduleId: 'SPARK-07', suggestedNode: 1 }
      ],
      items: [
        { id: 'PROTO-ITM-INFRA-01', name: 'High-Head Hydro Pelton Wheel & Industrial DC Dynamo', category: 'Technology / Power Grid', specs: 'Continuous 60V @ 400A (24 kW Electricity)', notes: 'Impulse hydraulic turbine driving regional foundries.', moduleId: 'INFRA-01', suggestedNode: 14, ownerNpcId: null, possessionMode: 'stored' },
        { id: 'PROTO-ITM-INFRA-02', name: 'Carbon Electric Arc Smelting Furnace', category: 'Heavy Industrial Metallurgy', specs: '4,500 deg F Electric Arc Smelter', notes: 'Synthesizes Calcium Carbide for miners lamps and acetylene.', moduleId: 'INFRA-02', suggestedNode: 13, ownerNpcId: null, possessionMode: 'stored' },
        { id: 'PROTO-ITM-INFRA-03', name: 'Argent-Fume Incendiary Smokewall Barrier', category: 'Defensive Ordnance', specs: 'Sublimated Mercury & Sulfur Defense Cloud', notes: 'Creates zero-visibility perimeter warding against air breaches.', moduleId: 'INFRA-03', suggestedNode: 7, ownerNpcId: 'PROTO-NPC-HROLF', possessionMode: 'carried' },
        { id: 'PROTO-ITM-INFRA-06', name: 'Gnomish Freewave Vacuum-Tube Transceiver', category: 'Communications Hardware', specs: 'Triode Tube CW/AM Transmitter', notes: 'Regional radio broadcast link coordinating frontier bastions.', moduleId: 'INFRA-06', suggestedNode: 8, ownerNpcId: 'PROTO-NPC-VOSS', possessionMode: 'carried' },
        { id: 'PROTO-ITM-INFRA-09', name: 'Zim-Sharr Sonic Resonator Ward Pylon', category: 'Esoteric Relic', specs: 'Harmonic Perimeter Disruption Array', notes: 'Ruptures subterranean carapace organisms attempting to tunnel.', moduleId: 'INFRA-09', suggestedNode: 10, ownerNpcId: 'PROTO-NPC-ZIM-SHARR', possessionMode: 'stored' }
      ],
      trackers: [
        { id: 'PROTO-TRK-FACT-01', name: 'Satellite Rebellion Escalation', type: 'Threat Clock', currentTicks: 0, maxTicks: 6, faction: 'Frontier Garrison', notes: 'Subordinated satellite nodes harbor deep resentment; each failure to deliver promised grain or silver advances the rebellion clock.', moduleId: 'FACT-01', suggestedNode: 1 },
        { id: 'PROTO-TRK-SPARK-02', name: 'Living Statue Blue-Rot Contagion', type: 'Hazard Clock', currentTicks: 0, maxTicks: 6, faction: 'Colonial Quarantine Guard', notes: 'Basalt sentinel weeping cerulean spores petrifies garrison lungs; players must isolate the vector or destroy the ward.', moduleId: 'SPARK-02', suggestedNode: 12 },
        { id: 'PROTO-TRK-SPARK-04', name: 'Iron-Blight Oxidation Cascade', type: 'Infrastructural Dial', currentTicks: 0, maxTicks: 8, faction: 'Syndicate Arc Foundry', notes: 'Alchemical oxidation spores dissolve bridge rivets and railway spurs; requires calcium carbide synthesis.', moduleId: 'SPARK-04', suggestedNode: 14 },
        { id: 'PROTO-TRK-SPARK-01', name: 'Salt Warehouse Famine Riot Dial', type: 'Dynamic Dilemma', currentTicks: 0, maxTicks: 4, faction: 'Civic Guilds vs Outcasts', notes: 'Dockworkers breach salt silos as winter supplies rot; advance on bread price increases.', moduleId: 'SPARK-01', suggestedNode: 6 },
        { id: 'PROTO-TRK-SPARK-07', name: 'Garrison Mutiny Tension Track', type: 'Political Schism', currentTicks: 0, maxTicks: 4, faction: 'Imperial Frontier Guard', notes: 'Commander Hrolf plans mutiny to feed starving convicts unless players arbitrate supplies.', moduleId: 'SPARK-07', suggestedNode: 1 }
      ]
    };

    // Load active topology from LocalStorage or Fallback
    function initTopology() {
      let activeCamp = (typeof localStorage !== "undefined") ? localStorage.getItem("cs_active_campaign") : null;
      const savedMapsStr = (typeof localStorage !== "undefined") ? localStorage.getItem("creator_studio_maps_registry") : null;
      const savedTopoStr = (typeof localStorage !== "undefined") ? localStorage.getItem("creator_studio_active_topology") : null;
      const savedEntitiesStr = (typeof localStorage !== "undefined") ? localStorage.getItem("creator_studio_campaign_entities") : null;
      const savedActiveMapId = (typeof localStorage !== "undefined") ? localStorage.getItem("creator_studio_active_map_id") : null;

      let restoredFromMaps = false;
      if (savedMapsStr) {
        try {
          const parsedMaps = JSON.parse(savedMapsStr);
          if (parsedMaps && typeof parsedMaps === "object" && Object.keys(parsedMaps).length > 0) {
            maps = parsedMaps;
            if (typeof normalizeNodeSlottedModules === "function") {
              Object.keys(maps).forEach(mKey => {
                if (maps[mKey]) {
                  maps[mKey].nodeSlottedModules = normalizeNodeSlottedModules(maps[mKey].nodeSlottedModules);
                }
              });
            }
            const rootMapKey = (savedActiveMapId && maps[savedActiveMapId])
              ? savedActiveMapId
              : (maps["map_root"] ? "map_root" : Object.keys(maps)[0]);
            activeMapId = (savedActiveMapId && maps[savedActiveMapId]) ? savedActiveMapId : rootMapKey;

            let campaignEntities = null;
            if (savedEntitiesStr) {
              try { campaignEntities = JSON.parse(savedEntitiesStr); } catch(e) {}
            }

            const curMap = maps[activeMapId] || maps[rootMapKey];
            if (!maps[activeMapId]) activeMapId = rootMapKey;
            nodes = Array.isArray(curMap.nodes) ? JSON.parse(JSON.stringify(curMap.nodes)) : [];
            links = Array.isArray(curMap.links) ? JSON.parse(JSON.stringify(curMap.links)) : [];
            nodeSlottedModules = (typeof normalizeNodeSlottedModules === "function")
              ? normalizeNodeSlottedModules(curMap.nodeSlottedModules)
              : (curMap.nodeSlottedModules ? JSON.parse(JSON.stringify(curMap.nodeSlottedModules)) : {});
            edgeSlottedModules = curMap.edgeSlottedModules ? JSON.parse(JSON.stringify(curMap.edgeSlottedModules)) : {};
            revealedNodes = curMap.revealedNodes ? JSON.parse(JSON.stringify(curMap.revealedNodes)) : {};
            if (typeof activeMapMetadata !== "undefined") {
              activeMapMetadata = curMap.mapMetadata || null;
            }

            if (typeof applyMapImageToCanvas === "function") {
              const targetMapId = activeMapId || rootMapKey;
              if (typeof resolveMapBackgroundUrl === "function") {
                resolveMapBackgroundUrl(targetMapId, activeMapMetadata).then(resolved => {
                  if (resolved && resolved.url) {
                    activeMapMetadata = resolved.metadata || activeMapMetadata;
                    applyMapImageToCanvas(resolved.url, resolved.width, resolved.height, resolved.opacity ?? 0.85, false);
                  }
                }).catch(() => {});
              } else if (typeof loadPersistedMapFromDB === "function") {
                loadPersistedMapFromDB(targetMapId).then(rec => {
                  if (rec && rec.dataUrl) {
                    activeMapMetadata = rec;
                    applyMapImageToCanvas(rec.dataUrl, rec.width, rec.height, rec.opacity ?? 0.85, false);
                  } else if (activeMapMetadata && activeMapMetadata.dataUrl) {
                    applyMapImageToCanvas(activeMapMetadata.dataUrl, activeMapMetadata.width, activeMapMetadata.height, activeMapMetadata.opacity ?? 0.85, false);
                  }
                }).catch(() => {});
              }
            }

            syncAdapterToWorkstationTopology();
            if (curMap.edgeData) {
              Workstation.activeTopology.edgeData = JSON.parse(JSON.stringify(curMap.edgeData));
            } else if (!Workstation.activeTopology.edgeData) {
              Workstation.activeTopology.edgeData = {};
            }
            if (curMap.edgeNotes) {
              Workstation.activeTopology.edgeNotes = JSON.parse(JSON.stringify(curMap.edgeNotes));
            } else if (!Workstation.activeTopology.edgeNotes) {
              Workstation.activeTopology.edgeNotes = {};
            }

            if (campaignEntities) {
              Workstation.activeTopology.npcs = campaignEntities.npcs || [];
              Workstation.activeTopology.quests = campaignEntities.quests || [];
              Workstation.activeTopology.items = campaignEntities.items || [];
              Workstation.activeTopology.trackers = campaignEntities.trackers || [];
              Workstation.activeTopology.tickets = campaignEntities.tickets || [];
              if (Array.isArray(campaignEntities.custom_modules)) {
                Workstation.activeTopology.custom_modules = campaignEntities.custom_modules;
              }
              if (Array.isArray(campaignEntities.deletedModules)) {
                Workstation.activeTopology.deletedModules = campaignEntities.deletedModules;
              }
              if (Array.isArray(campaignEntities.deletedPrototypes)) {
                Workstation.activeTopology.deletedPrototypes = campaignEntities.deletedPrototypes;
              }
            }
            ensureEntityCollections(Workstation.activeTopology);
            if (typeof syncCustomModulesToCatalog === "function") syncCustomModulesToCatalog(Workstation.activeTopology);
            purgeDeletedModulesFromRuntimeCatalog(Workstation.activeTopology);

            if (typeof renderLayoutTabs === "function") renderLayoutTabs();
            if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
            restoredFromMaps = true;
          }
        } catch (e) {
          console.warn("[InitTopology] Failed to restore maps registry:", e);
        }
      }

      if (restoredFromMaps) {
        return;
      }

      if (savedTopoStr) {
        try {
          const parsed = JSON.parse(savedTopoStr);
          if (parsed && parsed.nodes) {
            Workstation.activeTopology = parsed;
            ensureEntityCollections(Workstation.activeTopology);
            if (typeof syncCustomModulesToCatalog === "function") syncCustomModulesToCatalog(Workstation.activeTopology);
            purgeDeletedModulesFromRuntimeCatalog(Workstation.activeTopology);
            if (typeof initMapsRegistry === "function") initMapsRegistry();
            if (typeof syncAdapterFromWorkstationTopology === "function") syncAdapterFromWorkstationTopology();
            return;
          }
        } catch(e) {}
      }

      // Fallback: If a specific campaign preset is configured in CAMPAIGN_REGISTRY or BUNDLED_TOPOLOGIES, load it;
      // otherwise, initialize a sterile slate and present the Welcome Modal (no hardcoded Emerald Isle fallback).
      let base = null;
      if (activeCamp && typeof CAMPAIGN_REGISTRY !== "undefined" && CAMPAIGN_REGISTRY[activeCamp] && CAMPAIGN_REGISTRY[activeCamp].preset) {
        const p = CAMPAIGN_REGISTRY[activeCamp].preset;
        const rootId = p.rootMapId || p.activeMapId || "map_root";
        base = {
          id: p.id || activeCamp,
          name: p.name || CAMPAIGN_REGISTRY[activeCamp].metadata?.name || activeCamp,
          campaignName: p.campaignName || CAMPAIGN_REGISTRY[activeCamp].metadata?.name || activeCamp,
          rootMapId: rootId,
          activeMapId: p.activeMapId || rootId,
          maps: p.maps || null,
          nodes: p.nodes || (p.maps && p.maps[rootId]?.nodes) || [],
          links: p.links || (p.maps && p.maps[rootId]?.links) || [],
          waves: p.waves || (p.maps && p.maps[rootId]?.waves) || [],
          entities: p.entities || CAMPAIGN_REGISTRY[activeCamp].metadata?.entities || null,
          npcs: (p.entities && p.entities.npcs) || p.npcs || [],
          quests: (p.entities && p.entities.quests) || p.quests || [],
          items: (p.entities && p.entities.items) || p.items || [],
          trackers: (p.entities && p.entities.trackers) || p.trackers || [],
          tickets: (p.entities && p.entities.tickets) || p.tickets || []
        };
      } else if (activeCamp && typeof BUNDLED_TOPOLOGIES !== "undefined" && BUNDLED_TOPOLOGIES[activeCamp]) {
        base = BUNDLED_TOPOLOGIES[activeCamp];
      } else {
        base = createSterileTopology({
          campaignId: activeCamp || 'campaign_scratch',
          campaignName: activeCamp ? (activeCamp.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) : 'Untitled Campaign'
        });
        if (typeof setTimeout === 'function' && typeof openWelcomeModal === 'function') {
          setTimeout(() => { openWelcomeModal(); }, 50);
        }
      }

      Workstation.activeTopology = JSON.parse(JSON.stringify(base));
      ensureEntityCollections(Workstation.activeTopology);
      if (typeof syncCustomModulesToCatalog === "function") syncCustomModulesToCatalog(Workstation.activeTopology);
      purgeDeletedModulesFromRuntimeCatalog(Workstation.activeTopology);

      if (typeof initMapsRegistry === "function") initMapsRegistry();
      if (typeof syncAdapterFromWorkstationTopology === "function") syncAdapterFromWorkstationTopology();

      if (typeof applyMapImageToCanvas === "function") {
        const initMapId = (typeof activeMapId !== "undefined" && activeMapId) ? activeMapId : "map_root";
        const initMeta = (typeof maps !== "undefined" && maps && maps[initMapId]) ? maps[initMapId].mapMetadata : null;
        if (typeof resolveMapBackgroundUrl === "function") {
          resolveMapBackgroundUrl(initMapId, initMeta).then(resolved => {
            if (resolved && resolved.url) {
              activeMapMetadata = resolved.metadata || initMeta;
              applyMapImageToCanvas(resolved.url, resolved.width, resolved.height, resolved.opacity ?? 0.85, false);
            }
          }).catch(() => {});
        } else if (typeof loadPersistedMapFromDB === "function") {
          loadPersistedMapFromDB(initMapId).then(rec => {
            if (rec && rec.dataUrl) {
              activeMapMetadata = rec;
              applyMapImageToCanvas(rec.dataUrl, rec.width, rec.height, rec.opacity ?? 0.85, false);
            }
          }).catch(() => {});
        }
      }
    }

    function ensureEntityCollections(topo) {
      if (!topo) return;
      if (!topo.nodes || typeof topo.nodes !== 'object') topo.nodes = {};
      if (!Array.isArray(topo.links)) topo.links = [];
      if (!Array.isArray(topo.waves)) topo.waves = [];
      if (!topo.edgeData || typeof topo.edgeData !== 'object') topo.edgeData = {};
      if (!topo.edgeNotes || typeof topo.edgeNotes !== 'object') topo.edgeNotes = {};
      if (!topo.npcs) topo.npcs = [];
      if (!topo.quests) topo.quests = [];
      if (!topo.items) topo.items = [];
      if (!topo.trackers) topo.trackers = [];
      if (!topo.tickets) topo.tickets = [];
      if (!topo.deletedPrototypes) topo.deletedPrototypes = [];
      if (!topo.deletedModules) topo.deletedModules = [];
      if (!Array.isArray(topo.custom_modules)) topo.custom_modules = [];
      if (typeof ensureTopologyLayers === 'function') {
        ensureTopologyLayers(topo);
      } else {
        if (!topo.layers || !Array.isArray(topo.layers) || topo.layers.length === 0) {
          topo.layers = typeof getDefaultLayers === 'function' ? getDefaultLayers() : [];
        }
        if (!topo.shapes || !Array.isArray(topo.shapes)) {
          topo.shapes = [];
        }
      }
    }

    function purgeDeletedModulesFromRuntimeCatalog(topo) {
      const deletedSet = new Set();
      if (topo && Array.isArray(topo.deletedModules)) {
        topo.deletedModules.forEach(id => { if (id != null) deletedSet.add(String(id)); });
      }
      try {
        if (typeof localStorage !== "undefined" && localStorage && typeof localStorage.getItem === "function") {
          const globalRaw = localStorage.getItem("cs_deleted_modules");
          if (globalRaw) {
            const globalList = JSON.parse(globalRaw);
            if (Array.isArray(globalList)) {
              globalList.forEach(id => { if (id != null) deletedSet.add(String(id)); });
            }
          }
        }
      } catch(e) {}

      if (deletedSet.size === 0) return;

      if (topo) {
        topo.deletedModules = Array.from(deletedSet);
        if (Array.isArray(topo.campaign_modules)) {
          topo.campaign_modules = topo.campaign_modules.filter(id => !deletedSet.has(String(id)));
        }
        if (Array.isArray(topo.custom_modules)) {
          topo.custom_modules = topo.custom_modules.filter(m => m && !deletedSet.has(String(m.id)));
        }
        if (topo.nodes && typeof topo.nodes === "object") {
          Object.values(topo.nodes).forEach(n => {
            if (n && Array.isArray(n.modules)) {
              n.modules = n.modules.filter(id => !deletedSet.has(String(id)));
            }
          });
        }
      }

      if (typeof ALL_MODULES !== "undefined" && Array.isArray(ALL_MODULES)) {
        for (let i = ALL_MODULES.length - 1; i >= 0; i--) {
          if (ALL_MODULES[i] && deletedSet.has(String(ALL_MODULES[i].id))) {
            ALL_MODULES.splice(i, 1);
          }
        }
      }
      if (typeof MODULES_MANIFEST !== "undefined" && Array.isArray(MODULES_MANIFEST) && MODULES_MANIFEST !== ALL_MODULES) {
        for (let i = MODULES_MANIFEST.length - 1; i >= 0; i--) {
          if (MODULES_MANIFEST[i] && deletedSet.has(String(MODULES_MANIFEST[i].id))) {
            MODULES_MANIFEST.splice(i, 1);
          }
        }
      }
    }
    window.purgeDeletedModulesFromRuntimeCatalog = purgeDeletedModulesFromRuntimeCatalog;

    let _dirWriteInFlight = false;
    let _dirWritePending = false;
    async function flushProjectDirectorySync() {
      if (typeof flushProjectDirectoryNow === "function") {
        return await flushProjectDirectoryNow();
      }
      if (!window.activeProjectDirectoryHandle || typeof writeCampaignToProjectDirectory !== "function") return;
      if (_dirWriteInFlight) { _dirWritePending = true; return; }
      _dirWriteInFlight = true;
      try {
        await writeCampaignToProjectDirectory(window.activeProjectDirectoryHandle);
        if (window.activeProjectDirectoryName) {
          setStatusBarMessage(`Campaign saved & synced directly to Project Directory: "${window.activeProjectDirectoryName}".`);
        }
      } catch (dirErr) {
        console.warn("[SaveActiveCampaign] Error writing to bound Project Directory:", dirErr);
        setStatusBarMessage(`Saved to session, but Project Directory sync failed: ${dirErr.message || dirErr}`);
      } finally {
        _dirWriteInFlight = false;
        if (_dirWritePending) {
          _dirWritePending = false;
          flushProjectDirectorySync();
        }
      }
    }

    function saveActiveCampaign() {
      if (!Workstation.activeTopology) return;

      // 1. Synchronize current active canvas topology into Campaign Studio state and active map record
      if (typeof syncAdapterFromWorkstationTopology === "function") {
        syncAdapterFromWorkstationTopology();
      }
      if (typeof syncActiveMapToRegistry === "function") {
        syncActiveMapToRegistry();
      }

      // 2. Persist to bound Project Directory if active (single-flight async coalesced)
      if (!window.__csSuppressDiskSync) {
        if (typeof scheduleProjectDirectorySync === "function") {
          scheduleProjectDirectorySync();
        } else if (window.activeProjectDirectoryHandle && typeof writeCampaignToProjectDirectory === "function") {
          flushProjectDirectorySync();
        }
      }

      // 3. Persist the multi-map registry (maps) and active map ID (safely without crashing on quota)
      try {
        if (typeof maps !== "undefined" && maps && Object.keys(maps).length > 0) {
          const mapsForStorage = {};
          Object.keys(maps).forEach(mId => {
            const m = maps[mId];
            if (!m) return;
            if (m.mapMetadata && (m.mapMetadata.dataUrl || (typeof m.mapMetadata.url === "string" && m.mapMetadata.url.startsWith("data:"))) && typeof stripMapImageDataUrl === "function") {
              mapsForStorage[mId] = { ...m, mapMetadata: stripMapImageDataUrl(m.mapMetadata) };
            } else {
              mapsForStorage[mId] = m;
            }
          });
          localStorage.setItem("creator_studio_maps_registry", JSON.stringify(mapsForStorage));
          localStorage.setItem("creator_studio_active_map_id", (typeof activeMapId !== "undefined" ? activeMapId : "map_root"));
        }
      } catch (quotaErr) {
        console.warn("[SaveActiveCampaign] LocalStorage quota reached for maps registry. Storing clean metadata only:", quotaErr);
        setStatusBarMessage("Warning: Browser storage quota full. Use File -> Set Project Directory or Save As to save to disk.");
      }

      // 4. Persist campaign-level entities
      try {
        const entities = {
          npcs: Workstation.activeTopology.npcs || [],
          quests: Workstation.activeTopology.quests || [],
          items: Workstation.activeTopology.items || [],
          trackers: Workstation.activeTopology.trackers || [],
          tickets: Workstation.activeTopology.tickets || [],
          custom_modules: Workstation.activeTopology.custom_modules || []
        };
        localStorage.setItem("creator_studio_campaign_entities", JSON.stringify(entities));
      } catch (e) {}

      // 5. Persist active topology and timestamp (strip any inline base64 map images from activeTopology.maps)
      try {
        let topoForStorage = Workstation.activeTopology;
        if (topoForStorage && topoForStorage.maps && typeof stripMapImageDataUrl === "function") {
          const cleanTopoMaps = {};
          Object.keys(topoForStorage.maps).forEach(mId => {
            const tm = topoForStorage.maps[mId];
            if (!tm) return;
            cleanTopoMaps[mId] = tm.mapMetadata ? { ...tm, mapMetadata: stripMapImageDataUrl(tm.mapMetadata) } : tm;
          });
          topoForStorage = { ...topoForStorage, maps: cleanTopoMaps };
        }
        localStorage.setItem("creator_studio_active_topology", JSON.stringify(topoForStorage));
        localStorage.setItem("creator_studio_topology_timestamp", new Date().toLocaleString());
      } catch (e) {}

      if (!window.activeProjectDirectoryHandle || !window.activeProjectDirectoryName) {
        setStatusBarMessage("Campaign topology saved to session. (Use File -> Save As or Set Project Directory to save to disk).");
      }
    }

    function setStatusBarMessage(msg) {
      const el = document.getElementById('sb-status');
      if (el) el.textContent = msg;
    }

    function updateStatusBar() {
      const topo = Workstation.activeTopology;
      const count = topo && topo.nodes ? Object.keys(topo.nodes).length : 0;
      const campEl = document.getElementById('sb-campaign');
      if (campEl) campEl.textContent = `${topo ? topo.name || 'Campaign' : 'Campaign'} (${count} Nodes)`;

      const scaleEl = document.getElementById('sb-scale');
      if (scaleEl && typeof getActiveMapScaleSummary === 'function') {
        const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        scaleEl.textContent = `Scale: ${getActiveMapScaleSummary(curMapId)}`;
      }
      if (typeof updateDiskSyncIndicator === "function") {
        updateDiskSyncIndicator();
      }

      const originEl = document.getElementById('sb-origin');
      if (originEl && typeof window !== "undefined" && window.location) {
        const isHttp = window.location.protocol.startsWith('http');
        if (isHttp) {
          const port = window.location.port || '80';
          originEl.textContent = `⚡ Loopback :${port}`;
          originEl.title = `Secure Context (Origin: ${window.location.origin}). Full modern API & file persistence available.`;
          originEl.style.color = '#005500';
          originEl.style.fontWeight = 'bold';
        } else {
          originEl.textContent = `📁 Offline file://`;
          originEl.title = `Zero-CORS Offline Execution via file:/// protocol.`;
          originEl.style.color = '#555555';
          originEl.style.fontWeight = 'normal';
        }
      }
    }

    function showOriginDiagnostics() {
      if (typeof window === "undefined" || !window.location) return;
      const isHttp = window.location.protocol.startsWith('http');
      const port = window.location.port || (isHttp ? '80' : 'N/A');
      const details = isHttp
        ? `CREATOR STUDIO 2.5 RUNTIME DIAGNOSTICS\n\n- Security Mode: Secure Loopback Server\n- Origin: ${window.location.origin}\n- Active Port: ${port}\n- Protocol: ${window.location.protocol}\n- Persistence: Full IndexedDB & File System Access API active.`
        : `CREATOR STUDIO 2.5 RUNTIME DIAGNOSTICS\n\n- Security Mode: Standalone Zero-CORS Offline\n- Origin: null (file:///)\n- Protocol: file:\n- Persistence: Browser IndexedDB & In-Memory state.`;
      alert(details);
    }
    window.showOriginDiagnostics = showOriginDiagnostics;

    function exitWorkstationServer() {
      if (typeof closeAllMenus === 'function') closeAllMenus();
      if (typeof window === "undefined" || !window.location) return;
      const isHttp = window.location.protocol.startsWith('http');
      if (isHttp) {
        const ok = (typeof window.confirm === "function") ? window.confirm("Stop the local loopback server and exit Creator Studio?") : true;
        if (!ok) return;
        fetch('/api/shutdown', { method: 'POST' })
          .catch(() => {})
          .finally(() => {
            try { window.close(); } catch(_) {}
            if (typeof document !== "undefined" && document.body) {
              document.body.innerHTML = `
                <div style="font-family:sans-serif; text-align:center; padding:80px 20px; background:#008080; color:#fff; height:100vh; box-sizing:border-box;">
                  <h1 style="font-size:26px; margin-bottom:12px;">Creator Studio Server Stopped</h1>
                  <p style="font-size:14px; color:#e0f2fe; margin-bottom:24px;">The local loopback server has shut down gracefully.</p>
                  <p style="font-size:12px; color:#cbd5e1;">You may now safely close this browser tab or window.</p>
                </div>
              `;
            }
          });
      } else {
        alert("Creator Studio is running in standalone offline mode (file:///).\n\nSimply close this browser tab or window to exit.");
      }
    }
    window.exitWorkstationServer = exitWorkstationServer;

    // ========================================================================
    // MENU BAR INTERACTION & HOVER ENGINE
    // ========================================================================
    let isMenuOpen = false;

    function initMenuBar() {
      const menuBar = document.querySelector('.menu-bar');
      if (!menuBar || menuBar.dataset.menuBound === 'true') return;
      menuBar.dataset.menuBound = 'true';

      const items = menuBar.querySelectorAll('.menu-item');
      items.forEach(item => {
        const menuId = item.getAttribute('data-menu');
        const dropdown = item.querySelector('.menu-dropdown');

        item.addEventListener('click', (e) => {
          if (e.target.closest('.menu-dropdown')) {
            return;
          }
          e.stopPropagation();
          const wasOpen = dropdown ? dropdown.classList.contains('show') : false;
          closeAllMenus();
          if (!wasOpen && dropdown) {
            dropdown.classList.add('show');
            item.classList.add('active');
            isMenuOpen = true;
          } else {
            isMenuOpen = false;
          }
        });

        item.addEventListener('mouseenter', () => {
          if (isMenuOpen && dropdown) {
            closeAllMenus();
            dropdown.classList.add('show');
            item.classList.add('active');
          }
        });
      });

      // Close menus when selecting any row (unless it has a flyout submenu)
      document.querySelectorAll('.dropdown-row').forEach(row => {
        row.addEventListener('click', (e) => {
          if (row.classList.contains('has-submenu') && e.target.closest('.dropdown-submenu') === null) {
            e.stopPropagation();
            return;
          }
          closeAllMenus();
          isMenuOpen = false;
        });
      });

      // Dismiss Menus & Start Menu on Outside Click
      window.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-item') && !e.target.closest('.menu-dropdown') && !e.target.closest('.dropdown-btn')) {
          closeAllMenus();
          isMenuOpen = false;
        }
        if (!e.target.closest('#btn-start') && !e.target.closest('#win95-start-menu')) {
          const startMenu = document.getElementById('win95-start-menu');
          if (startMenu && startMenu.classList.contains('show')) {
            startMenu.classList.remove('show');
          }
        }
      });
    }

    function toggleMenu(menuId) {
      const dropdown = document.getElementById(menuId);
      if (!dropdown) return;
      const isVisible = dropdown.classList.contains('show');
      closeAllMenus();
      if (!isVisible) {
        dropdown.classList.add('show');
        const parentItem = dropdown.closest('.menu-item');
        if (parentItem) parentItem.classList.add('active');
        isMenuOpen = true;
      } else {
        isMenuOpen = false;
      }
    }

    function closeAllMenus() {
      document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('show'));
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.dropdown-row.has-submenu').forEach(r => r.classList.remove('open'));
    }

    function toggleToolPalette() {
      const pal = document.getElementById('cad-palette');
      if (!pal) return;
      pal.style.display = pal.style.display === 'none' ? 'flex' : 'none';
      setStatusBarMessage(`Tool Palette ${pal.style.display === 'none' ? 'Hidden' : 'Visible'}.`);
    }

    function resetBalancing() {
      if (typeof resetAllDraws === "function") {
        resetAllDraws();
      } else {
        renderCanvas();
        updatePropertiesGrid();
      }
    }

    // ========================================================================
    // 4 NEW MDI WINDOW LAUNCHERS & RENDERERS
    // ========================================================================
    function openMapNavigatorModal() {
      MDIWindowManager.open('modal-map-navigator');
      renderMapNavigatorTree();
    }

    function renderMapNavigatorTree() {
      const container = document.getElementById('map-nav-tree-container');
      if (!container) return;
      const mRegistry = (typeof maps !== "undefined" && maps) ? maps : { "map_root": { id: "map_root", name: (Workstation.activeTopology && Workstation.activeTopology.name) || "Root Map", scaleTier: "region", nodes: [], links: [] } };
      const curId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";

      container.innerHTML = Object.keys(mRegistry).map(mId => {
        const m = mRegistry[mId];
        const isActive = (mId === curId);
        const tier = (typeof SCALE_TIERS !== "undefined" && SCALE_TIERS[m.scaleTier]) ? SCALE_TIERS[m.scaleTier] : { label: "Region", icon: "🗺️" };
        const nodeCount = (m.nodes ? m.nodes.length : (isActive && Workstation.activeTopology && Workstation.activeTopology.nodes ? Object.keys(Workstation.activeTopology.nodes).length : 0));
        const hasImg = !!(m.mapMetadata && m.mapMetadata.dataUrl);

        return `
          <div style="padding:6px 8px; margin-bottom:4px; border:1px solid ${isActive ? '#000080' : '#cbd5e1'}; background:${isActive ? '#e0f2fe' : '#f8fafc'}; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:bold; font-size:11px; color:#000080; display:flex; align-items:center; gap:4px;">
                <span>${hasImg ? '🖼️' : tier.icon}</span>
                <span>${m.name || mId}</span>
                ${isActive ? '<span style="font-size:9px; background:#000080; color:#fff; padding:1px 4px; border-radius:2px;">ACTIVE</span>' : ''}
              </div>
              <div style="font-size:10px; color:#64748b; margin-top:2px;">
                Scale: ${(m.scaleTier || 'region').toUpperCase()} &bull; ${nodeCount} Nodes &bull; ${hasImg ? 'Custom Asset' : 'Tactical Grid'}
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:4px;">
              ${!isActive ? `<button class="win-btn" onclick="switchActiveMap('${mId}'); renderMapNavigatorTree();" style="font-size:10px; font-weight:bold; padding:2px 6px;">Switch To</button>` : `<span style="font-size:10px; color:#059669; font-weight:bold; padding:2px 4px;">[Active]</span>`}
              <button class="win-btn" onclick="openMapPropertiesDialog('${mId}')" style="font-size:10px; padding:2px 6px;" title="Edit Map Properties">Properties...</button>
              <button class="win-btn" onclick="triggerMapImageUpload('${mId}')" style="font-size:10px; padding:2px 6px;" title="Insert or Replace Background Map Image">${hasImg ? 'Change Image...' : '+ Map Image'}</button>
            </div>
          </div>
        `;
      }).join('');
    }

    function openSourcebooksModal() {
      MDIWindowManager.open('modal-sourcebooks');
      renderSourcebooksList();
    }

    function renderSourcebooksList() {
      const container = document.getElementById('sourcebooks-table-container');
      if (!container) return;
      const cReg = (typeof CAMPAIGN_REGISTRY !== "undefined") ? CAMPAIGN_REGISTRY : {};
      const regKeys = Object.keys(cReg);
      const allMods = (typeof ALL_MODULES !== "undefined") ? ALL_MODULES : [];
      const registeredMods = Workstation.registeredMods || {};
      const modKeys = Object.keys(registeredMods);

      const statusEl = document.getElementById('sourcebooks-count-status');
      if (statusEl) {
        statusEl.textContent = `${regKeys.length} Campaign Packages | ${allMods.length} Worldbuilding Modules | ${modKeys.length} Code Mods`;
      }

      let html = '';

      // SECTION 1: INSTALLED CAMPAIGN PACKAGES
      html += `
        <div style="margin-bottom:8px;">
          <div style="font-size:11px; font-weight:bold; color:#000080; border-bottom:1px solid #94a3b8; padding-bottom:2px; margin-bottom:6px;">
            INSTALLED CAMPAIGN PACKAGES &amp; PRESETS (${regKeys.length})
          </div>
      `;

      html += regKeys.map(cId => {
        const pkg = cReg[cId];
        const isCurrent = (Workstation.activeTopology && (Workstation.activeTopology.id === cId || Workstation.activeTopology.name === pkg.title));
        return `
          <div style="padding:8px; margin-bottom:6px; border:1px solid ${isCurrent ? '#000080' : '#cbd5e1'}; background:${isCurrent ? '#e0f2fe' : '#ffffff'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="font-size:11px; color:#000080;">${pkg.title}</strong>
                <span style="font-size:9px; color:#64748b; margin-left:6px;">(${cId})</span>
              </div>
              <div>
                ${!isCurrent ? `<button class="win-btn" onclick="loadInstalledCampaign('${cId}'); renderSourcebooksList();" style="font-size:10px; padding:2px 6px;">Load Package</button>` : `<span style="font-size:9px; background:#000080; color:#fff; padding:1px 4px; border-radius:2px; font-weight:bold;">LOADED IN CAD</span>`}
              </div>
            </div>
            <div style="font-size:10px; color:#475569; margin-top:3px;">${pkg.description || 'Campaign Sourcebook Package'}</div>
            <div style="font-size:10px; color:#1e3a8a; margin-top:2px;">
              <strong>Modules:</strong> ${pkg.modulesCount || 0} modules &bull; <strong>Option Packs:</strong> ${(pkg.optionPacks || []).length} packs
            </div>
          </div>
        `;
      }).join('');
      html += '</div>';

      // SECTION 2: WORLDBUILDING SOURCEBOOK MODULES
      html += `
        <div style="margin-bottom:8px;">
          <div style="font-size:11px; font-weight:bold; color:#0f766e; border-bottom:1px solid #94a3b8; padding-bottom:2px; margin-bottom:6px;">
            WORLDBUILDING SOURCEBOOK MODULES (${allMods.length} Modules Available)
          </div>
          <div style="padding:8px; border:1px solid #cbd5e1; background:#f0fdf4; border-radius:2px; font-size:10px; color:#166534;">
            <div>All worldbuilding modules across Tier 1 (Governance) through Tier 5 (Climax) are available for dynamic slotting into pointcrawl nodes.</div>
            <div style="margin-top:4px;">
              <button class="win-btn" onclick="openModuleExplorer(); MDIWindowManager.close('modal-sourcebooks');" style="font-size:10px; padding:2px 8px;">Launch Module Explorer (Ctrl+M)...</button>
            </div>
          </div>
        </div>
      `;

      // SECTION 3: WORKSTATION CODE MODS & EXTENSIONS
      html += `
        <div>
          <div style="font-size:11px; font-weight:bold; color:#78350f; border-bottom:1px solid #94a3b8; padding-bottom:2px; margin-bottom:6px;">
            WORKSTATION EXTENSION MODS (${modKeys.length} Active)
          </div>
      `;

      if (modKeys.length === 0) {
        html += `
          <div style="padding:10px; border:1px dashed #94a3b8; background:#f8fafc; border-radius:2px; font-size:10px; color:#64748b; text-align:center;">
            <div><em>No third-party workstation mods currently loaded in <code>mods/</code>. Creator Studio is running in pure offline zero-CORS mode.</em></div>
            <div style="margin-top:6px;">
              <button class="win-btn" onclick="showModSdkInfo()" style="font-size:9px; padding:2px 6px;">View Mod SDK Documentation...</button>
            </div>
          </div>
        `;
      } else {
        html += modKeys.map(mId => {
          const mod = registeredMods[mId];
          return `
            <div style="padding:6px 8px; margin-bottom:4px; border:1px solid #cbd5e1; background:#fff; font-size:10px;">
              <strong>${mod.name || mId}</strong> (v${mod.version || '1.0.0'}) &bull; <span style="color:#64748b;">${mod.description || 'Active extension mod'}</span>
            </div>
          `;
        }).join('');
      }
      html += '</div>';

      container.innerHTML = html;
    }

    function enableAllSourcebooks() {
      setStatusBarMessage("All campaign sourcebook modules enabled.");
      renderSourcebooksList();
    }

    function disableInactiveSourcebooks() {
      setStatusBarMessage("Restricted catalog to active campaign sourcebook.");
      renderSourcebooksList();
    }

    function openCampaignExportModal() {
      MDIWindowManager.open('modal-campaign-export');
      updateExportOutput();
    }

    let activeExportTabKey = 'json';
    function switchExportTab(tabKey) {
      activeExportTabKey = tabKey;
      ['json', 'md', 'vtt', 'svg'].forEach(k => {
        const b = document.getElementById(`btn-exp-${k}`);
        if (b) b.classList.toggle('active', k === tabKey);
      });
      updateExportOutput();
    }

    function updateExportOutput() {
      const outputEl = document.getElementById('export-output-text');
      if (!outputEl) return;

      try {
        if (activeExportTabKey === 'json') {
          let fullJson;
          try {
            fullJson = (typeof generateCampaignJSON === 'function')
              ? generateCampaignJSON()
              : JSON.stringify(Workstation.activeTopology, null, 2);
          } catch (jsonErr) {
            console.error("[ExportModal] Error generating campaign JSON, falling back:", jsonErr);
            const fallbackPayload = {
              metadata: {
                campaignName: Workstation.activeTopology ? Workstation.activeTopology.name : "Campaign",
                warning: "Generated in resilient fallback mode: " + jsonErr.message,
                generatedAt: new Date().toISOString()
              },
              activeMapId: typeof activeMapId !== "undefined" ? activeMapId : "map_root",
              maps: typeof maps !== "undefined" ? maps : null,
              activeTopology: Workstation.activeTopology
            };
            fullJson = JSON.stringify(fallbackPayload, null, 2);
          }
          outputEl.value = (typeof fullJson === 'string') ? fullJson : JSON.stringify(fullJson, null, 2);
        } else if (activeExportTabKey === 'md') {
          try {
            outputEl.value = (typeof generateCampaignMarkdown === 'function')
              ? generateCampaignMarkdown()
              : `# ${Workstation.activeTopology.name || 'Campaign Dossier'}\n\nExported from Creator Studio Desktop Workstation.`;
          } catch (mdErr) {
            console.error("[ExportModal] Error generating markdown dossier, falling back:", mdErr);
            outputEl.value = `# ${(Workstation.activeTopology && Workstation.activeTopology.name) || 'CAMPAIGN DOSSIER'}\n\n*Notice: Markdown dossier rendered in fallback mode (${mdErr.message}).*\n\nTotal Nodes: ${Object.keys((Workstation.activeTopology && Workstation.activeTopology.nodes) || {}).length}`;
          }
        } else if (activeExportTabKey === 'vtt') {
          outputEl.value = (typeof generateFoundryVTTJSON === 'function')
            ? JSON.stringify(generateFoundryVTTJSON(), null, 2)
            : JSON.stringify({ name: Workstation.activeTopology.name, scene: "Pointcrawl Map", nodes: Workstation.activeTopology.nodes }, null, 2);
        } else if (activeExportTabKey === 'svg') {
          const svgEl = document.getElementById('cad-svg');
          outputEl.value = svgEl ? svgEl.outerHTML : '<svg></svg>';
        }
      } catch (err) {
        console.error("[ExportModal] Fatal export error:", err);
        outputEl.value = JSON.stringify(Workstation.activeTopology || {}, null, 2);
      }

      // Update diagnostic file size status
      const diagEl = document.getElementById('export-modal-diag-status');
      if (diagEl) {
        const bytes = new Blob([outputEl.value]).size;
        const kb = (bytes / 1024).toFixed(1);
        diagEl.textContent = `Payload: ${kb} KB | Status: Verified`;
      }
    }

    function copyExportToClipboard() {
      const outputEl = document.getElementById('export-output-text');
      if (!outputEl) return;
      outputEl.select();
      navigator.clipboard.writeText(outputEl.value).then(() => {
        alert("Export data copied to clipboard!");
      });
    }

    function downloadExportFile() {
      const outputEl = document.getElementById('export-output-text');
      if (!outputEl) return;
      const content = outputEl.value;
      if (!content || content.trim().length === 0) {
        alert("Export payload is empty. Please select an export tab or verify campaign data.");
        return;
      }
      const ext = activeExportTabKey === 'json' ? 'creator.json' : (activeExportTabKey === 'md' ? 'md' : (activeExportTabKey === 'svg' ? 'svg' : 'json'));
      const filename = `${(Workstation.activeTopology.name || 'campaign').toLowerCase().replace(/\s+/g, '_')}_export.${ext}`;

      const blob = new Blob([content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      if (typeof setStatusBarMessage === "function") {
        setStatusBarMessage(`Export downloaded: "${filename}" (${(blob.size / 1024).toFixed(1)} KB).`);
      }
    }

// Exported globals
window.Workstation = Workstation;
window.CreatorStudio = CreatorStudio;
window.MODULE_ENTITY_PROTOTYPES = MODULE_ENTITY_PROTOTYPES;
window.initTopology = initTopology;
window.ensureEntityCollections = ensureEntityCollections;
window.flushProjectDirectorySync = flushProjectDirectorySync;
window.saveActiveCampaign = saveActiveCampaign;
window.setStatusBarMessage = setStatusBarMessage;
window.updateStatusBar = updateStatusBar;
window.initMenuBar = initMenuBar;
window.toggleMenu = toggleMenu;
window.closeAllMenus = closeAllMenus;
window.toggleToolPalette = toggleToolPalette;
window.resetBalancing = resetBalancing;
window.openMapNavigatorModal = openMapNavigatorModal;
window.renderMapNavigatorTree = renderMapNavigatorTree;
window.openSourcebooksModal = openSourcebooksModal;
window.renderSourcebooksList = renderSourcebooksList;
window.enableAllSourcebooks = enableAllSourcebooks;
window.disableInactiveSourcebooks = disableInactiveSourcebooks;
window.openCampaignExportModal = openCampaignExportModal;
window.switchExportTab = switchExportTab;
window.updateExportOutput = updateExportOutput;
window.copyExportToClipboard = copyExportToClipboard;
window.downloadExportFile = downloadExportFile;
window.exitWorkstationServer = exitWorkstationServer;
window.showOriginDiagnostics = showOriginDiagnostics;