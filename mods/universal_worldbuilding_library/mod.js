// ============================================================================
// WORKSTATION MOD: Universal Worldbuilding & CWT Archetype Library
// Campaign-Independent Climax Engines, Sanctuaries, Civilizations & Starter Sites
// ============================================================================
if (typeof window !== 'undefined' && window.CreatorStudio && typeof window.CreatorStudio.registerMod === 'function') {
  window.CreatorStudio.registerMod({
    id: 'universal_worldbuilding_library',
    name: 'Universal Worldbuilding & CWT Archetype Library',
    version: '2.0.0',
    description: 'Provides 41 campaign-independent climax engines, sanctuaries, historical civilization archetypes, and starter adventure sites.',
    menuItems: [
      {
        label: 'Browse Worldbuilding Library...',
        action: function() {
          if (typeof openModuleExplorer === 'function') {
            openModuleExplorer();
            const campSel = document.getElementById('me-filter-campaign');
            if (campSel) {
              campSel.value = 'mod_universal_worldbuilding_library';
              if (typeof filterModules === 'function') filterModules();
            }
          }
        }
      }
    ],
    onInit: function(studio) {
      // Automatically available across all campaigns via Module Explorer and Industry Chain Importer
    }
  });
}
