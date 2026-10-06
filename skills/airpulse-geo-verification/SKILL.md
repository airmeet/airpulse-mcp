---
name: airpulse-geo-verification
description: Inspect AirPulse GEO audit findings and remediation tasks, check audit freshness and fix verification, reconcile conflicts, and triage findings or update tasks when asked.
---

Resolve the brand, then `list_audits({brand_id})`. Pick the latest completed audit or the user's chosen audit and state its completion time, `audit_age_days` and whether it is `stale` (older than 30 days). A newer queued, in-progress or failed audit is not a completed assessment. Findings describe the site as it was when observed (`evidence_observed_at`); before acting on a stale audit say so, and treat re-auditing as a quota decision for the audit-runs skill.

Read `get_audit_findings({brand_id, audit_id})` (optional `severity`, `area`, `limit` 1–100) and `list_audit_tasks({brand_id, audit_id})` (optional `status`, `area`, `priority`, `limit` 1–200). Findings hide dismissed and false-positive items unless `include_dismissed: true`; use that when a linked finding seems missing. Test rows are never returned. Filters and limits can make either list incomplete — say so. The findings answer leads with a headline and a trimmed table. Keep its scope and caveats, and take fingerprints and full rows from the structured `data`, not the markdown. Keep IDs and fingerprints out of prose. Tasks link to findings through `linked_finding_ids`; open the full fix with `get_audit_finding({brand_id, audit_id, fingerprint})` using the `fingerprint` from the findings list, not an unverified linked ID.

Keep these facts separate: task `status` (the user's workflow state: not_started, in_progress, done, blocked, skipped, obsolete); finding `user_status` (manual triage, not proof a fix is live); task `verification` (`status` verifying | confirmed | failed | not_verifiable | error, with `checked_at`, `tested_target` and sanitized evidence); and your own live check. `state_conflict` flags disagreements such as a task marked done whose verification failed — report both facts; it is not proof the site is broken or proof of a sync bug. These tools do not trigger an individual re-verification.

When a live check is relevant and available, fetch the exact `tested_target`, follow redirects, record final URL, status and time, and test the stated acceptance criterion. A 404 on the target with the content live elsewhere is a target mismatch, not completed work. Header requirements need response headers, not HTML meta tags. One fetched page is evidence for that page, not the whole site.

Triage and task updates only on explicit user request (scope `write:tasks`; organization admins have it, members do not):
- `update_finding_status({brand_id, audit_id, fingerprint, status?, reason?})`: status is acknowledged, dismissed, fixed or false_positive, or null to clear. Dismissed, false-positive and fixed findings leave the scorecard, which is recomputed and returned. Marking fixed is triage, not verification.
- `update_audit_task_status({brand_id, audit_id, task_id, status?, owner?, due_at?, notes?, expected_updated_at?})`: only provided fields change. Pass the task's `updated_at` as `expected_updated_at`; on `version_conflict` re-read the task and decide with the user, never blindly retry.

Report the returned state after a write.

Return each item with recorded state, current evidence, conclusion (verified complete / incomplete / conflicting / unknown) and next check. Group shared fixes, keep owner and effort when supplied, and never promise ranking gains from an audit score. For repository-specific changes use the action-plan skill.

Read [verification cases](references/evaluation-cases.json) for behavioral evaluation.
