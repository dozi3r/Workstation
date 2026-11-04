---
id: SYS-BACKBURNER-01
title: "In-App BYOK LLM Co-Authoring Chatbot & Tool-Calling Loop (Deferred to Phase 2)"
pipeline_tier: 0
target_surface: "start.html (Future Optional Mod / Phase 2 Extension)"
status: discovery
category: "system_architecture"
wave: "Backburner / Phase 2 Deferred"
grounded_prerequisites: ["Phase 1 CampaignMutationEngine (src/workstation/scripts/campaign_mutation_engine.js)", "Append-Only Changelog & Undo (src/workstation/scripts/campaign_changelog_ui.js)"]
grounded_yields: ["Optional BYOK in-browser LLM assistant dispatching tool calls into CampaignMutationEngine"]
provides: ["Backburner: In-App-BYOK-CoAuthor"]
requires: ["Engine: CampaignMutationEngine", "Audit: Append-Only-Changelog"]
standalone_fallback: "External IDE/CLI agents (Claude Code, Cursor, Antigravity) co-author directly via CampaignMutationEngine and JSON files without in-app API keys."
---

# SYS-BACKBURNER-01: In-App BYOK LLM Co-Authoring Chatbot & Tool-Calling Loop (Deferred)
*Category: system_architecture | Target Surface: `start.html` (Future Optional Mod)*
*Status: discovery (Backburner / Deferred)*

---

## 1. Executive Summary & Deferral Rationale

During the evaluation of the partner's **Workstation 2.6 AI Co-Authoring Engine** specification (`Tickets 06–09`: `ai_provider.js`, `ai_context.js`, `ai_tools.js`, `ai_coauthor_ui.js`), we separated the **Phase 1 Data & Audit Foundation** (`Tickets 01–05`, now shipped) from the **In-App BYOK Chatbot UI**.

### Why This Remains on the Backburner
1. **External Agent Sufficiency**: Developers and worldbuilders using Antigravity, Claude Code, or Cursor already have superior multi-file context, terminal execution, and reasoning outside the browser. With `CampaignMutationEngine`, `campaign_sync.js`, and the append-only changelog (`Ctrl+Shift+L`) shipped in Phase 1, external agents already co-author campaigns seamlessly.
2. **Zero-CORS & Key Security**: Browser-direct LLM calls require users to paste raw API keys (`sk-ant-...`, `AIza...`) into `localStorage`, require vendor-specific CORS headers (`anthropic-dangerous-direct-browser-access`), and fail when offline.
3. **Future Mod Path**: If an in-app chat panel is desired later for non-technical end users, it should be packaged as an optional **Workstation Mod** (`mods/ai_coauthor/mod.js`) consuming `window.CampaignMutationEngine` rather than bloating core `start.html`.
