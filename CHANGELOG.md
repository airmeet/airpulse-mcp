# Changelog

## 0.2.0 — 2026-10-26

- The plugin now connects straight to the AirPulse remote MCP server (`https://prod-api.airpulse.ai/mcp`) with OAuth sign-in; the access-token header is documented as a fallback.
- Removed the local Node package, its npm distribution and the bundled report UI. The server now provides instructions, workflow prompts and server-rendered answers.
- Skills rewritten against the current server contract: explicit windows and cohort filters, coverage states, job drill-down, cursor pagination, metric definitions, audit freshness and verification, and scoped write actions. Skills reuse the server's answer envelope (headline, scope, table, charts, follow-ups) and keep `format: "raw"` for exports.
- Manifests gain homepage, repository, license and keywords; the marketplace gains a description.
- CI now validates the plugin, manifests and skill frontmatter.

## 0.1.0 — never released

Local Node package with seven skills; superseded by 0.2.0.
