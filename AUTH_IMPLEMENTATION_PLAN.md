# Auth Implementation Plan — for Sonnet

**Goal:** Add NextAuth with Google OAuth, wire persistent favorites to MongoDB, add user menu, "list your property" form, and a basic profile page.

**Env already set** (both `.env.local` and Vercel production + preview):
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL=https://staging.binayahhub.com`
- `NEXTAUTH_SECRET` (already generated)
- `MONGODB_URI` (existing — points to `binayah_web_new_dev`)

**Redirect URIs already registered in Google Cloud Console:**
- `https://staging.binayahhub.com/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google`

**Frontend domain:** `https://staging.binayahhub.com`
**Backend API:** `https://binayah-api.onrender.com` (Fastify, separate repo — do NOT touch for auth; all NextAuth code stays in the Next.js app)

---

## Phase 1 — NextAuth + Google OAuth

### 1.1 Install deps
```bash
cd /Users/zoop/binayah-properties
npm i next-auth @auth/mongodb-adapter mongodb
```

### 1.2 Create Mongo client singleton
**File:** `src/lib/mongodb.ts`
```ts
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const g = global as unknown as { _mongoClientPromise?: Promise<MongoClient> };
  if (!g._mongoClientPromise) {
    client = new MongoClient(uri, options);
    g._mongoClientPromise = client.connect();
  }
  clientPromise = g._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

### 1.3 NextAuth config
**File:** `src/lib/auth.ts`
```ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, { databaseName: "binayah_web_new_dev" }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: { signIn: "/signin" },
};
```

### 1.4 Route handler
**File:** `src/app/api/auth/[...nextauth]/route.ts`
```ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 1.5 Session provider
**Edit:** `src/app/providers.tsx` — wrap children with `<SessionProvider>` from `next-auth/react`. Keep existing providers (QueryClient, Toaster, etc.) as-is.

### 1.6 Type augmentation
**File:** `src/types/next-auth.d.ts`
```ts
import "next-auth";
declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}
```

### 1.7 Sign-in page
**File:** `src/app/signin/page.tsx` — simple centered card with "Continue with Google" button calling `signIn("google", { callbackUrl: "/" })`. Style to match the site (green gradient, rounded cards).

### 1.8 Verify locally
```bash
npm run dev
# open http://localhost:3000/signin → click Google → should redirect through Google → back to /
```

Check MongoDB — new collections `users`, `accounts`, `sessions` should appear in `binayah_web_new_dev`.

---

## Phase 2 — User menu in Navbar

### 2.1 UserMenu component
**File:** `src/components/UserMenu.tsx`
- Client component using `useSession()`.
- Unauthed: show "Sign in" button → links to `/signin`.
- Authed: show avatar (from `session.user.image`) → dropdown with "My Favorites", "My Profile", "Sign out".
- Match Navbar styling (same font, spacing).

### 2.2 Integrate into Navbar
**Edit:** `src/components/Navbar.tsx` — add `<UserMenu />` in the desktop nav row (near the right side) and inside the mobile drawer menu.

---

## Phase 3 — Persistent favorites

**Current:** `src/components/PropertyActions.tsx` stores favorites in `localStorage` (key `binayah_favorites`). Drawer `src/components/FavoritesDrawer.tsx` reads via `useFavorites()` hook.

**Strategy:** hybrid — unauthed users keep localStorage, authed users sync to DB. On sign-in, merge localStorage into DB then clear localStorage.

### 3.1 API routes
**File:** `src/app/api/favorites/route.ts`
- `GET` → returns `{ ids: string[] }` for logged-in user from `favorites` collection.
- `POST` body `{ id: string }` → adds id.
- `DELETE` body `{ id: string }` → removes id.
- All require `getServerSession(authOptions)`; return 401 if not logged in.

**Favorites schema** (Mongo collection `favorites`):
```
{ userId: string, propertyIds: string[], updatedAt: Date }
```

### 3.2 Update `useFavorites` hook
**Edit:** `src/components/PropertyActions.tsx`
- Still use localStorage when unauthed.
- When authed: read from `/api/favorites` on mount, write-through to `/api/favorites` on add/remove (optimistic update).
- On login: detect localStorage entries, POST each to `/api/favorites`, then clear localStorage. Do this inside the hook — check `useSession` status change.

### 3.3 Test
- Unauthed: favorite a property → refresh → still there (localStorage).
- Sign in → should merge and sync → refresh → still there (from DB).
- Sign in on another device → favorites should appear.

---

## Phase 4 — "List your property" form

### 4.1 Page
**File:** `src/app/list-your-property/page.tsx`
- Server component wrapper that checks session via `getServerSession`.
- If unauthed, redirect to `/signin?callbackUrl=/list-your-property`.
- Render `<ListPropertyForm />` client component.

### 4.2 Form component
**File:** `src/components/ListPropertyForm.tsx`
Fields: property type (apartment/villa/townhouse/office), listing type (sale/rent), community (text), bedrooms (number), area sqft, asking price AED, description (textarea), phone, optional image upload (skip upload for MVP — leave field note "Our agent will collect images").

### 4.3 Submit endpoint
**File:** `src/app/api/list-your-property/route.ts`
- `POST` — validate auth, validate fields.
- Store in Mongo collection `property_submissions` with `{ userId, userEmail, ...fields, status: "new", createdAt }`.
- Send email via Resend or Nodemailer. **SMTP creds not yet set** — leave a TODO comment and use `console.log` for now. User will provide SMTP later.

### 4.4 Navbar link
Add "List Your Property" link in Navbar for all users (redirect to sign-in if unauthed is handled server-side).

---

## Phase 5 — Profile page + price alerts stub

### 5.1 Profile page
**File:** `src/app/profile/page.tsx`
- Server component, requires auth.
- Shows: avatar, name, email, "sign out" button, list of saved favorites (link to drawer), list of price alerts (empty state for now).

### 5.2 Price alerts schema (stub only — no UI yet)
Mongo collection `price_alerts`:
```
{ userId, filters: { community?, minBeds?, maxPrice?, type? }, createdAt }
```
Leave a TODO: "alerts will be triggered by a cron when new matching listings are created."

---

## Final checks before handoff

1. `npx tsc --noEmit` — zero errors.
2. `npm run build` — succeeds (watch for the old next-intl static-prerender trap: **do not** create non-locale pages without a dynamic segment).
3. Commit with message: `feat: add Google auth + persistent favorites + list-your-property form`.
4. Push to `main` — Vercel auto-deploys.
5. Verify on `https://staging.binayahhub.com`: sign in, favorite, sign out, sign in on another browser, check favorites persist.

## Rules for Sonnet

- **Do not** add UI for price alerts beyond the profile empty state.
- **Do not** touch the Fastify backend (`binayah-api`) for any auth work — everything stays in the Next.js app.
- **Do not** create non-locale `page.tsx` routes without a dynamic segment (causes static prerender crash with next-intl). All new pages here are under `/app/*` directly (no `[locale]` wrapper) because they're new routes — if that triggers the prerender issue, add `export const dynamic = "force-dynamic"` to the page.
- **Database name:** always `binayah_web_new_dev` — explicitly pass `{ databaseName: "binayah_web_new_dev" }` to `MongoDBAdapter`.
- **No SMTP yet:** for emails, `console.log` the payload and add a TODO.
- If blocked or missing env/config, stop and report — don't invent placeholder values.
