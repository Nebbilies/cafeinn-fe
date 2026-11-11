# Frontend Structure and Naming

Apply when adding, moving, or naming files, or deciding a feature's responsibilities.

## Choose the location

| Location | Responsibility |
| --- | --- |
| `src/app/` | Routes and Next.js convention files; page composition, layouts, loading, and error boundaries |
| `src/features/<feature>/` | UI, queries, hooks, schemas, and logic specific to a business capability |
| `src/shared/api/` | HTTP transport, API errors, and shared access configuration |
| `src/shared/config/` | Public configuration and theme |
| `src/shared/i18n/` | Locales, translation initialization, and vi/en resources |
| `src/shared/providers/` | Composition of infrastructure library providers |
| `src/shared/ui/` | Business-independent UI with a concrete reuse requirement |

Keep code in a feature when only that feature uses it. Move code to `shared/` when it has a clear shared responsibility. Check Mantine and existing libraries before building a component or hook. Create directories and files when they have actual content.

A feature may use the following groups. This is a reference layout, not a mandatory directory checklist:

```text
features/menu/
├── api/menu.api.ts                     # HTTP functions without React dependencies
├── api/menu.queries.ts                 # Reusable query keys and query options
├── hooks/use-menu-items.ts             # Client-side query hook
├── hooks/use-create-menu-item.ts        # Client-side mutation hook
├── components/menu-table.tsx
├── schemas/menu.schema.ts
├── types/menu.types.ts                 # Only for types not inferred from schemas
└── server/menu.server.ts               # Only for server-specific logic
```

## Names and exports

- Use `kebab-case` for ordinary files and directories: `menu-table.tsx`, `use-menu-items.ts`, and `format-money.ts`.
- Use `PascalCase` for components and types, `camelCase` for functions and variables, and the `use` prefix for custom hooks, such as `useMenuItems`.
- Use consistent role suffixes: `.api.ts`, `.queries.ts`, `.schema.ts`, `.types.ts`, `.server.ts`, `.test.ts(x)`, and `.module.css`.
- Preserve Next.js convention filenames: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, and other names required by the installed version.
- Give each file one primary responsibility. Colocate tests and CSS with the behavior they verify or style when appropriate.
- Name code after its business meaning. Avoid collecting unrelated functionality in `utils.ts`, `helpers.ts`, or a global `components/` directory.
- Prefer named exports; use default exports where the framework requires them. Create a small public entrypoint only when needed. Keep server/client exports separate and avoid feature-wide `export *` barrels.

## Dependency rules

- `app/` composes features and shared code; features use shared code; shared code does not import the app or features.
- Other modules use a feature's public functionality. If no suitable public surface exists, establish ownership before accessing another feature's internal files.
- Use configured aliases for imports across directories and short relative imports within a feature.
- Keep server-only files behind a clear boundary, using `server-only` where appropriate. Do not re-export them through entrypoints imported by client code.
- Add `'use client'` only at boundaries that need hooks, events, or browser APIs. A Mantine/provider client boundary does not require the entire route to become client code.
- Infer types from schemas when possible and preserve DTOs from the API contract. Do not unilaterally change data shapes or copy database entities into frontend types.

## Completion check

Check file ownership, consistent naming, dependency direction, and server/client separation. Run relevant existing repository checks and identify anything not run.
