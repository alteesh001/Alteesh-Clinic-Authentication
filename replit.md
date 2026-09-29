# Alteesh Clinic

Alteesh Clinic is an Arabic-first clinic workspace with branded authentication, first-admin onboarding, and a protected role-aware portal for medical teams.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/alteesh-clinic` — React/Vite web app and clinic-facing UI.
- `artifacts/api-server/src/routes/auth.ts` — auth status, current profile, and first-admin onboarding routes.
- `lib/api-spec/openapi.yaml` — source of truth for API contracts and generated hooks.
- `lib/db/src/schema/clinic-users.ts` — clinic user profile schema.
- `artifacts/alteesh-clinic/src/App.tsx` — Clerk routing, public landing page, onboarding, and protected portal.

## Architecture decisions

- Clerk is the authentication provider; browser requests use Clerk's same-origin session cookie rather than manually attaching bearer tokens.
- The first signed-in user creates the clinic owner profile through the onboarding endpoint and receives the `super_admin` role.
- API contracts are OpenAPI-first; regenerate clients with `pnpm --filter @workspace/api-spec run codegen` after spec changes.
- The UI is bilingual and Arabic-first in product copy while keeping common workspace controls in English for the initial build.

## Product

- Public clinic welcome page with sign-in and sign-up entry points.
- Clerk-powered sign-in and sign-up screens with branded appearance and localization.
- First-admin onboarding that creates the clinic profile and protects the portal until setup is complete.
- Protected portal shell with role labels, clinic overview, appointment preview, quick actions, and sign-out.

## User preferences

- Preserve the Alteesh Clinic visual direction while building the medical-management functionality from the referenced source system.

## Gotchas

- Keep Clerk routes exactly `/sign-in/*?` and `/sign-up/*?`; Clerk needs full base-prefixed `path` props.
- Mount the Clerk proxy before Express body parsers and keep `clerkMiddleware` before API routes.
- Restart `artifacts/api-server: API Server` after backend bundle changes; Vite frontend changes hot reload.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
