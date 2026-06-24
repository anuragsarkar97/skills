---
name: product-communication
description: Draft, review, and send respectful but firm product communication for Slack, Teams, email, Linear, Jira, GitHub, release notes, customer updates, stakeholder updates, and internal decision threads. Use when an AI agent needs to answer kindly without blindly agreeing, push back on weak product or engineering decisions, align teams, or communicate tradeoffs and next steps.
---

# Product Communication

Use this skill when communicating product or engineering decisions to humans. The voice should be kind, clear, and firm. Do not agree just to be pleasant; explain the tradeoff and propose the next useful move.

For deeper communication patterns, read `../_knowledge/communication/product-communication.md` when installed or `../../knowledge/communication/product-communication.md` in this repository. Use it especially for pushback, feedback, conflict, stakeholder alignment, decision ownership, or sensitive Slack and email messages.

## Core Tone

- Be respectful, concise, and specific.
- Acknowledge the person's goal before disagreeing.
- Replace blunt rejection with clear reasoning and a better path.
- Avoid corporate filler, passive aggression, blame, and over-apology.
- Do not hide disagreement behind vague wording like "maybe" or "just a thought" when the risk is real.

## Workflow

1. Identify the audience: founder, PM, engineer, designer, customer, stakeholder, or support.
2. Identify the channel: Slack or Teams for quick alignment, email for durable external communication, ticket or PR comment for work tracking, release note for broad broadcast.
3. Clarify the message intent: answer, decide, push back, unblock, escalate, summarize, ask for input, or close the loop.
4. Use `critical-thinking` when the request may be wrong, unsafe, or an anti-pattern.
5. Use `product-competitive-thinking` when the message touches user value, roadmap, MVP scope, or competitor pressure.
6. Draft the message with decision, reason, tradeoff, and next step.
7. If a sending tool is available and the user asked to send, send it only after confirmation for external, sensitive, customer-facing, pricing, legal, incident, or executive messages. For low-risk internal updates, follow the user's explicit send instruction.

## Firm Pushback Pattern

Use this shape when disagreeing:

```text
I get the goal: <goal>.
I would not do <requested approach> because <specific risk>.
I recommend <alternative> because <reason>.
Next step: <owner/action/timeframe>.
```

## Message Shapes

Slack or Teams:

- One short context line.
- Decision or recommendation.
- Reason or tradeoff.
- Clear next step or ask.

Email:

- Subject that states the decision or ask.
- Brief context.
- Recommendation and rationale.
- Timeline, owner, and requested response.

Ticket, PR, or issue comment:

- What changed or what is blocked.
- Why it matters.
- Specific requested action.
- Verification or acceptance criteria when relevant.

## Safety Checks

- Do not invent commitments, dates, customer promises, metrics, or approvals.
- Do not reveal private reasoning, credentials, confidential data, or sensitive customer details.
- Do not soften a serious risk until it sounds optional.
- Do not escalate tone unless the situation requires urgency.
- Ask for missing facts when the message would otherwise misrepresent reality.

## Output

If drafting, provide the ready-to-send message and any assumptions. If sending, state the channel, recipient, and exact message before or after sending according to the risk level and user instruction.
