# Project Context — binayah-properties

**Read this file on iteration 1 of every iterate loop.** It saves you from rediscovering contracts, tokens, and gotchas that caused prior bugs. Update it at ship time when new routes/components/patterns land.

---

# §1 — Tech Directory

## Deploy targets

| Project | Platform | URL |
|---|---|---|
| binayah-properties (this repo) | Vercel | https://staging.binayahhub.com |
| binayah-api (Fastify) | Render | https://binayah-api.onrender.com |
| binayah-ultimate | Vercel | https://dashboard-gamification.vercel.app |

Push env vars via API (Vercel token + Render token live in `/Users/zoop/.env.shared`). Never ask the user to "set X in the dashboard".

## External API — Fastify at `https://binayah-api.onrender.com`

**Base env var:** `NEXT_PUBLIC_API_URL` (client) / `API_BASE_URL` (server). Use the `apiUrl(path)` and `serverApiUrl(path)` helpers from `src/lib/api.ts`.

**Key routes — all `GET` unless noted. All detail routes take `:slug`, NOT `:_id`.**

| Route | Returns | Notes |
|---|---|---|
| `/api/projects` | list of projects | supports filters via query |
| `/api/projects/:slug` | single project | **slug, not _id** |
| `/api/listings` | list of listings | supports filters |
| `/api/listings/:slug` | single listing | **slug, not _id** |
| `/api/communities` / `/api/communities/:slug` | communities | slug-based |
| `/api/developers` / `/api/developers/:slug` | developers | slug-based |
| `/api/news` / `/api/news/:slug` | news articles | slug-based |
| `/api/inquiries` (POST) | submit inquiry | |
| `/api/search` | unified search | |
| `/api/market-stats` / `/api/market-data` | market dashboards | |
| `/api/valuation/*` | valuation flow | |
| `/api/admin/*` | admin endpoints (preHandler: requireAdmin) | header `x-admin-secret` |

> **GOTCHA (learned iter 4, Apr 2026):** Favorites stored `_id` as the key → drawer fetched `/api/projects/${_id}` → silent 404 → blank UI with "(1)" in header. **Always pass `slug` as the identifier when the key will be used against Fastify.**

## Internal Next.js API routes (`src/app/api/`)

| Route | Purpose | Auth |
|---|---|---|
| `/api/auth/[...nextauth]` | NextAuth handler | — |
| `/api/auth/signup` | email + password sign-up | rate-limited (5/IP/10min) |
| `/api/auth/forgot-password` | send reset link | rate-limited (3/email/hour), always 200 (no enumeration) |
| `/api/auth/reset-password` | redeem reset token | atomic findOneAndUpdate |
| `/api/favorites` | GET/POST/DELETE user's favorites | `getServerSession` |
| `/api/favorites/hydrate` (POST) | batch-fetch property details for saved favorites | `getServerSession`; verifies all ids are in user's own favorites (403 if not) |
| `/api/list-your-property` | submit property listing | `getServerSession` |
| `/api/admin/session` | bootstrap admin cookie | validates ADMIN_SECRET |
| `/api/test/auth-seed` | **dev-only** — issues JWT cookie for QA | blocked in prod |
| `/api/valuation/*` | valuation proxy | — |

## Auth patterns

- **Strategy:** NextAuth with JWT session, Google OAuth + Credentials (email/password).
- **Adapter:** MongoDB (`binayah_web_new_dev` db).
- **Session shape:** `session.user = { id, name, email, image }`. `user.id` is `token.sub`.
- **Server-side check:** `const session = await getServerSession(authOptions); if (!session?.user?.id) return 401`.
- **Client-side check:** `const { data: session, status } = useSession()`.
- **Admin gate:** cookie `admin_secret` set via `/api/admin/session?secret=X&next=/admin` (HMAC-timing-safe compare, HttpOnly cookie, 8h). Never put secret in URL after bootstrap.
- **Sign-in UI:** always route to `/signin` page (supports Google + email tabs). Don't call `signIn("google")` directly from a nav button — it skips the email option.

## Routing — next-intl

- **`localePrefix: "as-needed"`**, locales `[en, ru, kz, in]`, default `en`.
- **ALL user-facing pages MUST live under `src/app/[locale]/`.** Top-level `src/app/<route>/` is NOT served — middleware rewrites to `/<locale>/<route>` which would 404.
- API routes stay at `src/app/api/` (middleware skip-lists them).
- Root `src/app/layout.tsx` is intentionally empty (`return children`). Real layout (fonts, providers, `<html>`, `<body>`) lives in `src/app/[locale]/layout.tsx`.
- Use `@/navigation` wrapper Link/useRouter from next-intl — auto-prefixes locale.
- For internal redirects that should preserve locale: `useParams()` → `router.push(\`/${locale}/path\`)`.

## Database — MongoDB Atlas

