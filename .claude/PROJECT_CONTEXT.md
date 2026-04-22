# Project Context — binayah-properties

**Read this file on iteration 1 of every iterate loop.** It saves you from rediscovering contracts, tokens, and gotchas that caused prior bugs. Update it at ship time when new routes/components/patterns land.

---

# §0 — Where to find things (read this first)

| What | Path |
|---|---|
| This context file | `.claude/PROJECT_CONTEXT.md` |
| **Design system (canonical)** | **`.claude/DESIGN_SYSTEM.md`** — all color tokens, gradients, buttons, glass variants, animations, copy voice |
| Design principles (quality bar) | `.claude/DESIGN_PRINCIPLES.md` — principles; DESIGN_SYSTEM.md expresses them for Binayah |
| Active iterate state | `.iterate/state.json` |
| Past iteration archives | `.iterate/state.*.json` (timestamped) |
| Iterate metrics log (append-only) | `.iterate/metrics.jsonl` |
| Dev server PID | `.iterate/devserver.pid` |
| Abort flag | `.iterate/abort` |
| Dev server log (orchestrator) | `/tmp/iterate-dev-server.log` |
| Auto-memory index | `/Users/zoop/.claude/projects/-Users-zoop-binayah-properties/memory/MEMORY.md` |
| Workspace-wide CLAUDE.md | `/Users/zoop/CLAUDE.md` |
| Shared credentials | `/Users/zoop/.env.shared` |

## Codebase map — use before `grep` for first-pass navigation

```
src/
├── app/
│   ├── [locale]/                     # All user-facing pages (next-intl locale-wrapped)
│   │   ├── layout.tsx                # Root layout for localized routes
│   │   ├── page.tsx                  # Homepage
│   │   ├── profile/                  # /profile — signed-in area (hero, tabs: saved/submissions/subs)
│   │   ├── admin/                    # /admin/* dashboard (landing + inquiries + submissions + subscriptions)
│   │   │   └── [token]/              # Hidden admin login URL (OAuth + email allowlist)
│   │   ├── off-plan/                 # Off-plan project listing/detail
│   │   ├── project/[slug]/           # Project detail (multi-property-type tabs)
│   │   ├── property/[slug]/          # Individual property detail
│   │   ├── news/[slug]/              # News articles
│   │   ├── communities/              # Community landing pages
│   │   ├── developers/               # Developer pages
│   │   ├── buy/ | rent/              # Listing pages by transaction type
│   │   ├── list-your-property/       # Seller submission flow
│   │   ├── construction-updates/
│   │   ├── pulse/                    # AI market pulse feature
│   │   ├── about/ | contact/
│   │   ├── forgot-password/ | reset-password/
│   │   └── error.tsx
│   └── api/                          # Next.js API routes (most proxy to Fastify)
│       ├── auth/                     # NextAuth handlers (Google OAuth)
│       ├── favorites/hydrate/        # Auth-gated favorites hydration
│       ├── list-your-property/       # Submission capture
│       ├── notifications/            # User notifications
│       ├── project-subscriptions/
│       └── test/auth-seed/           # Test-only auth seed (production-guarded)
├── components/                       # ~40+ components; notable ones:
│   ├── Navbar.tsx                    # Global nav — desktop + mobile cluster + fullscreen menu
│   ├── UserMenu.tsx                  # Signed-in avatar dropdown
│   ├── FavoritesDrawer.tsx           # Saved-properties drawer (opens via window event)
│   ├── NotificationsBell.tsx         # Navbar bell + badge
│   ├── PropertyActions.tsx           # ⚠ Favorites state hub — useFavorites() lives here, NOT in src/hooks/
│   ├── SubscribeButton.tsx           # Project-level subscribe
│   ├── ProjectSubscribeSection.tsx
│   ├── SavedPropertiesSection.tsx    # /profile Saved tab grid
│   ├── Footer.tsx
│   ├── HeroSection.tsx | HomePageClient.tsx
│   ├── FeaturedProperties*.tsx       # Server + Client + Section variants
│   ├── ListPropertyForm.tsx
│   ├── AIChatWidget.tsx | AIPulseBanner.tsx
│   ├── InquirySection.tsx | NewsSection.tsx | CommunitiesSection.tsx
│   ├── NewsletterStrip.tsx | CookieConsent.tsx | CryptoBanner.tsx
│   └── (many more — use Glob "src/components/*.tsx" if hunting specific)
├── hooks/
│   ├── useProjectSubscriptions.ts    # Subscription state
│   └── use-toast.ts                  # ⚠ favorites hook is NOT here — see PropertyActions.tsx
├── lib/
│   ├── auth.ts                       # NextAuth config
│   ├── api.ts                        # apiUrl() — Fastify host builder
│   └── session.ts                    # Session helpers
├── i18n/                             # next-intl config
├── data/                             # Static data (communities, developers)
├── types/                            # Shared TS types
├── navigation.ts                     # next-intl navigation wrappers (useRouter etc.)
└── middleware.ts                     # Locale routing middleware
```

