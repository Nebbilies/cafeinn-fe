# Motion and View Transitions

Apply when a task requires navigation transitions, shared elements, list changes, or other purposeful motion. This is guidance for actual motion requirements, not a requirement to animate the scaffold or every page.

## Before implementation

1. State what the motion communicates: a list/detail relationship, continuity of the same element, ordering, or state feedback. Keep operational POS interactions fast and clear.
2. Read actual React/Next.js versions from the lockfile and inspect available APIs/types. Check version-appropriate official documentation. Some source skill guidance comes from the experimental API period; Canary, flag, and browser-support claims are not universal.
3. Use stable APIs compatible with the chosen stack. If an approach requires a version change, experimental flag, or prerelease package, explain its limitations and alternatives first. Preserve the project's stable scaffold decision.
4. Audit affected routes, Links, programmatic navigation, Suspense/loading boundaries, persistent layouts, and shared elements. Identify transition placement and behavior when no matching shared element exists.

## Choose and place motion

- Prefer shared-element continuity when moving from a list to a detail view. Derive names from identity and avoid duplicate names among simultaneously mounted elements.
- Animate data reveals, state changes, and list reordering when they clarify the change. Background refreshes generally leave content still.
- Use directional slides for deeper/back navigation or ordered sequences. Use subtle motion or no motion for peer tabs rather than implying an ordering that does not exist.
- When using React ViewTransition, let React coordinate it; do not also call `document.startViewTransition` for the same flow.
- Place boundaries around the elements that actually mount, unmount, or update. Check nested boundaries and persistent layouts so an outer boundary does not suppress an inner animation.
- Use stable keys for list identity and change keys only for intentional remounting. Preserve Suspense boundary identity to avoid refetching solely for an effect.
- Choose animation triggers explicitly. Use `default="none"` when unrelated background updates or navigation should not animate.
- Call hooks such as `useRouter` at the top level of a Client Component/custom hook; handlers use the previously obtained value. Use `startTransition` and navigation APIs according to the installed integration.
- Preserve Link semantics and browser history. Do not replace Back with `push` merely to obtain animation; navigation must remain correct without motion.

## CSS, accessibility, and verification

- Use recipes verified against the current API/version and add only what is needed. Keep classes, keyframes, and timing consistent; avoid copying an unused stylesheet wholesale.
- Support `prefers-reduced-motion`; React does not automatically disable all effects for this preference. Preserve focus, keyboard access, scrolling, and interaction state.
- Unsupported browsers must continue to navigate and operate normally. Verify behavior with motion disabled.
- Check forward/back navigation, browser Back/Forward, deep links, slow/error responses, rapid repeated interactions, and duplicate shared-element names. Run typecheck/build and visually verify affected behavior.
- Report integration limitations and unverified behavior. Do not claim universal browser support based on an outdated version table.

Selectively adapted from the Vercel-authored `vercel-react-view-transitions` skill, version 1.0.0, licensed under MIT. This repository guide is standalone and does not require agents to have that skill installed.

Sources: [React ViewTransition](https://react.dev/reference/react/ViewTransition), [React 19.3 release](https://react.dev/blog/2026/09/09/react-19-3), [Next.js View Transitions](https://nextjs.org/docs/app/guides/view-transitions). Consult sources matching the locked versions when implementing; do not copy outdated flag guidance into the default configuration.
