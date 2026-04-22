# Design principles — Binayah

These are principles, not rules. Apply them by **reasoning** about the specific surface you are building, not by pattern-matching. A principle earns its keep by forcing you to ask a better question than "does it work?"

The bar is not "real estate category average." The bar is Linear, Airbnb, Stripe, Arc, Vercel. Their ordinary is our ceiling.

---

## Philosophy

**Aim for delight, not adequacy.** "Acceptable" is the enemy. If a user would be mildly impressed, push further until they would screenshot it.

**Benchmark against the best, not the category.** Competitors are mediocre. Measure against best-in-class software UIs. If you would be embarrassed to ship this next to a Linear or Stripe screen, iterate.

**Beauty is structural, not cosmetic.** Typography, spacing, proportion, rhythm, hierarchy — beauty comes from getting the bones right. It cannot be added at the end.

**Novel but obvious.** Innovation must not need explanation. New patterns should feel inevitable within seconds of first contact. If it needs a tooltip to understand, it is not ready.

**Use conventions users already know. Innovation belongs elsewhere.** A sliding pill switch is universally understood as on/off — use it. A red X in a modal corner is universally understood as close — use it. A checkbox is a checkbox. A spinner means loading. Innovate at the level of the PRODUCT experience, not at the level of primitive UI controls. Reinventing a toggle, a dropdown, or a confirmation dialog costs the user cognitive load for zero benefit. Reserve novelty for decisions where convention doesn't exist yet.

**Straightforward beats clever.** Simplicity is a feature. If a user reads a label twice, the design failed. Clever interactions that require onboarding are worse than boring ones that do not.

---

## Visual

**Show the data, not a symbol of it.** When a component represents personal or dynamic data, render that data. An icon is a fallback, not a default. A favorites card that shows three thumbnails of saved items beats a card with a heart icon, every time.

**Every pixel is intentional.** No inherited defaults. Gradients, shadows, radii, borders, timing curves — each is a decision. Tailwind defaults are a starting point, not a finish line.

**Every element earns its space.** If it does not convey information or enable an action, remove it.

---

## Interaction

**Interactivity is life.** Every surface responds — hover lifts, tap scales, scroll parallaxes, state transitions animate. Static UIs feel dead. Motion is not polish; it is the product breathing.

**Feedback under 100ms.** Every input produces visible evidence — hover, scale, color, motion. Silence feels broken.

**Motion has meaning.** Animate causality — what just happened and why. Never animate for decoration.

**Visual affordance is honesty.** If it is interactive, it must look interactive. A flat element that does something lies to the user.

---

## Scale

**Design for scale, not the demo.** Ask: what does this look like at 0, 1, 10, 100, 1000? The interaction pattern must match the real distribution, not the first-use case. A pattern that works at 3 items may collapse at 100.

**Progressive disclosure is kinder than density.** Show what matters now; provide a clear path to more. Never dump everything at once; never hide what is needed.

---

## Copy

**The copy is the UI.** Generic labels ("Submit", "View", "Item", "No results") are placeholders. Specific, human copy is design work, not filler. Empty states, error states, and CTAs are where voice is built.

---

## States

**Empty states are features.** They teach the user what is possible and set expectations. "No results" is a bug; a warm, illustrated empty state with specific guidance is a product decision.

**Error states are trust moments.** An error is where the user decides whether to keep using the product. Write them like a human explaining a problem, not a machine logging it.

---

## Polish

**Sweat the 1%.** A perfectly timed animation, a surprising empty state, a hover easter egg — the details competitors skip are what users remember and share.

**Mobile is the default.** If it cannot be used comfortably with a thumb, it is not done. 44px minimum tap targets, safe areas respected, gestures first-class.

---

## How to apply

Before shipping any UI, ask:

- Would Linear, Airbnb, or Stripe ship this?
- Would a user screenshot it?
- Does it feel alive when I hover, tap, scroll?
- Does it hold up at 0 items and at 1000?
- Is the copy specific to this product, or could I paste it into any app?
- If I remove the frame, does the component still feel intentional — or does it fall apart?

If any answer is "no" or "not really," it is not done.