**Directions — where does X live?**
- **Favorites state?** `components/PropertyActions.tsx` (NOT `hooks/`). Import `useFavorites` from there.
- **Navbar + mobile menu?** `components/Navbar.tsx` — both are in the same file.
- **Admin UI?** `app/[locale]/admin/*`. Shared header is `AdminHeader.tsx`.
- **Style tokens / design vocabulary?** `.claude/DESIGN_SYSTEM.md` is **canonical** (colors, gradients, buttons, glass, animations). `app/globals.css` is the CSS source; §2 below has codebase-specific gotchas and locked patterns.
- **API base URL?** `lib/api.ts` — `apiUrl(path)` builds `https://binayah-api.onrender.com{path}`.
- **Fastify routes (external)?** Live in `/Users/zoop/binayah-api/src/routes/` (different repo).
- **Tests?** No formal test suite yet. QA uses Playwright MCP against dev server.
- **Env vars?** `.env.local` (local), Vercel dashboard (staging/prod). Shared creds at `/Users/zoop/.env.shared`.
- **Router hooks?** `src/navigation.ts` — use `useRouter` from here, NOT `next/navigation`, to preserve locale.

**When an iterate run starts, read in this order:** (1) this file, (2) `.iterate/state.json` (for current task + stage), (3) the most recent archived `iterate-state.*.json` if you need prior stage history. Past DEV diffs, REVIEW findings, and QA bug lists live inside those archives — grep them before rediscovering the same issue.

## QA environment — constant facts, do NOT re-check these each run

**Playwright:** v1.59.1, already installed. Do NOT reinstall or version-check.
- Use Playwright MCP (`mcp__playwright__*`) — preferred for QA agents.
- Node scripts: `node -e "const { chromium } = require('@playwright/test'); ..."` (not npx ts-node).

**Dev server:** `http://localhost:3000` — orchestrator starts it. Trust it's live.

**Auth seed:** `GET http://localhost:3000/api/test/auth-seed` → `{"ok":true,"user":"qa@test.binayah.com"}`
- Sets a session cookie. Use for any authenticated-page tests (profile, favorites, etc).
- Blocked in production — safe to call in local QA.

**Atlas DNS unreachable in sandbox:** Routes hitting MongoDB directly will 500. Expected — mark `severity: "env"`, do not fail the stage. Vercel staging has real DB — QA-LIVE catches it.

**Package manager:** `npm`. Build: `npm run build`. Dev: `npm run dev` (Turbopack).

**TypeScript:** Strict mode. `npx tsc --noEmit` must pass. No `any` on new props.

## Frequently-missing dev packages (already present, do NOT reinstall)

- `@playwright/test` v1.59.1
- `typescript`, `@types/react`, `@types/node`

If an agent drops an orphan `*.spec.ts` at repo root, **delete it after the run** — breaks `tsc --noEmit`.

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

- **`localePrefix: "as-needed"`**, locales `[en, ru, zh, ar]`, default `en`. (kz/in removed Apr 2026)
- **Language switching:** use `router.replace(pathname, { locale })` from `@/navigation` — NOT `window.location.href`. Raw href causes double-prefix bugs.
- **Cookie:** `BINAYAH_LOCALE` (1yr, path=/) — written in middleware for all 4 code paths including English.
- **RTL:** `<html dir="rtl">` for Arabic locale, set in `src/app/[locale]/layout.tsx`.
- **Geo-detection:** `CF-IPCountry` / `X-Vercel-IP-Country` → 26 countries mapped (CN/TW/HK/SG→zh, MENA→ar, RU/KZ/BY/UA etc→ru).
- **sitemap.ts:** has its own `LOCALES` const (line 5) — must be kept in sync with routing.ts when locales change.
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

