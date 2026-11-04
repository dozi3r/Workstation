// ============================================================================
// WORKSTATION MOD: Universal Pre-Industrial Resource & Industry Pack
// Campaign-Independent Industry Chain Catalog (98 Modules / 45 Chains)
// Includes Opt-in Dwarf Fortress Stockpile, Working Cache & In-Transit Hauling Simulator
// ============================================================================
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const mod = factory();
    if (typeof window !== 'undefined' && window.CreatorStudio && typeof window.CreatorStudio.registerMod === 'function') {
      window.CreatorStudio.registerMod(mod);
    }
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MOD_ID = 'pre_industrial_resources';

  function isSimActive(topo) {
    if (!topo) return false;
    if (topo.modData && topo.modData[MOD_ID] && topo.modData[MOD_ID].dfSimEnabled) {
      return true;
    }
    return false;
  }

  function ensureNodeStorage(node) {
    if (!node.modData) node.modData = {};
    if (!node.modData[MOD_ID]) node.modData[MOD_ID] = {};
    const d = node.modData[MOD_ID];
    if (!d.inputHopper) d.inputHopper = {};
    if (!d.outputBin) d.outputBin = {};
    if (!d.stockpile) d.stockpile = {};
    if (d.backpressureHalt === undefined) d.backpressureHalt = false;
    return d;
  }

  function ensureEdgeStorage(edgeRecord) {
    if (!edgeRecord.modData) edgeRecord.modData = {};
    if (!edgeRecord.modData[MOD_ID]) edgeRecord.modData[MOD_ID] = {};
    const d = edgeRecord.modData[MOD_ID];
    if (!Array.isArray(d.inTransit)) d.inTransit = [];
    return d;
  }

  function parseTagCanonical(tagStr) {
    if (typeof parseResourceTag === 'function') {
      const p = parseResourceTag(tagStr);
      if (p) return `${p.category}:${p.name}`;
    }
    return tagStr ? String(tagStr).trim() : 'General:Good';
  }

  function isPerishableCommodity(tag) {
    const lower = String(tag).toLowerCase();
    return lower.includes('food') || lower.includes('grain') || lower.includes('wheat') ||
           lower.includes('fish') || lower.includes('meat') || lower.includes('bread') ||
           lower.includes('vegetable') || lower.includes('fruit') || lower.includes('cattle');
  }

  function nodeHasPreservation(node) {
    const provides = Array.isArray(node.provides) ? node.provides : [];
    const provStr = provides.join(' ').toLowerCase();
    const hasTag = provStr.includes('salt') || provStr.includes('ice') || provStr.includes('granary') || provStr.includes('root cellar') || provStr.includes('curing');
    const modules = Array.isArray(node.modules) ? node.modules : [];
    const modStr = modules.join(' ').toLowerCase();
    return hasTag || modStr.includes('salt') || modStr.includes('t0-dom-01') || modStr.includes('granary');
  }

  /**
   * Core Turn Advancement Engine for Physical Resource Simulation
   */
  function advanceDfSupplySimulation(context) {
    const topo = context.topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
    if (!topo || !isSimActive(topo)) return { active: false };

    const nodesList = context.nodes || (Array.isArray(topo.nodes) ? topo.nodes : Object.values(topo.nodes || {}));
    if (!topo.edgeData) topo.edgeData = {};
    const edgeData = topo.edgeData;
    let deliveredShipments = 0;
    let unitsConsumed = 0;
    let unitsProduced = 0;
    let unitsDecayed = 0;
    let haltedFacilities = 0;

    // Helper: find node by ID
    const findNode = (id) => {
      if (Array.isArray(topo.nodes)) return topo.nodes.find(n => n && String(n.id) === String(id));
      return topo.nodes[String(id)];
    };

    // 1. IN-TRANSIT ADVANCEMENT: Progress caravans/barges along corridors
    Object.keys(edgeData).forEach(edgeKey => {
      const rec = edgeData[edgeKey];
      if (!rec || !rec.modData || !rec.modData[MOD_ID]) return;
      const d = rec.modData[MOD_ID];
      if (!Array.isArray(d.inTransit) || d.inTransit.length === 0) return;

      const remaining = [];
      d.inTransit.forEach(shipment => {
        // If edge is blocked or severed, shipments freeze in transit
        const isBlocked = (typeof isEdgeBlocked === 'function') 
          ? isEdgeBlocked(shipment.from, shipment.to)
          : (rec.condition === 'severed' || rec.condition === 'blocked' || rec.condition === 'Blockaded / Besieged');

        if (isBlocked) {
          remaining.push(shipment);
          return;
        }

        shipment.etaTurns = (shipment.etaTurns || 1) - 1;
        if (shipment.etaTurns <= 0) {
          // Delivered! Move into destination node inputHopper or stockpile
          const targetNode = findNode(shipment.to);
          if (targetNode) {
            const destStore = ensureNodeStorage(targetNode);
            const rTag = parseTagCanonical(shipment.resource);
            // Place into inputHopper if required by node or slotted modules, else general stockpile
            const reqTags = (Array.isArray(targetNode.requires) ? targetNode.requires : []).map(parseTagCanonical);
            const slottedIds = (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules[targetNode.id])
              || (Array.isArray(targetNode.modules) ? targetNode.modules : []);
            const allMods = (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES))
              ? ALL_MODULES
              : ((typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST)) ? MODULES_MANIFEST : []);
            slottedIds.forEach(mid => {
              const mObj = allMods.find(m => m && m.id === mid);
              if (mObj && Array.isArray(mObj.requires)) {
                mObj.requires.forEach(req => reqTags.push(parseTagCanonical(req)));
              }
            });

            const hopperTarget = reqTags.includes(rTag) ? destStore.inputHopper : destStore.stockpile;
            if (!hopperTarget[rTag]) {
              hopperTarget[rTag] = { qty: 0, cap: (hopperTarget === destStore.inputHopper ? 20 : 100) };
            }
            hopperTarget[rTag].qty = Math.min((hopperTarget[rTag].qty || 0) + shipment.qty, hopperTarget[rTag].cap || 100);
            deliveredShipments++;
          }
        } else {
          remaining.push(shipment);
        }
      });
      d.inTransit = remaining;
    });

    // 2. PRODUCTION & CONSUMPTION PHASE FOR EACH NODE
    nodesList.forEach(node => {
      if (!node) return;
      const store = ensureNodeStorage(node);
      const slottedIds = (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules[node.id])
        || (Array.isArray(node.modules) ? node.modules : []);

      const allMods = (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES))
        ? ALL_MODULES
        : ((typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST)) ? MODULES_MANIFEST : []);

      store.backpressureHalt = false;

      slottedIds.forEach(mId => {
        const modObj = allMods.find(m => m && m.id === mId);
        if (!modObj) return;

        const reqs = Array.isArray(modObj.requires) ? modObj.requires : [];
        const provs = Array.isArray(modObj.provides) ? modObj.provides : [];

        // Check Backpressure: Are output bins for provided goods overflowing?
        let canProduce = true;
        provs.forEach(pTag => {
          const cTag = parseTagCanonical(pTag);
          if (!store.outputBin[cTag]) {
            store.outputBin[cTag] = { qty: 0, cap: 20 };
          }
          if (store.outputBin[cTag].qty >= store.outputBin[cTag].cap) {
            canProduce = false;
            store.backpressureHalt = true;
            haltedFacilities++;
          }
        });

        if (!canProduce) return;

        // Check Inputs: Does inputHopper or stockpile have required commodities?
        let inputsMet = true;
        const nodeProvidesList = (Array.isArray(node.provides) ? node.provides : []).map(parseTagCanonical);
        reqs.forEach(rTag => {
          const cTag = parseTagCanonical(rTag);
          const isSatisfiedCatalyst = (typeof isMaterialRequirement === 'function' && !isMaterialRequirement(rTag)) || nodeProvidesList.includes(cTag);
          if (isSatisfiedCatalyst) {
            return;
          }
          const inHop = (store.inputHopper[cTag] && store.inputHopper[cTag].qty) || (store.inputHopper[rTag] && store.inputHopper[rTag].qty) || 0;
          const inStk = (store.stockpile[cTag] && store.stockpile[cTag].qty) || (store.stockpile[rTag] && store.stockpile[rTag].qty) || 0;
          if (inHop + inStk < 1) {
            if (modObj.chain_role === 'extraction') {
              return;
            }
            inputsMet = false;
          }
        });

        // Run production cycle: Consume 1 unit of each input, produce 1 unit of each output
        if (inputsMet) {
          reqs.forEach(rTag => {
            const cTag = parseTagCanonical(rTag);
            const isSatisfiedCatalyst = (typeof isMaterialRequirement === 'function' && !isMaterialRequirement(rTag)) || nodeProvidesList.includes(cTag);
            if (isSatisfiedCatalyst) {
              return;
            }
            if (store.inputHopper[cTag] && store.inputHopper[cTag].qty >= 1) {
              store.inputHopper[cTag].qty -= 1;
              unitsConsumed += 1;
            } else if (store.inputHopper[rTag] && store.inputHopper[rTag].qty >= 1) {
              store.inputHopper[rTag].qty -= 1;
              unitsConsumed += 1;
            } else if (store.stockpile[cTag] && store.stockpile[cTag].qty >= 1) {
              store.stockpile[cTag].qty -= 1;
              unitsConsumed += 1;
            } else if (store.stockpile[rTag] && store.stockpile[rTag].qty >= 1) {
              store.stockpile[rTag].qty -= 1;
              unitsConsumed += 1;
            }
          });

          provs.forEach(pTag => {
            const cTag = parseTagCanonical(pTag);
            if (!store.outputBin[cTag]) store.outputBin[cTag] = { qty: 0, cap: 20 };
            store.outputBin[cTag].qty = Math.min((store.outputBin[cTag].qty || 0) + 1, store.outputBin[cTag].cap || 20);
            unitsProduced += 1;
          });
        }
      });

      // BFS search from neighborId (visiting unblocked adjacent nodes, avoiding originId)
      function hasDownstreamConsumer(startId, originId, targetTag) {
        const visited = new Set([String(originId), String(startId)]);
        const queue = [startId];
        while (queue.length > 0) {
          const currId = queue.shift();
          const currNode = findNode(currId);
          if (!currNode) continue;

          if (String(currId) !== String(startId)) {
            const reqs = (Array.isArray(currNode.requires) ? currNode.requires : []).map(parseTagCanonical);
            const slotted = (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules[currNode.id])
              || (Array.isArray(currNode.modules) ? currNode.modules : []);
            slotted.forEach(mid => {
              const mObj = allMods.find(m => m && m.id === mid);
              if (mObj && Array.isArray(mObj.requires)) {
                mObj.requires.forEach(r => reqs.push(parseTagCanonical(r)));
              }
            });
            if (reqs.includes(targetTag)) {
              return true;
            }
          }

          const adj = Array.isArray(currNode.adj) ? currNode.adj : [];
          for (const nextId of adj) {
            if (visited.has(String(nextId))) continue;
            const nextPairKey = (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.formatCorridorKey)
              ? CampaignMutationEngine.formatCorridorKey(currId, nextId, 'adj')
              : [String(currId), String(nextId)].sort().join('-');
            const nextRec = edgeData[nextPairKey] || edgeData[`${currId}->${nextId}`] || edgeData[`${nextId}->${currId}`];
            const blocked = (typeof isEdgeBlocked === 'function')
              ? isEdgeBlocked(currId, nextId)
              : (nextRec && (nextRec.condition === 'severed' || nextRec.condition === 'blocked' || nextRec.condition === 'Blockaded / Besieged'));
            if (blocked) continue;

            visited.add(String(nextId));
            queue.push(nextId);
          }
        }
        return false;
      }

      // 3. AUTO-DISPATCH SURPLUS OUTPUT BINS INTO CONNECTED CORRIDORS
      // If node has adjacent transit routes, transfer goods from outputBin to corridors toward consumers
      const adjIds = Array.isArray(node.adj) ? node.adj : [];
      if (adjIds.length > 0) {
        Object.keys(store.outputBin).forEach(cTag => {
          const bin = store.outputBin[cTag];
          if (bin.qty <= 0) return;

          // Dispatch portion along first viable unblocked road (toward nodes that actually require this good)
          for (const neighborId of adjIds) {
            const neighborNode = findNode(neighborId);
            if (!neighborNode) continue;
            // Only auto-dispatch toward a neighbor if that neighbor (or its slotted modules) requires this commodity
            const neighborReqs = (Array.isArray(neighborNode.requires) ? neighborNode.requires : []).map(parseTagCanonical);
            const neighborSlotted = (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules[neighborNode.id])
              || (Array.isArray(neighborNode.modules) ? neighborNode.modules : []);
            neighborSlotted.forEach(nMid => {
              const nmObj = allMods.find(m => m && m.id === nMid);
              if (nmObj && Array.isArray(nmObj.requires)) {
                nmObj.requires.forEach(nr => neighborReqs.push(parseTagCanonical(nr)));
              }
            });

            const pairKey = (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.formatCorridorKey)
              ? CampaignMutationEngine.formatCorridorKey(node.id, neighborId, 'adj')
              : [String(node.id), String(neighborId)].sort().join('-');
            let rec = edgeData[pairKey] || edgeData[`${node.id}->${neighborId}`];
            if (!rec) {
              rec = edgeData[pairKey] = { condition: 'Passable', capacity: 25, modules: [] };
            }

            const directNeeds = neighborReqs.includes(cTag);
            const dedicatedFlow = Array.isArray(rec.dedicatedFlows) && rec.dedicatedFlows.some(f => parseTagCanonical(typeof f === 'string' ? f : f.tag) === cTag);
            const downstreamNeeds = !directNeeds && !dedicatedFlow && hasDownstreamConsumer(neighborId, node.id, cTag);

            if (!directNeeds && !dedicatedFlow && !downstreamNeeds) continue;

            const isBlocked = (typeof isEdgeBlocked === 'function')
              ? isEdgeBlocked(node.id, neighborId)
              : (rec.condition === 'severed' || rec.condition === 'blocked' || rec.condition === 'Blockaded / Besieged');
            if (isBlocked) continue;

            const edgeStore = ensureEdgeStorage(rec);
            const roadCap = (typeof rec.capacity === 'number') ? rec.capacity : 25;
            const currentFlow = edgeStore.inTransit.reduce((acc, sh) => acc + (sh.qty || 0), 0);
            const availableBandwidth = Math.max(0, roadCap - currentFlow);

            if (availableBandwidth > 0 && bin.qty > 0) {
              const dispatchQty = Math.min(bin.qty, availableBandwidth, 5);
              bin.qty -= dispatchQty;
              const eta = (rec.condition && rec.condition.includes('Rough')) ? 2 : 1;
              edgeStore.inTransit.push({
                resource: cTag,
                qty: dispatchQty,
                from: node.id,
                to: neighborId,
                etaTurns: eta
              });
              break;
            }
          }
        });
      }

      // 4. PERISHABILITY & SPOILAGE DECAY
      const hasPreserve = nodeHasPreservation(node);
      const decayRate = hasPreserve ? 0.0 : 0.10; // 10% per turn if unpreserved
      if (decayRate > 0) {
        Object.keys(store.stockpile).forEach(cTag => {
          if (isPerishableCommodity(cTag)) {
            const item = store.stockpile[cTag];
            if (item && item.qty > 0) {
              const loss = Math.ceil(item.qty * decayRate);
              item.qty = Math.max(0, item.qty - loss);
              unitsDecayed += loss;
            }
          }
        });
      }
    });

    return {
      active: true,
      deliveredShipments,
      unitsConsumed,
      unitsProduced,
      unitsDecayed,
      haltedFacilities
    };
  }

  /**
   * Mod Object Definition
   */
  const PreIndustrialResourceMod = {
    id: MOD_ID,
    name: 'Universal Pre-Industrial Resource & Industry Pack',
    version: '1.2.0',
    description: 'Provides 98 pre-industrial industry chain modules across 45 chains, plus an opt-in Dwarf Fortress physical stockpile, hopper & in-transit hauling simulator.',
    menuItems: [
      {
        label: 'Open Industry Chain Importer... (Ctrl+Shift+I)',
        action: function() {
          if (typeof openIndustryChainImporterModal === 'function') {
            openIndustryChainImporterModal();
          }
        }
      },
      {
        label: 'Browse Industry Modules in Explorer...',
        action: function() {
          if (typeof openModuleExplorer === 'function') {
            openModuleExplorer();
            const campSel = document.getElementById('me-filter-campaign');
            if (campSel) {
              campSel.value = 'mod_pre_industrial_resources';
              if (typeof filterModules === 'function') filterModules();
            }
          }
        }
      },
      { separator: true },
      {
        label: 'Toggle DF Stockpile & Hauling Sim (Active Campaign)...',
        action: function() {
          const topo = (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
          if (!topo) {
            alert('No active campaign map loaded.');
            return;
          }
          if (!topo.modData) topo.modData = {};
          if (!topo.modData[MOD_ID]) topo.modData[MOD_ID] = {};
          const current = !!topo.modData[MOD_ID].dfSimEnabled;
          topo.modData[MOD_ID].dfSimEnabled = !current;
          if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
          if (typeof renderCanvas === 'function') renderCanvas();
          if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
          const stateStr = !current ? 'ENABLED (Strict Stockpiles, Hoppers & Caravans)' : 'DISABLED (Standard Qualitative/Catalyst Flow)';
          alert(`Dwarf Fortress Resource Simulation is now: ${stateStr}`);
        }
      }
    ],

    onInit: function(studio) {
      console.log('[Universal Pre-Industrial Resource Mod] Initialized with DF physical logistics hooks.');
    },

    onAdvanceSupplyTurn: function(context) {
      const simResult = advanceDfSupplySimulation(context);
      if (simResult && simResult.active) {
        console.log(`[DF Logistics Sim] Turn complete: Delivered: ${simResult.deliveredShipments}, Consumed: ${simResult.unitsConsumed}, Produced: ${simResult.unitsProduced}, Decayed: ${simResult.unitsDecayed}, Backpressure Halts: ${simResult.haltedFacilities}`);
      }
    },

    renderNodeProperties: function(tbody, ctx) {
      const node = ctx.node;
      const topo = ctx.topo;
      if (!isSimActive(topo)) return;

      const store = ensureNodeStorage(node);
      ctx.appendCategoryRow(tbody, 'DF Stockpiles & Working Buffers');

      // Status Indicator
      if (store.backpressureHalt) {
        ctx.appendPropRow(tbody, 'Operational Status', '⛔ BACKPRESSURE HALT (Bins Full)', false);
      } else {
        ctx.appendPropRow(tbody, 'Operational Status', '✅ Active (Hoppers Ready)', false);
      }

      // Input Hopper Summary
      const inHopKeys = Object.keys(store.inputHopper || {});
      const inHopSummary = inHopKeys.length 
        ? inHopKeys.map(k => `${k}: ${store.inputHopper[k].qty}/${store.inputHopper[k].cap || 20}`).join(', ')
        : '(Empty)';
      ctx.appendPropRow(tbody, 'Input Hoppers', inHopSummary, false);

      // Output Bin Summary
      const outBinKeys = Object.keys(store.outputBin || {});
      const outBinSummary = outBinKeys.length
        ? outBinKeys.map(k => `${k}: ${store.outputBin[k].qty}/${store.outputBin[k].cap || 20}`).join(', ')
        : '(Empty)';
      ctx.appendPropRow(tbody, 'Output Bins', outBinSummary, false);

      // Stockpile Summary
      const stkKeys = Object.keys(store.stockpile || {});
      const stkSummary = stkKeys.length
        ? stkKeys.map(k => `${k}: ${store.stockpile[k].qty}`).join(', ')
        : '(Empty)';
      ctx.appendPropRow(tbody, 'Stockpile Storage', stkSummary, false);

      // Action to Seed/Edit Stockpile
      ctx.appendActionPropRow(tbody, '[+ Seed/Edit Storage]', '+ Add Commodity Stockpile...', () => {
        const itemInput = prompt(`Enter commodity tag and quantity to seed into Node #${node.id} stockpile (e.g. "Ore: Iron [20]"):`);
        if (itemInput) {
          const match = itemInput.match(/([^\[]+)(?:\[(\d+)\])?/);
          if (match) {
            const tag = parseTagCanonical(match[1]);
            const qty = match[2] ? parseInt(match[2], 10) : 20;
            if (!store.stockpile[tag]) store.stockpile[tag] = { qty: 0, cap: 100 };
            store.stockpile[tag].qty += qty;
            ctx.save();
            ctx.refresh();
          }
        }
      });
    },

    renderEdgeProperties: function(tbody, ctx) {
      const edgeRecord = ctx.edgeRecord;
      const topo = ctx.topo;
      if (!isSimActive(topo)) return;

      const store = ensureEdgeStorage(edgeRecord);
      ctx.appendCategoryRow(tbody, 'DF Caravan & Hauling Queue');

      const queue = store.inTransit || [];
      if (queue.length === 0) {
        ctx.appendPropRow(tbody, 'Caravans In-Transit', 'None (Corridor idle)', false);
      } else {
        queue.forEach((sh, idx) => {
          ctx.appendPropRow(tbody, `Caravan #${idx+1}`, `${sh.resource} x${sh.qty} (ETA: ${sh.etaTurns} turn(s)) -> Node #${sh.to}`, false);
        });
      }

      ctx.appendActionPropRow(tbody, '[+ Dispatch Shipment]', '+ Dispatch Custom Caravan...', () => {
        const input = prompt(`Dispatch shipment from Node #${ctx.uId} to Node #${ctx.vId} (e.g. "Commodity: Timber [10]"):`);
        if (input) {
          const match = input.match(/([^\[]+)(?:\[(\d+)\])?/);
          if (match) {
            const tag = parseTagCanonical(match[1]);
            const qty = match[2] ? parseInt(match[2], 10) : 10;
            store.inTransit.push({
              resource: tag,
              qty: qty,
              from: ctx.uId,
              to: ctx.vId,
              etaTurns: 1
            });
            ctx.save();
            ctx.refresh();
          }
        }
      });
    },

    renderCanvasNode: function(g, ctx) {
      const topo = ctx.topo;
      if (!isSimActive(topo)) return;

      const node = ctx.node;
      const store = (node.modData && node.modData[MOD_ID]) ? node.modData[MOD_ID] : null;
      if (!store) return;

      if (store.backpressureHalt) {
        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badge.setAttribute('x', ctx.r - 4);
        badge.setAttribute('y', -ctx.r + 4);
        badge.setAttribute('font-size', '10px');
        badge.setAttribute('text-anchor', 'middle');
        badge.textContent = '⛔';
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = 'Backpressure Halt: Output bins full!';
        badge.appendChild(title);
        g.appendChild(badge);
      }
    },

    // Export internal helpers for unit testing
    _advanceDfSupplySimulation: advanceDfSupplySimulation,
    _ensureNodeStorage: ensureNodeStorage,
    _ensureEdgeStorage: ensureEdgeStorage,
    _isSimActive: isSimActive
  };

  return PreIndustrialResourceMod;
}));