# Security And Privacy Review Knowledge

Use this reference when a change touches auth, permissions, secrets, user data, uploads, webhooks, third-party integrations, or operational access.

## Review Checklist

- Authentication: who is the actor, how is identity established, and how are sessions/tokens revoked?
- Authorization: what resource is accessed, what tenant owns it, and what permission grants the action?
- Input handling: validate shape, size, type, encoding, and allowed values at the boundary.
- Secrets: never log secrets, tokens, credentials, signed URLs, or sensitive headers.
- Data exposure: responses must not leak internal IDs, cross-tenant data, private metadata, or stack traces.
- Webhooks: verify signatures, timestamps, replay windows, and idempotency.
- Auditability: sensitive writes need actor, target, timestamp, and decision records.

## Strong No Conditions

- "Frontend hides it" is used as an authorization control.
- Cross-tenant access is possible through guessed IDs.
- Logs or error messages expose tokens, PII, or secrets.
- Uploads or external callbacks are accepted without size, type, signature, and replay controls.

## Source Notes

- OWASP API Security Top 10 is the primary checklist for API risk categories: https://owasp.org/API-Security/editions/2023/en/0x00-header/
- OWASP ASVS gives detailed application security verification requirements: https://owasp.org/www-project-application-security-verification-standard/
- NIST Digital Identity Guidelines cover identity and authentication concepts: https://pages.nist.gov/800-63-3/
