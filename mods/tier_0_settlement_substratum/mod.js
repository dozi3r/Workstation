// ============================================================================
// WORKSTATION MOD: Tier 0 Agrarian Settlement Substratum Pack
// Baseline Vernacular Infrastructure & Agrarian Commons (T0-DOM-01..08)
// ============================================================================
if (typeof window !== 'undefined' && window.CreatorStudio && typeof window.CreatorStudio.registerMod === 'function') {
  window.CreatorStudio.registerMod({
    id: 'tier_0_settlement_substratum',
    name: 'Tier 0 Agrarian Settlement Substratum Pack',
    version: '1.0.0',
    description: 'Provides 8 campaign-independent baseline village settlement and agrarian substratum modules.',
    menuItems: [
      {
        label: 'Browse Tier 0 Substratum Modules...',
        action: function() {
          if (typeof openModuleExplorer === 'function') {
            openModuleExplorer();
            const tierSel = document.getElementById('me-filter-tier');
            if (tierSel) {
              tierSel.value = '0';
              if (typeof filterModules === 'function') filterModules();
            }
          }
        }
      },
      {
        label: 'Toggle Agrarian Baseline Simulation',
        action: function() {
          if (typeof toggleTier0Substratum === 'function') {
            const nextState = !(typeof tier0SubstratumEnabled !== 'undefined' && tier0SubstratumEnabled);
            toggleTier0Substratum(nextState);
            const msg = 'Tier 0 Substratum Simulation is now ' + (nextState ? 'ENABLED (Smooth Substratum)' : 'DISABLED (Granular Slotting)') + '.';
            if (typeof setStatusBarMessage === 'function') setStatusBarMessage(msg);
            alert(msg);
          }
        }
      }
    ],
    onInit: function(studio) {
      // Automatically registered into Module Explorer and active campaign catalog
    }
  });
}
