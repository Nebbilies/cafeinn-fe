# Portal layout design proposal

Status: design and implementation plan approved by the user; implementation and verification complete on 2026-11-13.

## Confirmed scope

- Build the shared internal system layout under `/portal/*`.
- Cover internal sales, preparation, study-room operations, shifts, events, event reception, and administration navigation.
- Business destinations contain clearly identified placeholder content in this task.
- Landing pages and guest-facing menu, event lookup, and other public pages are excluded.
- Work on `feat/portal-layout`, preserving the starting checkout. The starting checkout was clean. Do not commit or push without explicit authorization.

## Verified design references

File: https://www.figma.com/design/uFGpsRjt8VmGoUInMn4XNA

| Reference | Node | Verified behavior |
| --- | --- | --- |
| Navigation review | `8828:3528` | Expanded/collapsed navigation, tooltips, active/hover/focus states |
| Global header instance | `8813:425888` | 64px height, 24px horizontal padding, official logo left, 32px initial avatar and user name right |
| Sidebar instance | `8813:425803` | 224px expanded, 72px collapsed, 44px navigation items, 4px gaps, independently scrolling menu |
| Page header instance | `8813:425879` | 56px height, 24px horizontal padding, page identity and per-page action slot |
| Navigation masters | `8802:3504` | Shared header, sidebar, toggle, items, and tooltip components |

Read screenshots and design context for the header, sidebar, page header, and navigation review. Use the existing verified color tokens, Be Vietnam Pro fonts, and official local logo. Download the Figma navigation assets locally during implementation.

## Options

1. **Recommended: compose Mantine AppShell with portal-owned components and scoped CSS.** Reuse installed navigation, tooltip, avatar, drawer, and control primitives. Keep sizing and states faithful to Figma. Next.js nested layouts preserve the shell across portal navigation.
2. Build a custom shell with raw elements. This duplicates installed layout and responsive behavior without a demonstrated need.
3. Introduce another dashboard/UI package. This adds dependency and styling work despite sufficient installed components.

## Recommended behavior

- `src/app/portal/layout.tsx` wraps portal routes with a persistent shell; the existing root providers remain the owners of theme, locale, and query state.
- The header displays the official logo and a sample account clearly documented as fixture data until an authentication/session contract exists. A fixture must not imply that access is authorized.
- Desktop sidebar toggling changes only expanded state. Navigation and page state remain intact. Collapsed items retain accessible names and reveal tooltips on hover and keyboard focus.
- Use actual Next.js links, mark the active destination accurately, and preserve browser Back/Forward and deep links. Unknown routes return 404 rather than becoming arbitrary placeholder pages.
- Show all agreed internal destinations for this layout preview. Keep operational study-room navigation distinct from room administration. Actual permission filtering and authorization require a future session/backend contract.
- `/portal` provides a small internal entry page with links to the available sections. Known destination routes show their translated title and a plain placeholder notice. Avoid inventing dashboard metrics or business records.
- Page headers expose optional context and actions to future business pages. Do not add nonfunctional business action buttons.
- Proposed responsive fallback: below 48em, use a header menu control and a Mantine drawer with full labels. Close it after navigation; support Escape and focus return. This is an implementation proposal because no mobile specification has yet been verified in the inspected frames.
- Reuse existing vi/en translations and Light/Dark tokens. Vietnamese and Light remain the defaults. Keep the global header composition aligned with Figma rather than adding unrelated settings controls.
- Do not introduce decorative motion, dependencies, API calls, login/logout behavior, or permission rules for this layout task.

## Edge cases and acceptance conditions

- Directly opening known portal routes works; unknown destinations return 404.
- Active matching respects path segment boundaries and does not select multiple unrelated items.
- Desktop collapse/expand preserves route and mounted page state.
- Short viewports scroll the menu independently of the content.
- Long Vietnamese/English labels, account names, and page headings do not force horizontal page overflow.
- Navigation works with keyboard only; collapsed items have names and focus tooltips; mobile dismissal returns focus.
- The layout remains usable at 320px, tablet widths, and the 1280×800 reference size.
- Verify both locales and both color schemes without hydration mismatches.
- Verify local SVG assets, logo proportions, icon positions, and no temporary Figma runtime URLs.
- Run repository lint, typecheck, tests, and production build. Verify portal visuals and navigation in the browser where available.

## Self-review

The proposal reuses the installed stack and current foundations, isolates portal ownership, and avoids public-page changes. Verified dimensions are distinguished from the proposed mobile fallback. Placeholder navigation is explicitly separated from future authorization and business behavior. No dependency changes or unrelated refactoring are required. Design self-review: approved for user review.

