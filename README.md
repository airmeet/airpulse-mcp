# AirPulse plugin

Seven skills plus a connection to the AirPulse remote MCP server, packaged as a Claude Code plugin (with Codex and Cursor manifests). Ask your agent about AI-search visibility, competitor share, citations, the actual answers engines gave, and GEO site-audit findings — with scope, coverage and evidence kept honest.

The plugin is thin: a manifest, one remote server entry (`https://prod-api.airpulse.ai/mcp`) and the skills. The server does the rest: tools, OAuth sign-in, server instructions, workflow prompts and server-rendered answers.

## Install

**Claude Code**

```text
/plugin marketplace add airmeet/airpulse-mcp
/plugin install airpulse@airpulse
```

From a local checkout: `claude plugin marketplace add ./` then `claude plugin install airpulse@airpulse`. Run `/plugin marketplace update airpulse` to pick up a new release.

**Codex:** the `.codex-plugin/plugin.json` manifest uses the same `.mcp.json` and skills. To connect the server alone: `codex mcp add airpulse --url https://prod-api.airpulse.ai/mcp`. See [compatibility](docs/COMPATIBILITY.md) for OAuth status.

**Cursor:** the `.cursor-plugin/plugin.json` manifest uses the same `.mcp.json` and skills.

**MCP Registry:** `server.json` describes the hosted server as `ai.airpulse/airpulse` for the official MCP Registry.

**Other MCP clients** (Claude web and Desktop connectors, ChatGPT, VS Code): add `https://prod-api.airpulse.ai/mcp` as a remote MCP server. A bare connection gets the tools, server instructions and prompts, but not these skills.

## Connect

**OAuth (default).** No headers are configured, so the client signs in on first use. In Claude Code the server shows as needing authentication; run `/mcp`, choose `airpulse` and authenticate. A browser opens for AirPulse sign-in, where you pick the organization. All data is scoped to that organization. Read tools are available to every member. Actions are not yet enabled on the hosted server and return `writes_disabled`; when they are, they will be limited to organization admins. To switch organization, re-authenticate and list brands again.

**Access-token fallback.** Create a token in the AirPulse dashboard under **Settings → API Keys** (read scopes are enough while actions are disabled), provide it to the client as the `AIRPULSE_API_KEY` environment variable, and use a server entry with a header:

```json
{
  "mcpServers": {
    "airpulse": {
      "type": "http",
      "url": "https://prod-api.airpulse.ai/mcp",
      "headers": { "Authorization": "Bearer ${AIRPULSE_API_KEY}" }
    }
  }
}
```

Never paste tokens into prompts, files you commit, screenshots or URLs. Apps started from the Dock or Finder may not inherit shell variables.

**Development.** To test against dev, point a local copy of `.mcp.json` at `https://dev-api.airpulse.ai/mcp`. Don't commit that change.

## Tools

The server is the source of truth: `tools/list` and its descriptions win over this table.

| Area | Reads | Actions (scope) |
|---|---|---|
| Brands | `list_brands`, `get_brand_profile`, `get_brand_topics`, `get_brand_health` | `update_brand`, `update_brand_profile`, `set_brand_topics` (`write:brand_config`) |
| Visibility | `get_brand_visibility`, `get_competitor_comparison`, `get_metric_definitions` | `run_brand_audit` (`write:audit`, uses quota) |
| Answers | `list_brand_prompts`, `list_prompt_responses`, `get_prompt_response` | `create_brand_prompt` (uses quota), `update_brand_prompt` (`write:brand_config`) |
| Citations | `get_citations`, `list_citation_pages` | — |
| Knowledge base | `kb_list_sources`, `kb_search`, `kb_read_page` | `update_content_source`, `delete_content_source` (needs `confirm: true`) (`write:brand_config`) |
| GEO audits | `list_audits`, `get_audit_findings`, `get_audit_finding`, `list_audit_tasks`, `get_job_status` | `run_geo_audit` (`write:audit`, uses quota), `update_finding_status`, `update_audit_task_status` (`write:tasks`) |

Every read tool takes `format`. The default, `answer`, returns a server-rendered markdown answer (headline, scope line, table, legend and follow-ups), with `{schema_version, answer, data, meta}` in structured content; `answer.charts` holds chart-ready series for hosts that draw charts. `raw` returns the full JSON payload and is for exports only. Four reads are passthroughs whose payload is the answer: `kb_read_page`, `get_prompt_response`, `get_metric_definitions` and `get_job_status` return plain `{data, meta}`.

Resource: `airpulse://metrics/definitions`. Prompts: `visibility_report`, `investigate_answers`, `citation_analysis`, `geo_action_plan`, `export_data`, `refresh_data`.

Actions return `insufficient_scope`, `writes_disabled` or `subscription_required` when the caller, server or plan does not allow them. `version_conflict` means re-read, then decide.

## Skills

| Skill | Use it for |
|---|---|
| `airpulse-context` | Sign-in, brand selection, capabilities, brand configuration changes |
| `airpulse-visibility` | Visibility, competitors, citations, drill-down to exact answers |
| `airpulse-geo-verification` | Audit freshness, findings vs tasks vs verification, triage |
| `airpulse-content-plan` | Content plans grounded in tracked prompts and the knowledge base |
| `airpulse-audit-runs` | Quota-consuming fresh runs with bounded polling |
| `airpulse-action-plan` | File-specific GEO implementation plans for a repository |
| `airpulse-build` | Exports and integrations that keep scope, coverage and nulls |

In Claude Code they appear as `/airpulse:<skill>` and also load automatically from their descriptions. Each skill has behavioral fixtures in `references/evaluation-cases.json`.

## Data semantics

- Missing is not zero: each daily bucket carries `coverage_state`, and gaps are `null`.
- Lead with the server's answer and reuse its numbers; never recompute them.
- Every number comes with its window, timezone, cohort and latest observation time. Metric meaning comes from the server's metric dictionary.
- Brand-attributed citations are a subset of all citations.
- A task's status, a finding's triage and fix verification are separate facts.
- Reads never start analyses.

See the [data contract](docs/DATA-CONTRACT.md).

## Docs

- [Compatibility matrix](docs/COMPATIBILITY.md)
- [Data contract](docs/DATA-CONTRACT.md)
- [Release checklist](docs/RELEASE.md)
- [Security notes](docs/SECURITY-REVIEW.md)
- [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE).
