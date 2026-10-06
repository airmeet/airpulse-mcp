---
name: airpulse-audit-runs
description: Run and track a requested fresh AirPulse visibility analysis or GEO site audit, accounting for plan quota, write permissions and asynchronous job status.
---

Choose the operation from the requested outcome: `run_brand_audit({brand_id})` measures fresh AI-search visibility; `run_geo_audit({brand_id, source_ids?})` crawls and grades the website for AI readability. They are not interchangeable. Resolve the organization-scoped brand first. For source targeting call `kb_list_sources({brand_id})` and pass only returned source IDs; omitted, the GEO audit targets the primary website source.

Both consume plan quota. Explain that before starting. An explicit user request to run or refresh that analysis is sufficient authorization; do not ask twice. Reporting, charting, reviewing old failures, listing audits or noticing a stale audit does not authorize a run. Clarify a materially ambiguous operation before spending quota.

Submit once and keep the returned job ID. Poll `get_job_status({job_id})` about every 30 seconds until `terminal` is true (completed, failed or cancelled); avoid tight loops. If the submit call times out, its state is uncertain: do not resubmit — check `get_job_status` for a known job ID, or `list_audits` for a new queued or in-progress GEO audit, first. If the environment cannot keep waiting, return the job ID and how to check it.

After completion read the matching results and confirm their timestamps are newer than before (`latest_observation_at` for visibility; `list_audits` completion time, then that audit's findings and tasks for GEO). A completed job alone does not prove the data you are showing is fresh. A failed or cancelled job is not a refresh; show the returned error without inventing a reason.

These tools need the `write:audit` scope: organization admins signed in with OAuth have it; members and read-only tokens do not. `insufficient_scope`, `writes_disabled`, `subscription_required`, `rate_limited` and quota errors are real limits even when the tool is listed. Do not retry with another brand, request elevated scopes on the user's behalf, or promise access from tool discovery. Test with [job cases](references/evaluation-cases.json).
