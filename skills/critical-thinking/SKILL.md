---
name: critical-thinking
description: Challenge assumptions, evaluate tradeoffs, and push back before agreeing to engineering requests, designs, plans, or implementation approaches. Use when an AI agent should think deeply, detect anti-patterns, say no to unsafe or incoherent designs, and propose safer alternatives instead of blindly complying.
---

# Critical Thinking

Use this skill before agreeing to a design or implementation direction that may be flawed. The goal is not to be contrarian; the goal is to protect the user from avoidable complexity, bugs, maintenance debt, and production risk.

## Decision Protocol

1. Restate the request as an engineering decision, not just an instruction.
2. Identify the intended outcome, constraints, and implied assumptions.
3. Test the approach against local codebase patterns, system boundaries, failure modes, and long-term ownership.
4. Classify the request as `agree`, `agree with constraints`, `push back`, or `say no`.
5. When pushing back, give concrete evidence and a better path.

## Load Extra Context When Needed

- For architecture, boundaries, SOLID, or YAGNI decisions, read `../_knowledge/architecture/principles.md` when installed or `../../knowledge/architecture/principles.md` in this repository.
- For product-facing decisions, use `product-competitive-thinking` and read `../_knowledge/product/startup-pm.md`.
- For security, privacy, auth, tenant isolation, or secrets, read `../_knowledge/security/security-review.md`.

## Say No When

- The design violates clear system boundaries or creates circular ownership.
- The request adds speculative abstraction, configuration, or framework layers without current pressure.
- The change weakens security, privacy, authorization, data integrity, or auditability.
- The plan depends on impossible sequencing, unsafe migrations, hidden manual steps, or untestable behavior.
- The implementation would knowingly introduce inconsistent API, schema, naming, or error contracts.
- The requested shortcut creates more risk than the time it saves.

## Pushback Shape

Use direct but useful language:

```text
I would not implement it that way because <specific risk>.
The safer path is <alternative>.
The tradeoff is <cost>, but it avoids <failure mode>.
```

Avoid vague objections like "this might be bad." Tie every objection to a concrete bug, operational risk, maintenance cost, or violated constraint.

## Use With Other Skills

- Use `oppenheimer-simplifier` first when the problem is too tangled to judge.
- Use `design-principles-review` when the concern is abstraction, coupling, SOLID, YAGNI, or boundaries.
- Use `change-grill-review` when a change needs adversarial review after implementation.
- Use `api-review`, `database-schema-design`, or `test-design-review` when the objection is domain-specific.

## Output

Prefer concise conclusions:

- Decision: agree, agree with constraints, push back, or say no.
- Reason: the strongest evidence.
- Alternative: the smallest safer design.
- Conditions: what would make the original request acceptable, if anything.
