---
name: doc-template-writer
description: Create Markdown templates for product documents, PRDs, specs, RFCs, and engineering design docs. Use when the user asks to create a template for a product doc, engineering design doc, technical design, RFC, project brief, or planning document for a named topic so they can fill it in quickly.
---

# Doc Template Writer

Use this skill to create a fill-in Markdown document, not to write the full product strategy or engineering design itself. The output should help the user start quickly while leaving clear placeholders for decisions they still need to make.

## Workflow

1. Identify the document type: product doc, PRD, project brief, RFC, engineering design doc, or technical design.
2. Extract the topic from the request and turn it into a concise title and filename slug.
3. Use the matching asset as the base:
   - Product docs, PRDs, project briefs, launch plans, and opportunity docs: `assets/product-doc-template.md`
   - Engineering design docs, technical designs, architecture proposals, and RFCs: `assets/engineering-design-template.md`
4. Tailor section names and prompts to the topic without filling in unknown facts.
5. Create a Markdown file at the requested path. If no path is given, use `docs/<slug>.md` when `docs/` exists, otherwise `<slug>.md` in the current workspace.
6. Keep placeholders actionable and short so the user can scan and fill the document quickly.

## Checks

- The file is Markdown and has a concrete title based on the requested topic.
- Placeholders are specific prompts, not generic filler like `TBD` everywhere.
- The template includes owners, context, goals, non-goals, open questions, risks, and next steps.
- Product docs include users, problem, working-backwards narrative, customer FAQ, assumptions, confidence, success metrics, DACI roles, scope, launch or learning plan, and dependencies.
- Engineering design docs include context, constraints, requirements, proposed design, alternatives, architecture decisions, data/API/contracts, quality attributes, observability, rollout, test plan, and security or privacy considerations.
- The template does not invent commitments, dates, metrics, approvals, or implementation details.

## Completion Check

Before finishing, verify the file exists, the filename matches the requested topic, the selected template type matches the user's wording, and any assumptions about destination or doc type are stated.

## Output

Create the Markdown file and report its path plus a brief note about which template type was used.