> **`.claude/DESIGN_SYSTEM.md` is the canonical source** for all design tokens, gradients, button patterns, glass variants, animations, and copy voice. Read it first for any UI work. This §2 covers **codebase-specific gotchas, locked implementation patterns, and component maps** — things the design system doesn't track. Don't duplicate design-system content here; add implementation gotchas only.

The golden rule: **match what's next to you**. If your button sits next to an existing button, copy the existing button's classes and modify only what you must.

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

## Project subscribe — components map

Three surfaces, one source of truth (`/api/project-subscriptions`):

| Component | File | Where it renders | Shape |
|---|---|---|---|
| `SubscribeButton` | `src/components/SubscribeButton.tsx` | hero bar, enquire success CTA, mobile thank-you | small pill button + popover email capture |
| `ProjectSubscribeSection` | `src/components/ProjectSubscribeSection.tsx` | project detail page, under the enquire form | full-width card with 3 benefit bullets + inline email form |
| `useProjectSubscriptions` | `src/hooks/useProjectSubscriptions.ts` | reads current user's subs, listens for `subscriptions-update` event | hook |

All three dispatch `window.dispatchEvent(new Event("subscriptions-update"))` after a mutation so the bell, section, and button stay in sync. If you add a new surface, reuse the hook + dispatch the same event.

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

## New components (shipped Apr 2026 — mobile + profile + admin)

| Component | File | Purpose |
|---|---|---|
| `SavedPropertiesSection` | `src/components/SavedPropertiesSection.tsx` | Inline saved-properties grid on profile page. Reuses `useFavorites()` + `/api/favorites/hydrate`. Stale removal in `useEffect`. Remove uses stored-id lookup: `ids.find(id => id === p._id \|\| id === p.slug)`. |
| `AdminHeader` | `src/app/[locale]/admin/AdminHeader.tsx` | Shared client component for all 4 admin pages. Props: `{ title, backHref? }`. Green `#0B3D2E` bar, avatar dropdown with sign-out. |
| `InquiriesMobileList` | `src/app/[locale]/admin/inquiries/InquiriesMobileList.tsx` | `"use client"` accordion cards for mobile admin inquiries view (`md:hidden`). |
| `SubmissionsMobileList` | `src/app/[locale]/admin/submissions/SubmissionsMobileList.tsx` | `"use client"` accordion cards for mobile admin submissions view (`md:hidden`). |
| `SubscriptionsMobileList` | `src/app/[locale]/admin/subscriptions/SubscriptionsMobileList.tsx` | `"use client"` accordion cards for mobile admin subscriptions view (`md:hidden`). |

## Key patterns locked in (do not change without intent)

- **FavoritesDrawer is mounted ONCE** in `src/app/[locale]/layout.tsx`. Do NOT import/render it in any page component — it will double-mount and cause two overlapping drawers. To open it from anywhere: `window.dispatchEvent(new Event('open-favorites-drawer'))`.
- **UserMenu `compact` prop** — pass `compact={true}` in the mobile navbar header to get the icon-only 36px version. Desktop always uses default (full dropdown).
- **Profile tabs** are URL-driven: `/profile?tab=saved` (default), `/profile?tab=submissions`, `/profile?tab=subscriptions`. Use `useSearchParams` + `router.replace` from `@/navigation`.
- **Profile hero stats** — plain `<span>` chips, NOT clickable buttons. Tab navigation lives in the sticky tab bar below the hero only.
- **Admin mobile pattern** — desktop table: `hidden md:block`. Mobile cards: `md:hidden`. Never put tables inside `overflow-x-auto` on mobile; use the card fallback.


## Update protocol

When iterate loop ships:
1. New `src/app/api/**/route.ts` → add row to Internal API routes table
2. New `fixed *` element → add to Floating elements map (this §2)
3. New CSS token, gradient, or button pattern → add to **`.claude/DESIGN_SYSTEM.md`** (not here)
4. New Fastify route consumed → add to External API table (grep `/Users/zoop/binayah-api/src/routes/` for truth)
5. New "gotcha" encountered → add to the relevant section with date

Keep total file under 300 lines. If it grows past, split §2 (style guide) into its own file.
