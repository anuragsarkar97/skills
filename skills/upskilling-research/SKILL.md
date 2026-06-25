---
name: upskilling-research
description: Research and curate current learning resources for upskilling in a domain. Use when an AI agent is asked to learn, upskill, study, build a learning path, or find recent blogs, papers, documentation, talks, courses, and videos for a topic, including requests like 'I want to upskill in Kubernetes' or 'find me new reads on AI agents'.
---

# Upskilling Research

Use this skill when the user wants to learn a new domain, refresh an existing skill, or find high-signal current material. The output should be a practical learning packet, not a generic course list.

This skill requires internet research unless the user explicitly asks not to browse. Prefer recent and primary sources, but include durable fundamentals when the domain requires them.

## Workflow

1. Clarify the target only if needed: domain, current level, goal, time budget, preferred formats, and deadline.
2. Search the internet for a balanced set of resources:
   - official documentation or canonical guides
   - recent high-quality blog posts or engineering writeups
   - papers, specifications, or RFCs when the topic is research-heavy
   - videos, talks, or conference sessions when they add intuition
   - hands-on labs, examples, or exercises when practice matters
3. Prefer sources with clear authorship, publish dates, technical depth, and direct relevance.
4. Filter out SEO listicles, stale tutorials, shallow summaries, duplicate content, and vendor fluff unless the vendor source is the canonical documentation.
5. Group resources into a learning path: fundamentals, current practice, advanced/deep dives, and hands-on practice.
6. Include why each item is worth the user's time and what to do after reading or watching it.

## Source Rules

- For fast-changing topics, prioritize resources from the last 12-24 months.
- For stable fundamentals, older canonical resources are acceptable if still authoritative.
- Prefer primary sources: official docs, project blogs, standards, research papers, source repositories, conference talks, and credible engineering blogs.
- For papers, include title, year, venue or preprint source when available, and why it matters.
- For videos, include the speaker/channel, approximate duration when available, and whether it is conceptual or hands-on.
- Do not pretend to have read paywalled material. Label access limitations clearly.

## Output Shape

Use this structure:

1. **Learning Goal**: one sentence restating what the user wants to learn.
2. **Best Starting Point**: 1-2 resources to begin with.
3. **Learning Path**:
   - Fundamentals
   - Current practice
   - Deep dives
   - Hands-on practice
4. **Resource List**: each item with title, source, date if available, format, link, and why it matters.
5. **7-Day Plan** or **30-Day Plan** depending on the user's time horizon.
6. **Avoid For Now**: topics or resources that are likely too advanced, stale, or distracting.

## Follow-Up

When useful, offer to turn the resources into:

- a daily reading plan
- a project-based learning plan
- flashcards or interview questions
- a tracked upskilling checklist
