# Frontend Design Inspiration

Use when a frontend task needs visual direction or critique. Reviewed 2026-11-05. Visual heuristics here are design recommendations; accessibility requirements and browser features are linked separately.

## Reference Analysis

Search around the user's task, information density, audience, and desired tone. Use public Dribbble shots for visual composition and inspect an available working product or the current application when interaction details matter. A popular shot is not usability research.

For each useful reference, capture source URL, creator if available, observed pattern, why it fits, what to adapt, and what the image cannot establish. Inspect actual pixels before discussing fine visual details. Search snippets and alt text can identify a candidate but cannot establish its quality. Do not bypass access restrictions or claim to have inspected inaccessible content.

Separate useful influences: one reference may inform hierarchy, another density, another typography or illustration. Avoid a collage of incompatible styles. A few deliberate references are more useful than a gallery of near-identical cards.

## From Reference to Interface

Start with a short visual thesis, for example "an operations workspace optimized for scanning exceptions". Show the primary action and content order, then define the visual rules that support them:

- Composition: grouping, alignment, reading order, content width, and where whitespace earns its space.
- Typography: a readable body size, clear heading levels, line lengths, weight/contrast, and numeric alignment when comparing values. Reuse loaded fonts; a new typeface is a dependency.
- Color: neutral surfaces plus semantic roles for emphasis, selection, status, and destructive actions. Do not use color alone to encode meaning.
- Components: hierarchy of primary/secondary actions, control sizes, borders, corners, icon treatment, table density, and visible interaction states.
- Motion: explain state change or continuity; avoid motion whose only purpose is to make a screenshot feel expensive.

For an established product, describe the smallest changes with the highest visual payoff. For a new concept, offer distinct compositions rather than recoloring the same layout. Explain tradeoffs such as expressive branding versus scanning density or spacious presentation versus repeated daily tasks.

## Usability Checks

Use realistic text, long names, empty data, errors, and localization pressure. On narrow screens, define what reflows, collapses, scrolls, or remains persistent; shrinking the desktop screenshot is not a responsive plan.

Keep semantic controls, accessible labels, visible keyboard focus, and a logical focus order. Measure contrast rather than judging it by appearance. WCAG 2.2 AA target size is generally at least 24 by 24 CSS pixels, with defined exceptions including spacing; larger controls may better suit the task. Do not confuse this criterion with a universal 44-pixel AA rule.

Honor reduced-motion preferences when providing nonessential movement. Visual inspection, automated accessibility checks, and interaction tests each reveal different issues; none alone establishes complete accessibility conformance.

## Output That Helps Implementation

For thoughts or critique, lead with the recommended direction and a short list of concrete changes. Include a compact comparison only when there is a genuine decision to make. For a build request, translate the direction into existing components and tokens, then verify the actual rendered interface. A reference board is not the finished UI.

## Source Notes

- Dribbble public SaaS gallery is a discovery source, not evidence of production usability or permission to reuse assets: https://dribbble.com/tags/saas
- W3C explanation of visible keyboard focus, WCAG 2.2 criterion 2.4.7, Level AA: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- W3C explanation of target size and exceptions, WCAG 2.2 criterion 2.5.8, Level AA: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- MDN documents detection of the user's reduced-motion preference with CSS: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
