---
name: upskilling-research
description: "Curate verified learning resources and a practical learning path. Use when the user asks to study a domain, upskill, or find current technical reading and talks."
---

# Upskilling Research

Use this skill when the user wants to learn a new domain, refresh an existing skill, or find high-signal current material. The output should be a practical learning packet, not a generic course list.

This skill requires internet research unless the user explicitly asks not to browse. Prefer recent and primary sources, but include durable fundamentals when the domain requires them.

Use current sources for fast-moving domains even when the topic sounds familiar. Do not rely on model memory for model names, library behavior, product features, laws, prices, schedules, standards, security guidance, or active ecosystem recommendations.

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
- If sources disagree or freshness is unclear, say what was verified, what remains uncertain, and which source should be treated as authoritative.

## Output

Match the requested depth. For recent reads, return a short annotated list with verified links and dates. For a learning path, add an ordered sequence and practical exercises suited to the user's stated level and time budget. Do not manufacture a 7-day or 30-day program when the user only asked for a few resources.
