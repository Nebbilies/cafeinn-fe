# CafeInn Frontend

Next.js App Router foundation with strict TypeScript, Mantine, TanStack Query, and i18next. The startup page checks service connectivity and locale switching; it is not a finished business screen.

## Requirements

- Node.js **26.13.0 LTS** (supported range: `^26.13.0`).
- npm **11.20.0** or a compatible newer npm 11 release.

Check the runtime in the terminal running this project. `.node-version` records the target but does not automatically override every version manager's selection.

## Install and run

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A compatible CafeInn backend is expected at `http://localhost:4000/api/v1` by default. The page remains usable when the backend is unavailable and offers retry.

Production:

```sh
npm run build
npm start
```

The build does not require a running backend or database. Health fetching happens through a client-side feature hook.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Next.js development server. |
| `npm start` | Serve the production build. |
| `npm run build` | Build the production application. |
| `npm run typecheck` | Generate Next route types, then check TypeScript. |
| `npm run lint` | Run the Next.js and TypeScript ESLint configuration. |
| `npm test` | Test the framework-independent HTTP transport using native Node TypeScript support. |

ESLint is pinned to a release supported by the Next lint plugins. The lockfile records the exact dependency graph; use `npm ci` to reproduce it.

## Environment

No real environment file is created automatically. Copy `.env.example` to `.env.local` only when local overrides are needed.

| Variable | Default |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000/api/v1` |

Public Next.js environment variables are included in the browser bundle. Never place database URLs, passwords, or backend secrets here. Set the public API address before a production build and rebuild when changing it. Configure the backend's allowed CORS origin to match the frontend origin.

## Locale behavior

- Vietnamese (`vi`) is the default; English (`en`) is also available.
- The `cafeinn-locale` cookie remembers the choice for one year.
- Server HTML language and the initial i18next resources use the same validated locale.
- Unknown locale values fall back to Vietnamese.
- URLs currently have no locale prefix.
- Add matching keys to both translation resources when adding user-facing text. Vietnamese translation resources are application data; repository documentation is written in English.

## Visual foundations

The shared Mantine theme uses the CafeInn Figma Light/Dark foundations, a vendored Be Vietnam Pro font (400/500/600), and the approved logo exports. Fonts are served locally through Next.js; no external font service is required at build or runtime. Light is the default; Mantine remembers an explicit scheme selection independently of the locale cookie.

Run `npm run dev` and open [the foundations gallery](http://localhost:3000/dev/foundations) to review colors, typography, components and keyboard states. Its fixtures need no backend. `/dev/foundations` returns 404 when served from a production build (`npm run build` followed by `npm start`).

Read [docs/foundations.md](docs/foundations.md) for source nodes, values, asset provenance/licenses, supported semantic colors, and Mantine fallback coverage. Verify changes with the existing lint, typecheck, test and build scripts, plus browser checks in both schemes and locales.

## Structure

- `src/app/`: route/layout composition.
- `src/features/system-status/`: API function, TanStack Query hook, and startup status panel.
- `src/shared/api/`: framework-independent fetch transport and normalized HTTP errors.
- `src/shared/config/`: public configuration and Mantine theme.
- `src/shared/i18n/`: locale configuration and vi/en resources.
- `src/shared/providers/`: Mantine, Query, and translation providers.
- `src/shared/ui/`: locale selector.

Client fetching belongs in feature hooks; API functions remain independent of React. Server Components use server functions or prefetching when actually needed. Read [AGENTS.md](AGENTS.md) and the linked [.agents/ guides](.agents/architecture-and-naming.md) before feature work.

## Connectivity and checks

The status panel calls `GET /api/v1/health` and expects:

```json
{ "status": "ok", "service": "cafeinn-be" }
```

It retries a failed query once and checks again every 15 seconds while active. A connected status confirms the API response only, not database readiness.

Transport tests cover JSON success, empty 204 responses, unsuccessful response normalization, and cancellation. They do not test TanStack internals or database access. Check locale persistence, hydration, keyboard access, narrow/desktop layouts, and backend failure/recovery in a browser after changes affecting those behaviors.
