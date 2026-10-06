# Client compatibility

Record one row per client and version, tested from a fresh install against a named endpoint. Use ✅ passed, ❌ failed, ⚠️ partial (explain in notes), — not applicable, or leave blank for untested. A synthetic or local host is not a substitute for the real client.

Columns:
- **Connect:** the server is added and reaches the OAuth prompt.
- **Org picker:** sign-in shows the organization picker and data is scoped to the pick.
- **Tools with titles:** tools list shows human-readable titles.
- **Answer renders:** the server's answer shows with its headline, scope line and table as given. Where the host draws charts, they come from `answer.charts` with gaps kept.
- **Drill-down:** answer follow-up (or `data.series[].job_ids`) → `list_prompt_responses(job_id)` → `get_prompt_response`.
- **Member write denied:** a member's action returns `insufficient_scope`.
- **Admin write allowed:** an admin's action succeeds (with the server write flag on).

| Client | Version | Endpoint | Date | Connect | Org picker | Tools with titles | Answer renders | Drill-down | Member write denied | Admin write allowed | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Claude Code | 2.1.284 | dev | 2026-09-30 | ⚠️ | | | | | | | Plugin installs from a local marketplace; `plugin validate --strict` passes; server shows "Needs authentication". Browser sign-in not yet completed. |
| Claude Desktop | | | | | | | | | | | |
| Claude web | | | | | | | | | | | |
| ChatGPT | | | | | | | | | | | |
| Cursor | | | | | | | | | | | |
| VS Code | | | | | | | | | | | |
| Codex CLI | 0.141.0 | dev | 2026-09-30 | ⚠️ | | | | | | | Plugin installs and the HTTP server entry is read. `codex mcp list` reports auth "Unsupported"; dev publishes only `/.well-known/oauth-protected-resource/mcp`. Access-token fallback: `--bearer-token-env-var AIRPULSE_API_KEY`. |

Skills load only through a plugin install. A bare MCP connection gets tools, server instructions, prompts and server-rendered answers.
