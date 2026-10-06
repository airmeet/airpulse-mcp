# Data contract

The AirPulse server owns the data contract; this plugin does not redefine it.

- **Metric dictionary:** `get_metric_definitions` or the resource `airpulse://metrics/definitions` (`schema_version` "1"). It defines each metric's unit, range, formula, numerator and denominator, dedup rules, day-bucket and window semantics, and how zero and missing are represented. Results reference a metric as `{id, version, unit}`.
- **Tool contract:** the live `tools/list` schemas and descriptions, and the server instructions sent at initialize.

The skills rely on these guarantees and must not contradict them:

- Read tools take `format`. The default, `answer`, returns a markdown answer as text and `{schema_version: "1", answer, data, meta}` as structured content. `answer` holds `headline`, `scope`, `table`, `legend`, `caveats`, `coverage`, `charts` (named series; null = missing run) and `next` (follow-ups with ready `args` and `uses_quota`). `data` is the full result. The table is a summary capped at 12 rows (the visibility table is by engine when engine data exists, otherwise the most recent days), and `answer.table.truncated` (`{shown, total}`) marks dropped rows. `raw` returns the full JSON payload for programmatic export. Answers are reused as given, never recomputed, and internal IDs stay out of prose.
- Four reads are passthroughs whose payload is the answer: `kb_read_page`, `get_prompt_response`, `get_metric_definitions` and `get_job_status` return plain `{data, meta}`. The listing and profile reads (`list_brands`, `list_audits`, `list_audit_tasks`, `list_brand_prompts`, `list_citation_pages`, `kb_search`, `kb_list_sources`, `get_brand_profile`, `get_brand_topics`, `get_brand_health`) return a headline and table with empty `charts` and `next`.
- Daily buckets carry `coverage_state` (`measured`, `partial`, `pending`, `failed`, `not_scheduled`, `unknown`, `no_data_in_cohort`); gaps are `null`, never 0.
- Results echo their window (`scope`), timezone, cohort and `latest_observation_at`, and carry `result_id`.
- Answer history and cited pages paginate on stable snapshots with cursors.
- Citations carry `ownership`. Brand-attributed citations are a subset of all-source citations.
- Audit findings and tasks carry freshness, verification status and `state_conflict`. Test rows are filtered server-side.
- Errors are MCP errors with stable codes (`invalid_input`, `not_found`, `insufficient_scope`, `writes_disabled`, `subscription_required`, `rate_limited`, `version_conflict`, `temporarily_unavailable`).

When the server and a skill disagree, the server wins. Fix the skill, or report a server gap rather than working around it in the skill.
