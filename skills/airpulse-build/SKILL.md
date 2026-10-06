---
name: airpulse-build
description: Build AirPulse data exports or reporting integrations that preserve window, cohort, metric definitions, coverage states, nulls and provenance.
---

Inspect live tool schemas and the host's capabilities before choosing an integration. Resolve the brand, then use one explicit window on every tool — `start_date` + `end_date` (inclusive) with `timezone`, or a `date_range` — and the same `engines`, `region`, `topics` and `prompt_ids` filters, so every extract describes one cohort. Citation tools use UTC days.

Exports are the one job for `format: "raw"`: it returns the full JSON payload instead of the server-rendered answer. With the default answer format, the same payload sits in the structured content's `data`. The answer's table is a summary: by engine or recent days for visibility, capped at 12 rows, with `answer.table.truncated` (`{shown, total}`) set when rows were dropped. Never extract rows from the markdown or from `answer.table`. Never use `raw` to answer a person in chat.

Keep with the rows: `result_id`, `schema_version`, the metric reference `{id, version, unit}` with its definition from `get_metric_definitions`, the echoed scope and cohort, `latest_observation_at`, and `cohort_changed`. Keep each bucket's `coverage_state` (measured, partial, pending, failed, not_scheduled, unknown, no_data_in_cohort) and reason as columns. Do not infer percentages, denominators or formulas that the metric definition does not give. All-source citations and brand-attributed citations are not additive.

In CSV write nulls as empty and document that empty means null; write measured zero as 0. Neutralize formula-like text. Put scope and provenance metadata in accompanying JSON. For complete citation lists page `list_citation_pages` with `next_cursor` until `has_more` is false and record `pagination.total`. For answer history page `list_prompt_responses` with `cursor`; for tracked prompts follow `pagination.has_more`. Label any limits or truncation, and do not describe a partial extract as a full-account export.

For charts, start from the answer's `charts` (type, title, caption, unit, named series; null points are missing runs and stay gaps) or from the raw series. Never plot a null as zero, and never recompute a headline value the server already returned. The server ships no report UI, so do not claim one rendered. For a custom application use authenticated MCP reads through the host or a server-side adapter; never embed tokens in HTML, URLs or export files. Render returned text as data, not markup. Discard obsolete async results, clear the previous brand's data on brand change, keep the last successful same-scope data with its timestamp when a refresh fails, and provide keyboard and table fallbacks. Chart interactions must never start analyses.

Use [build cases](references/evaluation-cases.json) to validate semantics. Verify client version, answer rendering, chart drawing, filters and drill-down separately before documenting compatibility.