## Approved implementation and ownership

- `src/app/portal/layout.tsx` mounts the persistent portal shell; `page.tsx` composes the entry page; `[section]/page.tsx` validates the exact destination allowlist before rendering and calls `notFound()` for unknown values.
- `src/features/portal/portal-navigation.ts` owns the 15 destinations and segment-aware active matching. `portal-account.ts` derives the first uppercase grapheme using the native `Intl.Segmenter` API.
- Portal components own the AppShell, navigation, CSS masks for original Figma icons, page header, and placeholder pages. The page-header interface is `{ title: string; context?: string; actions?: ReactNode }`.
- The shared `BrandLogo` accepts an optional height, defaulting to its existing 64px. The portal uses 39.68px and retains the existing official scheme-specific exports.
- Both translation resources contain portal strings. The employee destination uses a short navigation label and a separate full page heading, matching the reference.
- Node tests cover route recognition, unknown paths, prefix boundaries, nested paths, and grapheme-safe account initials. No dependencies, global providers, or public routes were changed.

| Destination | Path |
| --- | --- |
| Sales | `/portal/sales` |
| Preparation | `/portal/preparation` |
| Study room bookings | `/portal/study-room-bookings` |
| Work shifts | `/portal/shifts` |
| Events | `/portal/events` |
| Event check-in | `/portal/event-check-in` |
| Employees | `/portal/employees` |
| Menu | `/portal/menu` |
| Tables | `/portal/tables` |
| Study room management | `/portal/study-rooms` |
| Adjustments | `/portal/adjustments` |
| Revenue | `/portal/revenue` |
| Expenses | `/portal/expenses` |
| Policies | `/portal/policies` |
| History | `/portal/audit-log` |

## Asset provenance

Original SVGs are vendored unchanged in `public/portal/icons/`. Icons use CSS masks to apply the existing scheme-aware token colors. The 20px navigation wrapper retains the source artwork's 16.6667px geometry; the chevron uses its full 20px wrapper.

| Asset | Source node |
| --- | --- |
| sales | `8802:3506` |
| preparation | `8802:3510` |
| room | `8802:3513` |
| shifts | `8802:3516` |
| microphone | `8802:3520` |
| check-in | `8802:3528` |
| users | `8802:3531` |
| menu-book | `8802:3535` |
| table | `8802:3538` |
| refund | `8802:3542` |
| bar-chart | `8802:3545` |
| receipt | `8802:3548` |
| policy | `8802:3551` |
| history | `8802:3554` |
| chevron-left | `8825:3526` |

The preview account name is the fixed fixture `Minh`. All destinations are visible for layout review. This task supplies neither authentication nor authorization and does not connect to a backend. Public guest-facing pages remain outside the portal.

## Verification results

- TDD: observed missing-module failures before implementing each agreed interface and a failing nested-route assertion before adding segment matching. The resulting four portal tests pass.
- `npm run lint`: passed.
- `npm run typecheck`: passed; the final production build also completed TypeScript checking.
- `npm test`: all eight tests passed, including the four existing HTTP transport tests.
- `npm run build`: passed, registering `/portal` and `/portal/[section]`.
- Production browser checks in installed Chrome: all 15 destinations returned 200; unknown and prefix-collision destinations and an unsupported nested route returned 404.
- Verified 64px header, 224px/72px sidebar, 44px single-line navigation, one active item, shell identity through collapse, retained collapse state on navigation, Back/Forward, keyboard tooltip, and independently scrolling navigation in a 400px-high viewport.
- Verified 320px, 768px, and 1280px widths without horizontal overflow; mobile Drawer navigation, Escape dismissal, and focus return. Desktop mobile-button visibility was corrected after visual inspection.
- Verified all four Vietnamese/English and Light/Dark combinations, translated server output, scheme persistence, long-heading wrapping, and no browser page errors. Each scheme shows one loaded logo at 39.68px height. All 15 local SVG URLs returned non-empty 200 responses. The installed Mantine version stores its scheme under `mantine-color-scheme-value`.
- Original local icons are non-empty, retain their SVG dimensions, and render in their intended navigation slots. No temporary Figma URLs are used at runtime.

Checks requiring child processes initially hit the host's `spawn EPERM` restriction; the actual npm test and production build scripts subsequently passed with execution approval. Browser checks ran against the production server on port 3010. Screenshots and the verification driver remain outside tracked source or in ignored build output.

Limitations: mobile checks used desktop Chrome viewport emulation, not physical iOS/Android devices. The retained official logo exports come from the existing foundations work; this change does not re-export or redraw them. Placeholder content has no business interactions or authentication coverage. No commit or push was performed.
