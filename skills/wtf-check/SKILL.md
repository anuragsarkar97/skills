---
name: wtf-check
description: Interrupt drift, thrash, overbuilding, vanity work, and incoherent direction for both the human and the AI. Use when an agent should bluntly ask what the hell we are doing, challenge whether the current path still serves the goal, stop scattered execution, and reset to the smallest useful next move.
---

# WTF Check

Use this skill as a self-correction interrupt for the human and the AI. The point is not to be rude; the point is to stop momentum from becoming waste.

Trigger it when the conversation or work shows drift:

- The user or agent keeps adding new ideas before finishing the current objective.
- The plan is getting broader, more abstract, or more clever without a clear payoff.
- The request contradicts a recent decision, stated goal, or validation result.
- The work is becoming performative: more tools, more docs, more architecture, more process, but no sharper outcome.
- The AI is complying too quickly instead of challenging the direction.
- The human is reacting to anxiety, novelty, frustration, or competitor fear instead of evidence.
- The next step is unclear but everyone is still moving.

## Tone

Be blunt, not abusive. Use direct language like:

```text
WTF check: we are drifting.
```

Do not insult the user. Do not moralize. Do not turn this into therapy. Keep the challenge about the work, the decision, and the next move.

## Reset Protocol

1. State the drift in one sentence.
2. Name the original or most useful goal.
3. Identify the current distraction, contradiction, or waste.
4. Ask the hardest necessary question.
5. Recommend one reset move.

## Hard Questions

Pick only the questions that matter:

- What outcome are we actually trying to create?
- What did we start but not finish?
- What evidence says this new direction is worth the context switch?
- Are we solving a real user or production problem, or feeding anxiety?
- Is this scope buying learning, revenue, reliability, speed, or differentiation?
- What would we delete, defer, or stop if we were serious?
- What is the smallest next action that proves progress?
- If we shipped nothing else today, what would still matter?

## Pairing

- Pair with `critical-thinking` when the drift is a bad design, unsafe shortcut, or anti-pattern.
- Pair with `product-competitive-thinking` when the drift is roadmap, competitor, startup, pricing, UX, or MVP confusion.
- Pair with `smriti-shruti` when the drift is caused by stale context, repeated logs, or too much conversation history.
- Pair with `caveman-mode` when the answer itself needs to become shorter and stop adding unasked material.
- Pair with `implementation-plan` only after the reset question is answered.

## Output

Default output shape:

```text
WTF check: <one-line drift diagnosis>.

Goal: <the thing we should be optimizing for>.
Drift: <what is pulling us away>.
Hard question: <one pointed question>.
Reset move: <one next action>.
```

If the user explicitly asks to be challenged hard, be sharper. If the work is sensitive, high-stakes, or emotionally loaded, stay firm but reduce the heat.
