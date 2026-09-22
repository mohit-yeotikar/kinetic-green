# Kinetic Green — Homepage Redesign

A production-quality, conversion-led homepage for **Kinetic Green** (Indian electric
mobility manufacturer), built as a static Astro site.

> **Note on imagery:** the hero uses one lightweight, background-removed E-Luna
> product cutout found through a Creative Commons-filtered image search. Other
> vehicle classes, maps, diagrams, icons, and data visuals remain hand-authored
> SVG/CSS. Replace the cutout with Kinetic Green's approved campaign master before
> production launch; the layout does not depend on this temporary source asset.

---

## Project Overview

- **Goal:** a premium automotive-brand homepage that also functions as a lead
  magnet. The visitor path is
  **DISCOVER → EXPLORE → PERSONALISE → CALCULATE → TEST RIDE / ENQUIRE → LEAD**.
- **Primary conversions:** test ride bookings, product enquiry, on-road price
  request, finance enquiry, dealer/fleet/partnership enquiries.
- **Tech:** Astro 7 static output · TypeScript · vanilla TS modules · hand-authored
  SVG/CSS. **No React/Next.js, no client framework runtime.**
- **Deploy target:** Cloudflare Pages (static).

### Header repair — September 2026

- Corrected overlapping KINETIC / GREEN SVG groups and matching viewBox/aspect ratios.
- Removed the duplicate header symbol and kept the full name visible on mobile.
- Navigation switches to the drawer below 1200px to prevent clipped controls.
- Browser regression checks cover 320, 390, 768, 1024, 1200, and 1440px widths,
  wordmark containment, menu open/Escape close, and existing core interactions.
- The broader six-section, product-led redesign is proposed, not yet implemented;
  waiting for direction confirmation. The existing homepage content is unchanged.

### Status

