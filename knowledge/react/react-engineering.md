# React Engineering Knowledge

Use this reference when writing or reviewing React components, hooks, state management, rendering behavior, forms, frontend tests, and API integration.

## Component Design

- Keep components focused on one UI responsibility. Extract components when it improves naming, reuse, or local reasoning, not just to reduce line count.
- Prefer derived values during render over duplicating state. Store the minimum state needed to represent user intent or server data.
- Keep state close to where it is used; lift it only when multiple components need the same source of truth.
- Avoid syncing props to state unless the component truly needs an editable draft or controlled reset behavior.

## Effects

- Effects are for synchronizing with external systems: network, subscriptions, browser APIs, timers, analytics, or imperative widgets.
- Do not use effects to compute values that can be derived during render.
- Include all reactive dependencies. If that causes loops, redesign the data flow rather than suppressing the dependency rule.
- Clean up subscriptions, timers, and abortable requests.

## Data And UX

- Model loading, empty, success, error, and stale states explicitly.
- Keep server state separate from local UI state where the framework or data library supports it.
- Treat accessibility as behavior: labels, keyboard navigation, focus management, semantic controls, and useful error text.
- Avoid layout shifts from loading text, dynamic labels, and uncontrolled image sizes.

## Tests

- Test user-visible behavior instead of component internals.
- Prefer queries that match how users find elements: role, label, text, placeholder, alt text.
- Cover important state transitions: loading to success, validation error, failed request, disabled controls, and retry.

## Source Notes

- React docs on thinking in React: https://react.dev/learn/thinking-in-react
- React docs on state structure: https://react.dev/learn/choosing-the-state-structure
- React docs on effects: https://react.dev/learn/synchronizing-with-effects
- React docs on escape hatches: https://react.dev/learn/escape-hatches
