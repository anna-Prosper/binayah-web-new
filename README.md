# Binayah Properties — Next.js + MongoDB

Dubai real estate platform migrated from **Vite + React + Supabase** to **Next.js 15 + Node.js + MongoDB**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19) |
| Database | MongoDB + Mongoose |
| Styling | Tailwind CSS + shadcn/ui (48 components) |
| Animation | Framer Motion |
| AI | OpenAI GPT-4o-mini (streaming SSE) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | TanStack React Query v5 |

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage (19 sections)
│   ├── layout.tsx                # Root layout + metadata
│   ├── providers.tsx             # Client providers (QueryClient, Tooltip, Toaster)
│   ├── globals.css               # CSS variables + Tailwind
│   ├── not-found.tsx             # 404 page
│   ├── about/page.tsx            # About Binayah
│   ├── communities/
│   │   ├── page.tsx              # All communities
│   │   └── [slug]/page.tsx       # Community detail + projects
│   ├── contact/page.tsx          # Contact form
│   ├── news/
│   │   ├── page.tsx              # News articles
│   │   └── [slug]/page.tsx       # Article detail
│   ├── off-plan/page.tsx         # All off-plan projects
│   ├── project/[slug]/page.tsx   # Project detail (2200 lines)
│   ├── services/page.tsx         # Property management services
│   └── api/
│       ├── projects/route.ts     # GET /api/projects?community=X&limit=N
│       ├── projects/[slug]/route.ts # GET /api/projects/:slug
│       ├── chat/route.ts         # POST /api/chat (streaming SSE)
│       ├── property-matcher/route.ts # POST /api/property-matcher (streaming)
│       └── inquiries/route.ts    # POST /api/inquiries
├── components/                   # 23 feature components
│   ├── AIChatWidget.tsx          # Floating AI chat with streaming
│   ├── AIPulseBanner.tsx         # Live stats ticker
│   ├── FeaturedProperties.tsx    # Top 3 projects (from API)
│   ├── HeroSection.tsx           # Smart search parser + parallax
│   ├── MarketDashboard.tsx       # Recharts market data
│   ├── Navbar.tsx                # Mobile-responsive nav
│   ├── OffPlanSection.tsx        # Latest 4 off-plan (from API)
│   ├── PropertyMatcher.tsx       # AI 7-step wizard
│   ├── ROICalculator.tsx         # Investment calculator
│   └── ui/                       # 48 shadcn/ui components
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── mongodb.ts                # MongoDB connection singleton
│   ├── seed.ts                   # Database seeder
│   └── utils.ts                  # cn() helper
└── models/
    └── Project.ts                # Mongoose schema (60+ fields)
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and OpenAI API key

# Seed sample data (optional — requires running MongoDB)
npx tsx src/lib/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/binayah    # MongoDB connection string
OPENAI_API_KEY=sk-...                            # OpenAI API key for AI features
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=971549988811
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List projects. Query: `?community=X&status=Y&limit=N` |
| GET | `/api/projects/[slug]` | Single project by slug |
| POST | `/api/chat` | AI chat (streaming SSE) |
| POST | `/api/property-matcher` | AI property recommendations (streaming SSE) |
| POST | `/api/inquiries` | Submit contact inquiry |

## Migration from Supabase

### What Changed

| Before | After |
|--------|-------|
| Vite + React Router | Next.js 15 App Router |
| Supabase PostgreSQL | MongoDB + Mongoose |
| Supabase Edge Functions (Deno) | Next.js API Routes |
| `supabase.from("projects")` | `fetch("/api/projects")` |
| Lovable AI Gateway | OpenAI API (configurable) |
| `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` |
| `<Link to="">` | `<Link href="">` |
| `useNavigate()` | `useRouter()` |
| snake_case DB fields | camelCase Mongoose fields |
| Static asset imports | `/public/assets/` paths |

### Database Field Mapping

All PostgreSQL snake_case columns → Mongoose camelCase:
- `developer_name` → `developerName`
- `starting_price` → `startingPrice`
- `image_gallery` → `imageGallery`
- `completion_date` → `completionDate`
- `payment_plan_summary` → `paymentPlanSummary`
- (etc. for all 60+ fields)

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### MongoDB Atlas

1. Create free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Set `MONGODB_URI` to your Atlas connection string
3. Whitelist Vercel's IP ranges (or use `0.0.0.0/0`)

## TODO

- [ ] Enable strict TypeScript (`strict: true` in tsconfig.json)
- [ ] Decompose ProjectDetail into ~10 smaller components
- [ ] Add MongoDB collections for: communities, news articles, inquiries
- [ ] Add Next.js Image optimization for external images
- [ ] Add admin dashboard for CRUD operations
- [ ] Add sitemap.xml and robots.txt generation
- [ ] Add Google Analytics / Meta Pixel
- [ ] Configure ISR for project pages
- [ ] Add Cloudinary for image hosting
