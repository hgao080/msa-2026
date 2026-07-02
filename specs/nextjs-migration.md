# Frontend Migration — Vite/React → Next.js (App Router)

## Decision (locked)

- **Framework:** Next.js App Router (replaces Vite + React Router v7).
- **Data layer:** Next-native — server components fetch server-side; `fetch` replaces Axios.
- **Auth:** JWT stays issued by the .NET backend (BCrypt + EF users = source of truth). Next stores the JWT in an **httpOnly cookie**; `proxy.ts` guards routes; server components read the cookie and forward `Authorization: Bearer <jwt>` to the backend.
- **Rejected:** Better Auth — it wants to own the user store/sessions; duplicates existing .NET auth, scope creep vs HANDOFF.
- **Dropped:** Axios, react-router-dom, Vite.

### Refinements during implementation
- **Server Actions over route handlers.** Login/register/logout/create-season use Server Actions (`use server`) instead of `app/api/*` route handlers — fewer files, idiomatic for form mutations. Actions set the httpOnly `token` cookie plus an httpOnly `user` cookie (display name for the server layout) and `redirect()`.
- **`proxy.ts`, not `middleware.ts`.** Next 16 renamed Middleware → Proxy (same behavior).
- **Zustand stores dropped.** In the SSR model the auth/season/application Zustand stores have no client consumer: data is fetched in server components, auth lives in cookies, NavBar gets the username via a prop from the server layout. The `zustand` dep is kept for future genuine client state but no store is ported yet.
- **Tailwind v4.** Class dark mode via `@custom-variant` in `globals.css` (replaces v3 `darkMode: 'class'`).

## Branch strategy

- Keep `feat/frontend-foundation` (PR #14) alive — source of truth to copy from. Do **not** delete.
- New branch `feat/frontend-nextjs` off `main`.
- Scaffold `create-next-app` (App Router, TS, Tailwind) into `frontend/` (wipe old contents on new branch first; originals safe on the PR branch).
- Commit clean scaffold alone, then port.

## File-by-file port plan

### Copy verbatim
- `src/types/index.ts` → `types/index.ts`. No changes. Framework-agnostic.
- `tailwind.config.ts`, theme tokens, `index.css` → Next Tailwind setup (`globals.css`).

### Rewrite (framework-coupled)
| PR file | Next target | Change |
|---|---|---|
| `src/api/client.ts` (axios + interceptors) | `lib/api.ts` server fetch wrapper | Rewrite. Reads JWT from cookie (`cookies()`), sets `Authorization` header, base URL `process.env.NEXT_PUBLIC_API_URL`/server env. 401 handling → redirect, not `window.location`. |
| `src/api/auth.ts` | `app/api/auth/login/route.ts`, `.../register/route.ts`, `.../logout/route.ts` | Route handlers POST to .NET `/api/auth/*`, set/clear httpOnly cookie. |
| `src/api/applications.ts`, `seasons.ts`, `dashboard.ts` | `lib/*.ts` server data fns | Swap axios calls for `fetch` via the server wrapper. Same endpoints/DTOs. |
| `src/store/authStore.ts` (persist localStorage) | mostly **dropped** | Auth state now cookie-driven server-side. Client keeps at most `user` for UI; no token in JS. |
| `src/store/seasonStore.ts`, `applicationStore.ts` | trimmed | Data fetching → server components. Zustand only for genuine client state (optimistic UI, filters). |
| `src/App.tsx` (router) | `app/` route tree + `middleware.ts` | See route map below. `ProtectedRoute` → middleware cookie check. |

### Route map (React Router → App Router)
| Old path | New file |
|---|---|
| `/login` | `app/(auth)/login/page.tsx` |
| `/register` | `app/(auth)/register/page.tsx` |
| `/` → redirect | `app/page.tsx` (redirect to `/dashboard`) |
| `/dashboard` | `app/dashboard/page.tsx` |
| `/board` | `app/board/page.tsx` |
| `/applications/:id` | `app/applications/[id]/page.tsx` |
| `/seasons` | `app/seasons/page.tsx` |
| `/seasons/new` | `app/seasons/new/page.tsx` |

### Components
- `NavBar.tsx`, `ThemeToggle.tsx` → `components/`. Add `'use client'`. ThemeToggle stays client (localStorage theme fine). Recharts components must be `'use client'`.
- Page components that submit forms (login/register/new season) → client components calling the route handlers / server actions.

## Auth flow (target)
1. Login form (client) POSTs to `app/api/auth/login`.
2. Route handler calls .NET `/api/auth/login`, gets `{ token, user }`, sets `token` as httpOnly cookie, returns `user`.
3. `middleware.ts` checks cookie on protected paths; redirects to `/login` if absent.
4. Server components/data fns read cookie via `cookies()`, forward `Bearer` to backend.
5. Logout route clears cookie.

## HANDOFF deviations to note
- Client-side token model (localStorage) → httpOnly cookie. Backend auth unchanged.
- Data fetching moves server-side; less Zustand than HANDOFF's SPA assumption.