- **Cluster:** `cluster0.bxh2ywj.mongodb.net`
- **DB:** `binayah_web_new_dev`
- **Key collections:**
  - `users`, `accounts`, `sessions`, `verification_tokens` (NextAuth)
  - `password_reset_tokens` — hashed tokens, TTL on `expiresAt`
  - `rate_limits` — `{ _id, count, expiresAt }`, TTL index on `expiresAt`
  - `property_submissions`, `submission_events` (list-your-property)
  - `favorites` — `{ userId, propertyId, createdAt }`
  - `inquiries` (read from Fastify's inquiries collection)

> **GOTCHA:** Atlas SRV DNS (`_mongodb._tcp.cluster0...`) is unreachable from Claude's local sandbox — all Mongo-touching code 500s during QA. Does NOT affect Vercel. Document the 500 but don't fail the iteration for it.

## Known gotchas (history)

1. **next-intl 404s** — solved Apr 15 by moving signin/profile/list-your-property/admin-submissions under `[locale]/`.
2. **Turbopack `.next` cache corrupts** when files move → 500 on everything. Orchestrator auto-nukes `.next` before each QA run.
3. **Render sets `NODE_ENV=production`** → build deps must be in `dependencies`, not `devDependencies` (tailwind, postcss, typescript, @types/*).
4. **Google avatars blocked by next/image** unless `lh3.googleusercontent.com` is in `remotePatterns`. `alt` text leaks out of broken 32px image box when blocked — always use empty `alt=""` for decorative avatars, and `referrerPolicy="no-referrer"`.
5. **In-memory `Map` rate limiters are no-ops on Vercel** (each lambda = fresh isolate). Use MongoDB-backed TTL collection.
6. **Legacy projects have `propertyTypes: undefined` not `[]`** (iter Apr 20) — MongoDB returns the field absent when not set despite schema `default: []`. Always use optional-chain: `project.propertyTypes?.length`, `project.propertyTypes?.join(...)`. Never bare-access `.length` or `.join`.

## Project schema — multi-property-type (iter Apr 20)

Projects now support **multiple property types** (e.g. Apartment + Villa in the same project). Shape:

```ts
project.propertyType: string          // legacy singular — still populated, used for hero badge / listing filters
project.propertyTypes?: string[]      // NEW plural — drives two-level tabs. undefined on legacy docs.
project.priceByType[i].propertyType   // NEW — "Apartment" | "Villa" | ""
project.floorPlans[i].propertyType    // NEW — "Apartment" | "Villa" | ""
```

**UI rule:** In `ProjectDetailClient.tsx`, when `project.propertyTypes?.length > 1` render primary property-type tabs; filter `priceByType` / `floorPlans` by `entry.propertyType === activePropertyType` before rendering bedroom sub-tabs. When `<= 1` or undefined, render flat bedroom tabs (legacy path, zero regression).

**Known latent bug (not yet fixed, waiting for real data):** The floor plan image slot at `ProjectDetailClient.tsx:646` still reads from flat `project.floor_plans[clampedUnitTab]` even for multi-type projects. Once a multi-type project actually uploads PNG floor plans, thread `floorPlans[].image` filtered by `activePropertyType` instead. Sensia is seeded with empty image strings so nothing visibly breaks today.

**Test project:** `sensia-by-beyond` has `propertyTypes: ["Apartment", "Villa"]` with 2BR/3BR Apartments and 4BR/5BR Villas.

---

# §2 — Style Guide

Read these tokens and patterns before adding ANY new UI component. The golden rule: **match what's next to you**. If your button sits next to an existing button, copy the existing button's classes and modify only what you must.

## Color tokens (from `src/app/globals.css`)

Defined as HSL in CSS vars, consumed via Tailwind as `bg-primary`, `text-foreground`, etc.

| Token | Light | Dark | When to use |
|---|---|---|---|
| `background` | off-white `40 20% 98%` | near-black `200 25% 6%` | page bg |
| `foreground` | near-black `200 25% 10%` | near-white `40 20% 95%` | body text **on background** |
| `card` | pure white `0 0% 100%` | `200 20% 10%` | card bg |
| `primary` | dark green `168 100% 15%` (#004D3D) | lighter green `168 100% 20%` | brand accent, primary CTA |
| `accent` | gold `43 60% 55%` (#D4A847) | same | secondary CTA, badges |
| `muted` / `muted-foreground` | light gray / mid gray | — | subtle bg, secondary text |
| `border` | low-contrast line | — | card borders, dividers |

**Literal hex colors used across the site** (navbar, hero gradients — these don't map to CSS vars, they're baked in):
- **Deep brand green:** `#0B3D2E` → `#1A7A5A` (gradient — this is the navbar bg)
- **Gold CTA:** `#D4A847` → `#B8922F` (gradient — Get in Touch button)
- **WhatsApp:** `#25D366`
- **Red heart:** `red-500` Tailwind (`#EF4444`)

## Text on colored backgrounds — **CRITICAL**

| Background | Use | Do NOT use |
|---|---|---|
| Green navbar (`#0B3D2E → #1A7A5A`) | `text-white`, `text-white/90`, `text-white/80` | `text-foreground` (invisible — it's dark!) |
| White/card | `text-foreground`, `text-muted-foreground` | `text-white` |
| Gold CTA | `text-white` | `text-foreground` |

> **GOTCHA (iter Apr 18):** `UserMenu` sign-in button used `text-foreground` on the green navbar — invisible on white text over dark green because `--foreground` is dark in light mode. Fix: always use `text-white/90` or explicit hex on dark backgrounds.

## Button patterns — copy these exactly

**Primary CTA (gold gradient):**
```tsx
<button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
  style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 15px rgba(212,168,71,0.3)" }}>
  Get in Touch
</button>
```

**Icon button in navbar (circle with white/20 border):**
```tsx
<button className="relative w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white/80 hover:text-white">
  <Icon className="h-4 w-4" />
</button>
```

**Ghost button on green (outlined, low emphasis):**
```tsx
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all border border-white/20">
  Sign in
</button>
```

**Card action button (on white cards):**
```tsx
<button className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
  <Icon className="h-3 w-3" />
</button>
```

**Tab button (active/inactive):**
```tsx
<button className={tab === "x" ? "bg-[#0B3D2E] text-white" : "bg-background text-muted-foreground hover:text-foreground"}>
```

## Form inputs

Match existing inputs in `SignInClient.tsx`:
```tsx
<input className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
```

## Cards

```tsx
<div className="bg-card border border-border/50 rounded-2xl shadow-xl p-8">
  ...
</div>
```

Property cards use `rounded-xl`, inquiry/auth cards use `rounded-2xl`. Hovers: `hover:shadow-xl hover:-translate-y-1` on clickable cards.

## Typography

- Headings: `font-bold text-foreground`, sizes `text-2xl` (page title) → `text-sm` (card title).
- Body: `text-sm text-foreground` or `text-xs text-muted-foreground` for secondary.
- Uppercase nav links: `text-[13px] font-medium uppercase tracking-[0.15em]`.
- Price (card): `text-xs font-bold text-primary`.
- Never use arbitrary font sizes below `text-[10px]` — it's unreadable.

## Spacing & radii

- Card padding: `p-4` (small cards) / `p-5` / `p-8` (auth/hero).
- Button padding: `px-3 py-1.5` (compact) / `px-5 py-2.5` (CTA) / `px-6 py-3.5` (full-width).
- Border radii: `rounded-lg` (buttons, tiles) → `rounded-xl` (property cards, inputs) → `rounded-2xl` (auth card, hero) → `rounded-full` (avatars, icon buttons).
- Gaps: `gap-2` (tight), `gap-3` (default), `gap-6` (section spacing).

## Icons

- Library: `lucide-react`. Sizes: `h-3 w-3` (micro) / `h-4 w-4` (default) / `h-5 w-5` (prominent).
- In icon buttons: always match button h-w to give a square tap target.

## Floating elements — **map before you add a new one**

Current `fixed` bottom-right elements (any page):
1. **WhatsApp floating button** — `fixed bottom-* right-*`, `#25D366` circle.
2. **Chat widget** — `data-chat-trigger`, also bottom-right.

> **GOTCHA (iter Apr 18):** Added a red heart favorites button at `fixed bottom-20 right-4` → clashed visually with WhatsApp. Moved to navbar instead.

**Rule:** If you're about to add another `fixed` bottom-* element, don't. Put it in the navbar, a sidebar, or the page content.

## Mobile rules

- Min tap target: `min-h-[44px]`, `min-w-[44px]` (iOS HIG).
- Test at 390×844. No horizontal scroll, no clipped text.
- Mobile nav is fullscreen overlay, not a drawer — see `Navbar.tsx` mobile menu.

## Design cohesion checklist (before committing UI work)

1. Does the new element sit next to existing ones? Open the file and copy their classes as a baseline.
2. Is it on a dark/colored bg? Use `text-white*` — never `text-foreground`.
3. Is it a button? It must match the patterns above. No one-off styles.
4. Does it float? Check the floating element map above first.
5. Does it fetch data? Confirm the API endpoint accepts the key type you're passing (usually `slug`, not `_id` — see Tech Directory).

---

## Update protocol

When iterate loop ships:
1. New `src/app/api/**/route.ts` → add row to Internal API routes table
2. New `fixed *` element → add to Floating elements map
3. New CSS token or hex-literal pattern → add to Color tokens or Button patterns
4. New Fastify route consumed → add to External API table (grep `/Users/zoop/binayah-api/src/routes/` for truth)
5. New "gotcha" encountered → add to the relevant section with date

Keep total file under 300 lines. If it grows past, split §2 (style guide) into its own file.
