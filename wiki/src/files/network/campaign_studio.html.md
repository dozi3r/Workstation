---
file_path: "network/campaign_studio.html"
title: "Campaign Studio - Redirecting to Workstation..."
volume: "vol-5"
kind: "Standalone Zero-CORS HTML Workstation"
current_hash: "2a271ad5adf1355a"
reviewed_hash: "2a271ad5adf1355a"
stale: false
size_bytes: 2088
line_count: 46
---

# Campaign Studio - Redirecting to Workstation...

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`network/campaign_studio.html` is the **Universal Pointcrawl Studio & Campaign Authoring Workstation (Deprecated Redirect Stub)** within **Volume V: Network Surfaces, Topologies & CLI Simulation (network/)**. Per [[File:docs/adr/0007-unified-workstation-consolidating-index-and-campaign-studio.md]], this surface has been deprecated and compiled by [[File:build_suite.js]] as a zero-CORS, query-preserving redirect stub pointing immediately to [[File:start.html]].

All pointcrawl authoring, 7-wave Tarot balancing, multi-scale cartography, module supply-line validation, and entity management features now run inside [[File:start.html]].

---

## Deprecation & Forwarding Contract
> [!NOTE]
> `network/campaign_studio.html` automatically forwards all query parameters (`?campaign=...&title=...`) to `../start.html` to maintain backward compatibility with legacy bookmarks and external links.
<!-- END_CUSTOM_NOTES -->
