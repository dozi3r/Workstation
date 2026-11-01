---
file_path: "scripts/build_zero_cors_css.js"
title: "build_zero_cors_css.js"
volume: "vol-8"
kind: "Node.js / Browser Engine Script"
current_hash: "14e8284ea09fec9e"
reviewed_hash: "14e8284ea09fec9e"
stale: false
size_bytes: 26222
line_count: 561
---

# build_zero_cors_css.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`scripts/build_zero_cors_css.js` is the **Zero-CORS Offline Utility CSS Compiler & Hardening Tool**. It scans HTML companion surfaces (`admin.html`, `network/contradiction_matrix_dashboard.html`, `network/network_builder.html`, `network/platform_audit_dashboard.html`, `tickets/tier_0/tier_0_project_visualizer.html`), compiles exact CSS rules for all utility classes in use (layout, typography, full 11-shade color palette with opacity modifiers, arbitrary values, and pseudo-classes), and replaces external CDN scripts (`https://.../tailwindcss.min.js`, `https://cdn.tailwindcss.com`) with an inlined `<style id="zero-cors-tailwind">` stylesheet.

It also strips external Google Fonts `<link>` tags across tarot matrix browser surfaces and injects robust offline system font stacks (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `ui-monospace`). Invoked automatically as step 7c of `[[File:build_suite.js]]`.
<!-- END_CUSTOM_NOTES -->
