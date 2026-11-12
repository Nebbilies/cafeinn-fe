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

## CI and Git hooks

`npm ci` installs Husky hooks for local development:

- **Pre-commit:** `npm run lint` checks the entire working tree.
- **Pre-push:** `npm run typecheck` followed by `npm test`.
- **Build:** runs on CI, not in Git hooks.

GitHub Actions runs on every pull request, pushes to `main`, and manual dispatch. The `Quality checks` job installs the Node.js version from `.node-version` and npm from `packageManager`, installs the lockfile with `npm ci --ignore-scripts`, and runs lint, typecheck, tests, and build. Dependency installation scripts are disabled on CI. No running backend or database is required. CI and production-only installs skip Husky setup.

The `main` branch must require a pull request and the GitHub Actions `Quality checks` status check, including for administrators, with the branch up to date before merging. These are GitHub repository settings; the workflow file alone does not enforce them. A failed check is fixed by pushing another commit to the same pull request. The existing tests cover HTTP transport, not browser or end-to-end behavior.

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
