# Binayah Properties — Design System

**The definitive reference for Binayah's visual language.** Every token below is verified against the actual codebase. Designer and DEV agents treat this as authoritative for Binayah-specific decisions.

Read this alongside `.claude/DESIGN_PRINCIPLES.md` — principles set the universal quality bar; this file says how Binayah specifically expresses it.

---

## Colors — semantic tokens (HSL)

Defined in `src/app/globals.css`. All values are HSL.

### Light mode (default)

| Token | Value | Meaning |
|---|---|---|
| `--background` | `hsl(40 20% 98%)` | Page background |
| `--foreground` | `hsl(200 25% 10%)` | Body text |
| `--primary` | `hsl(168 100% 15%)` | Brand green — deep forest |
| `--primary-foreground` | `hsl(0 0% 100%)` | Text on primary |
| `--accent` | `hsl(43 60% 55%)` | Gold — used for labels, highlights, accents |
| `--accent-foreground` | `hsl(0 0% 100%)` | Text on gold |
| `--secondary` | `hsl(43 55% 93%)` | Cream/sand secondary |
| `--muted` | `hsl(40 15% 94%)` | Subtle background |
| `--muted-foreground` | `hsl(200 10% 45%)` | Muted body text |
| `--card` | `hsl(0 0% 100%)` | Card surface |
| `--border` | `hsl(40 15% 88%)` | Dividers |
| `--input` | `hsl(40 15% 88%)` | Form input border |
| `--ring` | `hsl(168 60% 28%)` | Focus ring — green-tinted |
| `--destructive` | `hsl(0 84.2% 60.2%)` | Error / delete |

### Dark mode

| Token | Value |
|---|---|
| `--background` | `hsl(200 25% 6%)` |
| `--foreground` | `hsl(40 20% 95%)` |
| `--primary` | `hsl(168 100% 20%)` |
| `--card` | `hsl(200 20% 10%)` |
| `--border` | `hsl(200 15% 18%)` |
| `--ring` | `hsl(168 55% 40%)` |

### Pulse theme (AI market section, dark)

Isolated dark theme for `/pulse` — does NOT inherit from the main dark mode.

| Token | Value |
|---|---|
| `--pulse-bg` | `hsl(168 30% 8%)` |
| `--pulse-surface` | `hsl(168 22% 13%)` |
| `--pulse-surface-hover` | `hsl(168 22% 16%)` |
| `--pulse-border` | `hsl(168 20% 20%)` |
| `--pulse-border-hover` | `hsl(43 55% 55%)` |
| `--pulse-gold` | `hsl(43 55% 55%)` |
| `--pulse-gold-light` | `hsl(43 60% 62%)` |
| `--pulse-gold-dark` | `hsl(43 50% 45%)` |
| `--pulse-green` | `hsl(160 60% 30%)` |
| `--pulse-green-light` | `hsl(160 55% 42%)` |
| `--pulse-red` | `hsl(0 72% 51%)` |
| `--pulse-text` | `hsl(40 20% 95%)` |
| `--pulse-text-muted` | `hsl(168 10% 60%)` |
| `--pulse-text-dim` | `hsl(168 10% 42%)` |

---

## Gradients

### Primary brand gradients

| Name | Value | Used on |
|---|---|---|
| **Brand Green** | `linear-gradient(135deg, #0B3D2E, #1A7A5A)` | Primary CTAs, search buttons, navbar (solid state + mobile menu), dropdown menus, tab active state |
| **Gold / Amber** | `linear-gradient(to right, #D4A847, #B8922F)` | Contact CTAs, gold accent buttons, boxShadow `0 4px 20px rgba(212,168,71,0.3)` |
| **WhatsApp** | `linear-gradient(to right, #25D366, #1DA851)` | WhatsApp CTAs, floating WhatsApp button |

### Helper / subtle gradients (in-code)

| Name | Value | Used on |
|---|---|---|
| **Charcoal** | `linear-gradient(135deg, #1A1F2E 0%, #0F1218 50%, #0D1015 100%)` | Dark premium sections (ValuationCTA). |

### Usage notes

