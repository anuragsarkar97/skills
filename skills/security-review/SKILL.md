---
name: security-review
description: Review code, designs, APIs, and infrastructure for exploitable security and privacy risks. Use when an AI agent evaluates authentication, authorization, tenant isolation, secrets, PII, uploads, webhooks, injection, dependency trust, or other attacker-controlled boundaries.
---

# Security Review

Find concrete attack paths and privacy failures. Do not produce a generic checklist detached from the code or design under review.

Read `../_knowledge/security/security-review.md` when installed or `../../knowledge/security/security-review.md` in this repository. For API changes, pair with `api-review`; for risky production changes, use `code-review` in adversarial mode.

## Workflow

1. Establish the protected assets, actors, trust boundaries, entry points, and attacker-controlled inputs.
2. Trace identity from authentication through authorization to the final data or side-effect boundary.
3. Inspect validation, parsing, serialization, storage, logging, errors, outbound requests, and asynchronous boundaries.
4. Construct realistic abuse cases instead of assuming normal client behavior.
5. Verify each suspected vulnerability against source and existing controls.
6. Rank findings by exploitability and impact. Do not inflate severity for hypothetical issues without a reachable path.
7. Recommend the smallest fix that closes the attack path and name the regression test that should protect it.

## Review Areas

- Authentication: session/token validation, revocation, expiry, recovery, and identity confusion.
- Authorization: object-level checks, tenant ownership, role boundaries, privilege escalation, and confused deputies.
- Input and injection: SQL, shell, template, path, header, URL, deserialization, and resource-exhaustion inputs.
- Data protection: secrets, PII, logs, caches, error responses, backups, and retention.
- Webhooks and integrations: signatures, replay windows, idempotency, redirect handling, and SSRF.
- Uploads: size limits, content validation, storage isolation, filenames, decompression, and malware handling.
- Supply chain: dependency provenance, install scripts, external skill sources, and unsafe update behavior.
- Auditability: actor, action, target, decision, timestamp, and tamper resistance for sensitive operations.

## Severity

- Critical: practical compromise of many users, tenants, credentials, or production control.
- High: exploitable unauthorized access, privilege escalation, secret exposure, or durable data corruption.
- Medium: constrained exploit requiring meaningful preconditions or exposing limited sensitive data.
- Low: defense-in-depth weakness with limited direct impact.

Do not report style preferences as security findings.

## Output

Lead with findings ordered by severity. For each finding include:

- Location or affected boundary
- Attack preconditions and exploitation path
- Security impact
- Existing control and why it is insufficient
- Minimal remediation
- Regression test

Then state open questions and residual risks. If no exploitable issue is found, say so and identify what was not tested.
