# CafeInn FE — Agent Guidelines

## Context and scope

CafeInn serves a single acoustic cafe, covering F&B/POS, events, and study rooms. This repository contains the frontend only. The chosen stack is Next.js App Router on Active LTS, compatible React, strict TypeScript, Mantine, TanStack Query, i18next, and npm. Vietnamese is the default application language; English is also supported, and the selected locale is remembered.

The repository must work when cloned independently. The parent directory is the owner's local workspace; do not depend on `../docs/`, a neighboring backend repository, or skills installed on a personal machine. Use the business specification supplied for the task. When requirements are missing or conflicting, identify the uncertainty before implementing dependent behavior.

## Read guidelines by task

- **Structure, naming, or new features:** read [.agents/architecture-and-naming.md](.agents/architecture-and-naming.md).
- **Queries, mutations, caching, SSR, or API calls:** read [.agents/data-fetching.md](.agents/data-fetching.md).
- **React/Next.js changes, rendering, or bundle optimization:** read [.agents/react-performance.md](.agents/react-performance.md).
- **Motion, navigation transitions, or shared elements:** read [.agents/view-transitions.md](.agents/view-transitions.md) before proposing or adding animation.

Apply relevant guidelines together. The user's latest explicit decision takes precedence over repository guidance; report conflicts instead of silently choosing a rule.

## General rules

- Write all repository documentation in English, including `AGENTS.md`, `.agents/`, README files, setup/API guides, and documentation examples. Conversation follows the user's language; application translations remain Vietnamese and English.
- Place routes in `src/app/`, business features in `src/features/`, and shared code in `src/shared/`. The frontend has exactly one `src/shared/` directory.
- Keep business rules and data authorization in the backend. The frontend must not connect to MySQL or contain Prisma, database URLs, or backend secrets.
- Use the selected libraries. Before adding code, check existing implementations, the standard library, native platform features, and installed dependencies. Add a dependency only for a concrete need.
- Access remote client-side data through feature-level TanStack Query hooks. Server Components use server functions or prefetching; client hooks do not run on the server.
- Use compatible stable releases and check security patches when changing dependencies. Read actual versions and scripts from `package.json` and the lockfile; do not independently switch to Canary or enable experimental flags.
- Provide placeholder values in `.env.example`; keep real `.env` files and secrets out of Git. Only values safe for public disclosure may use the `NEXT_PUBLIC_` prefix.
- Inspect existing scripts before running lint, typecheck, tests, or builds. If the scaffold or script does not exist, state that the check cannot run; do not invent commands or claim success.
- Keep changes within the task scope. Verify affected behavior and report results, limitations, and anything not verified.