> **The brand green gradient is exactly `linear-gradient(135deg, #0B3D2E, #1A7A5A)` — copy it verbatim.** Do not change the angle, approximate the hex values, or add stops. It is the ONLY brand green gradient — there is no mobile-only variant. There are exactly three legitimate green families in this codebase:
> 1. **Brand green** — `#0B3D2E` / `#1A7A5A` (gradient stops, also used as solid fills via CSS vars `--primary`)
> 2. **WhatsApp green** — `#25D366`, `#1DA851`, `#22c55e` (hover). Only for WhatsApp UI. Never use for brand elements.
> 3. **Light/muted greens** — CSS vars only: `--ring`, `--pulse-green`, `--pulse-green-light`. Never hardcoded.
>
> Any other green hex in the codebase is wrong. REVIEWER flags it as `severity: "major"`, `category: "design"`.

- Hardcoded hex values `#0B3D2E`, `#1A7A5A`, `#D4A847`, `#B8922F`, `#25D366`, `#1DA851` are brand colors NOT in CSS custom properties — they're inline `style={}` props. Copy them exactly; never approximate.

---

## Typography

### Font stack
- **All text:** Plus Jakarta Sans (`var(--font-jakarta)`), fallback `sans-serif`. Set globally in `globals.css`.
- **Display weights:** 700 (bold) for headings. 400 (regular) for body.

### Scale (Tailwind classes — as used)

| Role | Class | Typical use |
|---|---|---|
| H1 page title | `text-4xl md:text-5xl font-bold` | "The Art of Luxury Living" |
| H2 section title | `text-3xl font-bold` | "Featured Properties" |
| Section label (eyebrow) | `text-xs uppercase tracking-[0.3em] text-accent font-semibold` | "What We Offer" |
| Body | `text-base text-muted-foreground leading-relaxed` | Paragraph copy |
| Nav links | `text-[13px] font-medium uppercase tracking-[0.15em]` | Primary nav |

### Voice conventions
- Headings are short and declarative. No ending punctuation.
- Section labels are always-caps with wide letter-spacing — they're labels, not sentences.
- Body uses muted-foreground; only special callouts use foreground.

---

## Layout

| Token | Value | Use |
|---|---|---|
| Navbar container | `max-w-[1600px]` | Full-width nav |
| Content sections | `max-w-6xl` (1152px) | Marketing pages, default content |
| Narrow content | `max-w-4xl` (896px) | Focused forms, narrow text content |
| Detail/admin pages | `max-w-5xl` / `max-w-7xl` | ProfileClient uses `max-w-5xl`; project detail uses `max-w-7xl` |
| Footer | `max-w-6xl` | Standard footer width |

### Spacing conventions
- Section padding: `py-16 sm:py-24`
- Horizontal padding: `px-4 sm:px-6`
- Grid gaps: `gap-6` to `gap-10` (never `gap-4` for main grids — feels cramped)
- Border radius: `0.5rem` (`--radius`). Compounds to `lg`/`md`/`sm` via Tailwind config.

---

## Buttons

### Primary (Brand Green gradient)
```tsx
<button
  className="px-6 py-3 rounded-lg text-white font-semibold"
  style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
>
  Find Properties
</button>
```
Hover: the class `hover:-translate-y-0.5` is the standard lift (used 15+ times across components).

### Gold (Contact / secondary CTA)
```tsx
<button
  className="px-6 py-3 rounded-lg text-white font-semibold"
  style={{
    background: "linear-gradient(to right, #D4A847, #B8922F)",
    boxShadow: "0 4px 20px rgba(212,168,71,0.3)"
  }}
>
  Get in Touch
</button>
```

### WhatsApp (for WhatsApp CTAs only, never general green)
```tsx
<a className="... bg-[#25D366] hover:bg-[#22c55e] text-white ...">
  Chat on WhatsApp
</a>
```

### Secondary / Outlined
```tsx
<button className="px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground">
  Learn More
</button>
```

### Social icon / round icon button
```tsx
<button className="w-9 h-9 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center">
  <Icon className="h-4 w-4 text-white" />
</button>
```

**Tap-target minimum on mobile:** 44×44px. Smaller icons get padding to reach that bound.

