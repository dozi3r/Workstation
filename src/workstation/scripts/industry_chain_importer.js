// ========================================================================
// INDUSTRY CHAIN IMPORTER & DEDUPLICATION WIZARD (SYS-RES-03)
// Authority: ip_module_framework_srd.md, ADR-0005, supply_chain_simulator.js
// ========================================================================

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.IndustryChainImporter = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let currentSelectedChainId = null;

  /**
   * Helper to resolve active nodes list using CampaignMutationEngine with safe fallback
   */
  function resolveNodesList(topo) {
    if (typeof CampaignMutationEngine !== 'undefined' && typeof CampaignMutationEngine.getNodesList === 'function') {
      return CampaignMutationEngine.getNodesList(topo);
    }
    return Array.isArray(topo.nodes) ? topo.nodes : Object.values(topo.nodes || {});
  }

  /**
   * Infers valid VB6 Property Grid conduitType from commodity tag names
   * Authoritative enum in property_grid_inspector.js:
   * 'Standard Route', 'Aqueduct / Pipeline', 'Caravan Trade Route', 'Smuggling Tunnel', 'Arcane / Ley Conduit', 'Military Supply Line'
   */
  function inferConduitType(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return 'Caravan Trade Route';
    const tagStr = tags.join(' ').toLowerCase();
    if (tagStr.includes('water') || tagStr.includes('pipeline') || tagStr.includes('aqueduct') || tagStr.includes('brine') || tagStr.includes('fluid') || tagStr.includes('hydro')) {
      return 'Aqueduct / Pipeline';
    }
    if (tagStr.includes('ordnance') || tagStr.includes('weapon') || tagStr.includes('armor') || tagStr.includes('munition') || tagStr.includes('military')) {
      return 'Military Supply Line';
    }
    if (tagStr.includes('arcane') || tagStr.includes('ley') || tagStr.includes('mana') || tagStr.includes('aether') || tagStr.includes('esot')) {
      return 'Arcane / Ley Conduit';
    }
    if (tagStr.includes('smuggl') || tagStr.includes('covert') || tagStr.includes('illicit') || tagStr.includes('contraband')) {
      return 'Smuggling Tunnel';
    }
    return 'Caravan Trade Route';
  }

  /**
   * Scans ALL_MODULES and compiles a structured catalog of Industry Chains
   */
  function getAvailableIndustryChains() {
    const catalog = {};
    const modules = (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES))
      ? ALL_MODULES
      : ((typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST)) ? MODULES_MANIFEST : []);

    modules.forEach(m => {
      if (!m || !m.chain_id) return;
      if (m.mod_id && typeof Workstation !== 'undefined' && Workstation.disabledMods && Workstation.disabledMods[m.mod_id]) return;
      const cId = String(m.chain_id).trim();
      if (!catalog[cId]) {
        const CHAIN_TITLES = {
          'CHAIN-WHEAT': 'Wheat Farming, Gristmilling & Baking',
          'CHAIN-FLAX': 'Flax Farming & Linen Weaving',
          'CHAIN-TIMBER': 'Hardwood Logging, Sawmilling & Cooperage',
          'CHAIN-TANNIN': 'Bark Harvesting & Tannin Extraction',
          'CHAIN-CHARCOAL': 'Charcoal Burning & Potash Production',
          'CHAIN-IRON': 'Iron Mining, Bloomery & Smelting Works',
          'CHAIN-STEEL': 'Crucible & Bessemer Steelworks (Requires Pig-Iron & Coal)',
          'CHAIN-COAL': 'Deep Colliery & Metallurgical Coking Ovens',
          'CHAIN-CATTLE': 'Cattle Husbandry, Abattoir & Tannery',
          'CHAIN-CLAY': 'River Clay, Bricks & Amphorae Ceramics',
          'CHAIN-PAPER': 'Rag Collection & Papermaking Mill',
          'CHAIN-OLIVE': 'Olive Grove & Oil Pressing',
          'CHAIN-VINE': 'Vineyard, Winery & Alembic Distillery',
          'CHAIN-COPPER': 'Drift Copper Mining & Smelting',
          'CHAIN-TIN': 'Placer Tin Mining & Smelting',
          'CHAIN-BRONZE': 'Bronze Foundry & Monumental Casting',
          'CHAIN-SHEEP': 'Sheep Herding, Spinning & Wool Dyeing',
          'CHAIN-LIME': 'Limestone Quarrying & Quicklime',
          'CHAIN-GLASS': 'Quartz Sand & Glassblowing',
          'CHAIN-MERCURY': 'Cinnabar Mining & Mercury Retorts',
          'CHAIN-SUGAR': 'Sugarcane Agriculture, Molasses & Rum Distillation',
          'CHAIN-RICE': 'Flooded Paddy Rice & Husking',
          'CHAIN-CORN': 'Maize Cultivation, Nixtamal Mill & Sour-Mash Distillery',
          'CHAIN-COTTON': 'Cotton Plantation, Ginning & Weaving',
          'CHAIN-SILK': 'Mulberry Orchards & Silk Brocade',
          'CHAIN-TOBACCO': 'Tobacco Cultivation & Curing',
          'CHAIN-COFFEE': 'Coffee Finca & Roasting House',
          'CHAIN-TEA': 'Terrace Tea Garden & Firing Shed',
          'CHAIN-SILVER': 'Deep Lode Silver Mining & Royal Mint',
          'CHAIN-GOLD': 'Placer Gold Panning & Imperial Mint',
          'CHAIN-LEAD': 'Galena Vein Mining & Pewterer',
          'CHAIN-POWDER': 'Saltpeter, Sulfur & Blackpowder Mill',
          'CHAIN-TAR': 'Softwood Logging & Naval Pine Tar',
          'CHAIN-FURS': 'Highland Trapping & Furrier',
          'CHAIN-SALT': 'Tidal Salt Pans & Evaporation',
          'CHAIN-FISH': 'Deep Fisheries & Salting Houses',
          'CHAIN-WHALE': 'Deep Sea Whaling & Try-Works',
          'CHAIN-BEES': 'Coastal Apiculture, Mead & Wax',
          'CHAIN-BARGE': 'River Canal Lockways & Freight Barging'
        };
        const chainTitle = m.chain_title || CHAIN_TITLES[cId] || `${cId} Industry Chain`;

        catalog[cId] = {
          id: cId,
          title: chainTitle,
          stages: []
        };
      }

      catalog[cId].stages.push({
        stage: typeof m.chain_stage === 'number' ? m.chain_stage : 1,
        role: m.chain_role || 'processing',
        module: m
      });
    });

    // Sort stages numerically within each chain
    Object.values(catalog).forEach(chain => {
      chain.stages.sort((a, b) => a.stage - b.stage);
    });

    return catalog;
  }

  /**
   * Audits campaign state to detect existing facilities and provided resources
   */
  function auditChainDeduplication(chainId, targetTopo = null) {
    const chains = getAvailableIndustryChains();
    const chain = chains[chainId];
    if (!chain) return null;

    const topo = targetTopo || ((typeof Workstation !== 'undefined') ? Workstation.activeTopology : null) || {};
    const nodes = resolveNodesList(topo);

    const allModulesList = (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES))
      ? ALL_MODULES
      : ((typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST)) ? MODULES_MANIFEST : []);

    const auditResults = [];

    chain.stages.forEach(st => {
      const mod = st.module;
      const result = {
        stage: st.stage,
        role: st.role,
        moduleId: mod.id,
        moduleTitle: mod.title,
        module: mod,
        provides: mod.provides || [],
        requires: mod.requires || [],
        status: 'unmet',
        matchedNodeId: null,
        matchedNodeName: null,
        matchReason: null
      };

      // 1. Check if module ID is already slotted on an active node
      for (const n of nodes) {
        if (!n) continue;
        const nId = String(n.id);
        const slotted = (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules[nId])
          || (Array.isArray(n.modules) ? n.modules : []);

        if (slotted.includes(mod.id)) {
          result.status = 'already_slotted';
          result.matchedNodeId = nId;
          result.matchedNodeName = n.name || `Node ${nId}`;
          result.matchReason = `Module ${mod.id} is already operational at this node.`;
          break;
        }
      }

      // 2. If not slotted, check if all provided resources are already produced on a node
      if (result.status === 'unmet' && mod.provides && mod.provides.length > 0) {
        for (const n of nodes) {
          if (!n) continue;
          const nId = String(n.id);
          const nProvides = new Set(Array.isArray(n.provides) ? n.provides : []);
          const slotted = (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules[nId])
            || (Array.isArray(n.modules) ? n.modules : []);

          slotted.forEach(mid => {
            const sm = allModulesList.find(x => x.id === mid);
            if (sm && Array.isArray(sm.provides)) sm.provides.forEach(p => nProvides.add(p));
          });

          const satisfiesAll = mod.provides.every(p => nProvides.has(p));
          if (satisfiesAll) {
            result.status = 'resource_satisfied';
            result.matchedNodeId = nId;
            result.matchedNodeName = n.name || `Node ${nId}`;
            result.matchReason = `All outputs (${mod.provides.join(', ')}) are already supplied here.`;
            break;
          }
        }
      }

      auditResults.push(result);
    });

    return {
      chain,
      stages: auditResults
    };
  }

  /**
   * Opens the Win95/VB6 Industry Chain Importer Modal
   */
  function openIndustryChainImporterModal(defaultChainId = null) {
    if (typeof closeAllMenus === 'function') closeAllMenus();
    if (typeof MDIWindowManager !== 'undefined') {
      MDIWindowManager.open('modal-industry-chain-importer');
    } else {
      const el = document.getElementById('modal-industry-chain-importer');
      if (el) el.classList.remove('hidden');
    }

    const chains = getAvailableIndustryChains();
    const selectEl = document.getElementById('ici-chain-select');
    if (!selectEl) return;

    selectEl.innerHTML = '';
    const chainIds = Object.keys(chains);

    if (chainIds.length === 0) {
      selectEl.innerHTML = '<option value="">(No Industry Chains found in active catalog)</option>';
      renderChainStageGrid(null);
      return;
    }

    chainIds.forEach(cId => {
      const opt = document.createElement('option');
      opt.value = cId;
      opt.textContent = `${cId}: ${chains[cId].title}`;
      selectEl.appendChild(opt);
    });

    const activeId = (defaultChainId && chains[defaultChainId]) ? defaultChainId : chainIds[0];
    selectEl.value = activeId;
    currentSelectedChainId = activeId;

    renderChainStageGrid(activeId);
  }

  /**
   * Renders the stage-by-stage deduplication and binding grid
   */
  function renderChainStageGrid(chainId) {
    const container = document.getElementById('ici-stages-container');
    if (!container) return;

    if (!chainId) {
      container.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">No industry chain selected.</div>';
      return;
    }

    const audit = auditChainDeduplication(chainId);
    if (!audit) {
      container.innerHTML = '<div style="padding:20px; text-align:center; color:#c00;">Failed to audit chain.</div>';
      return;
    }

    const topo = (typeof Workstation !== 'undefined') ? Workstation.activeTopology : null;
    const nodes = (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.getNodesList)
      ? CampaignMutationEngine.getNodesList(topo)
      : (topo && Array.isArray(topo.nodes) ? topo.nodes : Object.values((topo && topo.nodes) || {}));

    let html = `
      <div style="background:#fff; border:1px solid #7f9db9; padding:8px; margin-bottom:10px;">
        <div style="font-weight:bold; font-size:12px; margin-bottom:4px;">${audit.chain.title}</div>
        <div style="font-size:10px; color:#555;">
          Chain ID: <code>${audit.chain.id}</code> &bull; Total Stages: ${audit.stages.length} &bull; 
          Automatic deduplication compares module IDs and provides/requires tags across active campaign nodes.
        </div>
      </div>
      <table class="win95-table" style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:#ece9d8; border-bottom:1px solid #7f9db9; text-align:left;">
            <th style="padding:4px; width:40px;">Stage</th>
            <th style="padding:4px; width:160px;">Module &amp; Role</th>
            <th style="padding:4px;">Provides / Requires</th>
            <th style="padding:4px; width:140px;">Deduplication Status</th>
            <th style="padding:4px; width:220px;">Placement &amp; Action</th>
          </tr>
        </thead>
        <tbody>
    `;

    audit.stages.forEach((st, idx) => {
      let statusBadge = '';
      let defaultActionHtml = '';

      if (st.status === 'already_slotted') {
        statusBadge = `<span style="background:#dcfce7; color:#166534; padding:2px 6px; border:1px solid #86efac; font-weight:bold; font-size:9px; border-radius:3px;">&#10003; Active at Node ${st.matchedNodeId}</span>`;
        defaultActionHtml = `
          <select id="ici-stage-action-${idx}" class="win-select-input" style="width:100%; font-size:10px;" onchange="IndustryChainImporter.onActionChange(${idx})">
            <option value="skip" selected>&#10003; Skip (Reuse Node ${st.matchedNodeId}: ${st.matchedNodeName})</option>
            <option value="bind">Slot on another node...</option>
            <option value="create_node">Create another satellite node...</option>
          </select>
        `;
      } else if (st.status === 'resource_satisfied') {
        statusBadge = `<span style="background:#fef3c7; color:#92400e; padding:2px 6px; border:1px solid #f59e0b; font-weight:bold; font-size:9px; border-radius:3px;">&#10003; Resource Supplied</span>`;
        defaultActionHtml = `
          <select id="ici-stage-action-${idx}" class="win-select-input" style="width:100%; font-size:10px;" onchange="IndustryChainImporter.onActionChange(${idx})">
            <option value="skip" selected>&#10003; Skip (Supplied at Node ${st.matchedNodeId})</option>
            <option value="bind">Slot new dedicated facility on node...</option>
            <option value="create_node">Create new dedicated facility node...</option>
          </select>
        `;
      } else {
        statusBadge = `<span style="background:#fee2e2; color:#991b1b; padding:2px 6px; border:1px solid #f87171; font-weight:bold; font-size:9px; border-radius:3px;">&#9888; Unmet (Needs Placement)</span>`;
        
        let nodeOptions = nodes.map(n => `<option value="${n.id}">Slot on Node ${n.id}: ${n.name || 'Station'}</option>`).join('');
        defaultActionHtml = `
          <select id="ici-stage-action-${idx}" class="win-select-input" style="width:100%; font-size:10px;" onchange="IndustryChainImporter.onActionChange(${idx})">
            <option value="create_node" selected>&#65291; Create New Connected Satellite Node</option>
            ${nodeOptions}
          </select>
        `;
      }

      const providesHtml = (st.provides || []).map(p => `<span style="color:#059669; font-weight:bold;">+ ${p}</span>`).join('<br>');
      const requiresHtml = (st.requires || []).map(r => `<span style="color:#dc2626;">- ${r}</span>`).join('<br>');

      html += `
        <tr style="border-bottom:1px solid #e2e8f0; vertical-align:top; background:${idx % 2 === 0 ? '#fff' : '#f8fafc'};">
          <td style="padding:6px; font-weight:bold; text-align:center;">#${st.stage}</td>
          <td style="padding:6px;">
            <div style="font-weight:bold; color:#1e293b;">${st.moduleTitle}</div>
            <div style="font-size:9px; color:#64748b;"><code>${st.moduleId}</code> &bull; <em>${st.role.toUpperCase()}</em></div>
          </td>
          <td style="padding:6px; font-size:10px;">
            ${providesHtml || '<span style="color:#94a3b8;">None</span>'}
            ${requiresHtml ? `<div style="margin-top:2px;">${requiresHtml}</div>` : ''}
          </td>
          <td style="padding:6px;">
            ${statusBadge}
            ${st.matchReason ? `<div style="font-size:9px; color:#64748b; margin-top:2px;">${st.matchReason}</div>` : ''}
          </td>
          <td style="padding:6px;">
            ${defaultActionHtml}
            <div id="ici-stage-suboptions-${idx}" style="margin-top:4px;"></div>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }

  function onActionChange(stageIdx) {
    // Optional hook for secondary inputs
  }

  /**
   * Executes the full compound industry chain import
   */
  function executeChainImport() {
    if (!currentSelectedChainId) return;
    const audit = auditChainDeduplication(currentSelectedChainId);
    if (!audit) return;

    const topo = (typeof Workstation !== 'undefined') ? Workstation.activeTopology : null;
    if (!topo) {
      alert("No active campaign topology loaded.");
      return;
    }

    if (typeof ensureEntityCollections === 'function') ensureEntityCollections(topo);
    if (!Array.isArray(topo.campaign_modules)) topo.campaign_modules = [];
    if (!topo.nodes) topo.nodes = {};
    if (!topo.edgeData) topo.edgeData = {};
    if (typeof nodeSlottedModules === 'undefined') window.nodeSlottedModules = {};

    let createdNodesCount = 0;
    let boundNodesCount = 0;
    let reusedCount = 0;
    const stageNodeMap = {}; // stageIdx -> nodeId

    // 1. Process each stage placement
    audit.stages.forEach((st, idx) => {
      const selectEl = document.getElementById(`ici-stage-action-${idx}`);
      const actionVal = selectEl ? selectEl.value : 'skip';

      if (actionVal === 'skip') {
        stageNodeMap[idx] = st.matchedNodeId;
        reusedCount++;
        return;
      }

      let targetNodeId = null;

      if (actionVal === 'create_node') {
        // Calculate new node position offset from center or previous stage
        const existingList = (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.getNodesList)
          ? CampaignMutationEngine.getNodesList(topo)
          : Object.values(topo.nodes);

        let baseX = 400 + (idx * 160);
        let baseY = 300 + ((idx % 2 === 0 ? 1 : -1) * 80);

        if (existingList.length > 0) {
          const lastN = existingList[existingList.length - 1];
          baseX = (lastN.x || 400) + 140;
          baseY = (lastN.y || 300) + ((idx % 2 === 0 ? 60 : -60));
        }

        const nextNumericId = existingList.reduce((max, n) => {
          const num = parseInt(n.id, 10);
          return (!isNaN(num) && num > max) ? num : max;
        }, 0) + 1;

        targetNodeId = String(nextNumericId);

        const newNode = {
          id: targetNodeId,
          name: `${st.moduleTitle} (${st.role})`,
          x: baseX,
          y: baseY,
          tier: 2,
          culture: st.module.culture || 'Universal',
          color: st.module.color || 'Colorless',
          modules: [st.moduleId],
          provides: Array.isArray(st.module.provides) ? [...st.module.provides] : [],
          requires: Array.isArray(st.module.requires) ? [...st.module.requires] : [],
          adj: [],
          infBy: []
        };

        if (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.upsertNode) {
          CampaignMutationEngine.upsertNode(topo, newNode);
        } else {
          topo.nodes[targetNodeId] = newNode;
        }

        createdNodesCount++;
      } else {
        // Bound to existing selected node ID
        targetNodeId = String(actionVal);
        const nodeObj = (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.getNodeById)
          ? CampaignMutationEngine.getNodeById(topo, targetNodeId)
          : topo.nodes[targetNodeId];

        if (nodeObj) {
          if (!Array.isArray(nodeObj.modules)) nodeObj.modules = [];
          if (!nodeObj.modules.includes(st.moduleId)) nodeObj.modules.push(st.moduleId);
          boundNodesCount++;
        }
      }

      stageNodeMap[idx] = targetNodeId;

      // Update runtime collections & slotting
      if (!topo.campaign_modules.includes(st.moduleId)) {
        topo.campaign_modules.push(st.moduleId);
      }
      if (!Array.isArray(nodeSlottedModules[targetNodeId])) {
        nodeSlottedModules[targetNodeId] = [];
      }
      if (!nodeSlottedModules[targetNodeId].includes(st.moduleId)) {
        nodeSlottedModules[targetNodeId].push(st.moduleId);
      }

      // Promote and station latent entity prototypes for this module
      if (typeof getPrototypesForType === 'function' && typeof promotePrototypeToCampaign === 'function') {
        ['npc', 'quest', 'item', 'tracker'].forEach(type => {
          const protos = getPrototypesForType(type) || [];
          protos.forEach(proto => {
            if (proto && proto.moduleId === st.moduleId) {
              const promoted = promotePrototypeToCampaign(proto.id, type);
              if (promoted) {
                promoted.nodeId = targetNodeId;
              }
            }
          });
        });
      }
    });

    // 2. Automatically tether conduits between producer and consumer stage nodes (DAG-aware with sequential fallback)
    for (let i = 0; i < audit.stages.length - 1; i++) {
      const u = stageNodeMap[i];
      const uStage = audit.stages[i];
      const uProvides = Array.isArray(uStage.provides) ? uStage.provides : [];
      let wiredConsumer = false;

      for (let j = i + 1; j < audit.stages.length; j++) {
        const v = stageNodeMap[j];
        const vStage = audit.stages[j];
        const vRequires = Array.isArray(vStage.requires) ? vStage.requires : [];
        const matchedTags = uProvides.filter(p => vRequires.includes(p));

        if (matchedTags.length > 0 && u && v && String(u) !== String(v)) {
          wiredConsumer = true;
          const conduitType = inferConduitType(matchedTags);
          const flows = matchedTags.map(tag => ({ tag, sourceModuleId: uStage.moduleId }));
          if (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.addCorridor) {
            CampaignMutationEngine.addCorridor(topo, u, v, 'adj', { conduitType, dedicatedFlows: flows });
          } else {
            const edgeKey = `${u}->${v}`;
            if (!topo.edgeData[edgeKey]) topo.edgeData[edgeKey] = {};
            topo.edgeData[edgeKey].conduitType = conduitType;
            if (!Array.isArray(topo.edgeData[edgeKey].dedicatedFlows)) topo.edgeData[edgeKey].dedicatedFlows = [];
            topo.edgeData[edgeKey].dedicatedFlows.push(...flows);
          }
        }
      }

      // Sequential fallback if no explicit tag overlap inside the chain
      if (!wiredConsumer) {
        const v = stageNodeMap[i + 1];
        if (u && v && String(u) !== String(v)) {
          const conduitTag = uProvides[0] || 'Trade: Goods';
          const conduitType = inferConduitType([conduitTag]);
          const flowPayload = { tag: conduitTag, sourceModuleId: uStage.moduleId };
          if (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.addCorridor) {
            CampaignMutationEngine.addCorridor(topo, u, v, 'adj', { conduitType, dedicatedFlows: [flowPayload] });
          } else {
            const edgeKey = `${u}->${v}`;
            if (!topo.edgeData[edgeKey]) topo.edgeData[edgeKey] = {};
            topo.edgeData[edgeKey].conduitType = conduitType;
            if (!Array.isArray(topo.edgeData[edgeKey].dedicatedFlows)) topo.edgeData[edgeKey].dedicatedFlows = [];
            topo.edgeData[edgeKey].dedicatedFlows.push(flowPayload);
          }
        }
      }
    }

    // 3. Save, render and notify
    if (typeof pushHistoryState === 'function') {
      pushHistoryState(`Import Industry Chain: ${audit.chain.id}`);
    }
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    if (typeof auditAllSupplyLines === 'function') auditAllSupplyLines();
    if (typeof renderCanvas === 'function') renderCanvas();
    if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    if (typeof renderEntityManagerList === 'function') renderEntityManagerList();

    if (typeof MDIWindowManager !== 'undefined') {
      MDIWindowManager.close('modal-industry-chain-importer');
    } else {
      const el = document.getElementById('modal-industry-chain-importer');
      if (el) el.classList.add('hidden');
    }

    const summaryMsg = `Successfully imported ${audit.chain.title}! Reused: ${reusedCount}, Created Nodes: ${createdNodesCount}, Bound: ${boundNodesCount}.`;
    if (typeof setStatusBarMessage === 'function') {
      setStatusBarMessage(summaryMsg);
    }
    alert(summaryMsg);
  }

  if (typeof window !== 'undefined') {
    window.openIndustryChainImporterModal = openIndustryChainImporterModal;
  }

  return {
    getAvailableIndustryChains,
    auditChainDeduplication,
    openIndustryChainImporterModal,
    renderChainStageGrid,
    onActionChange,
    executeChainImport
  };
}));
