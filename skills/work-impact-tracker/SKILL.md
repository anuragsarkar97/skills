---
name: work-impact-tracker
description: Capture evidence-backed accomplishments in a private local worklog and generate weekly, quarterly, or year-end appraisal summaries. Use when an AI agent records completed work, reviews recent impact, maintains a brag document, or prepares a performance review.
---

# Work Impact Tracker

Maintain an evidence-backed record of outcomes, not an activity dump. Store personal work data outside the skills repository.

Use `scripts/work-impact.mjs`. Its default directory is:

- macOS and Linux: `~/Desktop/worklog`
- Windows: `%USERPROFILE%\Desktop\worklog`

Set `WORKLOG_DIR` or pass `--dir <path>` when Desktop is redirected, localized, or synchronized through OneDrive.

## Workflow

1. Initialize the worklog with `node scripts/work-impact.mjs init`.
2. Capture meaningful work with `add`. Ask for the problem, personal contribution, outcome, and evidence when they are not available.
3. Mark explicitly reported work `confirmed`. Mark inferred work, such as candidates derived from Git history, `draft` until the user verifies ownership and impact.
4. Use `list` for weekly or quarterly review. Resolve drafts and fill missing outcomes while the context is fresh.
5. Use `report --year <year>` for appraisal preparation. Summarize confirmed records by month and preserve evidence links.
6. Review the generated report with the user. Do not invent metrics, claim team work as individual work, or turn code volume into impact.

## Capture Commands

```bash
node scripts/work-impact.mjs init
node scripts/work-impact.mjs add --title "Reduced checkout failures" \
  --problem "Retries caused duplicate requests" \
  --contribution "Added idempotency handling and rollout checks" \
  --outcome "Duplicate requests fell by 80%" \
  --evidence "PR-123"
node scripts/work-impact.mjs list --year 2026
node scripts/work-impact.mjs report --year 2026
```

Use `--status draft` for inferred work. Repeat `--evidence` and `--competency` to store multiple values.

## Guardrails

- Do not store credentials, customer data, private messages, health information, or confidential review feedback.
- Record collaborators and distinguish personal contribution from team results.
- Prefer measured outcomes. Label estimates and qualitative impact honestly.
- Treat Git commits, tickets, and calendar events as evidence candidates, not proof of impact.
- Never overwrite `entries.jsonl`; append records and generate reports separately.

## Output

For capture, report the record ID and file location. For review, report confirmed outcomes, unresolved drafts, missing evidence, and the generated Markdown report path.