---

## Glass / Frosted surfaces

Verified usage in components. Three variants:

### Light glass (hero search bar, scrolled navbar, inquiry form overlay)
```tsx
className="backdrop-blur-md bg-white/20 border border-white/30"
```

### Dark glass (pulse dashboard panels, dark cards)
```tsx
className="backdrop-blur-xl bg-black/40 border border-white/10"
```

### Green glass (gallery/brochure buttons on hero images)
```tsx
className="backdrop-blur-sm bg-white/10 border border-white/20"
```

---

## Pulse — special CSS classes (dark-theme section only)

Defined in `globals.css`. Use on pulse surfaces only.

| Class | What it does |
|---|---|
| `.pulse-glass` | Dark glass surface with subtle border glow |
| `.pulse-glass-hover` | Adds hover state — border shifts to gold |
| `.pulse-gold-shimmer` | Diagonal gold gradient sweeps across on hover |
| `.pulse-gold-shimmer::after` | The sweep pseudo-element |

---

## Animations

### Defined in Tailwind config / tailwindcss-animate plugin

| Name | Duration | Use |
|---|---|---|
| `accordion-down` | 0.2s ease-out | Radix accordion expand |
| `accordion-up` | 0.2s ease-out | Radix accordion collapse |
| `fade-in` | via plugin | Section reveal |
| `slide-up` | via plugin | Card reveal |
| `scale-in` | via plugin | Modal/popover entry |

### Hover conventions
- **Lift:** `hover:-translate-y-0.5` + transition duration ~150ms
- **Scale:** `hover:scale-[1.01]` for cards, `hover:scale-105` for small buttons
- **Shadow deepen:** `hover:shadow-xl` on cards with existing `shadow-md`

### Framer Motion usage
Used for page-level transitions (sections fading in on scroll). Not used for micro-interactions — those use Tailwind hover classes.

---

## Patterns (reusable components/effects)

### `<ParticleConstellation />`
Canvas-based animated particle background. Lives at `src/components/ParticleConstellation.tsx`. Used on the homepage hero for a high-tech/premium feel. Do NOT add new instances on every page — it's a signature element; overuse dilutes it.

### Section label pattern
Every marketing section starts with:
1. Small uppercase label in accent (gold) color
2. Bold heading (h2)
3. Muted description paragraph
4. Content grid

```tsx
<div>
  <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold">Our Services</p>
  <h2 className="text-3xl font-bold mt-3">Why Binayah</h2>
  <p className="text-base text-muted-foreground leading-relaxed mt-4">Lorem ipsum...</p>
  <div className="grid md:grid-cols-3 gap-6 mt-10">...</div>
</div>
```

### Dot pattern background (subtle texture)
`radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)` at 0.03–0.04 opacity. Used on green navbar and hero sections.

### Floating elements map
Always check before adding a new fixed-positioned element:
- **WhatsApp FAB** — bottom-right, `fixed bottom-6 right-6`
- **AI Chat widget** — bottom-right variant, toggles open
- **Cookie banner** — bottom, full-width strip

Never add a 4th floating element on the same page — they stack and cover each other.

---

## Copy voice

- **Second-person, warm, specific.** "Save this search" not "Submit". "Nothing saved yet — heart a property to see it here" not "No results".
- **Avoid jargon.** "Get in Touch" not "Submit Inquiry". "List your property" not "Create listing".
- **Numbers matter.** Prices always use thousand separators. Currency always `AED` prefix (e.g. `AED 1.5M`, `AED 450K`).
- **Empty states teach.** Never "No items" — always a sentence explaining what should appear and how to make it appear.

---

## Universal UI conventions — use these, do not reinvent

Every pattern below has a universally-understood convention. Designer and DEV MUST use the convention, not a custom variant, unless there's an explicit principled reason documented. Reinventing toggles, checkboxes, or confirmations costs users cognitive load for zero benefit.

