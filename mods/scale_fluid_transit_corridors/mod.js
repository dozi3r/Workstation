// ============================================================================
// WORKSTATION MOD: Scale-Fluid Transit Corridors Pack
// Edge Corridor Modules Slottable onto Pointcrawl Roads (CWT-020..025)
// ============================================================================
if (typeof window !== 'undefined' && window.CreatorStudio && typeof window.CreatorStudio.registerMod === 'function') {
  window.CreatorStudio.registerMod({
    id: 'scale_fluid_transit_corridors',
    name: 'Scale-Fluid Transit Corridors Pack',
    version: '1.0.0',
    description: 'Provides 6 campaign-independent scale-fluid edge corridor modules slottable onto pointcrawl road edges.',
    menuItems: [
      {
        label: 'Browse Transit Corridor Modules...',
        action: function() {
          if (typeof openModuleExplorer === 'function') {
            openModuleExplorer();
            const campSel = document.getElementById('me-filter-campaign');
            if (campSel) {
              campSel.value = 'mod_scale_fluid_transit_corridors';
              if (typeof filterModules === 'function') filterModules();
            }
          }
        }
      }
    ],
    onInit: function(studio) {
      // Automatically registered into Module Explorer and Edge slotting catalog
    }
  });
}
