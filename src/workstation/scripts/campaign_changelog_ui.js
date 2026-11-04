/**
 * Creator Studio - Campaign Changelog & Sync Summary Digest UI (campaign_changelog_ui.js)
 *
 * Implements:
 *  - #modal-sync-digest (Sync Summary Digest popup modal on startup/sync with conflict resolution)
 *  - #modal-campaign-changelog (Persistent MDI window for browsing and reverting mutation history)
 *  - Interactive Revert Batch with full UI invalidation sequence
 *  - GM Session Note Logging
 *  - Entity Navigation Links
 */

(function () {
  'use strict';

  function getActiveSlug() {
    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) || null;
    const cName = (typeof currentCampaignName !== 'undefined' && currentCampaignName)
      || (topo && topo.name) || 'campaign';
    return cName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }

  function getActiveChangelog() {
    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) || null;
    if (topo && Array.isArray(topo.changelog)) return topo.changelog;
    if (typeof window !== 'undefined' && Array.isArray(window.__csChangelog)) return window.__csChangelog;
    return [];
  }

  // --- Entity Link & Navigation Helper ---
  function navigateToChangelogEntity(category, entityId) {
    if (!category || !entityId) return;
    const cat = category.toLowerCase().endsWith('s') ? category.toLowerCase() : category.toLowerCase() + 's';

    // 1. If wiki navigation exists, use it
    if (typeof navigateToWikiEntity === 'function') {
      try {
        navigateToWikiEntity(cat, entityId);
        return;
      } catch (_) {}
    }

    // 2. Center stationed node on canvas if available
    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) || null;
    if (topo) {
      if (cat === 'nodes' && topo.nodes && topo.nodes[entityId]) {
        if (typeof centerCanvasOnNode === 'function') centerCanvasOnNode(entityId);
        return;
      }
      const col = (topo.entities && topo.entities[cat]) || topo[cat];
      if (Array.isArray(col)) {
        const ent = col.find(e => e && String(e.id) === String(entityId));
        if (ent && ent.nodeId && typeof centerCanvasOnNode === 'function') {
          centerCanvasOnNode(ent.nodeId);
        }
      }
    }

    // 3. Open Entity Manager tab
    const singular = cat.endsWith('s') ? cat.slice(0, -1) : cat;
    if (typeof openEntityManager === 'function') {
      try {
        openEntityManager(singular === 'tracker' ? 'tracker' : singular);
      } catch (_) {}
    }
  }
  window.navigateToChangelogEntity = navigateToChangelogEntity;

  // --- Sync Summary Digest Modal ---

  function openSyncSummaryDigestModal(force = false) {
    const slug = getActiveSlug();
    const changelog = getActiveChangelog();
    const lastSeenKey = 'cs_last_seen_batch_id_' + slug;
    let lastSeenId = null;
    try { lastSeenId = localStorage.getItem(lastSeenKey); } catch (_) {}

    let unseenBatches = [];
    if (Array.isArray(window.__csNewUnseenBatches) && window.__csNewUnseenBatches.length > 0) {
      unseenBatches = window.__csNewUnseenBatches;
    } else if (lastSeenId) {
      const idx = changelog.findIndex(b => b && b.batchId === lastSeenId);
      if (idx >= 0) {
        unseenBatches = changelog.slice(idx + 1);
      } else {
        unseenBatches = changelog.slice(-5);
      }
    } else if (changelog.length > 0) {
      unseenBatches = changelog.slice(-5);
    }

    if (!force && unseenBatches.length === 0 && (!window.__csActiveConflicts || window.__csActiveConflicts.length === 0)) {
      return;
    }

    renderSyncSummaryDigest(unseenBatches);
    if (typeof openModal === 'function') {
      openModal('modal-sync-digest');
    } else {
      const el = document.getElementById('modal-sync-digest');
      if (el) { el.classList.remove('hidden'); el.style.display = 'flex'; }
    }
  }
  window.openSyncSummaryDigestModal = openSyncSummaryDigestModal;

  function renderSyncSummaryDigest(unseenBatches = []) {
    const nameEl = document.getElementById('sync-digest-campaign-name');
    const badgeEl = document.getElementById('sync-digest-batch-count-badge');
    const contentEl = document.getElementById('sync-digest-content');
    const conflictsArea = document.getElementById('sync-digest-conflicts');
    const conflictsList = document.getElementById('sync-digest-conflicts-list');

    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) || null;
    const cName = (typeof currentCampaignName !== 'undefined' && currentCampaignName)
      || (topo && topo.name) || 'Active Campaign';

    if (nameEl) nameEl.textContent = cName;
    if (badgeEl) badgeEl.textContent = `${unseenBatches.length} new batch(es)`;

    // Render Conflicts if any
    const conflicts = window.__csActiveConflicts || [];
    if (conflictsArea && conflictsList) {
      if (conflicts.length > 0) {
        conflictsArea.classList.remove('hidden');
        conflictsArea.style.display = 'flex';
        conflictsList.innerHTML = conflicts.map((c, i) => `
          <div style="background:#fff; border:1px solid #e0c870; padding:4px 6px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
            <div style="font-size:11px;">
              <strong>${escapeHtml(c.entityName || c.entityId)}</strong> (${escapeHtml(c.field)}):
              <span style="color:#0066cc;">Local: "${escapeHtml(String(c.localValue))}"</span> vs
              <span style="color:#990000;">AI: "${escapeHtml(String(c.remoteValue))}"</span>
              ${c.baseValue !== undefined ? `<span style="font-size:10px; color:#777; margin-left:4px;">(Base: "${escapeHtml(String(c.baseValue))}")</span>` : ''}
            </div>
            <div style="display:flex; gap:4px;">
              <button class="win-btn" style="font-size:10px; padding:1px 5px;" onclick="resolveSyncConflict(${i}, 'local')">Keep Local</button>
              <button class="win-btn" style="font-size:10px; padding:1px 5px;" onclick="resolveSyncConflict(${i}, 'remote')">Keep AI</button>
            </div>
          </div>
        `).join('');
      } else {
        conflictsArea.classList.add('hidden');
        conflictsArea.style.display = 'none';
        conflictsList.innerHTML = '';
      }
    }

    // Render Batches
    if (contentEl) {
      if (unseenBatches.length === 0) {
        contentEl.innerHTML = '<div style="padding:15px; text-align:center; color:#666; font-style:italic;">No new unacknowledged changes. Everything is in sync with disk!</div>';
        return;
      }

      contentEl.innerHTML = unseenBatches.map(batch => {
        const changes = Array.isArray(batch.changes) ? batch.changes : [];
        const createdChanges = changes.filter(ch => ch.field === '_entity' && ch.before === undefined);
        const deletedChanges = changes.filter(ch => ch.field === '_entity' && ch.after === null);
        const modifiedChanges = changes.filter(ch => ch.field !== '_entity');

        return `
          <div class="bevel-thin-inset" style="background:#fff; padding:8px; display:flex; flex-direction:column; gap:5px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <strong style="color:#003366;">${escapeHtml(batch.summary || 'Campaign Mutation')}</strong>
                <div style="font-size:10px; color:#777;">
                  By <strong>${escapeHtml(batch.actor || 'AI')}</strong> &bull; ${batch.appliedAt ? new Date(batch.appliedAt).toLocaleTimeString() : 'Recent'} &bull; <span style="font-family:monospace;">${escapeHtml(batch.batchId || '')}</span>
                </div>
              </div>
              <button class="win-btn" style="font-size:10px; padding:2px 6px; color:#990000;" onclick="revertChangelogBatch('${escapeHtml(batch.batchId)}')">Revert Batch</button>
            </div>

            <div style="display:flex; flex-direction:column; gap:3px; margin-top:3px; font-size:11px;">
              ${createdChanges.length > 0 ? `
                <div style="color:#006600;">
                  <strong>Added:</strong> ${createdChanges.map(ch => `<a href="javascript:void(0)" onclick="navigateToChangelogEntity('${ch.category}', '${ch.entityId}')" style="color:#006600; text-decoration:underline;">${escapeHtml(ch.entityName || ch.entityId)}</a> <span style="font-size:10px; color:#888;">(${ch.category})</span>`).join(', ')}
                </div>
              ` : ''}

              ${modifiedChanges.length > 0 ? `
                <div style="color:#004488;">
                  <strong>Modified:</strong> ${modifiedChanges.map(ch => `<a href="javascript:void(0)" onclick="navigateToChangelogEntity('${ch.category}', '${ch.entityId}')" style="color:#004488; text-decoration:underline;">${escapeHtml(ch.entityName || ch.entityId)}</a> [${escapeHtml(ch.field)}: <span style="color:#888;">${escapeHtml(JSON.stringify(ch.before))}</span> &rarr; <strong>${escapeHtml(JSON.stringify(ch.after))}</strong>]`).join(', ')}
                </div>
              ` : ''}

              ${deletedChanges.length > 0 ? `
                <div style="color:#880000;">
                  <strong>Removed:</strong> ${deletedChanges.map(ch => `${escapeHtml(ch.entityName || ch.entityId)} <span style="font-size:10px; color:#888;">(${ch.category})</span>`).join(', ')}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function resolveSyncConflict(index, choice) {
    const conflicts = window.__csActiveConflicts || [];
    const conf = conflicts[index];
    if (!conf) return;

    if (choice === 'remote') {
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) || null;
      if (topo) {
        const col = (topo.entities && topo.entities[conf.category]) || topo[conf.category];
        if (Array.isArray(col)) {
          const entity = col.find(e => e && String(e.id) === String(conf.entityId));
          if (entity) {
            entity[conf.field] = conf.remoteValue;
            if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
            if (typeof scheduleProjectDirectorySync === 'function') scheduleProjectDirectorySync();
          }
        }
      }
    }

    conflicts.splice(index, 1);
    window.__csActiveConflicts = conflicts;
    renderSyncSummaryDigest(window.__csNewUnseenBatches || []);
  }
  window.resolveSyncConflict = resolveSyncConflict;

  function dismissSyncSummaryDigest() {
    const slug = getActiveSlug();
    const changelog = getActiveChangelog();
    if (changelog.length > 0) {
      const latestBatch = changelog[changelog.length - 1];
      if (latestBatch && latestBatch.batchId) {
        try { localStorage.setItem('cs_last_seen_batch_id_' + slug, latestBatch.batchId); } catch (_) {}
      }
    }
    window.__csNewUnseenBatches = [];
    if (typeof closeModal === 'function') {
      closeModal('modal-sync-digest');
    } else {
      const el = document.getElementById('modal-sync-digest');
      if (el) { el.classList.add('hidden'); el.style.display = 'none'; }
    }
  }
  window.dismissSyncSummaryDigest = dismissSyncSummaryDigest;

  // --- Campaign Changelog MDI Window ---

  function openCampaignChangelogModal() {
    if (typeof MDIWindowManager !== 'undefined' && typeof MDIWindowManager.open === 'function') {
      MDIWindowManager.open('modal-campaign-changelog');
    } else {
      const el = document.getElementById('modal-campaign-changelog');
      if (el) el.classList.remove('hidden');
    }
    renderCampaignChangelog();
  }
  window.openCampaignChangelogModal = openCampaignChangelogModal;

  function renderCampaignChangelog() {
    const changelog = getActiveChangelog();
    const listEl = document.getElementById('campaign-changelog-list');
    const statsEl = document.getElementById('changelog-stats-label');
    const filterEl = document.getElementById('changelog-filter-select');
    const searchEl = document.getElementById('changelog-search-input');

    const filter = filterEl ? filterEl.value : 'all';
    const query = searchEl ? searchEl.value.toLowerCase().trim() : '';

    if (statsEl) {
      statsEl.textContent = `${changelog.length} mutation batch(es) recorded in campaign history`;
    }

    if (!listEl) return;

    if (changelog.length === 0) {
      listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#666; font-style:italic;">No changelog batches recorded yet. Run Campaign-AI.ps1 or log a GM note!</div>';
      return;
    }

    // Filter and sort newest first
    let entries = [...changelog].reverse();

    if (filter === 'ai') {
      entries = entries.filter(b => b.actor && !b.actor.includes('User') && !b.actor.includes('Slice'));
    } else if (filter === 'slice') {
      entries = entries.filter(b => (b.actor && b.actor.includes('Slice')) || (b.summary && b.summary.includes('slice')));
    } else if (filter === 'user') {
      entries = entries.filter(b => b.actor && b.actor.includes('User'));
    } else if (filter === 'clock') {
      entries = entries.filter(b => b.summary && (b.summary.includes('Clock') || b.summary.includes('clock') || b.summary.includes('tick')));
    }

    if (query) {
      entries = entries.filter(b => (b.summary && b.summary.toLowerCase().includes(query))
        || (b.batchId && b.batchId.toLowerCase().includes(query))
        || (b.actor && b.actor.toLowerCase().includes(query)));
    }

    if (entries.length === 0) {
      listEl.innerHTML = '<div style="padding:15px; text-align:center; color:#888;">No entries matched your filter.</div>';
      return;
    }

    listEl.innerHTML = entries.map(batch => {
      const isRevert = batch.batchId && batch.batchId.startsWith('revert-');
      const isUser = batch.actor && batch.actor.includes('User');
      const changes = Array.isArray(batch.changes) ? batch.changes : [];

      return `
        <div class="bevel-thin-inset" style="background:#fcfcfc; padding:8px; display:flex; flex-direction:column; gap:4px; border-left:4px solid ${isRevert ? '#cc3333' : (isUser ? '#339933' : '#3366cc')};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <strong style="font-size:12px; color:#222;">${escapeHtml(batch.summary || 'Campaign Mutation')}</strong>
              <div style="font-size:10px; color:#777; margin-top:2px;">
                <span class="bevel-inset" style="padding:1px 5px; font-weight:bold; background:${isUser ? '#e8f5e9' : '#e3f2fd'}; color:${isUser ? '#2e7d32' : '#1565c0'};">${escapeHtml(batch.actor || 'AI')}</span>
                &bull; ${batch.appliedAt ? new Date(batch.appliedAt).toLocaleString() : 'Unknown date'}
                &bull; <span style="font-family:monospace; color:#888;">${escapeHtml(batch.batchId || '')}</span>
              </div>
            </div>
            ${!isRevert ? `
              <button class="win-btn" style="font-size:10px; padding:2px 7px; color:#aa0000;" onclick="revertChangelogBatch('${escapeHtml(batch.batchId)}')">Revert</button>
            ` : '<span style="font-size:10px; color:#aa0000; font-weight:bold;">[REVERT BATCH]</span>'}
          </div>

          ${changes.length > 0 ? `
            <details style="margin-top:4px; font-size:11px;">
              <summary style="cursor:pointer; color:#555;">View ${changes.length} field diff(s)</summary>
              <div style="margin-top:4px; padding:4px; background:#fff; border:1px solid #ddd; max-height:140px; overflow-y:auto; display:flex; flex-direction:column; gap:3px;">
                ${changes.map(ch => `
                  <div style="font-size:10px; border-bottom:1px dotted #eee; padding-bottom:2px;">
                    <span style="font-weight:bold; color:#333;">[${escapeHtml(ch.category)}]</span>
                    <a href="javascript:void(0)" onclick="navigateToChangelogEntity('${ch.category}', '${ch.entityId}')" style="color:#0044aa; text-decoration:underline;">${escapeHtml(ch.entityName || ch.entityId)}</a>
                    &bull; <span style="color:#666;">${escapeHtml(ch.field)}:</span>
                    <span style="color:#990000; text-decoration:line-through;">${escapeHtml(JSON.stringify(ch.before))}</span> &rarr;
                    <span style="color:#007700; font-weight:bold;">${escapeHtml(JSON.stringify(ch.after))}</span>
                  </div>
                `).join('')}
              </div>
            </details>
          ` : ''}
        </div>
      `;
    }).join('');
  }
  window.renderCampaignChangelog = renderCampaignChangelog;
  window.filterChangelogView = renderCampaignChangelog;
  window.refreshChangelogView = renderCampaignChangelog;

  // --- Revert Batch Action ---

  async function revertChangelogBatch(batchId) {
    if (!batchId) return;
    if (typeof confirm === 'function' && !confirm(`Are you sure you want to revert batch "${batchId}"? This will apply compensating reverse mutations across the campaign.`)) {
      return;
    }

    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) || null;
    if (!topo) return;

    const engine = (typeof CreatorStudio !== 'undefined' && CreatorStudio.ai)
      || (typeof CampaignMutationEngine !== 'undefined' ? CampaignMutationEngine : null)
      || (typeof window !== 'undefined' && (window.CampaignMutationEngine || (window.CreatorStudio && window.CreatorStudio.ai)));
    if (!engine || typeof engine.revertBatch !== 'function') {
      if (typeof alert === 'function') alert('CampaignMutationEngine not loaded. Cannot revert batch.');
      return;
    }

    try {
      const changelog = getActiveChangelog();
      const res = engine.revertBatch(topo, batchId, changelog);
      if (res.status === 'reverted') {
        if (Array.isArray(topo.changelog)) {
          topo.changelog.push({
            batchId: res.revertBatchId,
            actor: 'User GM (Revert)',
            summary: `Reverted batch "${batchId}"`,
            appliedAt: new Date().toISOString(),
            changes: res.changes || []
          });
        }

        // Full invalidation sequence
        const _save = (typeof saveActiveCampaign === 'function' ? saveActiveCampaign : (typeof window !== 'undefined' ? window.saveActiveCampaign : null));
        if (typeof _save === 'function') _save();

        const _wiki = (typeof buildWikiIndex === 'function' ? buildWikiIndex : (typeof window !== 'undefined' ? window.buildWikiIndex : null));
        if (typeof _wiki === 'function') _wiki();

        const _canvas = (typeof renderCanvas === 'function' ? renderCanvas : (typeof window !== 'undefined' ? window.renderCanvas : null));
        if (typeof _canvas === 'function') _canvas();

        const _prop = (typeof updatePropertiesGrid === 'function' ? updatePropertiesGrid : (typeof window !== 'undefined' ? window.updatePropertiesGrid : null));
        if (typeof _prop === 'function') _prop();

        const _emTree = (typeof renderEntityManagerTree === 'function' ? renderEntityManagerTree : (typeof window !== 'undefined' ? window.renderEntityManagerTree : null));
        if (typeof _emTree === 'function') _emTree();

        const _emList = (typeof renderEntityManagerList === 'function' ? renderEntityManagerList : (typeof window !== 'undefined' ? window.renderEntityManagerList : null));
        if (typeof _emList === 'function') _emList();

        const _sync = (typeof scheduleProjectDirectorySync === 'function' ? scheduleProjectDirectorySync : (typeof window !== 'undefined' ? window.scheduleProjectDirectorySync : null));
        if (typeof _sync === 'function') _sync();

        const _status = (typeof setStatusBarMessage === 'function' ? setStatusBarMessage : (typeof window !== 'undefined' ? window.setStatusBarMessage : null));
        if (typeof _status === 'function') {
          _status(`Reverted batch "${batchId}" successfully (${res.changes ? res.changes.length : 0} compensating changes applied).`);
        }

        renderCampaignChangelog();
        renderSyncSummaryDigest(window.__csNewUnseenBatches || []);
      }
    } catch (err) {
      console.error('[RevertBatch] Error:', err);
      if (typeof alert === 'function') alert('Failed to revert batch: ' + err.message);
    }
  }
  window.revertChangelogBatch = revertChangelogBatch;

  // --- Log Manual GM Session Note ---

  function logManualGMSessionNote() {
    const note = prompt('Enter GM Session Note to record in campaign changelog:');
    if (!note || !note.trim()) return;

    if (typeof recordUserMilestoneInChangelog === 'function') {
      recordUserMilestoneInChangelog(note.trim(), []);
    }
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    if (typeof scheduleProjectDirectorySync === 'function') scheduleProjectDirectorySync();
    if (typeof setStatusBarMessage === 'function') {
      setStatusBarMessage('Logged GM session note to campaign history.');
    }
    renderCampaignChangelog();
  }
  window.logManualGMSessionNote = logManualGMSessionNote;

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const CampaignChangelogUI = {
    openSyncSummaryDigestModal,
    renderSyncSummaryDigest,
    dismissSyncSummaryDigest,
    openCampaignChangelogModal,
    renderCampaignChangelog,
    revertChangelogBatch,
    logManualGMSessionNote,
    resolveSyncConflict,
    navigateToChangelogEntity
  };

  if (typeof window !== 'undefined') {
    window.CampaignChangelogUI = CampaignChangelogUI;
    window.openSyncSummaryDigestModal = openSyncSummaryDigestModal;
    window.renderSyncSummaryDigest = renderSyncSummaryDigest;
    window.dismissSyncSummaryDigest = dismissSyncSummaryDigest;
    window.openCampaignChangelogModal = openCampaignChangelogModal;
    window.renderCampaignChangelog = renderCampaignChangelog;
    window.revertChangelogBatch = revertChangelogBatch;
    window.logManualGMSessionNote = logManualGMSessionNote;
    window.resolveSyncConflict = resolveSyncConflict;
    window.navigateToChangelogEntity = navigateToChangelogEntity;

    if (typeof window.addEventListener === 'function') {
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          openSyncSummaryDigestModal(false);
        }, 1500);
      });
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CampaignChangelogUI;
  }

})();