| Need | Convention — use this | Never |
|---|---|---|
| Binary on/off (single setting) | **Sliding pill switch** (iOS-style toggle). Green/primary fill when on, gray when off. 44px tap target. | Checkbox for "enable X" settings. Buttons that toggle. Custom chevron switches. |
| Multi-choice (one of many) | **Radio buttons** OR **segmented pill group** | Multiple switches for mutually-exclusive options |
| Multi-select (any of many) | **Checkboxes** with labels. Label is clickable. | Switches for a list of items (switches imply on/off of ONE thing) |
| Yes/No confirmation | **Modal with two buttons** — destructive action red, cancel muted. Destructive action NOT default. | Inline buttons without confirmation for destructive ops |
| Destructive confirmation (delete, remove) | Modal with typed confirmation for account-level; simple modal for item-level. Red primary button labeled with the verb ("Delete 3 properties"). | Generic "OK/Cancel" labels |
| Loading | **Spinner** (short waits <2s) or **skeleton** (longer waits, known shape). Never both. | Blank screen. Progress bar for unknown duration. |
| Error (inline) | **Red-bordered field + text below**, specific message. Icon optional. | Tooltips. Generic "Error occurred". Alert dialogs for form validation. |
| Success | **Green toast** (transient) OR **green banner** (persistent until dismissed/navigated). | Modal dialog for "Saved!" |
| Required field | **Asterisk after label** (`Email *`) or `(required)` hint. | Red label without indicator. Inconsistent across forms. |
| Close (modal, drawer, dismissable item) | **X icon top-right**, 24-32px tap area | "Close" text button only. Bottom "Close" is fine AS SUPPLEMENT, not replacement. |
| Expand/collapse | **Chevron down/up** or **+/-** (accordion). | Arrows pointing left/right. |
| Sort/filter | **Dropdown** with current selection visible. Mobile: **bottom sheet**. | Custom pickers that hide the current value. |
| External link | `↗` icon OR `target="_blank"` with subtle visual hint | No indication |
| Rating | **Stars** (5-star scale, half-star allowed) | Numeric-only 0-100 |
| Search | **Magnifying-glass icon + input**. Placeholder text descriptive ("Search properties, communities..."). | Just an input box without icon |
| Dropdown menu (click-triggered) | **Chevron down next to label** | Arrow right |
| Navigation tabs | **Underline indicator for active**, horizontal line above inactive is OK. Mobile: **horizontal scroll** if tabs overflow. | Pills for primary tabs (pills fine for secondary/filter). Dropdowns for 3-4 tabs. |
| Input with icon | Icon OUTSIDE the input border to the left; input text doesn't overlap | Icon inside border, text jumping over it |
| Slider for a range | **Dual-handle range slider** for price/size; single-handle for quantity. | Two separate number inputs for a range. |
| Tooltips | **On-hover for desktop, tap-triggered for mobile**. Dismiss on tap-outside. | Always-visible tooltips. |
| Date picker | **Calendar popover** for past/future dates; **native input** on mobile. | Custom dropdowns of day/month/year. |

**When to break convention:**
- You have a product-level reason (not aesthetic) — e.g., a toggle that triggers 3 subsequent fields is better as a radio because it implies structure. State the reason explicitly in the designer brief under `doNot`/`whyThisWay`.
- The convention doesn't exist yet (genuinely novel surface). Even then, test recognition against 2–3 users mentally before committing.

If designer's brief proposes a non-conventional control where a conventional one exists, QA flags it: `severity: "major"`, `category: "design"`, `principle: "use conventions users already know"`.

---

## What's NOT in this system (by deliberate omission)

- **Dark mode UI surfaces** — tokens exist but no pages are currently designed for dark. Do not ship dark-mode UI without explicit user decision.
- **Comprehensive icon style** — the codebase uses `lucide-react` (outlined, 2px stroke). No custom icon system.
- **Illustration library** — none exists. Empty states use icons + text, not illustrations.
- **Motion tokens beyond hover + accordion** — most animation is ad-hoc in Framer Motion. If designer proposes a new motion language, capture it here on ship.

---

## Update protocol

When a feature introduces a NEW token, pattern, or convention, append it here (not into PROJECT_CONTEXT.md — that's the index; this file is the canonical design source). The terminator also auto-merges `state.contextGaps` entries when `section: "DESIGN_SYSTEM"` is specified.
