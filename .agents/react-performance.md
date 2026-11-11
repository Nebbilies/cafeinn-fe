# React and Next.js Quality and Performance

Apply when writing or modifying React/Next.js. Prioritize correct behavior, server/client boundaries, and data flow before micro-optimizations.

## Server data and rendering

- Start independent operations concurrently with `Promise.all`; await results when the relevant branch needs them. Preserve ordering for dependent operations and mutations.
- Use Suspense/loading boundaries around meaningful content so slow data does not block the whole page. Avoid request waterfalls caused by component placement.
- Keep request state, permissions, and locales request-scoped. Share only immutable configuration or caches with appropriate policies and keys across requests.
- Pass only necessary data across client boundaries; keep tokens, secrets, and privileged operations on the server.
- If a task introduces Server Actions or Route Handlers, authorize each entrypoint like an endpoint. The backend remains the owner of CafeInn business rules and data.

## Bundles and libraries

- Import internal code from specific paths and keep public entrypoints small. For external packages, use supported exports/subpaths rather than private paths for bundle savings.
- Use supported import optimization when needed instead of collecting re-exports or enabling experimental flags from outdated examples.
- Dynamically import heavy, infrequently used code when measurements or loading characteristics justify it. Avoid delaying important content through unnecessary lazy loading.
- Use appropriate Next.js image, font, and script facilities. Load third-party scripts when they are needed.
- Read peer dependencies and version-appropriate Mantine guidance before changing providers, styles, or build configuration.

## State and hooks

- Compute inexpensive derived values during rendering or in selectors. Use effects to synchronize with external systems.
- Handle interactions in event handlers. Keep effect dependencies correct and clean up effects; do not disable lint rules to hide missing dependencies.
- Use functional state updates when the new value depends on the previous value, and lazy initialization when state initialization is expensive.
- Declare components at module scope and use stable data identities as keys. Change keys only when an identity reset is intended.
- Measure or identify expensive rendering before adding `memo`, `useMemo`, or `useCallback`; avoid blanket memoization of simple expressions.
- Keep input interactions responsive. Consider transitions/deferred values for non-urgent updates without delaying action feedback.
- Use refs for transient values that do not require rendering. Limit broad subscriptions, listeners, and state; remove listeners at the end of their lifecycle.

## UI, hydration, and accessibility

- Keep initial HTML, locale, and data consistent between server and client. Access browser APIs only where appropriate.
- Fix the cause of hydration mismatches. Use `suppressHydrationWarning` only for narrow cases explicitly justified by a library or the design.
- Reuse Mantine before wrapping or rebuilding equivalent UI. Preserve labels, focus, keyboard behavior, and status announcements.
- Introduce virtualization or deferred list rendering when actual data and measurements justify it.
- Use meaningful translation keys and add vi/en resources for new content. Locale switching must remain consistent with SSR.

## Apply selectively

This guide is adapted from the Vercel-authored `vercel-react-best-practices` skill, version 1.0.0, licensed under MIT. CafeInn uses TanStack Query; follow [data-fetching.md](data-fetching.md) rather than adding SWR. Do not turn every cache recommendation or micro-optimization into a mandatory requirement. Verify both the benefit and correctness of changes.

API references: [React Rules](https://react.dev/reference/rules), [Next.js data fetching](https://nextjs.org/docs/app/getting-started/fetching-data), [Mantine with Next.js](https://mantine.dev/guides/next/). When a skill example differs from the repository's version, check official documentation and the lockfile before applying it.
