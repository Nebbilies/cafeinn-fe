# API Calls and Server State

Apply when adding queries, mutations, caching, polling, or SSR/prefetching. CafeInn uses **TanStack Query**; apply request deduplication principles from Vercel guidance through this library.

## Separate responsibilities

1. `shared/api/` handles transport: URLs, HTTP statuses, empty bodies, errors, configuration, and request cancellation.
2. `features/<feature>/api/*.api.ts` contains endpoint functions with typed inputs and an `AbortSignal` when appropriate. These functions do not import React or call hooks.
3. `*.queries.ts` contains query keys and query options when they are reused by hooks, prefetching, or multiple callers.
4. `hooks/use-*.ts` wraps `useQuery`/`useMutation`, expressing business intent and cache policy.
5. Components consume hooks and render states. Avoid scattering `fetch` calls or repeated query configuration across components.

For small features, split only files with actual responsibilities. Keep the distinction between API functions and hooks clear; do not create a generic hook that merely renames TanStack Query's API.

## Client-side fetching

- Read remote data through query hooks and change it through mutation hooks. Keep local UI state in React; do not copy query data into state through effects.
- Query keys must include every input that changes the result: IDs, filters, pagination, sorting, and authorized data scope. Search state may live in the URL when sharing or Back/Forward behavior requires it.
- Pass the query function's `signal` through the API function to `fetch` so the library can cancel requests. Handle unsuccessful HTTP statuses; `fetch` does not automatically throw for all HTTP 4xx/5xx responses.
- Distinguish initial loading, background refresh, empty results, errors, and pending mutations. Preserve existing content during background refetches where appropriate.
- Choose `staleTime`, refetching, and polling according to business sensitivity. POS data may need fresher results than a rarely changed catalog; avoid one long stale period for every query.
- Run independent queries in parallel. Run dependent queries only when their inputs are ready; avoid unnecessary request waterfalls.
- After a mutation, invalidate or update the relevant queries. Treat the backend response as confirmation of the result.
- Retry mutations only when the contract makes retries safe or provides idempotency. For payments, refunds, room bookings, and important state changes, design idempotency and concurrency with the backend before introducing optimistic updates.
- On logout or account changes, remove private cached data that no longer belongs to the current session. Query keys do not replace backend authorization.

## Server Components and SSR

- Server Components call server functions or prefetch queries. Do not call client hooks or convert an entire page to a Client Component merely to load data.
- Add prefetching, dehydration, and `HydrationBoundary` when initial data or waterfall prevention warrants it. Reuse the client's query keys and options.
- Isolate server QueryClient instances per request/render and keep browser instances stable. Keep user and i18n state separate for each request.
- Avoid independently loading the same data on server and client and maintaining two sources of state. When both need the data, define ownership and hydration/revalidation behavior.
- Use an explicit Next.js cache policy for server fetching. Private cached data must respect session/permission scope; shared caches need keys that correctly separate users.
- Pass only necessary, serializable data to the client. Server-side fetching must follow the agreed authentication mechanism; do not assume browser cookies automatically reach the backend.

## Data boundaries

- Validate untrusted data at appropriate boundaries using the selected schema library. A type assertion is not runtime validation.
- Preserve stable API error codes for mapping to vi/en messages. Do not expose stack traces or internal details.
- Follow the contract's monetary and time representations. The backend confirms totals, price snapshots, and room reservation decisions.

## Verification

Check loading/error/empty states, changing inputs, cancellation, mutation success/failure, and relevant invalidation. For SSR, verify hydration and session isolation. Test affected user behavior or contracts rather than reproducing library internals.

Sources: [TanStack Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr), [Query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys), [Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation).
