    // ========================================================================
    // WINDOWS 95 MDI WINDOW MANAGER & TASKBAR ENGINE
    // ========================================================================
    const MDIWindowManager = {
      windows: {},
      activeWindowId: null,
      highestZIndex: 100,

      registerWindow(id, config) {
        const el = document.getElementById(id);
        if (!el) return;

        this.windows[id] = {
          id: id,
          title: config.title || id,
          icon: config.icon || 'CS',
          el: el,
          minimized: false,
          maximized: false,
          lastPos: { top: el.style.top || '60px', left: el.style.left || '100px', width: el.style.width || '800px', height: el.style.height || '550px' }
        };

        this.setupDragging(id);
        this.renderTaskbar();
      },

      setupDragging(id) {
        const win = this.windows[id];
        if (!win) return;
        const header = win.el.querySelector('.title-bar, .mdi-title-bar');
        if (!header) return;

        header.style.cursor = 'move';
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onMouseDown = (e) => {
          if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
          this.bringToFront(id);
          if (win.maximized) return;

          isDragging = true;
          document.body.classList.add('mdi-dragging');
          startX = e.clientX;
          startY = e.clientY;
          initialLeft = win.el.offsetLeft;
          initialTop = win.el.offsetTop;
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
          e.preventDefault();
        };

        const onMouseMove = (e) => {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          win.el.style.left = `${Math.max(10, initialLeft + dx)}px`;
          win.el.style.top = `${Math.max(30, initialTop + dy)}px`;
        };

        const onMouseUp = () => {
          if (isDragging) {
            isDragging = false;
            document.body.classList.remove('mdi-dragging');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          }
        };

        header.addEventListener('mousedown', onMouseDown);
        win.el.addEventListener('mousedown', () => this.bringToFront(id));
      },

      bringToFront(id) {
        const win = this.windows[id];
        if (!win) return;

        this.highestZIndex += 2;
        win.el.style.zIndex = this.highestZIndex;
        this.activeWindowId = id;

        Object.keys(this.windows).forEach(wId => {
          const w = this.windows[wId];
          if (wId === id) {
            w.el.classList.add('active-focus');
          } else {
            w.el.classList.remove('active-focus');
          }
        });

        this.renderTaskbar();
      },

      minimize(id) {
        const win = this.windows[id];
        if (!win) return;

        win.minimized = true;
        win.el.classList.add('minimized');
        win.el.classList.remove('active-focus');

        if (this.activeWindowId === id) {
          const openWindows = Object.keys(this.windows).filter(wId => !this.windows[wId].minimized && !this.windows[wId].el.classList.contains('hidden'));
          this.activeWindowId = openWindows.length > 0 ? openWindows[openWindows.length - 1] : null;
          if (this.activeWindowId) {
            this.bringToFront(this.activeWindowId);
          }
        }

        this.renderTaskbar();
        setStatusBarMessage(`Minimized ${win.title}.`);
      },

      restoreOrMaximize(id) {
        const win = this.windows[id];
        if (!win) return;

        if (win.minimized) {
          win.minimized = false;
          win.el.classList.remove('minimized');
          win.el.classList.remove('hidden');
          this.bringToFront(id);
        } else if (win.maximized) {
          win.maximized = false;
          win.el.classList.remove('maximized');
          win.el.style.top = win.lastPos.top;
          win.el.style.left = win.lastPos.left;
          win.el.style.width = win.lastPos.width;
          win.el.style.height = win.lastPos.height;
          this.bringToFront(id);
        } else {
          win.lastPos = {
            top: win.el.style.top || `${win.el.offsetTop}px`,
            left: win.el.style.left || `${win.el.offsetLeft}px`,
            width: win.el.style.width || `${win.el.offsetWidth}px`,
            height: win.el.style.height || `${win.el.offsetHeight}px`
          };
          win.maximized = true;
          win.el.classList.add('maximized');
          this.bringToFront(id);
        }

        this.renderTaskbar();
      },

      maximize(id) {
        this.restoreOrMaximize(id);
      },

      close(id) {
        const win = this.windows[id];
        const el = win ? win.el : document.getElementById(id);
        if (el) {
          el.classList.add('hidden');
          el.classList.remove('active-focus');
        }
        if (win) {
          win.minimized = false;
        }

        if (this.activeWindowId === id) {
          const remaining = Object.keys(this.windows).filter(wId => !this.windows[wId].minimized && !this.windows[wId].el.classList.contains('hidden'));
          this.activeWindowId = remaining.length > 0 ? remaining[remaining.length - 1] : null;
          if (this.activeWindowId) this.bringToFront(this.activeWindowId);
        }

        this.renderTaskbar();
        if (win) setStatusBarMessage(`Closed ${win.title}.`);
      },

      open(id) {
        let win = this.windows[id];
        if (!win) {
          const el = document.getElementById(id);
          if (el) {
            const titleEl = el.querySelector('.mdi-title-text, .title-bar-text');
            const title = titleEl ? titleEl.textContent.trim() : id;
            this.registerWindow(id, { title: title });
            win = this.windows[id];
          }
        }
        if (!win) return;

        win.minimized = false;
        win.el.classList.remove('hidden');
        win.el.classList.remove('minimized');
        win.el.style.display = '';
        this.bringToFront(id);
        this.renderTaskbar();
      },

      toggleWindow(id) {
        const win = this.windows[id];
        if (!win) return;

        if (win.el.classList.contains('hidden')) {
          this.open(id);
        } else if (win.minimized) {
          this.restoreOrMaximize(id);
        } else if (this.activeWindowId === id) {
          this.minimize(id);
        } else {
          this.bringToFront(id);
        }
      },

      renderTaskbar() {
        const container = document.getElementById('win95-task-list');
        if (!container) return;
        container.innerHTML = '';

        Object.keys(this.windows).forEach(id => {
          const win = this.windows[id];
          const isHidden = win.el.classList.contains('hidden');
          if (isHidden && !win.minimized) return;

          const btn = document.createElement('button');
          btn.className = `win-btn win95-task-item ${this.activeWindowId === id && !win.minimized ? 'active' : ''} ${win.minimized ? 'minimized' : ''}`;
          btn.onclick = () => this.toggleWindow(id);

          const iconSpan = document.createElement('span');
          iconSpan.className = 'win95-start-logo';
          iconSpan.style.width = '12px';
          iconSpan.style.height = '12px';
          iconSpan.style.fontSize = '8px';
          iconSpan.textContent = win.icon || 'CS';

          const textSpan = document.createElement('span');
          textSpan.style.overflow = 'hidden';
          textSpan.style.textOverflow = 'ellipsis';
          textSpan.textContent = win.title;

          btn.appendChild(iconSpan);
          btn.appendChild(textSpan);
          container.appendChild(btn);
        });

        // Update systray telemetry
        const systrayTel = document.getElementById('systray-telemetry');
        if (systrayTel && typeof ALL_MODULES !== 'undefined') {
          const modCount = ALL_MODULES.length;
          const nodeCount = Object.keys(Workstation.activeTopology.nodes || {}).length;
          const npcCount = (Workstation.activeTopology.npcs || []).length;
          const questCount = (Workstation.activeTopology.quests || []).length;
          const itemCount = (Workstation.activeTopology.items || []).length;
          const trackerCount = (Workstation.activeTopology.trackers || []).length;
          const ticketCount = (typeof MASTER_TICKETS_DATA !== 'undefined' ? MASTER_TICKETS_DATA.length : 0) + ((Workstation.activeTopology && Workstation.activeTopology.tickets) ? Workstation.activeTopology.tickets.length : 0);
          systrayTel.textContent = `M:${modCount} ND:${nodeCount} N:${npcCount} Q:${questCount} I:${itemCount} T:${trackerCount} TK:${ticketCount}`;
        }
      },

      cascadeWindows() {
        const openWins = Object.keys(this.windows).map(id => this.windows[id]).filter(w => !w.el.classList.contains('hidden'));
        openWins.forEach((w, idx) => {
          if (w.minimized) {
            w.minimized = false;
            w.el.classList.remove('minimized');
          }
          if (w.maximized) {
            w.maximized = false;
            w.el.classList.remove('maximized');
          }
          w.el.style.top = `${55 + (idx * 30)}px`;
          w.el.style.left = `${60 + (idx * 30)}px`;
          w.el.style.width = '780px';
          w.el.style.height = '500px';
          this.bringToFront(w.id);
        });
        this.renderTaskbar();
        setStatusBarMessage("Cascaded open windows.");
      },

      tileHorizontally() {
        const openWins = Object.keys(this.windows).map(id => this.windows[id]).filter(w => !w.el.classList.contains('hidden'));
        if (openWins.length === 0) return;
        const totalHeight = window.innerHeight - 90;
        const h = Math.max(180, Math.floor(totalHeight / openWins.length));
        openWins.forEach((w, idx) => {
          if (w.minimized) { w.minimized = false; w.el.classList.remove('minimized'); }
          if (w.maximized) { w.maximized = false; w.el.classList.remove('maximized'); }
          w.el.style.top = `${32 + (idx * h)}px`;
          w.el.style.left = '140px';
          w.el.style.width = `${Math.max(500, window.innerWidth - 460)}px`;
          w.el.style.height = `${h - 4}px`;
          this.bringToFront(w.id);
        });
        this.renderTaskbar();
        setStatusBarMessage("Tiled windows horizontally.");
      },

      tileVertically() {
        const openWins = Object.keys(this.windows).map(id => this.windows[id]).filter(w => !w.el.classList.contains('hidden'));
        if (openWins.length === 0) return;
        const totalWidth = window.innerWidth - 460;
        const wWidth = Math.max(300, Math.floor(totalWidth / openWins.length));
        openWins.forEach((w, idx) => {
          if (w.minimized) { w.minimized = false; w.el.classList.remove('minimized'); }
          if (w.maximized) { w.maximized = false; w.el.classList.remove('maximized'); }
          w.el.style.top = '40px';
          w.el.style.left = `${140 + (idx * wWidth)}px`;
          w.el.style.width = `${wWidth - 4}px`;
          w.el.style.height = `${Math.max(300, window.innerHeight - 100)}px`;
          this.bringToFront(w.id);
        });
        this.renderTaskbar();
        setStatusBarMessage("Tiled windows vertically.");
      },

      minimizeAll() {
        Object.keys(this.windows).forEach(id => {
          const w = this.windows[id];
          if (!w.el.classList.contains('hidden')) {
            this.minimize(id);
          }
        });
        setStatusBarMessage("Minimized all windows to taskbar.");
      },

      restoreAll() {
        Object.keys(this.windows).forEach(id => {
          const w = this.windows[id];
          if (!w.el.classList.contains('hidden')) {
            w.minimized = false;
            w.el.classList.remove('minimized');
          }
        });
        this.renderTaskbar();
        setStatusBarMessage("Restored all windows.");
      },

      closeAll() {
        Object.keys(this.windows).forEach(id => this.close(id));
        setStatusBarMessage("Closed all windows.");
      }
    };

    function toggleStartMenu() {
      const menu = document.getElementById('win95-start-menu');
      if (menu) menu.classList.toggle('show');
    }

    function updateClock() {
      const clockEl = document.getElementById('systray-clock');
      if (!clockEl) return;
      const now = new Date();
      let hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      clockEl.textContent = `${hours}:${mins} ${ampm}`;
    }
    if (typeof setInterval !== 'undefined') setInterval(updateClock, 10000);

    // Keyboard Shortcuts
    function setupKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

        // Spacebar Hand Tool (Photoshop / CAD)
        if (e.code === 'Space' && !e.repeat) {
          e.preventDefault();
          Workstation.isSpaceDown = true;
          const container = document.getElementById('canvas-container');
          if (container && !Workstation.isPanning) {
            container.style.cursor = 'grab';
          }
          return;
        }

        if (e.key === 'v' || e.key === 'V') setTool('select');
        else if (e.key === 'h' || e.key === 'H') setTool('pan');
        else if (e.key === 'm' || e.key === 'M') { if (!e.ctrlKey) setTool('move'); }
        else if (e.key === 'n' || e.key === 'N') setTool('node-t2');
        else if (e.key === 'a' || e.key === 'A') setTool('node-t3');
        else if (e.key === 'l' || e.key === 'L') setTool('road');
        else if (e.key === 'i' || e.key === 'I') setTool('hegemony');
        else if (e.key === 'r' || e.key === 'R') { if (!e.ctrlKey) setTool('rect'); }
        else if (e.key === 'c' || e.key === 'C') { if (!e.ctrlKey) setTool('circle'); }
        else if (e.key === 'w' || e.key === 'W') { if (!e.ctrlKey) setTool('line'); }
        else if (e.key === 'e' || e.key === 'E') { if (!e.ctrlKey) setTool('erase'); }
        else if (e.key === 'g' || e.key === 'G') toggleGrid();
        else if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
        else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
          e.preventDefault();
          if (e.shiftKey) {
            redoAction();
          } else {
            undoAction();
          }
        }
        else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
          e.preventDefault();
          redoAction();
        }
        else if (e.key === 'F4') { e.preventDefault(); togglePropertiesDock(); }
        else if (e.key === 'F9') { e.preventDefault(); openTicketCenter(); }
        else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); if (typeof toggleLayersPane === 'function') toggleLayersPane(); }
        else if (e.ctrlKey && e.shiftKey && (e.key === 'm' || e.key === 'M')) { e.preventDefault(); openMapNavigatorModal(); }
        else if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); openSurfaceCatalogModal(); }
        else if (e.ctrlKey && e.shiftKey && (e.key === 'o' || e.key === 'O')) { e.preventDefault(); openOdvMatrixModal(); }
        else if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) { e.preventDefault(); openSourcebooksModal(); }
        else if (e.ctrlKey && (e.key === 'e' || e.key === 'E')) { e.preventDefault(); openCampaignExportModal(); }
        else if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); openEntityManager('tracker'); }
        else if (e.ctrlKey && e.key === 'F5') { e.preventDefault(); openEntityManager('npc'); }
        else if (e.ctrlKey && e.key === 'F6') { e.preventDefault(); openEntityManager('quest'); }
        else if (e.ctrlKey && e.key === 'F7') { e.preventDefault(); openEntityManager('item'); }
        else if (e.ctrlKey && e.key === 'F9') { e.preventDefault(); openEntityManager('tracker'); }
        else if (e.ctrlKey && e.key === 'F10') { e.preventDefault(); openEntityManager('node'); }
        else if ((e.ctrlKey && (e.key === 'm' || e.key === 'M')) || e.key === 'F8') { e.preventDefault(); openModuleExplorer(); }
        else if (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); if (typeof openSaveAsNewCampaignModal === 'function') openSaveAsNewCampaignModal(); }
        else if (e.ctrlKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); if (typeof handleToolbarSave === 'function') { handleToolbarSave(); } else { saveActiveCampaign(); if (typeof flushProjectDirectoryNow === 'function') flushProjectDirectoryNow({ interactive: true }); } }
        else if (e.ctrlKey && e.key === 'o') { e.preventDefault(); openLoadPresetModal(); }
        else if (e.ctrlKey && e.key === 'n') { e.preventDefault(); openNewCampaignWizard(); }
        else if (e.key === '+') zoomIn();
        else if (e.key === '-') zoomOut();
        else if (e.key === '0') resetZoom();
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          Workstation.isSpaceDown = false;
          const container = document.getElementById('canvas-container');
          if (container) {
            container.style.cursor = Workstation.isPanning ? 'grabbing' : (Workstation.activeTool === 'pan' ? 'grab' : 'crosshair');
          }
          if (Workstation.isPanning && !Workstation.isMiddleMousePanning && Workstation.activeTool !== 'pan') {
            Workstation.isPanning = false;
          }
        }
      });
    }

    function deleteSelected() {
      if (Array.isArray(Workstation.selectedEntities) && Workstation.selectedEntities.length > 1) {
        const list = [...Workstation.selectedEntities];
        const count = list.length;
        if (!confirm(`Delete all ${count} selected entities?`)) return;

        const topo = Workstation.activeTopology;
        if (!topo) return;

        list.forEach(ent => {
          if (ent.type === 'node') {
            if (typeof deleteNodeDirect === 'function') {
              deleteNodeDirect(ent.id);
            } else if (typeof deleteNode === 'function') {
              deleteNode(ent.id);
            }
          } else if (ent.type === 'shape') {
            if (Array.isArray(topo.shapes)) {
              topo.shapes = topo.shapes.filter(s => s.id !== ent.id);
            }
          } else if (ent.type === 'edge') {
            if (typeof deleteEdge === 'function') {
              deleteEdge(ent.uId, ent.vId, ent.edgeType);
            }
          }
        });

        if (typeof clearSelection === 'function') {
          clearSelection();
        } else {
          Workstation.selectedEntities = [];
          Workstation.selectedEntity = { type: 'global' };
        }
        if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
        if (typeof renderCanvas === 'function') renderCanvas();
        if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
        if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
        setStatusBarMessage(`Deleted ${count} selected entities.`);
        return;
      }

      if (!Workstation.selectedEntity) return;
      if (Workstation.selectedEntity.type === 'node') {
        deleteNode(Workstation.selectedEntity.id);
      } else if (Workstation.selectedEntity.type === 'edge') {
        const ent = Workstation.selectedEntity;
        if (typeof deleteEdge === 'function') {
          deleteEdge(ent.uId, ent.vId, ent.edgeType);
        }
      } else if (Workstation.selectedEntity.type === 'shape') {
        if (typeof deleteShape === 'function') {
          deleteShape(Workstation.selectedEntity.id, true);
        }
      }
    }

    function selectAllNodes() {
      if (typeof selectByType === 'function') {
        selectByType('node');
      } else {
        setStatusBarMessage("Select All nodes activated.");
      }
    }

    function restoreSnapshot(snap) {
      if (!snap || !snap.topology || !Workstation.activeTopology) return;
      const target = snap.topology;
      const current = Workstation.activeTopology;

      // In-place property copy to preserve state_adapter.js and maps[activeMapId] references (ADR-0007)
      Object.keys(current).forEach(k => {
        if (k !== 'mapMetadata') delete current[k];
      });

      Object.keys(target).forEach(k => {
        if (k === 'mapMetadata') {
          if (current.mapMetadata) {
            const existingDataUrl = current.mapMetadata.dataUrl;
            current.mapMetadata = Object.assign({}, target.mapMetadata);
            if (existingDataUrl) current.mapMetadata.dataUrl = existingDataUrl;
          } else {
            current.mapMetadata = Object.assign({}, target.mapMetadata);
          }
        } else {
          current[k] = JSON.parse(JSON.stringify(target[k]));
        }
      });

      if (typeof maps !== 'undefined' && typeof activeMapId !== 'undefined' && maps[activeMapId]) {
        Object.keys(current).forEach(k => {
          maps[activeMapId][k] = current[k];
        });
      }

      if (typeof ensureEntityCollections === 'function') {
        ensureEntityCollections(current);
      }

      // Reset selection set to prevent dangling references (ADR-0013)
      Workstation.selectedEntities = [];
      Workstation.selectedEntity = { type: 'global' };

      if (typeof renderCanvas === 'function') renderCanvas();
      if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
      if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    }
    window.restoreSnapshot = restoreSnapshot;

    function undoAction() {
      if (!Workstation || !Workstation.history || Workstation.history.undoStack.length === 0) {
        setStatusBarMessage("Nothing to undo.");
        return;
      }
      Workstation.history.isPerforming = true;
      try {
        const topo = Workstation.activeTopology;
        const currentSanitized = JSON.parse(JSON.stringify(topo, (key, value) => {
          if (key === 'dataUrl' || key === 'base64') return undefined;
          return value;
        }));
        if (currentSanitized.mapMetadata && typeof stripMapImageDataUrl === 'function') {
          currentSanitized.mapMetadata = stripMapImageDataUrl(currentSanitized.mapMetadata);
        }

        Workstation.history.redoStack.push({
          description: "Pre-Undo State",
          timestamp: Date.now(),
          topology: currentSanitized
        });

        const prev = Workstation.history.undoStack.pop();
        restoreSnapshot(prev);
        setStatusBarMessage(`Undo: ${prev.description}`);
      } catch (e) {
        console.error('Error executing undoAction:', e);
      } finally {
        Workstation.history.isPerforming = false;
      }
    }
    window.undoAction = undoAction;

    function redoAction() {
      if (!Workstation || !Workstation.history || Workstation.history.redoStack.length === 0) {
        setStatusBarMessage("Nothing to redo.");
        return;
      }
      Workstation.history.isPerforming = true;
      try {
        const topo = Workstation.activeTopology;
        const currentSanitized = JSON.parse(JSON.stringify(topo, (key, value) => {
          if (key === 'dataUrl' || key === 'base64') return undefined;
          return value;
        }));
        if (currentSanitized.mapMetadata && typeof stripMapImageDataUrl === 'function') {
          currentSanitized.mapMetadata = stripMapImageDataUrl(currentSanitized.mapMetadata);
        }

        Workstation.history.undoStack.push({
          description: "Pre-Redo State",
          timestamp: Date.now(),
          topology: currentSanitized
        });

        const next = Workstation.history.redoStack.pop();
        restoreSnapshot(next);
        setStatusBarMessage(`Redo: ${next.description}`);
      } catch (e) {
        console.error('Error executing redoAction:', e);
      } finally {
        Workstation.history.isPerforming = false;
      }
    }
    window.redoAction = redoAction;

    // Modal Handlers
    function openWelcomeModal() {
      closeAllMenus();
      const modal = document.getElementById('modal-welcome');
      if (modal) modal.classList.remove('hidden');
      if (typeof updateWelcomeSummary === 'function') updateWelcomeSummary();
      if (typeof updateWelcomeDiskCallout === 'function') updateWelcomeDiskCallout();
    }

    function closeWelcomeModal() {
      const chk = document.getElementById('chk-show-on-startup');
      if (chk) localStorage.setItem("cs_show_startup_dialog", chk.checked ? "true" : "false");
      const modal = document.getElementById('modal-welcome');
      if (modal) modal.classList.add('hidden');
    }

    function getCampaignFolderPresets() {
      const presets = [];
      const seen = new Set();

      // 0. Clean Slate Starter: Blank Canvas Pointcrawl
      presets.push({
        id: "blank_canvas",
        folderName: "blank_canvas",
        title: "Blank Canvas (New Pointcrawl)",
        desc: "Empty pointcrawl network ready for custom nodes and connections",
        nodeCount: 0,
        sourceType: "starter",
        sourceBadge: "✨ Clean Slate",
        isBlank: true
      });
      seen.add("blank_canvas");

      // 1. Live disk /campaigns/ directory
      if (window.discoveredDiskCampaigns && Object.keys(window.discoveredDiskCampaigns).length > 0) {
        Object.values(window.discoveredDiskCampaigns).forEach(d => {
          const key = d.id || d.folderName;
          if (seen.has(key)) return;
          seen.add(key);
          if (d.folderName) seen.add(d.folderName);

          const title = d.title || d.folderName || key;
          const nodeCount = d.nodeCount || 0;
          const desc = d.description || `${nodeCount} Nodes`;
          presets.push({
            id: key,
            folderName: d.folderName || key,
            title: title,
            desc: desc,
            nodeCount: nodeCount,
            sourceType: "disk",
            sourceBadge: `📁 /campaigns/${d.folderName || key}/`,
            diskItem: d
          });
        });
      }

      // 2. Bundled CAMPAIGN_REGISTRY (compiled directly from campaigns/ folder)
      if (typeof CAMPAIGN_REGISTRY !== 'undefined' && Object.keys(CAMPAIGN_REGISTRY).length > 0) {
        Object.keys(CAMPAIGN_REGISTRY).forEach(cId => {
          if (seen.has(cId)) return;
          const item = CAMPAIGN_REGISTRY[cId];
          if (item.folder && seen.has(item.folder)) return;
          seen.add(cId);
          if (item.folder) seen.add(item.folder);

          const meta = item.metadata || {};
          const title = meta.name || item.preset?.name || cId;
          const modCount = (item.modules || []).length;
          let nodeCount = 0;
          if (item.preset?.nodes) {
            nodeCount = Array.isArray(item.preset.nodes) ? item.preset.nodes.length : Object.keys(item.preset.nodes).length;
          } else if (item.preset?.maps) {
            nodeCount = Object.values(item.preset.maps).reduce((acc, m) => acc + (m.nodes ? (Array.isArray(m.nodes) ? m.nodes.length : Object.keys(m.nodes).length) : 0), 0);
          }
          const desc = meta.description || `${nodeCount} Nodes • ${modCount} Modules`;

          presets.push({
            id: cId,
            folderName: item.folder || cId,
            title: title,
            desc: desc,
            nodeCount: nodeCount,
            moduleCount: modCount,
            sourceType: "registry",
            sourceBadge: `📁 /campaigns/${item.folder || cId}/`,
            registryItem: item
          });
        });
      }

      return presets;
    }
    window.getCampaignFolderPresets = getCampaignFolderPresets;

    function renderNewCampaignPresetsList() {
      const container = document.getElementById('new-campaign-presets-list');
      if (!container) return;

      const presets = getCampaignFolderPresets();
      container.innerHTML = '';

      if (presets.length === 0) {
        container.innerHTML = `
          <div style="padding:16px 12px; text-align:center; color:#64748b; font-size:11px;">
            <div>No campaigns found in /campaigns/ folder.</div>
            <div style="margin-top:4px; font-size:10px;">Link a /campaigns folder or create a campaign package to build from.</div>
          </div>
        `;
        const createBtn = document.getElementById('btn-confirm-new-camp');
        if (createBtn) createBtn.disabled = true;
        return;
      }

      const createBtn = document.getElementById('btn-confirm-new-camp');
      if (createBtn) createBtn.disabled = false;

      presets.forEach((p, idx) => {
        const label = document.createElement('label');
        label.style.cssText = 'display:flex; align-items:center; gap:8px; cursor:pointer; padding:4px 6px; border-radius:2px; border:1px solid transparent;';
        label.onmouseenter = () => { label.style.background = '#e0f2fe'; label.style.borderColor = '#93c5fd'; };
        label.onmouseleave = () => { label.style.background = 'transparent'; label.style.borderColor = 'transparent'; };

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'new-preset';
        radio.value = p.id;
        if (idx === 0) radio.checked = true;

        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'display:flex; flex-direction:column; gap:1px; flex:1; min-width:0;';
        infoDiv.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="color:#000080; font-size:12px;">📁 ${escapeHtml(p.title)}</strong>
            <span style="font-size:9px; font-family:monospace; background:#f1f5f9; color:#0284c7; padding:1px 5px; border-radius:3px; border:1px solid #cbd5e1;">${escapeHtml(p.sourceBadge)}</span>
          </div>
          <span style="font-size:10px; color:#475569; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(p.desc)}</span>
        `;

        label.appendChild(radio);
        label.appendChild(infoDiv);
        container.appendChild(label);
      });
    }
    window.renderNewCampaignPresetsList = renderNewCampaignPresetsList;

    function openNewCampaignWizard() {
      closeAllMenus();
      const welcome = document.getElementById('modal-welcome');
      if (welcome) welcome.classList.add('hidden');
      renderNewCampaignPresetsList();
      const modal = document.getElementById('modal-new');
      if (modal) modal.classList.remove('hidden');
      const input = document.getElementById('new-camp-name');
      if (input) {
        input.value = 'Untitled Campaign';
        input.focus();
        input.select();
      }
    }
    window.openNewCampaignWizard = openNewCampaignWizard;

    async function confirmNewCampaign() {
      const nameInput = document.getElementById('new-camp-name');
      const name = (nameInput ? nameInput.value.trim() : '') || 'Untitled Campaign';
      const checkedRadio = document.querySelector('input[name="new-preset"]:checked');
      if (!checkedRadio) {
        alert("Please select a campaign in the campaigns folder to build from.");
        return;
      }
      const choice = checkedRadio.value;

      if (typeof flushProjectDirectoryNow === 'function') {
        try { await flushProjectDirectoryNow(); } catch(_) {}
      }
      if (typeof resetWorkstationSlate === 'function') {
        await resetWorkstationSlate({ campaignName: name });
      }
      if (typeof unbindProjectDirectory === 'function') await unbindProjectDirectory();

      const presets = getCampaignFolderPresets();
      const chosenPreset = presets.find(p => p.id === choice || p.folderName === choice);
      const presetTitle = chosenPreset ? chosenPreset.title : choice;

      // Build new campaign by cloning the chosen preset or initializing a clean blank canvas
      if (choice === 'blank_canvas' || (chosenPreset && chosenPreset.isBlank)) {
        const blankPkg = {
          id: "blank_canvas",
          name: name,
          campaignName: name,
          description: "Fresh blank pointcrawl campaign",
          rootMapId: "map_root",
          activeMapId: "map_root",
          maps: {
            map_root: {
              id: "map_root",
              name: "Root Map",
              nodePrefix: "",
              scaleTier: "region",
              parentMapId: null,
              parentNodeId: null,
              dispositionModifier: "",
              nodes: [],
              links: []
            }
          },
          nodes: [],
          links: [],
          entities: { npcs: [], quests: [], items: [], dials: [], tickets: [] },
          modules: []
        };
        if (typeof window.loadCampaignProjectPackage === 'function') {
          await window.loadCampaignProjectPackage(blankPkg);
        }
      } else if (chosenPreset && chosenPreset.diskItem && chosenPreset.diskItem.handle && typeof loadCampaignFromDirectoryHandle === 'function') {
        await loadCampaignFromDirectoryHandle(chosenPreset.diskItem.handle);
      } else if (chosenPreset && chosenPreset.diskItem && chosenPreset.diskItem.topo) {
        const d = chosenPreset.diskItem;
        const pkg = {
          id: choice,
          name: name,
          campaignName: name,
          description: `Created from preset: ${presetTitle}`,
          maps: d.topo.maps ? JSON.parse(JSON.stringify(d.topo.maps)) : null,
          nodes: d.topo.nodes ? JSON.parse(JSON.stringify(d.topo.nodes)) : null,
          links: d.topo.links ? JSON.parse(JSON.stringify(d.topo.links)) : null,
          waves: d.topo.waves ? JSON.parse(JSON.stringify(d.topo.waves)) : null,
          entities: (d.meta?.entities || d.topo?.entities) ? JSON.parse(JSON.stringify(d.meta?.entities || d.topo?.entities)) : null,
          modules: d.meta?.modules || []
        };
        if (typeof window.loadCampaignProjectPackage === 'function') {
          await window.loadCampaignProjectPackage(pkg);
        }
      } else if (typeof CAMPAIGN_REGISTRY !== 'undefined' && (CAMPAIGN_REGISTRY[choice] || Object.values(CAMPAIGN_REGISTRY).find(c => c.folder === choice || c.id === choice))) {
        const regKey = CAMPAIGN_REGISTRY[choice] ? choice : Object.keys(CAMPAIGN_REGISTRY).find(k => CAMPAIGN_REGISTRY[k].folder === choice || CAMPAIGN_REGISTRY[k].id === choice);
        if (typeof window.loadCampaignProjectPackage === 'function') {
          await window.loadCampaignProjectPackage(regKey);
        }
      } else if (typeof BUNDLED_TOPOLOGIES !== 'undefined' && BUNDLED_TOPOLOGIES[choice]) {
        Workstation.activeTopology = JSON.parse(JSON.stringify(BUNDLED_TOPOLOGIES[choice]));
      }

      // Immediately unbind preset directory so edits/saves target the new campaign folder instead of the template
      if (typeof unbindProjectDirectory === 'function') await unbindProjectDirectory();

      // Stamp new campaign name and slug across topology, active maps, and session state
      const newSlug = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      const newDesc = `Created from preset: ${presetTitle}`;
      if (typeof currentCampaignName !== 'undefined') currentCampaignName = name;
      if (typeof activeCampaignId !== 'undefined') activeCampaignId = newSlug;
      localStorage.setItem("cs_active_campaign", newSlug);

      if (Workstation && Workstation.activeTopology) {
        Workstation.activeTopology.id = newSlug;
        Workstation.activeTopology.name = name;
        Workstation.activeTopology.campaignName = name;
        Workstation.activeTopology.description = newDesc;
        if (Workstation.activeTopology.folder) delete Workstation.activeTopology.folder;
      }

      if (typeof maps !== 'undefined' && maps) {
        const rootId = (typeof activeMapId !== 'undefined' && maps[activeMapId]) ? activeMapId : (Object.keys(maps)[0] || 'map_root');
        if (maps[rootId]) {
          maps[rootId].name = name;
        }
      }

      if (typeof ensureEntityCollections === 'function') ensureEntityCollections(Workstation.activeTopology);

      closeModal('modal-new');

      // Default to Live Disk Sync: create /campaigns/<newSlug>/ on disk and bind live disk sync
      if (typeof saveActiveCampaignAsNew === 'function') {
        await saveActiveCampaignAsNew(name, newSlug, newDesc, "disk");
      } else if (typeof saveActiveCampaign === 'function') {
        saveActiveCampaign();
      }

      if (typeof renderCanvas === 'function') renderCanvas();
      if (typeof selectGlobal === 'function') selectGlobal();
      if (typeof updateStatusBar === 'function') updateStatusBar();
    }
    window.confirmNewCampaign = confirmNewCampaign;

    let activeCampaignLauncherTab = 'all';

    function setCampaignLauncherTab(tab) {
      activeCampaignLauncherTab = tab;
      ['all', 'disk', 'library', 'presets'].forEach(t => {
        const btn = document.getElementById(`tab-camps-${t}`);
        if (btn) {
          if (t === tab) btn.classList.add('active');
          else btn.classList.remove('active');
        }
      });
      renderInstalledCampaignsModalList();
    }
    window.setCampaignLauncherTab = setCampaignLauncherTab;

    function filterCampaignsModalList() {
      renderInstalledCampaignsModalList();
    }
    window.filterCampaignsModalList = filterCampaignsModalList;

    function updateCampaignsFolderStatusUI() {
      const dot = document.getElementById('campaigns-folder-status-dot');
      const text = document.getElementById('campaigns-folder-status-text');
      const btnText = document.getElementById('btn-link-folder-text');
      if (window.campaignsRootDirectoryHandle) {
        if (dot) dot.style.background = '#10b981';
        if (text) text.textContent = `Connected: /${window.campaignsRootDirectoryName || 'campaigns'}`;
        if (btnText) btnText.textContent = 'Change Folder...';
      } else {
        if (dot) dot.style.background = '#94a3b8';
        if (text) text.textContent = 'Campaigns Folder: Unlinked';
        if (btnText) btnText.textContent = 'Link /campaigns Folder...';
      }
    }
    window.updateCampaignsFolderStatusUI = updateCampaignsFolderStatusUI;

    async function refreshCampaignsManager(interactive = false) {
      let rootHandle = window.campaignsRootDirectoryHandle;
      if (!rootHandle && typeof getStoredCampaignsFolderHandle === "function") {
        rootHandle = await getStoredCampaignsFolderHandle();
      }
      if (rootHandle) {
        try {
          let perm = await rootHandle.queryPermission({ mode: "readwrite" });
          if (perm !== "granted" && interactive) {
            perm = await rootHandle.requestPermission({ mode: "readwrite" });
          }
          if (perm === "granted") {
            await scanCampaignsDirectory(rootHandle);
          }
        } catch(e) {
          console.warn("[CampaignManager] Folder refresh warning:", e);
        }
      }

      if (typeof getCampaignsFromIndexedDBLibrary === "function") {
        try {
          window.savedLibraryCampaigns = await getCampaignsFromIndexedDBLibrary();
        } catch(e) {
          window.savedLibraryCampaigns = [];
        }
      }

      updateCampaignsFolderStatusUI();
      renderInstalledCampaignsModalList();
      renderWelcomeCampaignsList();
      if (interactive && typeof setStatusBarMessage === "function") {
        const total = (Object.keys(window.discoveredDiskCampaigns || {}).length) + (window.savedLibraryCampaigns ? window.savedLibraryCampaigns.length : 0);
        setStatusBarMessage(`Refreshed campaign launcher: ${total} local & disk campaign(s) available.`);
      }
    }
    window.refreshCampaignsManager = refreshCampaignsManager;

    async function connectCampaignsFolder(opts = { autoLoad: true }) {
      if (!window.showDirectoryPicker) {
        alert("Folder linking is supported in Chromium-based browsers (Chrome, Edge, Opera).\n\nIn other browsers, campaigns are saved to your In-Browser Library or exported as .zip.");
        return null;
      }
      try {
        const pickerOpts = {
          mode: "readwrite",
          id: (opts && opts.startIn === "documents") ? "cs-documents-root" : "cs-workspace-root"
        };
        if (opts && opts.startIn) pickerOpts.startIn = opts.startIn;
        let dirHandle = null;
        try {
          dirHandle = await window.showDirectoryPicker(pickerOpts);
        } catch(pickErr) {
          if (pickErr && pickErr.name === "AbortError") throw pickErr;
          dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
        }
        if (!dirHandle) return null;
        const perm = (typeof dirHandle.requestPermission === "function") ? await dirHandle.requestPermission({ mode: "readwrite" }) : "granted";
        if (perm !== "granted") {
          alert("Write permission to the selected folder was not granted.");
          return null;
        }

        // Normalize hierarchy: direct campaign folder vs. /campaigns vs. workspace/USB/Documents root
        let targetHandle = dirHandle;
        let isDirectCampaign = false;
        const targetSlug = (opts && opts.targetSlug) ? opts.targetSlug : "";

        if (typeof resolveCampaignWorkspaceHierarchy === "function") {
          const hierarchy = await resolveCampaignWorkspaceHierarchy(dirHandle, targetSlug);
          if (hierarchy) {
            if (hierarchy.mode === "direct_campaign" && hierarchy.activeCampaignHandle) {
              isDirectCampaign = true;
              targetHandle = hierarchy.activeCampaignHandle;
            } else if (hierarchy.campaignsRootHandle) {
              targetHandle = hierarchy.campaignsRootHandle;
            }
          }
        } else {
          try {
            const cFile = await dirHandle.getFileHandle("campaign.json");
            if (cFile) isDirectCampaign = true;
          } catch(_) {}
          if (!isDirectCampaign) {
            try {
              const subCampaigns = await dirHandle.getDirectoryHandle("campaigns", { create: false });
              if (subCampaigns) targetHandle = subCampaigns;
            } catch(_) {}
          }
        }

        if (isDirectCampaign) {
          if ((!opts || opts.autoLoad !== false) && typeof loadCampaignFromDirectoryHandle === "function") {
            await loadCampaignFromDirectoryHandle(targetHandle);
            if (typeof refreshCampaignsManager === "function") await refreshCampaignsManager(false);
            if (typeof updateWelcomeDiskCallout === "function") updateWelcomeDiskCallout();
          }
          return targetHandle;
        }

        await setCampaignsFolderHandle(targetHandle);
        const discovered = await scanCampaignsDirectory(targetHandle);
        await refreshCampaignsManager(false);

        // If only 1 campaign is present in campaigns folder, auto-load it if permitted
        const discKeys = Object.keys(discovered || {});
        if ((!opts || opts.autoLoad !== false) && discKeys.length === 1 && discovered[discKeys[0]].handle && typeof loadCampaignFromDirectoryHandle === "function") {
          await loadCampaignFromDirectoryHandle(discovered[discKeys[0]].handle);
        }

        if (typeof updateWelcomeDiskCallout === "function") updateWelcomeDiskCallout();
        if (typeof setStatusBarMessage === "function") {
          setStatusBarMessage(`Campaigns folder linked: "${targetHandle.name}". Found ${discKeys.length} campaign(s).`);
        }
        return targetHandle;
      } catch(err) {
        if (err && err.name !== "AbortError") {
          console.warn("[ConnectCampaignsFolder]", err);
          alert("Failed to link campaigns folder: " + err.message);
        }
        return null;
      }
    }
    window.connectCampaignsFolder = connectCampaignsFolder;

    async function confirmRemoveCampaignItem(cId, sourceType, folderName, title) {
      if (sourceType === 'disk') {
        if (confirm(`Are you sure you want to permanently delete campaign "${title}" from disk?\n\nThis will remove the folder /campaigns/${folderName}/ and all its contents.`)) {
          await deleteCampaignFromDisk(folderName);
        }
      } else if (sourceType === 'library') {
        if (confirm(`Remove campaign "${title}" from your In-Browser Library?`)) {
          await deleteCampaignFromIndexedDBLibrary(cId);
          await refreshCampaignsManager(false);
        }
      } else if (sourceType === 'preset') {
        if (confirm(`Hide built-in preset "${title}" from the launcher?\n\n(You can restore hidden presets at any time).`)) {
          const hidden = JSON.parse(localStorage.getItem("cs_hidden_presets") || "[]");
          if (!hidden.includes(cId)) hidden.push(cId);
          localStorage.setItem("cs_hidden_presets", JSON.stringify(hidden));
          await refreshCampaignsManager(false);
        }
      }
    }
    window.confirmRemoveCampaignItem = confirmRemoveCampaignItem;

    function renderInstalledCampaignsModalList() {
      const container = document.getElementById('modal-installed-campaigns-list');
      if (!container) return;

      updateCampaignsFolderStatusUI();

      const items = [];
      const hiddenPresets = JSON.parse(localStorage.getItem("cs_hidden_presets") || "[]");

      const normalizeCampKey = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
      const hasDiskMatch = (id, folder, title) => {
        const k1 = normalizeCampKey(id);
        const k2 = normalizeCampKey(folder);
        const k3 = normalizeCampKey(title);
        return items.some(it => it.sourceType === "disk" && (
          (k1 && (normalizeCampKey(it.id) === k1 || normalizeCampKey(it.folderName) === k1)) ||
          (k2 && (normalizeCampKey(it.id) === k2 || normalizeCampKey(it.folderName) === k2)) ||
          (k3 && normalizeCampKey(it.title) === k3)
        ));
      };

      // 1. Discovered campaigns from connected disk folder
      if (window.discoveredDiskCampaigns && Object.keys(window.discoveredDiskCampaigns).length > 0) {
        Object.values(window.discoveredDiskCampaigns).forEach(d => {
          items.push({
            id: d.id,
            folderName: d.folderName,
            title: d.title || d.folderName,
            desc: d.description || `${d.nodeCount || 0} Nodes`,
            sourceType: "disk",
            sourceBadge: `📁 /campaigns/${d.folderName}/`,
            badgeColor: "#0284c7",
            handle: d.handle,
            openFn: () => {
              loadCampaignFromDirectoryHandle(d.handle);
              closeModal('modal-load');
            }
          });
        });
      }

      // 2. Saved library campaigns from IndexedDB (only if not already on disk)
      if (Array.isArray(window.savedLibraryCampaigns) && window.savedLibraryCampaigns.length > 0) {
        window.savedLibraryCampaigns.forEach(lib => {
          const libTitle = lib.name || lib.campaignName || lib.id;
          if (hasDiskMatch(lib.id, lib.folderName, libTitle)) return;
          const nodeCount = lib.maps ? Object.values(lib.maps).reduce((acc, m) => acc + (m.nodes ? (Array.isArray(m.nodes) ? m.nodes.length : Object.keys(m.nodes).length) : 0), 0) : 0;
          items.push({
            id: lib.id,
            folderName: null,
            title: libTitle,
            desc: lib.description || `In-Browser Library (${nodeCount} Nodes)`,
            sourceType: "library",
            sourceBadge: "💾 In-Browser Library",
            badgeColor: "#059669",
            pkg: lib,
            openFn: async () => {
              closeModal('modal-load');
              await openCampaignWithEnforcedDiskSync(lib.id, libTitle, libTitle, lib);
            }
          });
        });
      }

      // 3. Bundled CAMPAIGN_REGISTRY presets (only if not already discovered on disk)
      if (typeof CAMPAIGN_REGISTRY !== 'undefined' && Object.keys(CAMPAIGN_REGISTRY).length > 0) {
        Object.keys(CAMPAIGN_REGISTRY).forEach(cId => {
          if (hiddenPresets.includes(cId)) return;
          const item = CAMPAIGN_REGISTRY[cId];
          const meta = item.metadata || {};
          const title = meta.name || item.preset?.name || cId;
          const regFolder = item.folder || cId;
          if (hasDiskMatch(cId, regFolder, title)) return;
          const modCount = (item.modules || []).length;
          let nodeCount = '';
          if (item.preset?.nodes) {
            const count = Array.isArray(item.preset.nodes) ? item.preset.nodes.length : Object.keys(item.preset.nodes).length;
            nodeCount = `${count} Nodes • `;
          }
          const desc = meta.description || `${nodeCount}${modCount} Modules`;
          items.push({
            id: cId,
            folderName: regFolder,
            title: title,
            desc: desc,
            sourceType: "preset",
            sourceBadge: "📦 Built-in Preset",
            badgeColor: "#64748b",
            cId: cId,
            openFn: async () => {
              closeModal('modal-load');
              await openCampaignWithEnforcedDiskSync(cId, regFolder, title, null);
            }
          });
        });
      }

      // Update badge counts on tab buttons
      const countAllEl = document.getElementById('camps-count-all');
      const countDiskEl = document.getElementById('camps-count-disk');
      const countLibEl = document.getElementById('camps-count-library');
      const countPreEl = document.getElementById('camps-count-presets');
      if (countAllEl) countAllEl.textContent = items.length;
      if (countDiskEl) countDiskEl.textContent = items.filter(i => i.sourceType === 'disk').length;
      if (countLibEl) countLibEl.textContent = items.filter(i => i.sourceType === 'library').length;
      if (countPreEl) countPreEl.textContent = items.filter(i => i.sourceType === 'preset').length;

      // Filter by tab
      let filtered = items;
      if (activeCampaignLauncherTab !== 'all') {
        filtered = filtered.filter(i => i.sourceType === activeCampaignLauncherTab);
      }

      // Filter by search text
      const searchInput = document.getElementById('campaign-launcher-search');
      if (searchInput && searchInput.value.trim()) {
        const query = searchInput.value.trim().toLowerCase();
        filtered = filtered.filter(i => i.title.toLowerCase().includes(query) || (i.desc && i.desc.toLowerCase().includes(query)) || (i.folderName && i.folderName.toLowerCase().includes(query)));
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="padding:16px 12px; text-align:center; color:#64748b; font-size:11px;">
            <div>No campaigns found matching current filter.</div>
            <div style="margin-top:4px; font-size:10px;">Use <strong>Link /campaigns Folder...</strong> to auto-discover folders from disk, or start a <strong>New Campaign</strong>.</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      filtered.forEach((it) => {
        const row = document.createElement('div');
        row.className = 'action-tile-btn win-btn';
        row.style.cssText = 'padding:6px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px; cursor:default;';

        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'display:flex; flex-direction:column; gap:2px; flex:1; min-width:0; text-align:left; cursor:pointer;';
        infoDiv.onclick = () => it.openFn();
        infoDiv.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="color:#000080; font-size:12px;">📁 ${escapeHtml(it.title)}</strong>
            <span style="font-size:9px; font-family:monospace; background:#f1f5f9; color:${it.badgeColor}; padding:1px 5px; border-radius:3px; border:1px solid #cbd5e1;">${escapeHtml(it.sourceBadge)}</span>
          </div>
          <span style="font-size:11px; color:#475569; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(it.desc)}</span>
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'display:flex; align-items:center; gap:6px;';

        const openBtn = document.createElement('button');
        openBtn.className = 'win-btn';
        openBtn.style.cssText = 'padding:3px 10px; font-weight:bold; font-size:11px;';
        openBtn.textContent = 'Open';
        openBtn.onclick = (e) => { e.stopPropagation(); it.openFn(); };

        const delBtn = document.createElement('button');
        delBtn.className = 'win-btn';
        delBtn.style.cssText = 'padding:3px 6px; font-size:11px; color:#b91c1c;';
        delBtn.title = it.sourceType === 'disk' ? 'Delete folder from disk' : (it.sourceType === 'library' ? 'Delete from library' : 'Hide preset');
        delBtn.textContent = '🗑️';
        delBtn.onclick = (e) => {
          e.stopPropagation();
          confirmRemoveCampaignItem(it.id, it.sourceType, it.folderName, it.title);
        };

        actionsDiv.appendChild(openBtn);
        actionsDiv.appendChild(delBtn);

        row.appendChild(infoDiv);
        row.appendChild(actionsDiv);
        container.appendChild(row);
      });
    }

    function renderWelcomeCampaignsList() {
      const grid = document.getElementById('welcome-installed-campaigns-grid');
      if (!grid) return;

      const norm = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
      const items = [];
      if (window.discoveredDiskCampaigns) {
        Object.values(window.discoveredDiskCampaigns).forEach(d => {
          items.push({ id: d.id, folderName: d.folderName, title: d.title || d.folderName, desc: d.description || `${d.nodeCount || 0} Nodes`, handle: d.handle });
        });
      }
      if (items.length === 0 && Array.isArray(window.savedLibraryCampaigns)) {
        window.savedLibraryCampaigns.forEach(lib => {
          items.push({ id: lib.id, title: lib.name || lib.id, desc: lib.description || "In-Browser Library", pkg: lib });
        });
      }
      if (typeof CAMPAIGN_REGISTRY !== 'undefined') {
        const hidden = JSON.parse(localStorage.getItem("cs_hidden_presets") || "[]");
        Object.keys(CAMPAIGN_REGISTRY).forEach(cId => {
          if (hidden.includes(cId)) return;
          const regFolder = CAMPAIGN_REGISTRY[cId].folder || cId;
          const meta = CAMPAIGN_REGISTRY[cId].metadata || {};
          const title = meta.name || cId;
          if (items.some(it => norm(it.id) === norm(cId) || norm(it.folderName) === norm(regFolder) || norm(it.title) === norm(title))) return;
          items.push({ id: cId, folderName: regFolder, title: title, desc: meta.description || "Campaign Sourcebook", cId: cId });
        });
      }

      grid.innerHTML = '';
      items.slice(0, 4).forEach(it => {
        const tile = document.createElement('div');
        tile.className = 'bevel-inset action-tile-btn win-btn';
        tile.style.cssText = 'height:auto; padding:6px; cursor:pointer; text-align:left;';
        tile.onclick = async () => {
          if (it.handle) {
            await loadCampaignFromDirectoryHandle(it.handle);
            closeWelcomeModal();
            return;
          }
          await openCampaignWithEnforcedDiskSync(it.cId || it.id, it.folderName || it.title, it.title, it.pkg || null);
          closeWelcomeModal();
        };
        tile.innerHTML = `
          <strong>${escapeHtml(it.title)}</strong>
          <span>${escapeHtml(it.desc)}</span>
        `;
        grid.appendChild(tile);
      });
    }
    window.renderWelcomeCampaignsList = renderWelcomeCampaignsList;

    function openSaveAsNewCampaignModal() {
      closeAllMenus();
      const currentName = (typeof currentCampaignName !== "undefined" && currentCampaignName) 
        || (Workstation.activeTopology && Workstation.activeTopology.name) 
        || "My New Campaign";
      const nameInput = document.getElementById('save-as-camp-name');
      const slugInput = document.getElementById('save-as-camp-slug');
      const descInput = document.getElementById('save-as-camp-desc');
      if (nameInput) nameInput.value = currentName;
      if (slugInput) slugInput.value = currentName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      if (descInput) descInput.value = "";
      autoUpdateSaveAsSlug();

      const diskLabel = document.getElementById('save-as-disk-label');
      const diskStatus = document.getElementById('save-as-disk-status');
      const destDisk = document.getElementById('save-as-dest-disk');
      const destCustom = document.getElementById('save-as-dest-custom-folder');
      const destLib = document.getElementById('save-as-dest-library');
      const destZip = document.getElementById('save-as-dest-zip');
      const curSlug = slugInput ? slugInput.value : "campaign";

      // Dynamically display the target folder path and disk sync status
      if (diskLabel) {
        diskLabel.innerHTML = `In /campaigns/ Folder (/campaigns/<span id="save-as-slug-preview">${escapeHtml(curSlug)}</span>)`;
      }
      if (diskStatus) {
        if (window.campaignsRootDirectoryHandle) {
          diskStatus.textContent = `Saves into /campaigns/${curSlug}/ and binds live disk sync`;
        } else {
          diskStatus.textContent = `Saves into /campaigns/${curSlug}/ and binds live disk sync (will prompt to link folder)`;
        }
      }

      // Read last picked destination (default to 'disk' - top choice)
      const lastDest = localStorage.getItem("cs_last_save_dest") || "disk";
      if (lastDest === "custom_folder" && destCustom) {
        destCustom.checked = true;
      } else if (lastDest === "library" && destLib) {
        destLib.checked = true;
      } else if (lastDest === "zip" && destZip) {
        destZip.checked = true;
      } else if (destDisk) {
        destDisk.checked = true;
      }

      const modal = document.getElementById('modal-save-as-new');
      if (modal) modal.classList.remove('hidden');
    }
    window.openSaveAsNewCampaignModal = openSaveAsNewCampaignModal;

    function autoUpdateSaveAsSlug() {
      const nameInput = document.getElementById('save-as-camp-name');
      const slugInput = document.getElementById('save-as-camp-slug');
      const preview = document.getElementById('save-as-slug-preview');
      const diskStatus = document.getElementById('save-as-disk-status');
      let curSlug = "campaign";
      if (nameInput && slugInput && (!slugInput.dataset.manualEdited || slugInput.value === '')) {
        curSlug = nameInput.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_") || "campaign";
        slugInput.value = curSlug;
      } else if (slugInput) {
        curSlug = slugInput.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_") || "campaign";
      }
      if (preview) preview.textContent = curSlug;
      if (diskStatus) {
        if (window.campaignsRootDirectoryHandle) {
          diskStatus.textContent = `Saves into /campaigns/${curSlug}/ and binds live disk sync`;
        } else {
          diskStatus.textContent = `Saves into /campaigns/${curSlug}/ and binds live disk sync (will prompt to link folder)`;
        }
      }
    }
    window.autoUpdateSaveAsSlug = autoUpdateSaveAsSlug;

    async function confirmSaveAsNewCampaign() {
      const nameInput = document.getElementById('save-as-camp-name');
      const slugInput = document.getElementById('save-as-camp-slug');
      const descInput = document.getElementById('save-as-camp-desc');
      const destInput = document.querySelector('input[name="save-as-dest"]:checked');

      const name = (nameInput ? nameInput.value.trim() : "") || "Untitled Campaign";
      const slug = (slugInput ? slugInput.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_") : "") || "untitled_campaign";
      const desc = descInput ? descInput.value.trim() : "";
      const dest = destInput ? destInput.value : "disk";

      try { localStorage.setItem("cs_last_save_dest", dest); } catch(_) {}

      closeModal('modal-save-as-new');

      if (dest === "custom_folder") {
        if (typeof saveCampaignAsFolder === "function") {
          await saveCampaignAsFolder(name);
        }
      } else if (dest === "zip") {
        if (typeof saveCampaignAsZip === "function") {
          await saveCampaignAsZip(name);
        }
      } else if (dest === "disk") {
        // Save as new campaign into /campaigns/<slug> and bind live disk sync
        await saveActiveCampaignAsNew(name, slug, desc, "disk");
      } else {
        await saveActiveCampaignAsNew(name, slug, desc, "library");
      }

      if (typeof renderCanvas === "function") renderCanvas();
      if (typeof selectGlobal === "function") selectGlobal();
      if (typeof updateStatusBar === "function") updateStatusBar();
    }
    window.confirmSaveAsNewCampaign = confirmSaveAsNewCampaign;

    async function tryOpenCampaignFromDiskRoot(campId, fallbackFolder = "") {
      if (typeof loadCampaignFromDirectoryHandle !== "function") return false;
      const norm = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
      const targetKey = norm(campId);
      const fallbackKey = norm(fallbackFolder);

      // 1. Check already discovered disk campaigns (prefer exact folder name or richest node count)
      if (window.discoveredDiskCampaigns) {
        const matches = Object.values(window.discoveredDiskCampaigns).filter(d =>
          d && d.handle && (
            norm(d.id) === targetKey ||
            norm(d.folderName) === targetKey ||
            (fallbackKey && (norm(d.id) === fallbackKey || norm(d.folderName) === fallbackKey))
          )
        );
        if (matches.length > 0) {
          matches.sort((a, b) => {
            if (fallbackFolder && a.folderName === fallbackFolder) return -1;
            if (fallbackFolder && b.folderName === fallbackFolder) return 1;
            return (b.nodeCount || 0) - (a.nodeCount || 0);
          });
          await loadCampaignFromDirectoryHandle(matches[0].handle);
          return true;
        }
      }

      // 2. Check linked /campaigns root directory handle on disk
      let rootHandle = window.campaignsRootDirectoryHandle;
      if (!rootHandle && typeof getStoredCampaignsFolderHandle === "function") {
        try { rootHandle = await getStoredCampaignsFolderHandle(); } catch(_) {}
      }
      if (rootHandle && typeof rootHandle.getDirectoryHandle === "function") {
        try {
          let perm = "granted";
          if (typeof rootHandle.queryPermission === "function") {
            perm = await rootHandle.queryPermission({ mode: "readwrite" });
            if (perm !== "granted" && typeof rootHandle.requestPermission === "function") {
              perm = await rootHandle.requestPermission({ mode: "readwrite" });
            }
          }
          if (perm === "granted") {
            const candidates = [fallbackFolder, campId, targetKey, fallbackKey].filter(Boolean);
            for (const cand of candidates) {
              try {
                const subDir = await rootHandle.getDirectoryHandle(cand, { create: false });
                if (subDir) {
                  await loadCampaignFromDirectoryHandle(subDir);
                  return true;
                }
              } catch(_) {}
            }
          }
        } catch(_) {}
      }
      return false;
    }
    window.tryOpenCampaignFromDiskRoot = tryOpenCampaignFromDiskRoot;

    /**
     * Enforces Live Disk Sync by default when opening any campaign from the Welcome Dialog or Launcher.
     * If no disk folder is bound, prompts the user to link their workspace/USB/Documents folder first.
     */
    async function openCampaignWithEnforcedDiskSync(campId, folderName, title, fallbackPkg = null) {
      const displayTitle = title || folderName || campId || "Campaign";
      const regFolder = folderName || ((typeof CAMPAIGN_REGISTRY !== "undefined" && CAMPAIGN_REGISTRY[campId] && CAMPAIGN_REGISTRY[campId].folder) ? CAMPAIGN_REGISTRY[campId].folder : campId);

      // 1. Try opening directly from already-linked or stored /campaigns/ folder
      if (await tryOpenCampaignFromDiskRoot(campId, regFolder)) {
        return true;
      }

      // 2. If not linked yet, prompt user to link their workspace / USB / Documents folder now
      if (typeof window !== "undefined" && window.showDirectoryPicker && typeof connectCampaignsFolder === "function") {
        const confirmFn = (typeof window.confirm === "function") ? window.confirm : (() => false);
        const shouldLink = confirmFn(
          `"${displayTitle}" will be opened with Live Disk Sync.\n\n` +
          `Select your Workstation / USB folder (or /Documents) now so all changes, modules, and maps save directly to disk inside campaigns/${regFolder}/?\n\n` +
          `• OK = Link folder on disk (Recommended)\n` +
          `• Cancel = Open in temporary browser memory only`
        );
        if (shouldLink) {
          const linkedHandle = await connectCampaignsFolder({ autoLoad: false, targetSlug: regFolder || campId });
          if (linkedHandle) {
            // If user picked the campaign folder directly, or if it exists inside the linked campaigns root:
            if (typeof dirLooksLikeCampaign === "function" && await dirLooksLikeCampaign(linkedHandle)) {
              await loadCampaignFromDirectoryHandle(linkedHandle);
              return true;
            }
            if (await tryOpenCampaignFromDiskRoot(campId, regFolder)) {
              return true;
            }
            // Otherwise (e.g. user linked a fresh /Documents/campaigns/ folder), hydrate package and write it into campaigns/<slug>/ on disk
            if (typeof window.loadCampaignProjectPackage === "function") {
              await window.loadCampaignProjectPackage(fallbackPkg || campId);
            }
            if (typeof saveActiveCampaignAsNew === "function") {
              const slug = String(campId || displayTitle).toLowerCase().replace(/[^a-z0-9_]/g, "_");
              await saveActiveCampaignAsNew(displayTitle, slug, "", "disk");
              return true;
            }
          }
        }
      }

      // 3. Fallback: user declined disk sync or non-Chromium browser
      if (typeof unbindProjectDirectory === "function") await unbindProjectDirectory();
      if (typeof window.loadCampaignProjectPackage === "function") {
        await window.loadCampaignProjectPackage(fallbackPkg || campId);
      }
      if (typeof setStatusBarMessage === "function") {
        setStatusBarMessage(`⚠️ Opened "${displayTitle}" in temporary memory (Disk not linked). Click "Disk: not linked" in status bar to bind disk sync.`);
      }
      if (typeof updateDiskSyncIndicator === "function") {
        updateDiskSyncIndicator("none");
      }
      return false;
    }
    window.openCampaignWithEnforcedDiskSync = openCampaignWithEnforcedDiskSync;

    function openLoadPresetModal() {
      closeAllMenus();
      document.getElementById('modal-welcome').classList.add('hidden');
      refreshCampaignsManager(true);
      document.getElementById('modal-load').classList.remove('hidden');
    }

    async function loadInstalledCampaign(campId) {
      const regFolder = (typeof CAMPAIGN_REGISTRY !== 'undefined' && CAMPAIGN_REGISTRY[campId] && CAMPAIGN_REGISTRY[campId].folder) ? CAMPAIGN_REGISTRY[campId].folder : campId;
      const title = (typeof CAMPAIGN_REGISTRY !== 'undefined' && CAMPAIGN_REGISTRY[campId] && CAMPAIGN_REGISTRY[campId].metadata && CAMPAIGN_REGISTRY[campId].metadata.name) ? CAMPAIGN_REGISTRY[campId].metadata.name : campId;
      await openCampaignWithEnforcedDiskSync(campId, regFolder, title, null);
    }

    async function importJsonFromDisk(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const isZip = file.name.endsWith(".zip") || file.name.endsWith(".csz");

      if (isZip) {
        if (typeof window.ZeroCorsZip === "undefined") {
          alert("ZIP decompression engine is not loaded.");
          return;
        }
        try {
          const buffer = await file.arrayBuffer();
          const zipFiles = await window.ZeroCorsZip.parse(buffer);

          let mainData = null;
          let campMeta = null;
          if (zipFiles["campaign.json"]) {
            try { campMeta = JSON.parse(new TextDecoder().decode(zipFiles["campaign.json"])); } catch(e) {}
          }

          if (zipFiles["preset.json"]) {
            mainData = JSON.parse(new TextDecoder().decode(zipFiles["preset.json"]));
          } else if (zipFiles["topology.json"]) {
            mainData = JSON.parse(new TextDecoder().decode(zipFiles["topology.json"]));
          } else if (zipFiles["campaign.json"]) {
            mainData = campMeta;
          }

          if (!mainData) {
            alert("ZIP archive does not contain preset.json, topology.json, or campaign.json.");
            return;
          }

          if (campMeta && campMeta.entities) {
            if (!mainData.entities) mainData.entities = campMeta.entities;
            if (mainData.activeTopology && !mainData.activeTopology.entities) {
              mainData.activeTopology.entities = campMeta.entities;
            }
          }

          // Hydrate image assets from ZIP into data URLs
          if (mainData.maps) {
            for (const mId of Object.keys(mainData.maps)) {
              const mMap = mainData.maps[mId];
              if (mMap && mMap.mapMetadata && mMap.mapMetadata.assetPath) {
                const assetPath = mMap.mapMetadata.assetPath.replace(/^\//, "");
                const rawImg = zipFiles[assetPath] || zipFiles[`assets/${mId}_bg.png`] || zipFiles[`assets/${mId}_bg.jpg`];
                if (rawImg) {
                  const ext = assetPath.endsWith(".jpg") || assetPath.endsWith(".jpeg") ? "jpeg" : (assetPath.endsWith(".webp") ? "webp" : "png");
                  const blob = new Blob([rawImg], { type: `image/${ext}` });
                  const dataUrl = await new Promise((res) => {
                    const r = new FileReader();
                    r.onload = () => res(r.result);
                    r.readAsDataURL(blob);
                  });
                  mMap.mapMetadata.dataUrl = dataUrl;
                }
              }
            }
          }

          const candidateEntities = campMeta?.entities 
            || mainData.entities
            || (mainData.activeTopology && mainData.activeTopology.entities)
            || (mainData.activeTopology ? {
                npcs: mainData.activeTopology.npcs || [],
                quests: mainData.activeTopology.quests || [],
                items: mainData.activeTopology.items || [],
                trackers: mainData.activeTopology.trackers || [],
                tickets: mainData.activeTopology.tickets || []
               } : null);

          const pkg = {
            id: campMeta?.id || mainData.id || file.name.replace(/\.[^/.]+$/, ""),
            name: campMeta?.name || campMeta?.campaignName || mainData.name || mainData.campaignName || file.name.replace(/\.[^/.]+$/, ""),
            sourceType: "zip",
            maps: mainData.maps || {},
            nodes: mainData.nodes || (mainData.preset && mainData.preset.nodes) || null,
            links: mainData.links || (mainData.preset && mainData.preset.links) || null,
            waves: mainData.waves || (mainData.preset && mainData.preset.waves) || null,
            entities: candidateEntities || {
              npcs: (campMeta && campMeta.npcs) || mainData.npcs || [],
              quests: (campMeta && campMeta.quests) || mainData.quests || [],
              items: (campMeta && campMeta.items) || mainData.items || [],
              trackers: (campMeta && campMeta.trackers) || mainData.trackers || [],
              tickets: (campMeta && campMeta.tickets) || mainData.tickets || []
            },
            globalDials: campMeta?.globalDials || mainData.globalDials || {}
          };

          if (typeof window.loadCampaignProjectPackage === "function") {
            await window.loadCampaignProjectPackage(pkg);
          } else if (typeof importCampaignData === "function") {
            importCampaignData(mainData, file.name);
          } else {
            Workstation.activeTopology = mainData.activeTopology || mainData;
          }

          saveActiveCampaign();
          closeModal('modal-load');
          renderCanvas();
          selectGlobal();
          updateStatusBar();
          if (typeof renderEntityManagerTree === "function") renderEntityManagerTree();
          if (typeof renderEntityManagerList === "function") renderEntityManagerList();
          if (typeof updatePropertiesGrid === "function") updatePropertiesGrid();
          setStatusBarMessage(`Imported archive package: "${file.name}" successfully.`);
        } catch(err) {
          console.error("[ImportZip]", err);
          alert("Failed to parse campaign ZIP archive: " + err.message);
        }
        return;
      }

      // JSON or .creator.json loader
      const reader = new FileReader();
      reader.onload = async function(evt) {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (!parsed.nodes && !parsed.maps && !parsed.preset) {
            if (parsed.entities || parsed.globalDials || parsed.campaignName) {
              alert(
                `"${file.name}" is a Campaign Metadata & Entity file, not a map topology graph.\n\n` +
                `To open this campaign:\n` +
                `1. Select the ZIP package: "${file.name.replace(/campaign\.json$/i, '')}...package.zip", OR\n` +
                `2. Select "topology.json" from this folder, OR\n` +
                `3. Use "Open Project Folder from Disk..." to open the entire folder directly.`
              );
              return;
            }
            alert("Error: File does not contain a valid pointcrawl 'nodes' or 'maps' object.");
            return;
          }

          if (typeof window.loadCampaignProjectPackage === "function") {
            const pkg = {
              name: (parsed.metadata && (parsed.metadata.name || parsed.metadata.campaignName)) || parsed.name || parsed.campaignName || file.name.replace(/\.[^/.]+$/, ""),
              sourceType: "json",
              maps: parsed.maps || {},
              nodes: parsed.nodes || (parsed.preset && parsed.preset.nodes) || null,
              links: parsed.links || (parsed.preset && parsed.preset.links) || null,
              waves: parsed.waves || (parsed.preset && parsed.preset.waves) || null,
              entities: parsed.entities || (parsed.activeTopology && parsed.activeTopology.entities) || (parsed.preset && parsed.preset.entities) || null,
              npcs: parsed.npcs || (parsed.preset && parsed.preset.npcs) || null,
              quests: parsed.quests || (parsed.preset && parsed.preset.quests) || null,
              items: parsed.items || (parsed.preset && parsed.preset.items) || null,
              trackers: parsed.trackers || (parsed.preset && parsed.preset.trackers) || null,
              tickets: parsed.tickets || (parsed.preset && parsed.preset.tickets) || null,
              globalDials: parsed.globalDials || (parsed.preset && parsed.preset.globalDials) || null,
              mapMetadata: parsed.mapMetadata || null
            };
            await window.loadCampaignProjectPackage(pkg);
          } else if (typeof importCampaignData === "function") {
            importCampaignData(parsed, file.name);
          } else {
            Workstation.activeTopology = parsed;
            if (typeof ensureEntityCollections === 'function') ensureEntityCollections(Workstation.activeTopology);
            if (typeof initMapsRegistry === 'function') initMapsRegistry(true);
            if (typeof syncAdapterFromWorkstationTopology === 'function') syncAdapterFromWorkstationTopology();
          }

          saveActiveCampaign();
          closeModal('modal-load');
          renderCanvas();
          selectGlobal();
          updateStatusBar();
          if (typeof renderEntityManagerTree === "function") renderEntityManagerTree();
          if (typeof renderEntityManagerList === "function") renderEntityManagerList();
          if (typeof updatePropertiesGrid === "function") updatePropertiesGrid();
          setStatusBarMessage(`Imported campaign: "${file.name}" successfully.`);
        } catch(err) {
          alert("Failed to parse JSON: " + err.message);
        }
      };
      reader.readAsText(file);
    }

    function openSettingsModal() {
      closeAllMenus();
      document.getElementById('modal-settings').classList.remove('hidden');
    }

    function openModal(modalId) {
      const el = document.getElementById(modalId);
      if (el) el.classList.remove('hidden');
    }

    function closeModal(modalId) {
      const el = document.getElementById(modalId);
      if (el) el.classList.add('hidden');
    }

    async function requestEnterWorkstation() {
      if (window.activeProjectDirectoryHandle) {
        closeWelcomeModal();
        return;
      }

      const pendingHandle = window.pendingProjectDirectoryHandle;
      let rootHandle = window.campaignsRootDirectoryHandle;
      if (!rootHandle && typeof getStoredCampaignsFolderHandle === "function") {
        try { rootHandle = await getStoredCampaignsFolderHandle(); } catch(_) {}
      }

      const wantToLink = confirm(
        "⚠️ Disk Sync Not Connected!\n\n" +
        "You are entering Creator Studio without an active disk folder linked.\n" +
        "Any changes you make in browser memory could be lost if your browser cache is cleared or you move your USB drive.\n\n" +
        "Click OK to link your workspace / USB / Documents folder now (Recommended), or Cancel to enter in temporary Unsynced Mode."
      );

      if (wantToLink) {
        if (pendingHandle && typeof reconnectProjectDirectory === "function") {
          const ok = await reconnectProjectDirectory(pendingHandle, { interactive: true });
          if (ok) {
            closeWelcomeModal();
            return;
          }
        }
        await connectCampaignsFolder();
        if (window.activeProjectDirectoryHandle || window.campaignsRootDirectoryHandle) {
          closeWelcomeModal();
        }
      } else {
        closeWelcomeModal();
        if (typeof setStatusBarMessage === "function") {
          setStatusBarMessage("⚠️ UNSYNCED SESSION: No disk folder linked. Press Ctrl+S or click the status bar pill to bind a folder.");
        }
      }
    }
    window.requestEnterWorkstation = requestEnterWorkstation;

    async function actionContinueLast() {
      await requestEnterWorkstation();
      if (document.getElementById('modal-welcome') && document.getElementById('modal-welcome').classList.contains('hidden')) {
        setStatusBarMessage(`Resumed active session: ${(Workstation.activeTopology && Workstation.activeTopology.name) || 'Campaign'}`);
      }
    }

    function updateWelcomeSummary() {
      const savedTopo = (typeof localStorage !== "undefined") ? localStorage.getItem("creator_studio_active_topology") : null;
      const savedMaps = (typeof localStorage !== "undefined") ? localStorage.getItem("creator_studio_maps_registry") : null;
      const hasSession = !!(savedTopo || savedMaps);

      const name = (Workstation.activeTopology && Workstation.activeTopology.name) 
        || (typeof currentCampaignName !== "undefined" && currentCampaignName) 
        || null;
      let count = 0;
      if (Workstation.activeTopology && Workstation.activeTopology.nodes) {
        count = Array.isArray(Workstation.activeTopology.nodes)
          ? Workstation.activeTopology.nodes.length
          : Object.keys(Workstation.activeTopology.nodes).length;
      }
      const el = document.getElementById('welcome-last-summary');
      if (el) {
        if (hasSession && name && count > 0) {
          el.textContent = `Resume ${name} (${count} Nodes).`;
        } else if (hasSession && name) {
          el.textContent = `Resume ${name} (Blank Canvas).`;
        } else {
          el.textContent = `No active campaign session. Start a new campaign or open an existing one.`;
        }
      }
    }

    async function updateWelcomeDiskCallout() {
      const callout = document.getElementById('welcome-disk-callout');
      const titleEl = document.getElementById('welcome-disk-title');
      const descEl = document.getElementById('welcome-disk-desc');
      const btnEl = document.getElementById('welcome-disk-btn');
      const docsBtnEl = document.getElementById('welcome-disk-docs-btn');
      const pathEl = document.getElementById('welcome-detected-path');
      if (!callout || !titleEl || !descEl || !btnEl) return;

      const boundHandle = window.activeProjectDirectoryHandle;
      const pendingHandle = window.pendingProjectDirectoryHandle;
      let rootHandle = window.campaignsRootDirectoryHandle;
      if (!rootHandle && typeof getStoredCampaignsFolderHandle === "function") {
        try { rootHandle = await getStoredCampaignsFolderHandle(); } catch(_) {}
      }

      if (boundHandle) {
        callout.style.display = 'block';
        callout.style.background = '#f0fdf4';
        callout.style.border = '1px solid #86efac';
        titleEl.style.color = '#166534';
        titleEl.textContent = `📁 Disk Workspace Active: "${window.activeProjectDirectoryName || boundHandle.name}"`;
        descEl.textContent = 'Auto-saving is active. Map assets, modules, and changes are synced directly to disk.';
        if (pathEl) pathEl.style.display = 'none';
        if (docsBtnEl) docsBtnEl.style.display = 'none';
        btnEl.textContent = 'Sync Now (Ctrl+S)';
        btnEl.onclick = async () => {
          if (typeof flushProjectDirectoryNow === "function") await flushProjectDirectoryNow({ interactive: true });
        };
      } else if (pendingHandle) {
        callout.style.display = 'block';
        callout.style.background = '#fffbe8';
        callout.style.border = '1px solid #eab308';
        titleEl.style.color = '#854d0e';
        titleEl.textContent = `📁 Reconnect Disk Campaign: "${pendingHandle.name}"`;
        descEl.textContent = 'Browser security requires one click per session to grant disk access and live-sync modules & map images.';
        if (pathEl) pathEl.style.display = 'none';
        if (docsBtnEl) docsBtnEl.style.display = 'none';
        btnEl.textContent = 'Grant Permission & Sync';
        btnEl.onclick = async () => {
          if (typeof reconnectProjectDirectory === "function") {
            const ok = await reconnectProjectDirectory(pendingHandle, { interactive: true });
            if (ok) {
              updateWelcomeDiskCallout();
              if (typeof updateWelcomeSummary === "function") updateWelcomeSummary();
            }
          }
        };
      } else if (rootHandle) {
        let perm = "prompt";
        try { perm = await rootHandle.queryPermission({ mode: "readwrite" }); } catch(_) {}
        callout.style.display = 'block';
        callout.style.background = '#fffbe8';
        callout.style.border = '1px solid #eab308';
        titleEl.style.color = '#854d0e';
        titleEl.textContent = `📁 Reconnect Campaigns Folder: "${rootHandle.name}"`;
        descEl.textContent = 'Click to grant folder access and refresh your campaigns, modules, and map assets from disk.';
        if (pathEl) pathEl.style.display = 'none';
        if (docsBtnEl) docsBtnEl.style.display = 'none';
        btnEl.textContent = 'Sync Campaigns Folder';
        btnEl.onclick = async () => {
          try {
            const p = await rootHandle.requestPermission({ mode: "readwrite" });
            if (p === "granted") {
              const disc = await scanCampaignsDirectory(rootHandle);
              const keys = Object.keys(disc);
              if (keys.length === 1 && disc[keys[0]].handle && typeof loadCampaignFromDirectoryHandle === "function") {
                await loadCampaignFromDirectoryHandle(disc[keys[0]].handle);
              }
              await refreshCampaignsManager(false);
              updateWelcomeDiskCallout();
              if (typeof updateWelcomeSummary === "function") updateWelcomeSummary();
            }
          } catch(e) {
            console.warn("[WelcomeDisk] Root permission error:", e);
          }
        };
      } else {
        callout.style.display = 'block';
        callout.style.background = '#f8fafc';
        callout.style.border = '1px solid #cbd5e1';
        titleEl.style.color = '#1e293b';
        titleEl.textContent = '📁 Connect Local Workspace Folder (Enforces Live Disk Sync)';
        descEl.textContent = 'Pick your USB folder, start.html folder, or /Documents. Campaigns are automatically organized into .../campaigns/<campaign_name>/.';
        if (pathEl) {
          try {
            if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
              const rawPath = decodeURIComponent(window.location.pathname || '')
                .replace(/^\/([A-Za-z]:)/, '$1')
                .replace(/\/[^/]*$/, '')
                .replace(/\//g, '\\');
              if (rawPath) {
                pathEl.textContent = `Detected app folder: ${rawPath}`;
                pathEl.style.display = 'block';
              } else {
                pathEl.style.display = 'none';
              }
            } else {
              pathEl.style.display = 'none';
            }
          } catch (_) {
            pathEl.style.display = 'none';
          }
        }
        if (docsBtnEl) {
          docsBtnEl.style.display = 'inline-block';
          docsBtnEl.onclick = async () => {
            await connectCampaignsFolder({ startIn: 'documents' });
            updateWelcomeDiskCallout();
          };
        }
        btnEl.textContent = 'Link Workspace / USB Folder...';
        btnEl.onclick = async () => {
          await connectCampaignsFolder();
          updateWelcomeDiskCallout();
        };
      }
    }
    window.updateWelcomeDiskCallout = updateWelcomeDiskCallout;
    window.updateWelcomeDiskTile = updateWelcomeDiskCallout;

    function onWelcomeDiskCalloutClick() {
      if (typeof updateWelcomeDiskCallout === "function") updateWelcomeDiskCallout();
    }
    window.onWelcomeDiskCalloutClick = onWelcomeDiskCalloutClick;

    // Export Handlers
    function exportTopologyJson() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Workstation.activeTopology, null, 2));
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `${(Workstation.activeTopology.name || 'campaign').toLowerCase().replace(/\s+/g, '_')}_topology.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatusBarMessage("Exported topology JSON to disk.");
    }

    function exportSvgMap() {
      const svg = document.getElementById('cad-svg');
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const dataStr = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `map_${Date.now()}.svg`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatusBarMessage("Exported SVG map to disk.");
    }

    // Dock Tab Switching (Generic Architecture with Mod Hooking)
    let activeDockTab = 'properties';
    function switchDockTab(tabId) {
      activeDockTab = tabId;
      const tabBtns = document.querySelectorAll('.dock-tab-btn');
      tabBtns.forEach(btn => {
        if (btn.id === `btn-dock-${tabId}`) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      const panels = document.querySelectorAll('#properties-dock .dock-panel');
      panels.forEach(p => {
        if (p.id === `panel-dock-${tabId}`) p.classList.remove('hidden');
        else p.classList.add('hidden');
      });

      if (tabId === 'properties') {
        if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
      } else {
        // Mod notification
        if (window.CreatorStudio && typeof window.CreatorStudio.getRegisteredMods === 'function') {
          const mods = window.CreatorStudio.getRegisteredMods();
          Object.keys(mods).forEach(mId => {
            const m = mods[mId];
            if (typeof m.onDockTabSwitched === 'function') {
              try { m.onDockTabSwitched(tabId); } catch (e) { console.error(`[Mod ${mId}] onDockTabSwitched error:`, e); }
            }
          });
        }
        if (tabId === 'layers' && typeof renderLayersManagerUI === 'function') {
          renderLayersManagerUI();
        } else if (tabId === 'waves' && typeof renderBalancingDock === 'function') {
          renderBalancingDock();
        } else if (tabId === 'factions' && typeof renderFactionsDock === 'function') {
          renderFactionsDock();
        }
      }
    }
    window.switchDockTab = switchDockTab;

    function openAuditDashboard() {
      location.href = `network/platform_audit_dashboard.html`;
    }

    // ========================================================================
    // SYSTEM SURFACE CATALOG & DIRECTORY ENGINE (Ctrl+Shift+A)
    // ========================================================================
    let currentSurfaceCatalogCategory = 'all';

    function escapeSurfaceHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function openSurfaceCatalogModal() {
      closeAllMenus();
      if (typeof MDIWindowManager !== 'undefined') {
        MDIWindowManager.open('modal-surface-catalog');
      } else {
        const el = document.getElementById('modal-surface-catalog');
        if (el) el.classList.remove('hidden');
      }
      renderSurfaceCatalog();
      setTimeout(() => {
        const searchInput = document.getElementById('surface-catalog-search');
        if (searchInput) searchInput.focus();
      }, 50);
    }
    window.openSurfaceCatalogModal = openSurfaceCatalogModal;

    function openOdvMatrixModal() {
      if (typeof closeAllMenus === 'function') closeAllMenus();
      if (typeof MDIWindowManager !== 'undefined') {
        MDIWindowManager.open('modal-odv-matrix');
      } else {
        const el = document.getElementById('modal-odv-matrix');
        if (el) el.classList.remove('hidden');
      }
      if (typeof renderMdiOdvMatrix === 'function') {
        renderMdiOdvMatrix();
      }
    }
    window.openOdvMatrixModal = openOdvMatrixModal;

    function setSurfaceCatalogCategory(cat) {
      currentSurfaceCatalogCategory = cat;
      const tabBtns = document.querySelectorAll('#surface-catalog-tabs .dock-tab-btn');
      tabBtns.forEach(btn => {
        if (btn.getAttribute('data-cat') === cat) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      renderSurfaceCatalog();
    }
    window.setSurfaceCatalogCategory = setSurfaceCatalogCategory;

    function clearSurfaceCatalogSearch() {
      const searchInput = document.getElementById('surface-catalog-search');
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      renderSurfaceCatalog();
    }
    window.clearSurfaceCatalogSearch = clearSurfaceCatalogSearch;

    function filterSurfaceCatalog() {
      renderSurfaceCatalog();
    }
    window.filterSurfaceCatalog = filterSurfaceCatalog;

    function renderSurfaceCatalog() {
      const grid = document.getElementById('surface-catalog-grid');
      const statusEl = document.getElementById('surface-catalog-status');
      if (!grid) return;

      const surfaces = (typeof ALL_SURFACES_DATA !== 'undefined' && Array.isArray(ALL_SURFACES_DATA)) ? ALL_SURFACES_DATA : [];
      const searchInput = document.getElementById('surface-catalog-search');
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

      const filtered = surfaces.filter(s => {
        // Category filter
        if (currentSurfaceCatalogCategory !== 'all') {
          if (currentSurfaceCatalogCategory === 'core') {
            if (s.category !== 'core' && s.category !== 'modules') return false;
          } else if (s.category !== currentSurfaceCatalogCategory) {
            return false;
          }
        }

        // Search query filter
        if (query) {
          const title = (s.title || '').toLowerCase();
          const file = (s.file || '').toLowerCase();
          const cat = (s.category || '').toLowerCase();
          const rule = (s.immutable_rule || '').toLowerCase();
          const specs = Array.isArray(s.authoritative_specs) ? s.authoritative_specs.join(' ').toLowerCase() : '';
          const data = Array.isArray(s.data_sources) ? s.data_sources.join(' ').toLowerCase() : '';
          
          if (!title.includes(query) && 
              !file.includes(query) && 
              !cat.includes(query) && 
              !rule.includes(query) && 
              !specs.includes(query) && 
              !data.includes(query)) {
            return false;
          }
        }

        return true;
      });

      if (statusEl) {
        statusEl.innerHTML = `Showing <strong style="color:#000080;">${filtered.length}</strong> of ${surfaces.length} project surfaces &bull; Category: <span style="text-transform:uppercase; font-weight:bold;">${currentSurfaceCatalogCategory}</span>`;
      }

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="text-align:center; padding:30px 10px; color:#666;">
            <div style="font-size:24px; margin-bottom:8px;">🔍</div>
            <div style="font-size:12px; font-weight:bold; color:#333;">No matching surfaces found</div>
            <div style="font-size:11px; margin-top:4px;">Try clearing your search query or switching category tabs.</div>
          </div>
        `;
        return;
      }

      let html = '';
      filtered.forEach(s => {
        const isHtml = s.type === 'html' || s.file.endsWith('.html');
        const isPs1 = s.type === 'ps1' || s.file.endsWith('.ps1');
        const isMd = s.type === 'markdown' || s.file.endsWith('.md');
        
        let typeBadgeColor = '#000080';
        let typeBadgeBg = '#e8eeff';
        if (isPs1) {
          typeBadgeColor = '#006400';
          typeBadgeBg = '#e8ffe8';
        } else if (isMd) {
          typeBadgeColor = '#8b4513';
          typeBadgeBg = '#fff8e8';
        }

        const catBadgeColors = {
          'core': { bg: '#e0e7ff', fg: '#3730a3' },
          'assets': { bg: '#fef3c7', fg: '#92400e' },
          'trackers': { bg: '#fee2e2', fg: '#991b1b' },
          'modules': { bg: '#dcfce7', fg: '#166534' }
        };
        const catColor = catBadgeColors[s.category] || { bg: '#f1f5f9', fg: '#334155' };

        const specsHtml = (Array.isArray(s.authoritative_specs) && s.authoritative_specs.length > 0)
          ? `<div style="font-size:10px; color:#555; margin-top:4px;">
               <strong style="color:#222;">Specs:</strong> ${s.authoritative_specs.map(spec => `<span style="font-family:monospace; background:#e8e8e8; padding:1px 3px; border-radius:2px; margin-right:4px;">${escapeSurfaceHtml(spec)}</span>`).join('')}
             </div>`
          : '';

        const dataHtml = (Array.isArray(s.data_sources) && s.data_sources.length > 0)
          ? `<div style="font-size:10px; color:#555; margin-top:2px;">
               <strong style="color:#222;">Data:</strong> ${s.data_sources.map(src => `<span style="font-family:monospace; background:#f4f4f4; padding:1px 3px; border-radius:2px; margin-right:4px;">${escapeSurfaceHtml(src)}</span>`).join('')}
             </div>`
          : '';

        let actionBtnHtml = '';
        if (isHtml) {
          actionBtnHtml = `<button class="win-btn" onclick="window.open('${s.file}', '_blank')" style="font-weight:bold; font-size:11px; padding:3px 10px; color:#000080;">Launch Surface ↗</button>`;
        } else if (isPs1) {
          actionBtnHtml = `<button class="win-btn" onclick="copyCliCommand('${s.file}')" style="font-weight:bold; font-size:11px; padding:3px 10px; color:#006400;">📋 Copy PS1 Command</button>`;
        } else {
          actionBtnHtml = `<button class="win-btn" onclick="window.open('${s.file}', '_blank')" style="font-weight:bold; font-size:11px; padding:3px 10px;">View Markdown ↗</button>`;
        }

        const wikiBtnHtml = s.wikiFile
          ? `<button class="win-btn" onclick="window.open('${s.wikiFile}', '_blank')" style="font-size:11px; padding:3px 8px;" title="Open compiled Technical Manual Wiki page">📚 Wiki Doc</button>`
          : '';

        html += `
          <div class="bevel-outset" style="background:#f7f7f7; padding:8px; border:1px solid #7f9db9;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:3px;">
                  <span style="font-size:14px;">${s.icon || '📄'}</span>
                  <span style="font-weight:bold; font-size:12px; color:#000080;">${escapeSurfaceHtml(s.title || s.file)}</span>
                  <span style="font-size:9px; font-weight:bold; padding:1px 4px; border:1px solid ${typeBadgeColor}; background:${typeBadgeBg}; color:${typeBadgeColor}; text-transform:uppercase;">${s.type || 'file'}</span>
                  <span style="font-size:9px; font-weight:bold; padding:1px 4px; background:${catColor.bg}; color:${catColor.fg}; text-transform:uppercase;">${s.category || 'core'}</span>
                </div>
                <div style="font-family:monospace; font-size:11px; color:#444; margin-bottom:4px; word-break:break-all;">
                  <strong>File:</strong> ${escapeSurfaceHtml(s.file)}
                </div>
                ${s.immutable_rule ? `<div style="font-size:11px; color:#333; font-style:italic; margin-bottom:4px; line-height:1.3; background:#fff; padding:4px 6px; border:1px dashed #ccc;">${escapeSurfaceHtml(s.immutable_rule)}</div>` : ''}
                ${specsHtml}
                ${dataHtml}
              </div>
              <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end; shrink-0;">
                ${actionBtnHtml}
                ${wikiBtnHtml}
              </div>
            </div>
          </div>
        `;
      });

      grid.innerHTML = html;
    }
    window.renderSurfaceCatalog = renderSurfaceCatalog;

    function copyCliCommand(filePath) {
      const cmd = `powershell -File .\\${filePath.replace(/\//g, '\\')}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).then(() => {
          if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Copied command: ${cmd}`);
          alert(`Copied CLI execution command to clipboard:\n\n${cmd}`);
        }).catch(() => {
          prompt("Copy CLI command:", cmd);
        });
      } else {
        prompt("Copy CLI command:", cmd);
      }
    }
    window.copyCliCommand = copyCliCommand;

    function copyMasterBuildCommand() {
      const cmd = "powershell -ExecutionPolicy Bypass -File .\\Build-Suite.ps1";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).then(() => {
          if (typeof setStatusBarMessage === 'function') setStatusBarMessage("Copied master build command to clipboard.");
          alert(`Copied Master Suite Build command to clipboard:\n\n${cmd}`);
        }).catch(() => {
          prompt("Copy master build command:", cmd);
        });
      } else {
        prompt("Copy master build command:", cmd);
      }
    }
    window.copyMasterBuildCommand = copyMasterBuildCommand;

    function copyModUpdateCommand() {
      const cmd = "powershell -ExecutionPolicy Bypass -File .\\mods\\Update-Mods.ps1";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).then(() => {
          if (typeof setStatusBarMessage === 'function') setStatusBarMessage("Copied mod update command to clipboard.");
          alert(`Copied Mod Update command to clipboard:\n\n${cmd}`);
        }).catch(() => {
          prompt("Copy mod update command:", cmd);
        });
      } else {
        prompt("Copy mod update command:", cmd);
      }
    }
    window.copyModUpdateCommand = copyModUpdateCommand;

    function openEmbeddedSurfaceWindow(surfaceId, title, url, iconText = 'SF') {
      const winId = `modal-surface-${surfaceId}`;
      let el = document.getElementById(winId);

      if (!el) {
        el = document.createElement('div');
        el.id = winId;
        el.className = 'mdi-window hidden';
        el.style.cssText = 'width:980px; height:640px; min-width:640px; min-height:420px; top:45px; left:60px;';
        el.innerHTML = `
          <div class="mdi-title-bar">
            <div class="mdi-title-text">
              <span class="win95-start-logo" style="width:12px; height:12px; font-size:8px;">${iconText}</span>
              <span>${title}</span>
            </div>
            <div class="mdi-title-controls">
              <button class="win-btn" onclick="MDIWindowManager.minimize('${winId}')" title="Minimize">_</button>
              <button class="win-btn" onclick="MDIWindowManager.restoreOrMaximize('${winId}')" title="Maximize / Restore">&#9633;</button>
              <button class="win-btn" onclick="MDIWindowManager.close('${winId}')" title="Close">X</button>
            </div>
          </div>
          <div class="mdi-body" style="padding:0; margin:0; width:100%; height:calc(100% - 24px); overflow:hidden; background:#fff;">
            <iframe src="${url}" style="width:100%; height:100%; border:none; display:block;" title="${title}"></iframe>
          </div>
        `;
        document.body.appendChild(el);
        MDIWindowManager.registerWindow(winId, { title: title, icon: iconText });
      }

      MDIWindowManager.open(winId);
      if (typeof setStatusBarMessage === 'function') {
        setStatusBarMessage(`Opened Administrative Surface: ${title}`);
      }
    }
    window.openEmbeddedSurfaceWindow = openEmbeddedSurfaceWindow;

    function openShortcutsHelp() {
      alert("Creator Studio Keyboard Map:\n\n[V] - Select & Drag Tool\n[H] - Pan Viewport Tool\n[N] - Place Tier 2 Node\n[A] - Place Tier 3 Apex Node\n[L] - Transit Road Link (E_adj)\n[I] - Hegemony Influence Vector (E_inf)\n[E] - Eraser Tool\n[M] - Measurement Ruler\n[T] - Text Callout\n[G] - Toggle Grid\n[F4] - Properties Inspector\n[Ctrl+S] - Save Campaign");
    }

    function openAboutModal() {
      alert("Creator Studio Workstation v1.2.0\nUniversal System-Agnostic Pointcrawl Workstation\nWindows 95 / Visual Basic 6 Zero-CORS Desktop Architecture\nAuthority: ADR-0004 & Authoring Engine SRD");
    }

    function showModSdkInfo() {
      alert("Creator Studio Mod Extension API:\n\nUse `window.CreatorStudio.registerMod({...})` to inject custom menu commands, palette tool buttons, and property grid fields.\nSee ticket SYS-START-03 for the complete specification.");
    }

    function refreshModUI() {
      const container = document.getElementById('dynamic-mod-tools-container');
      if (container) container.innerHTML = '';
      const menuMods = document.getElementById('menu-mods');
      if (!menuMods) return;
      menuMods.innerHTML = '';

      const modKeys = Object.keys(Workstation.registeredMods || {});
      if (modKeys.length === 0) {
        const emptyRow = document.createElement('div');
        emptyRow.className = 'dropdown-row';
        emptyRow.style.color = '#666';
        emptyRow.style.fontStyle = 'italic';
        emptyRow.textContent = 'No active external mods';
        menuMods.appendChild(emptyRow);
      } else {
        modKeys.forEach(modId => {
          const mod = Workstation.registeredMods[modId];

          // Add to Mod Menu as a sub-menu named after the mod
          const menuItems = mod.menuItems || mod.menuOptions;
          if (menuItems && menuItems.length > 0) {
            const modRow = document.createElement('div');
            modRow.className = 'dropdown-row has-submenu';
            
            const titleSpan = document.createElement('span');
            titleSpan.innerHTML = `<strong>${escapeHtml(mod.name || modId)}</strong>`;
            
            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'submenu-arrow';
            arrowSpan.innerHTML = '&#9658;';

            const subMenu = document.createElement('div');
            subMenu.className = 'dropdown-submenu bevel-outset';
            subMenu.style.minWidth = '240px';

            modRow.onclick = function(e) {
              if (e.target.closest('.dropdown-submenu') === null) {
                e.stopPropagation();
                modRow.classList.toggle('open');
              }
            };

            menuItems.forEach(item => {
              if (item.separator) {
                const sep = document.createElement('div');
                sep.className = 'dropdown-separator';
                subMenu.appendChild(sep);
              } else {
                const row = document.createElement('div');
                row.className = 'dropdown-row';
                row.textContent = item.label;
                row.onclick = function(e) {
                  e.stopPropagation();
                  // Close menus
                  if (typeof closeAllMenus === 'function') {
                    closeAllMenus();
                  } else {
                    document.querySelectorAll('.menu-dropdown').forEach(d => {
                      d.classList.remove('show');
                      d.style.display = 'none';
                    });
                    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
                    document.querySelectorAll('.dropdown-row.has-submenu').forEach(r => r.classList.remove('open'));
                  }
                  if (typeof item.action === 'function') item.action();
                };
                subMenu.appendChild(row);
              }
            });

            modRow.appendChild(titleSpan);
            modRow.appendChild(arrowSpan);
            modRow.appendChild(subMenu);
            menuMods.appendChild(modRow);
          } else {
            const row = document.createElement('div');
            row.className = 'dropdown-row';
            row.textContent = `${mod.name || modId} (Active)`;
            menuMods.appendChild(row);
          }

          // Add to Palette
          if (mod.paletteTools && container) {
            mod.paletteTools.forEach(tool => {
              const btn = document.createElement('button');
              btn.className = 'win-btn palette-tool-btn';
              btn.innerHTML = `<strong>${escapeHtml(tool.label)}</strong><span class="tool-tag">[MOD]</span>`;
              btn.onclick = tool.action;
              container.appendChild(btn);
            });
          }
        });
      }

      const sep = document.createElement('div');
      sep.className = 'dropdown-separator';
      menuMods.appendChild(sep);

      const sdkInfoRow = document.createElement('div');
      sdkInfoRow.className = 'dropdown-row';
      sdkInfoRow.textContent = 'Mod SDK Documentation...';
      sdkInfoRow.onclick = showModSdkInfo;
      menuMods.appendChild(sdkInfoRow);
    }

    function toggleMaximize() {
      setStatusBarMessage("Maximize / restore toggled.");
    }