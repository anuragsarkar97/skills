---
name: dribbble-design
description: Develop frontend design directions from Dribbble references, screenshots, or existing UI. Use for visual inspiration, moodboards, hierarchy, typography, and design critiques; not mechanical frontend fixes.
---

# Dribbble Design

Turn visual references into a coherent frontend direction that fits the actual product. Dribbble is one input, not evidence that a pictured workflow works.

For reference analysis, visual decisions, and accessibility checks, read `../_knowledge/frontend/design-inspiration.md` when installed or `../../knowledge/frontend/design-inspiration.md` in this repository.

## Establish the Design Task

- Identify the screen, target user, primary action, real content, brand constraints, and existing design system from the request and available UI. Ask only for missing information that materially changes the direction.
- For an existing product, inspect its current screen and components before suggesting a new style. A visual refinement should not silently replace navigation, product behavior, or the whole brand.
- Respect the requested mode: thoughts, critique, reference research, or implementation. Design advice alone does not authorize building. When implementation is requested and the direction is clear, continue without an unnecessary approval gate.

## Research and Interpret

- Use supplied references first. For fresh inspiration, search by product task and visual quality, such as a dense operations table or editorial onboarding, rather than only "modern SaaS".
- Choose a small, varied set of relevant references. Open the original shot and visually inspect its image with available image/browser tools; text snippets do not establish typography, spacing, or interaction behavior.
- Record the source link, author when available, the specific principle to borrow, its fit to this task, and the limitation. Never invent a visual observation or call a concept validated UX.
- If browsing or image access is unavailable, say so and reason from available screenshots or existing UI. Label unverified candidates; do not pretend to have assembled a researched moodboard.

## Produce a Direction

- When exploring, offer a few genuinely distinct directions with different hierarchy, composition, density, typography, and color roles. Explain which fits the user's task and why. If a direction is already chosen, refine it instead of reopening the decision.
- Describe the page structure and primary action before decoration. Translate the direction into concrete spacing, type hierarchy, content widths, surface/color roles, component treatment, and restrained motion.
- Reuse existing tokens and components where they fit. Introduce new visual choices deliberately; avoid defaulting every product to gradients, floating cards, oversized headings, or dense dashboards.
- Borrow visual principles across references rather than copying a single composition, brand identity, text, or assets. Do not introduce fonts or image dependencies the project cannot actually load.

## Check Beyond the Shot

Account for narrow screens, keyboard focus, contrast, long text, real data density, loading, empty/error states, and reduced motion where relevant. A static image cannot prove responsive behavior or accessibility. For React implementation questions, load the existing React reference only as needed.

## Completion Check

For design thoughts, deliver a concise direction, the rationale, inspected reference links when used, and specific changes the developer can act on. State what is inferred versus observed. Do not generate a codebase, deck, or lengthy design system unless requested.

For implementation, inspect the rendered result at relevant desktop and narrow widths, exercise important states and keyboard interaction, and fix visible issues within scope. If rendering was unavailable, report that limit rather than claiming visual QA passed.