| Area | State |
| --- | --- |
| Build | `npm run build` clean |
| Local serve | PM2 on `:3000`, HTTP 200 |
| Payload (gzipped) | HTML 63 KB · CSS 25 KB · JS 18 KB |
| Hero product image | 89 KB WebP with transparency |
| Sections rendered | 15 |
| Browser QA | Desktop 1440 px + mobile 390 px; no horizontal overflow |
| Interaction smoke test | Explorer, calculator, lead modal, and EV finder pass |
| `/api/lead` endpoint | ❌ Not implemented — leads fall to the offline queue |
| Deploy | ⏸️ **Awaiting choice of deploy path** (see [Deployment](#deployment)) |

---

## Quick start

```bash
npm install
npm run build                 # → dist/
pm2 start ecosystem.config.cjs   # http://localhost:3000
pm2 logs webapp --nostream
```

| Script | Does |
| --- | --- |
| `npm run dev` | Astro dev server (hot reload) |
| `npm run build` | Static build to `dist/` |
| `npm run serve` | Dev server bound to `0.0.0.0:3000` |
| `npm run deploy` | `build && wrangler pages deploy dist` |

---

## Information architecture

Section order is the intended journey, not a component list. Every section ends in
an action, so a visitor can leave the funnel and re-enter it at any level of
commitment.

| # | Section | Component | Job |
| --- | --- | --- | --- |
| 01 | Header | `Header.astro` | Sticky smart nav, retracts on scroll-down |
| 02 | Hero | `Hero.astro` | Positioning + primary test-ride CTA |
| 03 | Conversion bar | `ConversionBar.astro` | Locate → Justify → Convert on one line |
| 04 | Vehicle explorer | `VehicleExplorer.astro` | The lineup, one product at a time |
| 05 | EV finder | `EVFinder.astro` | **Primary lead magnet** — 4 questions → matched vehicle |
| 06 | Savings calculator | `SavingsCalculator.astro` | Transparent cost model |
| 07 | Product story | `ProductStory.astro` | E-Luna in 5 chapters + full spec |
| 08 | India mobility | `IndiaMobility.astro` | Regional context, selectable map |
| 09 | Technology | `Technology.astro` | 6 systems explained plainly |
| 10 | Legacy timeline | `LegacyTimeline.astro` | Company history as eras + counters |
| 11 | Ownership | `Ownership.astro` | Charging / Service / Finance / Dealers |
| 12 | Finance | `Finance.astro` | EMI estimator (shows total interest) |
| 13 | Dealer finder | `DealerFinder.astro` | City/PIN locator + soft lead capture |
| 14 | On-road price | `PriceLead.astro` | Highest-intent pre-purchase lead |
| 15 | Stories + FAQ | `Stories.astro` | Editorial rail + Q&A |
| 16 | Final CTA | `FinalCTA.astro` | 3 routes in descending commitment |
| 17 | Footer | `Footer.astro` | Navigation + honest disclaimer |
| — | Lead modal | `LeadModal.astro` | Multi-step, one decision per step |
| — | Sticky CTA | `StickyCTA.astro` | Mobile-only thumb-reach conversion bar |

### Shared building blocks

`BaseLayout.astro` · `Logo.astro` · `Icon.astro` (~50 inline icons) ·
`VehicleVisual.astro` (the SVG art layer) · `StickyCTA.astro`

---

## Art direction

**Palette:** `--kg-paper #FBFCF8` and mineral mist surfaces now carry most of
page, with `--kg-ink #111714` for typography and `--kg-green #00C853` as the
single action/data accent. Charcoal is reserved for the final conversion and
footer rather than repeated through the journey.

**Editorial light system:** `src/styles/redesign.css` is the cross-component art
direction layer. It replaces the former dark-microsite rhythm with daylight
product stages, quieter technical grids, flat-edged controls, and more measured
type. The component-level CSS remains intact as the functional baseline.

**The Kinetic Green diagonal** — the logo's forward cut — recurs as the design's
signature geometry: hero cut plane, section edges, button sweeps, footer edge.

**Motion** communicates movement, never decoration: reveals travel in the reading
direction, counters ease-out to a precise settle, and every routine is skipped
entirely under `prefers-reduced-motion`. Magnetic CTAs (capped at 4 px) are
pointer-fine only.

### Product imagery and vector fallback

The hero's E-Luna Plus uses an optimized 89 KB transparent WebP product cutout.
`VehicleVisual.astro` still draws 5 fallback body types (`moped`, `motorcycle`,
`three-wheeler-passenger`, `three-wheeler-cargo`, `cart`) as layered SVG chassis
planes when an approved product image is unavailable. This prevents invented
vehicle renders from being presented as real products.

**Replacing the temporary cutout with approved OEM photography** requires no code
change beyond the data — each vehicle carries a documented media slot:

```ts
// src/data/vehicles.ts
media: { hero: null, card: null, poster: null, alt: '...' }
//        ^ put a path like '/media/eluna-plus-hero.avif' here
```

`VehicleVisual` automatically switches to a `<picture>` with an AVIF source,
explicit `width`/`height` and `fetchpriority` when `media.hero` is set.

---

## Data integrity — the important part

This build **does not fabricate specifications, statistics, testimonials or
corporate history.** Every figure carries a verification contract:

```ts
verification: 'verified' | 'indicative' | 'pending'
source: 'Published by Kinetic Green, ...'
```

Where a value is unknown, the UI says so instead of inventing a number:

- Technology hotspots without a published spec render **"No confirmed figure
  published for this system yet"** rather than a plausible-looking spec.
- Legacy milestones without a sourced date render **"Year TBC"** and an
  **"Awaiting confirmation"** flag. Currently only 2 of 9 milestones assert a date.
- `IndiaMobility` reports only the **published national** dealer figure (550+).
  Per-state splits are not published, so none are stated — the UI says this
  explicitly.
- All 32 dealer records are flagged `verified: false` and the UI labels them as a
  representative sample. Dealer schema deliberately emits **zero** nodes until real
  data arrives, so structured data never describes a dealer the page omits.
- Savings and EMI figures are labelled estimates with printed assumptions and
  explicit disclaimers (including total interest payable, which most EMI widgets
  hide).

**Before launch, replace:** the dealer roster (`src/data/content.ts`), the
milestone dates, and the technology hotspot specs.

---

## Progressive enhancement

The contract: **the page renders completely and meaningfully with JavaScript
disabled.**

- `<html>` only receives `.js` from an inline script, so `[data-reveal]` elements
  are never left invisible for no-JS visitors.
- Interactive switchers (explorer, product story, technology, region map) render
  **every panel in the HTML** and JS only *hides* the inactive ones. The full
  product catalogue, every engineering explanation and every region narrative is
  therefore indexable.
- The savings calculator and EMI estimator are mirrored **server-side**, so the
  default figures are correct before any script runs.
- The EV finder ships a **server-rendered seed recommendation**.
- The dealer finder renders a plain roster grouped by state.
- The lead modal has a `<noscript>` contact route with the real phone number.

---

## Architecture notes

**One client bundle.** Everything the browser runs is imported from
`src/scripts/main.ts`, so the page fetches one deferred module rather than a
scatter of inline scripts. Each controller is wrapped in a `guard()` so a single
failure can never take down the conversion surfaces.

**One source of truth per calculation.** The finder's rules and cost model live in
`src/data/finder.ts`, and are rendered into the page *both* as readable prose (the
visible answer table) *and* as a JSON island the client reads. The published
explanation cannot drift from the behaviour. The same applies to the EMI formula,
which is mirrored in `Finance.astro` and `finance.ts`.

**Data islands, not duplicated markup.** `[data-explorer-data]`,
`[data-finder-config]`, `[data-india-data]`, `[data-dealer-data]` and
`[data-price-data]` are `application/json` — inert, never executed, and read once.

**One modal contract.** `LeadModal` opens from any `[data-lead-open]` element and
configures itself from that element's `data-*` attributes (a callback is 3 steps, a
test ride is 5). Other controllers use the `kg:open-lead` CustomEvent bridge. There
is no second code path into the modal.

**Native scroll, not JS carousels.** Rails use CSS scroll-snap so trackpad, touch
and keyboard work for free; desktop pinning is layered on top and degrades
cleanly.

---

## Analytics

Event names follow the measurement plan exactly, declared on markup via
`data-track` and dispatched through **one delegated capture-phase listener** — so
the event map can be audited by grepping components rather than reading JS.

`hero_test_ride_click` · `vehicle_view` · `vehicle_category_select` ·
`ev_finder_start` · `ev_finder_step` · `ev_finder_complete` ·
`savings_calculator_start` · `savings_calculator_complete` · `price_check_start` ·
`price_check_submit` · `dealer_search` · `dealer_contact` · `test_ride_start` ·
`test_ride_complete` · `finance_calculator` · `callback_submit` · `story_click` ·
`faq_open` · `sticky_cta_click` · `scroll_depth` · `section_view` ·
`conversion_bar_click` · `business_enquiry_start` · `footer_link_click`

- Attribution (UTM / gclid / fbclid / referrer / landing page) captured once per
  session.
- Consent-mode defaults to **deny** for ad storage.
- GTM is a wired no-op stub: set `window.__kgGTM_ID` in `BaseLayout.astro` to
  switch it on. The event map is already complete and testable.
- Scroll depth (25/50/75/100) and section views use `IntersectionObserver`.

---

## SEO

- Static HTML, `compressHTML`, sitemap integration.
- Canonical, robots, geo, full Open Graph + Twitter cards.
- Semantic landmarks with a skip link; one `<h1>`; real `<h2>`/`<h3>` hierarchy.
- **Schema.org `@graph`** cross-referenced by `@id`:
  Organization ← WebSite ← FAQPage / ItemList / Product / AutomotiveBusiness.
  Section-owned nodes (Product, FAQ-finance, dealer AutoDealer) are emitted only
  for content actually rendered on the page.
- FAQPage is generated from the same `faqs` data the component renders, so schema
  and visible content cannot diverge.

---

## Accessibility

- Skip link, visible focus rings, semantic landmarks and headings.
- ARIA **tablist** semantics done properly (roving tabindex + arrow keys/Home/End)
  for the explorer and region map — not re-implemented buttons.
- Role `group` + `aria-pressed` (not tablist) for the story filter, because they
  filter one collection rather than swapping panels.
- Region map: the SVG is a pointer affordance only; the **tablist is the keyboard
  path**, avoiding 9 duplicate tab stops.
- Live regions announce the finder result, dealer count and form outcomes.
- Validation messages render next to the field that failed and move focus there.
- Touch targets ≥ 44 px on coarse pointers.
- Full `prefers-reduced-motion` and print stylesheets.

---

## Data model

| File | Contains |
| --- | --- |
| `src/data/vehicles.ts` | 9 vehicles × 6 categories, verification contract, disclaimers, `formatINR()` |
| `src/data/content.ts` | brand, metrics, milestones, technology hotspots, ownership pillars, dealers, regions, stories, FAQs |
| `src/data/finder.ts` | Ordered match rules, cost model, assumption text |

**Storage:** none at runtime — the site is static. Lead capture posts to
`/api/lead`.

---

## Known gaps / next steps

1. **`/api/lead` does not exist.** Every lead surface POSTs to it. Until it is
   implemented, `submitLead()` holds submissions in a **localStorage offline
   queue** (surfaced in the conversion bar) rather than silently dropping them.
   Implement as a Cloudflare Pages Function at `functions/api/lead.ts`, or point it
   at a CRM/marketing-automation endpoint.
2. **Placeholder data** — dealer roster, milestone dates, technology specs (see
   [Data integrity](#data-integrity--the-important-part)).
3. **Missing secondary pages:** `/privacy` (linked from the lead modal and price
   form), `/terms`, `/cookies`, `/404`.
4. **No OG image.** `public/brand/og-default.jpg` is referenced but absent; social
   shares will have no preview image until one is supplied.
5. **Image approval required.** Replace `/public/media/eluna-hero.webp` with the
   approved Kinetic Green campaign master before production launch.
6. **CRM and consent review.** Connect the lead endpoint, confirm consent copy, and
   complete legal review before enabling paid-media tracking.

---

## Deployment

Static output deploys to **Cloudflare Pages**:
`npm run build && wrangler pages deploy dist`

⚠️ **Two deploy paths are available and must be chosen before deploying:**
- **BYOK** — your own Cloudflare account via API token in the Deploy panel.
- **Genspark-hosted** — Genspark manages the Cloudflare resources.

---

**Last updated:** 2026-09-22
**Stack:** Astro 7 · TypeScript · vanilla TS modules · hand-authored SVG/CSS · Cloudflare Pages
