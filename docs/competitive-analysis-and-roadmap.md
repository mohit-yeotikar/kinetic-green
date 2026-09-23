# Kinetic Green — Competitor Analysis, SEO & Build Roadmap

> Deep teardown of nine EV competitor sites (Simple Energy, Raptee.HV, Vida, River,
> Gogoro Smartscooter + Delight, Ather, Ultraviolette, CFMoto) mapped against a full
> audit of this Astro homepage — with the bugs, the semantic-SEO plan, the animation/JS
> toolkit, and the exact imagery to create. Generated for branch `claude/gifted-cannon-kl73y7`.

## What has already shipped on this branch

Phase 1 (bugs + SEO) and the first slice of Phase 2 (motion) are **implemented and pushed**:

- **Bugs fixed** — real footer social glyphs (LinkedIn/Instagram/YouTube/Facebook were an
  identical circle); missing `/brand/og-default.jpg` + `apple-touch-icon.png` created;
  `nav_menu_open` analytics event now fires; LeadModal resume-cursor guarded; manifest
  `theme_color` aligned to the light page chrome; misleading dealer-schema comment corrected.
- **Semantic SEO** — every heading now folds a keyword-bearing subhead into the same
  H1/H2/H3 while keeping the campaign line verbatim; range-card H3s carry the category noun
  (electric moped / electric scooter / electric three-wheeler); a new **FAQ section** renders
  the previously-dormant `faqs[]` as crawlable H2+H3 content; `index.astro` emits a full
  JSON-LD graph (ItemList + Product×3 with an E-Luna offer + FAQPage + BreadcrumbList);
  keyword-front-loaded `<title>`/description; `aria-labelledby` on every section; LCP hero
  preload; `robots.txt` no longer blocks `/_astro/`.
- **Motion** — the dormant `motion.ts` is wired (reveal + count-up), scroll-reveal added to
  below-the-fold sections (hero excluded to protect LCP, reduced-motion safe), and a new
  count-up **trust band** surfaces the unused `metrics[]` as social proof.
- **Conversion + TCO (Phase 3, started)** — the savings calculator now shows a **5-year
  projection** and an **annual petrol-CO₂-avoided** estimate (honestly labelled) alongside
  yearly savings; a persistent **mobile CTA bar** keeps "Book test ride" + "Dealers" one tap
  away at any scroll depth (reveals after the hero, hides with the drawer/modal, no-JS safe).

**Still open (need brand assets or are larger builds):** colour-swatch configurator + 360°
viewer (need per-colour renders / frame sequences), hero video, the matched 3-vehicle studio
set + Astro `<Image>` migration, a spec **compare** table (blocked on confirmed Zing/Safar
specs — the E-Luna variants are ready today), split product sub-pages, and the dealer map
(awaits the verified dealer feed).

Everything below is the full analysis and the remaining roadmap (Phase 2 finish + Phase 3).

---

## Full analysis & roadmap

*Lead-engineer briefing for the Astro 7 static homepage (`src/pages/index.astro`). Synthesises 9 EV-competitor teardowns (Simple Energy, Raptee.HV, Vida, River, Gogoro Smartscooter + Delight, Ather, Ultraviolette, CFMoto) against a full self-audit of the active codebase.*

---

## 1. Executive summary

**Where KG stands today.** The homepage is *technically* healthier than the brief assumed. The document shell (`BaseLayout.astro`) is already a strong SEO base — correct title/canonical/OG/Twitter, a valid `Organization + WebSite` JSON-LD `@graph`, self-hosted-font CLS handling, skip-link/landmark/ARIA scaffolding, and genuinely good keyword-bearing image `alt` text. The active homepage's controllers, dialogs, focus traps, scroll-lock and calculator math are all correctly wired. Two "bugs" in the original premise are **false and verified so**: `public/brand/` (og-default.jpg + apple-touch-icon.png) exists, and Astro 7.3.3 + `@astrojs/sitemap` are genuinely installed.

**But KG is losing on three fronts every competitor wins on:**

1. **Semantic SEO is inverted.** Every heading is emotionally styled and keyword-empty ("Go your own way.", "Small switch. Big difference."). The real keywords (*electric scooter, E-Luna, e-moped, electric three-wheeler, Safar, EV India*) sit in non-heading `<p class="editorial-label">` eyebrows where Google's heading-outline weighting ignores them. Meanwhile a fully keyword-rich `faqs[]` array in `content.ts` **is never rendered to HTML at all**, and `index.astro` passes **no `schema` prop** — so the Product/FAQPage/ItemList plumbing already built into BaseLayout is dormant. This is where Ather, Simple, Gogoro and Vida beat us for free.

2. **The entire motion system is dead code.** `motion.ts` and `interactions.ts` are never imported by `main.ts`, and no active component carries the `data-reveal / data-parallax / data-count` attributes they target. The live page has zero scroll choreography — only CSS hover states. Every competitor (Ather, Ultraviolette, Simple, River, Gogoro) leads with scroll-driven storytelling and count-up stats. We shipped the engine and never turned the key.

3. **Imagery bypasses the build pipeline and under-sells the brand.** All images are raw `<img>` from `public/` — no Astro `<Image>`, no AVIF, no `srcset`, no LCP preload. The E-Luna hero is a lone 846×994 portrait cutout reused (mis-dimensioned as 800×600) in a lineup grid of true-landscape shots, so the range looks unbalanced. Competitors run cinematic hero video and matched studio systems.

**Top 5 moves (highest leverage first):**

| # | Move | Why it wins | Effort/Impact |
|---|------|-------------|---------------|
| 1 | **Rewrite every heading to fold keywords into a subhead span** (keep the emotional line verbatim) + fix the title tag | Fastest ranking lift; zero design regression | S / **H** |
| 2 | **Render `faqs[]` as a real FAQ section + wire FAQPage/Product/ItemList schema** via `index.astro`'s dormant `schema` prop | Biggest single content/keyword loss on the page; unlocks rich results | M / **H** |
| 3 | **Fix the footer social icons** (only real user-visible bug) + the low-severity latent bugs | Footer currently looks broken | S / M |
| 4 | **Wire `initMotion` + add `data-reveal`/`data-count` attributes** and lightweight reveal CSS | Turns a static brochure into a modern, premium-feeling page using code we already own | M / **H** |
| 5 | **Migrate homepage imagery to Astro `<Image>` + source a matched 3-vehicle studio set and preload the LCP hero** | Core Web Vitals (a ranking factor) + brand credibility on India's mobile-first audience | M–L / **H** |

**Positioning gap to own:** every rival sells *range* (Simple, Ather), *performance* (Ultraviolette, Raptee), or *premium lifestyle* (Gogoro). None sells **affordability + real-world utility + running-cost economics** — which is exactly E-Luna and Safar's ground. Our savings calculator and TCO story are a differentiator, not a me-too feature.

---

## 2. Bugs to fix now

Confirmed bugs from the audit, deduplicated and severity-ranked. (The two "missing asset / missing dependency" premises were verified **false** — no action; see note at end.)

| # | Sev | Bug | File | One-line fix |
|---|-----|-----|------|--------------|
| 1 | **Medium** | Footer social icons (LinkedIn/Instagram/YouTube) all render as an identical generic circle — `Icon.astro`'s `paths` record has no brand-glyph entries, so all fall back to `<circle>`. Only user-visible defect on the live page. | `src/components/Icon.astro` (`paths`), keys from `src/data/content.ts` L36-39 | Add real `linkedin`/`instagram`/`youtube`/`facebook` SVG path entries to `paths` (prefer `fill` over 1.6px stroke for brand marks); verify all four render distinctly. |
| 2 | Low | LeadModal `cursor` is never reset on `close()`; a resumed non-test-ride lead type would show "Step 0 of 3" and a broken progress rail. Latent — only fires once a 2nd lead type is wired. | `src/scripts/leadModal.ts` (`open()` ~L805, `configure()`) | In `open()`: `const start = (config.steps.includes(cursor) && cursor !== 5) ? cursor : config.steps[0]; showStep(start, 1);` — or reset `cursor = config.steps[0]` at end of `configure()`. |
| 3 | Low | `nav_menu_open` analytics event is declared in the `EventName` union but never fired — funnel gap on mobile drawer open. | `src/scripts/nav.ts` (`openDrawer()` ~L220) | Call `track('nav_menu_open', { source: 'nav' })` inside `openDrawer()` (import `track` from `../lib/analytics`). |
| 4 | Low | Dead null-guarded selectors `[data-lead-company-wrap]` and `[data-lead-status]` in `leadModal.ts` reference markup that doesn't exist — company capture and offline-status silently no-op. | `src/scripts/leadModal.ts` (~L547, ~L775) vs `LeadModal.astro` | Either add the markup (`company-wrap` field group + `status` region) or delete the dead paths so they don't imply working features. |
| 5 | Low | `theme-color` mismatch: head `<meta name="theme-color" content="#FBFCF8">` (light) vs `site.webmanifest` `#12161A` (dark) — inconsistent mobile chrome / PWA splash. | `src/layouts/BaseLayout.astro` L123 vs `public/site.webmanifest` L8-9 | Pick one brand chrome color for both (or ship a light/dark media-scoped `theme-color` pair). |
| 6 | Low | Misleading comment: BaseLayout claims DealerFinder emits per-dealer `LocalBusiness` schema; it emits none. Not emitting is *correct* (dealers are `verified:false` placeholders) — the comment is the bug. | `src/layouts/BaseLayout.astro` L91-95 vs `DealerFinder.astro` | Rewrite the comment to state LocalBusiness is intentionally suppressed until the live dealer feed lands, gated on `verified===true`. |

**Verified NON-bugs (do not chase):** `public/brand/og-default.jpg` (68 KB) and `apple-touch-icon.png` (1.5 KB) both exist → BaseLayout references resolve. `astro@7.3.3` is genuinely installed and `@astrojs/sitemap@3.6.0` is wired with `output:'static'`, so `robots.txt`'s `sitemap-index.xml` is generated at build. All `/media/*.webp` referenced by the active page exist. *(Optional robustness: confirm `apple-touch-icon.png` is a valid 180×180 and not a placeholder; add maskable PWA icons — see §6.)*

---

## 3. SEO powerhouse plan

### 3.1 Principle

Keep the campaign voice **verbatim** as the visually dominant display line, and fold the target keyword into the **same heading element** via a smaller styled subhead `<span>`. This preserves brand tone while giving Google's heading-outline weighting the commercial nouns it currently gets zero of. Add one CSS rule (`.section-heading h2 span.sub`, `.campaign-hero__h1-sub`, `.range-card__cat`) sized ~0.5–0.6× the display line.

### 3.2 Before → after: EVERY heading on the homepage

| Component | Element | Current (verbatim) | Recommended (keyword-rich, voice-preserving) |
|-----------|---------|--------------------|-----|
| Hero.astro L8 | **H1** | `Go your own way.` | `Go your own way.` **+** `<span class="campaign-hero__h1-sub">Meet the Kinetic Green E-Luna electric scooter.</span>` |
| VehicleExplorer L12 | H2 | `Find your kind of electric.` | `Find your kind of electric.` **+** `<span>Electric scooters, e-mopeds and three-wheelers from Kinetic Green.</span>` |
| VehicleExplorer L24 | H3 (×3, `{v.name}`) | `E-Luna` / `Zing` / `Safar Smart` | `E-Luna <span class="range-card__cat">electric moped</span>` / `Zing <span…>electric scooter</span>` / `Safar Smart <span…>electric three-wheeler</span>` (add `segmentShort` to each `range[]` object) |
| VehicleExplorer L34 | H2 (dialog, ×3, `{v.name}`) | `E-Luna` / `Zing` / `Safar Smart` | `{v.name} — {v.segment}` → `E-Luna — electric moped`, `Safar Smart — electric passenger three-wheeler` (differentiates from card H3, adds keyword) |
| SavingsCalculator L11 | H2 | `Small switch. Big difference.` | `Small switch. Big difference.` **+** `<span>Your electric scooter running-cost savings, per month and per year.</span>` |
| Ownership L12 | H2 | `Made for life. Your kind of life.` | `Made for life. Your kind of life.` **+** `<span>Charging, service and finance for your Kinetic Green electric vehicle.</span>` |
| DealerFinder L7 | H2 | `Your next ride. Closer than you think.` | `Your next ride. Closer than you think.` **+** `<span>Find a Kinetic Green electric scooter and E-Luna dealer near you.</span>` |
| FinalCTA L5 | H2 | `Your electric chapter starts here.` | `Your electric chapter starts here.` **+** `<span class="sub">Book a Kinetic Green E-Luna test ride.</span>` |
| **NEW** FAQ.astro | H2 | *(does not exist)* | `Everyday questions about going electric.` **+** `<span>Kinetic Green E-Luna range, charging, price and dealers.</span>` |
| **NEW** FAQ.astro | H3 (×7) | *(does not exist)* | Render each `faqs[].q` as an `<h3>` with a visible `<p>` answer (see §3.4) |

### 3.3 Recommended H1–H3 outline (final rendered order)

```
H1  Go your own way. — Meet the Kinetic Green E-Luna electric scooter.        (Hero)
H2  Find your kind of electric. — Electric scooters, e-mopeds & three-wheelers (VehicleExplorer §range)
  H3  E-Luna · electric moped
  H3  Zing · electric scooter
  H3  Safar Smart · electric three-wheeler
H2  Small switch. Big difference. — running-cost savings per month/year        (SavingsCalculator)
H2  Made for life. Your kind of life. — charging, service & finance            (Ownership)
H2  Your next ride. Closer than you think. — find a dealer near you            (DealerFinder)
H2  Everyday questions about going electric. — range, charging, price, dealers (FAQ — NEW)
  H3  What electric vehicles does Kinetic Green make?
  H3  What is the range of the Kinetic Green E-Luna?
  H3  How long does the E-Luna take to charge?
  H3  How much does the Kinetic Green E-Luna cost?
  H3  How do I book a test ride?
  H3  What finance options are available?
  H3  Where are Kinetic Green dealers located?
H2  Your electric chapter starts here. — book an E-Luna test ride             (FinalCTA)
```
*Note on dialog H2s:* the three product-`<dialog>` H2s are emitted after the card H3s and (currently) duplicate the bare names. A `<dialog>` is a self-contained region so an H2 is defensible — but disambiguate by using `{name} — {segment}` (as above) rather than repeating the card string. If strict outline purity is preferred, demote dialog titles to `<h3>`.

### 3.4 schema.org additions — which component emits what

`index.astro` builds a `schema` array in frontmatter and passes `schema={schema}` to `<BaseLayout>`, which already merges it into the `@graph` after `Organization` + `WebSite`.

| Schema type | Emitted by | Source data | Notes |
|-------------|-----------|-------------|-------|
| `ItemList` | `index.astro` (frontmatter) | `range[]` (3 vehicles), each `itemListElement` an `@id` ref | Wraps the range grid |
| `Product` / `Vehicle` (×3) | `index.astro` | `vehicles.ts` `priceFrom` + specs; E-Luna variants have confirmed ex-showroom prices (₹69,990 Go / ₹79,990 Plus / ₹86,990 Pro / ₹89,990 Prime) | `offers` with `priceCurrency:"INR"`, availability; mark price *indicative/ex-showroom*; **only** emit for items whose data is `verified`, never `pending`. Cross-reference `brand`/`manufacturer` to the `Organization @id`. |
| `FAQPage` | new **FAQ.astro** (or `index.astro` reading `faqs[]`) | `content.ts` `faqs[]` L624-657 | **Only after** the answers render as visible on-page text — schema must mirror visible content. |
| `BreadcrumbList` | `index.astro` | trivial single-page | Low value on a one-pager; include for completeness |
| `LocalBusiness`/`AutoDealer` | DealerFinder — **deferred** | `dealers[]` | **Do NOT emit** until the placeholder roster (`verified:false`, L333-357) is replaced by the live feed; gate on `verified===true`. Fix the misleading BaseLayout comment (Bug #6). |

### 3.5 Meta / title & keyword targets per section

- **Title tag** (`index.astro` L13): change `Kinetic Green — Go your own way. Go electric.` → **`Kinetic Green E-Luna Electric Scooter & Three-Wheelers | India`** (~60 chars, front-loads nouns + geo).
- **Meta description:** name E-Luna, *electric scooter* and *three-wheeler* explicitly (current says generic "vehicles").
- **Per-section keyword targets:**

| Section | Primary keywords |
|---------|------------------|
| Hero | `Kinetic Green E-Luna`, `electric scooter India`, `electric moped` |
| VehicleExplorer | `electric scooter`, `electric moped`, `electric three-wheeler`, `E-Luna`, `Zing`, `Safar` |
| SavingsCalculator | `electric scooter running cost`, `EV vs petrol savings`, `cost per km` |
| Ownership | `electric scooter charging`, `EV finance India`, `service network` |
| DealerFinder | `E-Luna dealer near me`, `Kinetic Green dealer`, `electric scooter showroom` |
| FAQ | `E-Luna range km`, `E-Luna price`, `electric scooter charging time`, `550+ dealers pan India` |
| FinalCTA | `book E-Luna test ride`, `electric scooter test ride` |

### 3.6 Other technical-SEO fixes

- **`robots.txt` L11 — remove `Disallow: /_astro/`.** It blocks Astro's hashed CSS/JS from Googlebot (Google renders pages; blocked resources trigger Search Console warnings). Hashed static assets are no crawl-budget risk. Keep `Disallow: /api/` and the `Sitemap:` line.
- **`aria-labelledby` on `<section>` landmarks:** give each rewritten heading an `id` and point its `<section>` at it — do opportunistically during the heading edits.
- **Anchor text:** tighten vague in-page links — Hero "Explore the range" → *"Explore the electric range"* (`#vehicles`); Ownership "Let's talk electric" → *"Find a dealer near you"* (`#dealers`).
- **Roadmap note:** all keyword equity concentrates on one URL. If the roadmap allows, split E-Luna / Zing / Safar into crawlable sub-pages (Ather-style SSG) to target their keyword clusters independently.

### 3.7 Image alt-text rules (already good — keep the pattern)

1. Every product image: `"{Model} — {category} from Kinetic Green"` (e.g. `"E-Luna electric moped from Kinetic Green"`).
2. Lifestyle images: describe the India-context scene + benefit (`"Rider charging the E-Luna at a home socket"`).
3. Decorative/icon SVGs: empty `alt=""` + `aria-hidden`.
4. Never keyword-stuff; one natural keyword phrase per alt.
5. Any new `<Image>` migration must carry the same alt as the current `<img>`.

---

## 4. Competitor ideas to implement

Grouped by theme. Effort **S/M/L**, Impact **H/M/L**. Every idea is buildable in static Astro + vanilla JS (no framework needed).

### Hero & motion
| Idea | Inspired by | Build in Astro/vanilla | Eff/Imp |
|------|-------------|------------------------|---------|
| Wire the **existing `motion.ts`** (`initReveal`, `initCounters`, `initParallax`) — import `initMotion` in `main.ts`, add `data-reveal`/`data-count` to headings, cards, savings total | Ather, Simple, River, Gogoro | We already own the code (shared IntersectionObserver + one rAF loop). Add reveal CSS gated behind `.js` + `prefers-reduced-motion` | S / **H** |
| **Cinematic hero video** (muted, `playsinline`, IntersectionObserver-gated, WebP poster fallback) of E-Luna on a real Indian street | Gogoro, Gogoro Delight, CFMoto, Ather | `<video autoplay muted loop playsinline poster>` + JS pause when offscreen; reduced-motion → poster only | M / **H** |
| **Count-up stat band** (range km, ₹/km running cost, payload) on scroll-enter | Simple, Ultraviolette, Raptee, Ather | `initCounters` from `motion.ts` + `data-count` attrs (already supported) | S / **H** |
| **Sticky nav transparent→blurred-solid** on scroll with `backdrop-filter` | Gogoro, Simple, Raptee | Existing nav controller + scroll listener toggling a class; CSS `backdrop-filter: blur()` | S / M |

### Product / configurator
| Idea | Inspired by | Build | Eff/Imp |
|------|-------------|-------|---------|
| **Colour-swatch picker** that cross-fades a pre-rendered PNG per colour | Simple (9 colours), Raptee, Gogoro Delight, Vida | Vanilla JS swapping `<img src>` with CSS opacity crossfade; no WebGL — fast on 3G | M / **H** |
| **360° turntable viewer** scrubbed by drag/scroll (36–60 frame image sequence) | Simple, Vida, Gogoro, Ultraviolette | Canvas or stacked `<img>` frame-swap on pointer/scroll; reuse frames for hero rotate + swatches | M / M |
| **Side-by-side Compare tool** (E-Luna vs Zing vs Safar, sticky column headers) | Gogoro `/specs`, Vida `compare.html`, Ather | Static Astro table from `vehicles.ts`; sticky `position:sticky` header; strong long-tail SEO ("E-Luna vs Zing") | M / **H** |
| **AR "view in your space"** (later) | Vida, Gogoro | `<model-viewer>` + GLB/USDZ; Phase 3 | L / M |

### Calculators & tools
| Idea | Inspired by | Build | Eff/Imp |
|------|-------------|-------|---------|
| **Upgrade the existing SavingsCalculator into a full TCO / "EV vs petrol" tool** (km/day → ₹ saved/month, /year, 5-yr break-even, CO₂ saved) | Vida, Ather, Simple, CFMoto | Extend `calculator.ts` (math already SSR-consistent); this is KG's *differentiator* — lean in | M / **H** |
| **EMI / finance calculator by variant** | CFMoto USA, Ather, River | Vanilla JS; feeds the Ownership finance story | M / M |
| **Dealer / service locator with map** (persistent nav CTA) | Vida, Ather, CFMoto, Gogoro, River | Static list now (DealerFinder exists); add Mapbox/Google JS + pincode filter when the verified feed lands; `AutoDealer` schema then | M / **H** |

### Scroll storytelling
| Idea | Inspired by | Build | Eff/Imp |
|------|-------------|-------|---------|
| **Pinned "utility proof" section** — pin the vehicle image, reveal load/payload/battery callouts one-by-one as you scroll | River (55L storage), Ather, Simple, Gogoro Delight | CSS `position:sticky` + IntersectionObserver step reveals (no GSAP needed for v1); optional Lenis smooth-scroll layer | M / **H** |
| **Scroll-scrubbed "reveal" of the E-Luna** (frame sequence tied to scroll) | Ultraviolette, Simple, Ather | Canvas image-sequence + scroll-progress mapping; lazy-load, reduced-motion fallback | L / M |

### Navigation
| Idea | Inspired by | Build | Eff/Imp |
|------|-------------|-------|---------|
| **Persistent sticky "Book Test Ride" CTA** (top pill + mobile sticky bottom bar) | Ather, Simple, Raptee, Gogoro, all | Reuse existing `[data-lead-open]` triggers; add a fixed mobile bar; every scroll depth = 1-tap conversion | S / **H** |
| **Vehicle-TYPE-first category tiles** (E-Moped / E-Scooter / E-3-Wheeler) as homepage entry cards | CFMoto (scales as lineup grows) | Static Astro cards routing to filtered/anchored range; also clarifies portfolio | S / M |
| **Mega-menu model switcher with thumbnails** | Gogoro, Vida, CFMoto | Enhance existing nav drawer; CSS flyout | M / M |

### Social proof / trust
| Idea | Inspired by | Build | Eff/Imp |
|------|-------------|-------|---------|
| **Trust/credibility band** (units sold, km driven, 550+ dealers, FAME/subsidy, warranty, awards) | River (Red Dot), Simple (IP67), CFMoto (racing) | Static Astro strip near CTAs; count-up numbers | S / **H** |
| **Semantic content hub / blog** (buying guides, "E-Luna vs petrol moped running cost") with `BlogPosting` schema | Ultraviolette, Raptee | Astro content collections; captures long-tail intent rivals ignore | L / M |
| **Reviews / testimonials** with authentic India-context photos + `Review`/`aggregateRating` | Ather, Gogoro | Static component; wire schema only with real data | M / M |

---

## 5. Modern JS / CSS & animation toolkit (observed across all 9 sites → mapped to KG)

| Technique / library | Seen at | Where it maps in KG |
|---------------------|---------|---------------------|
| **IntersectionObserver reveals** (fade/slide-up on enter) | All | Section headings, range cards, savings result, ownership photo — *code already exists in `motion.ts`* |
| **Animated count-up counters** (`requestAnimationFrame`) | Simple, Ather, Ultraviolette, Raptee | Savings total, range/payload/₹-per-km stat band — *`initCounters` exists* |
| **`position:sticky` pinned scrollytelling** | River, Ather, Gogoro, Simple | Utility-proof section, spec walk-through |
| **Lenis (smooth/inertia scroll)** | Simple, Ather, Ultraviolette, Gogoro, River | Optional global polish layer; gate behind reduced-motion |
| **GSAP ScrollTrigger** (pin + scrub timelines) | Ather, Ultraviolette, Simple, River | Only if `motion.ts`'s native approach proves limiting — prefer vanilla first for bundle weight |
| **`<video>` `currentTime` scroll-scrubbing / canvas image-sequence** | Gogoro, Simple, Ultraviolette, Ather | Hero reveal / 360 turntable |
| **`backdrop-filter: blur()` on sticky nav** | Gogoro, Simple, Raptee | Nav transparent→solid transition |
| **`clip-path` / `mask-image` reveal wipes** | Gogoro, Ultraviolette, Simple | Section transitions |
| **CSS scroll-driven animations (`animation-timeline`)** | Gogoro (progressive enhancement) | Future-proof reveal alternative where supported |
| **View Transitions API** (model-to-model continuity) | Gogoro | If sub-pages are added |
| **`prefers-reduced-motion` guards** | Ultraviolette, all quality builds | *Already handled correctly in `redesign.css` — preserve when adding reveals; scope hidden state to `.js [data-reveal]`* |
| **Responsive `srcset`/`sizes` + AVIF/WebP, lazy-load, LCP preload** | All | §6 — currently absent on KG |
| **`<picture>` art-direction + CDN media** | Gogoro, Ather, Vida | Hero/lifestyle crops |
| **Colour-swatch state via CSS custom properties** | Simple, River, Gogoro Delight | Colour picker |

---

## 6. Images & visual assets to create

| Section / target | Image concept | Format / dimensions | Why |
|------------------|---------------|---------------------|-----|
| **Hero** | E-Luna studio cutout, clean/transparent plate, retina | AVIF+WebP, **1692×1988** (2× current) + `srcset` 846/1200/1692 | Current 846×994 is under-resolved for 2× displays; competitors run high-DPI/video heroes |
| **Hero (optional)** | 6–10s muted looping clip, E-Luna on real Indian street | MP4 (H.264) + WebM/VP9, ~1920×1080, **<2 MB**, WebP poster | Single biggest perceived-premium lift (Gogoro/Ather/CFMoto pattern) |
| **VehicleExplorer** | **Matched 3-vehicle studio set** — E-Luna, Zing, Safar Smart, same seamless bg, identical framing/eye-line, 3/4-front | AVIF+WebP, **1600×1200** (2× the 800×600 card box) | Today E-Luna is a mismatched portrait among landscape shots — lineup looks unbalanced; fixes Bug-adjacent aspect issue |
| **VehicleExplorer** | Dedicated landscape E-Luna card shot at true 800×600 (distinct from tall hero) + correct `width/height` | WebP, 800×600 | Card/dialog declare 800×600 but file is 846×994 portrait — wrong aspect hint |
| **VehicleExplorer** | Colour-swatch / variant thumbnail strip per card | PNG/WebP, ~120×120 each | Powers the colour picker (§4) |
| **Ownership / lifestyle** | 3–4 authentic India-context shots (commute, market run, family, charging at home) | AVIF+WebP, 2000px wide + `srcset`; wide 21:9 crop **2000×901** + 800px mobile variant | Only one lifestyle image exists, served at one size; `riding.webp` (1400×901) is over-delivered to mobile |
| **Ownership (optional)** | Short charging-at-home clip | MP4/WebM, <1.5 MB | Supports "charge that fits your routine" accordion |
| **DealerFinder** | Stylised India dealer-network map illustration or static map tile | SVG preferred, ~1200px | Section is currently a pure form with no visual |
| **FinalCTA** | Brand SVG motif or dark lifestyle backdrop | SVG / WebP | Replace the giant Arial "↗" text-glyph decoration |
| **Stat band / calculator** | Range, ₹/km, payload infographic tiles; EV-vs-petrol savings graphic | SVG | Feed count-up animations |
| **Cutaway** | Exploded/cutaway render (battery + motor placement) | AVIF+WebP, 1600px | Engineering-credibility block (Ultraviolette/Raptee/Simple pattern) |
| **Detail macros** | LED signature, instrument cluster, load deck, telescopic suspension, brake disc | AVIF+WebP, 1200px | Anchor scrollytelling callouts |
| **OG social** | Per-section/product OG variants beyond the single default | JPG/PNG, **1200×630** | One `og-default.jpg` serves all deep-links today; verify it's a true 1200×630 |
| **apple-touch-icon** | Confirm/replace real icon | PNG, **180×180** | Current file is only 1.5 KB — verify it's valid, not a placeholder |
| **PWA icons (missing)** | Maskable app icons | PNG, **192×192** + **512×512** | Manifest lists only `favicon.svg` — add + reference maskable PNGs |

**Pipeline rule:** move source images to `src/assets/` and use Astro `<Image>`/`<Picture>`/`getImage` in Hero, VehicleExplorer and Ownership to emit AVIF+WebP, responsive widths and hashed filenames. Keep `public/` only for `favicon`, `og`, `manifest`. Add `<link rel="preload" as="image" href="/media/eluna-hero.webp" fetchpriority="high">` (later `imagesrcset`/`imagesizes`) to BaseLayout `<head>`. Add `decoding="async"` to lazy images; keep hero as sync decode + `fetchpriority=high`.

---

## 7. Phased roadmap

### Phase 1 — Bugs + SEO (do now; no design regression, highest ROI)
- [ ] **Bug 1:** Add real `linkedin`/`instagram`/`youtube`/`facebook` glyph paths to `Icon.astro` (fill, not stroke).
- [ ] **Bug 2:** Reset LeadModal `cursor` in `open()`/`configure()`.
- [ ] **Bug 3:** Fire `nav_menu_open` in `nav.ts` `openDrawer()`.
- [ ] **Bug 4:** Remove (or implement) dead `[data-lead-company-wrap]`/`[data-lead-status]` paths.
- [ ] **Bug 5:** Unify `theme-color` between head meta and `site.webmanifest`.
- [ ] **Bug 6:** Correct the misleading LocalBusiness comment in BaseLayout.
- [ ] Rewrite title tag → `Kinetic Green E-Luna Electric Scooter & Three-Wheelers | India`; enrich meta description.
- [ ] Add subhead-span keyword rewrites to **all 8 existing headings** (§3.2) + the `.campaign-hero__h1-sub` / `.section-heading span.sub` / `.range-card__cat` CSS.
- [ ] Add `segmentShort` to `range[]`; render category noun in card H3s; differentiate dialog H2s (`{name} — {segment}`).
- [ ] Build **FAQ.astro** rendering `faqs[]` (H2 + H3s + visible `<p>` answers); insert before FinalCTA.
- [ ] Build `schema` array in `index.astro` and pass `schema={schema}`: `ItemList` + `Product`×3 (verified only) + `FAQPage` + `BreadcrumbList`. **Do not** emit dealer `LocalBusiness`.
- [ ] `robots.txt`: remove `Disallow: /_astro/`.
- [ ] `aria-labelledby` on sections; tighten in-page anchor text.

### Phase 2 — Motion + visual (perceived-premium lift using code we already own)
- [ ] Import `initMotion` in `main.ts` (`guard('motion', initMotion)`).
- [ ] Add `data-reveal` to headings/cards/savings-result/ownership-photo; `data-count` to stat/savings numbers.
- [ ] Add reveal CSS **gated behind `.js [data-reveal]:not([data-revealed])`**; verify reduced-motion still forces visible.
- [ ] Sticky nav transparent→blurred-solid; persistent sticky "Book Test Ride" CTA (top + mobile bottom bar).
- [ ] Migrate Hero/VehicleExplorer/Ownership to Astro `<Image>` + `srcset`/`sizes`; preload LCP hero; `decoding="async"`.
- [ ] Source & wire the matched 3-vehicle studio set + correct all `eluna-hero.webp` dimension hints.
- [ ] Optional: hero video with poster fallback; Lenis smooth-scroll layer.
- [ ] Add trust/credibility band (dealers, units, warranty, FAME) with count-ups.
- [ ] Add OG variants, maskable PWA icons; verify apple-touch-icon.

### Phase 3 — Tools / configurator (conversion depth)
- [ ] Upgrade SavingsCalculator → full TCO/EV-vs-petrol tool (₹ saved/mo/yr, break-even, CO₂).
- [ ] Colour-swatch picker (pre-rendered PNG crossfade) per model.
- [ ] Compare tool (E-Luna vs Zing vs Safar, sticky headers) — long-tail SEO.
- [ ] Pinned "utility proof" scrollytelling section.
- [ ] EMI/finance calculator by variant.
- [ ] Dealer/service locator with map (+ `AutoDealer` schema) once the verified feed replaces placeholders.
- [ ] 360° turntable viewer (reuse frames for hero rotate).
- [ ] (Stretch) split E-Luna/Zing/Safar into crawlable sub-pages; content hub/blog with `BlogPosting` schema; AR `<model-viewer>`.

---

*All file paths and line references above are relative to `/home/user/kinetic-green`. No files were edited in producing this document.*

---

# Appendix — Per-competitor teardown

### https://www.simpleenergy.in/ — Simple Energy (Simple ONE / Simple ONE S Gen 2 e-scooter)

**Positioning.** Simple Energy positions the Simple ONE as India's long-range, "made-in-India" premium performance e-scooter — the brand hook is best-in-class range (203–265 km IDC) plus a connected, app-driven ownership experience. The homepage sells range anxiety relief + performance + design status ("The Simple way forward"), targeting the ₹1.5–2L premium buyer who cross-shops Ather and Ola.

**Hero.** Full-viewport cinematic hero: a large studio render / hero video of the Simple ONE against a dark or gradient backdrop, minimal chrome, one dominant headline calling out the flagship stat (range/top speed), and two clear CTAs — "Book Now" (primary, high-contrast) and "Test Ride" / "Explore" (secondary/ghost). The stat (e.g. "203 km range · 105 km/h") is surfaced immediately as social proof of the value prop. Hero doubles as the entry to a scroll-driven product story.

**Interactions & animation**
  - Scroll-triggered fade/slide reveals on every section (IntersectionObserver / GSAP ScrollTrigger)
  - Pinned/sticky scroll sequences where the scooter stays fixed while copy and callouts animate around it
  - Animated number counters for headline specs (range, top speed, kWh) that count up on entry
  - Colour/variant switcher that cross-fades the product render instantly on selection
  - Likely image-sequence or video scrubbing tied to scroll for a 360/rotation or reveal of the scooter
  - Parallax layering between product and background
  - Sticky nav state change (transparent → solid) on scroll

**Modern JS/CSS & likely stack**
  - Likely React/Next.js SPA (component-driven, client-rendered sections)
  - GSAP + ScrollTrigger for pinning and scroll-timeline choreography
  - Lenis (or similar) smooth-scroll library for inertia
  - IntersectionObserver for entrance reveals and lazy loading
  - Image-sequence canvas scrub or HTML5 <video> scrubbing for the hero product rotation (Three.js/WebGL only if a true 3D configurator is present)
  - CSS transforms/opacity for GPU-accelerated animation, clip-path for shaped reveals
  - backdrop-filter blur on the translucent sticky nav

**Functional tools**
  - Book Now / pre-order flow (payment/booking)
  - Test-ride booking form
  - Experience center / dealer locator (50+ centers)
  - Variant selector (Simple ONE vs ONE S; 4.5 kWh vs 5 kWh)
  - Colour configurator (9 colours)
  - Spec sheet / comparison table
  - Downloadable brochure (PDF)

**SEO.** H1: _Simple ONE — India's Longest Range Electric Scooter_  
Keywords: electric scooter India, long range electric scooter, Simple ONE, Simple Energy, best electric scooter, high range EV scooter, electric scooter price India, book electric scooter test ride
Title: `Simple ONE Electric Scooter — 203+ km Range | Simple Energy`

**Visual style.** Dark, premium, high-contrast automotive aesthetic — near-black and deep-gradient backgrounds that make studio product renders and colour finishes pop. Photography is a mix of clean studio 3D-style renders (for colour/spec accuracy) and lifestyle/road shots for aspiration. Bold, condensed sans-serif display type for stat headlines; generous whitespace; neon/electric accent colour used sparingly for CTAs and data highlights. Motion feel is smooth, weighty and "engineered" — slow reveals, easing that feels mechanical rather than bouncy.

**Image ideas worth stealing**
  - Full-bleed dark studio hero render of the flagship scooter with a rim-light halo
  - 360-degree image sequence (36–72 frames) for scroll rotation of each model
  - Macro detail shots: battery pack, motor/hub, touchscreen cluster, disc brakes, LED signature lighting
  - Colour swatch tiles + matching full-vehicle render per colour for the configurator
  - Lifestyle road/city shots at golden hour showing range/freedom narrative
  - Cutaway / exploded-view render showing battery + motor architecture

**Steal for Kinetic Green**
  - Lead with ONE dominant, benchmark-owning stat in the hero the way Simple leads with range. Kinetic Green should own 'range + affordability' for the E-Luna (e.g. '150 km on a single charge, EMI from ₹X/day') — one number the whole page defends. This is the single highest-leverage steal.
  - Build a scroll-driven, pinned product story: fix the vehicle in view while callouts (battery, motor, load capacity, mileage/km-per-charge cost) animate in on scroll. Cheap to fake with a 36-frame image sequence + GSAP ScrollTrigger — no true 3D/WebGL needed. Huge perceived-premium upgrade for E-Luna and Zing.
  - Add animated count-up stat counters (range, top speed, payload, running cost ₹/km) triggered on scroll — instantly communicates value and dwell-time for SEO.
  - Ship a proper conversion stack on every product page: sticky 'Book Now' + 'Test Ride' CTAs, a dealer/experience-center locator, and a variant/colour switcher with instant render cross-fade. Kinetic's E-Luna (commuter + cargo variants) is perfect for a variant switcher.
  - Make it an SEO powerhouse with intent-matched H tags: one keyworded H1 per model ('Kinetic E-Luna — India's Most Affordable Electric Moped'), H2s carrying 'range', 'price', 'mileage', 'EMI', 'book test ride', plus Product + Offer + FAQPage + LocalBusiness JSON-LD schema. Simple/Ather rank because their headings answer search intent — Kinetic should mirror this exactly.

---

### https://www.rapteehv.com/#overview (Raptee.HV T30 — India's first high-voltage electric motorcycle)

**Positioning.** Raptee.HV positions the T30 as "India's first high-voltage electric motorcycle" — electric-car DNA (240V architecture, CCS2 fast charging at public car chargers) brought to an accessible ₹2.39 lakh two-wheeler. The core idea is credibility-through-engineering: they don't sell "range," they sell a car-grade high-voltage platform, a proprietary Automotive Grade Linux OS with OTA updates, and software features (Raptee Maps, AI Trip Planner, Find/Ping My Raptee) that frame the bike as a connected software product, not a commodity scooter.

**Hero.** Full-viewport cinematic hero: the T30 shot on a dark/neutral stage with the tagline built around "High Voltage" / "India's First High-Voltage Electric Motorcycle." Single dominant product visual (likely a looping muted video or a scroll-reactive render), a short benefit line, and a primary CTA "Book your T30 / Book @ ₹1,000" plus a secondary "Explore." The URL uses a #overview anchor, signalling a single long-scroll page with jump-linked sections rather than many separate routes.

**Interactions & animation**
  - Scroll-triggered fade/slide-up reveals on each section as it enters the viewport
  - Sticky/pinned product visual that changes state (angle, colour, zoom) while surrounding copy scrolls past
  - Likely video scrubbing or an image sequence tied to scroll for the motorcycle beauty shots
  - Count-up number animations on the key-spec band (0->135, 0->200)
  - Colour-swatch picker that swaps the bike render/gallery image (mini configurator)
  - Parallax layering on hero and section backgrounds
  - Smooth anchor scrolling from nav to #sections

**Modern JS/CSS & likely stack**
  - Webflow or a React/Next.js build (this genre of Indian EV launch sites is overwhelmingly Webflow + custom JS, or Next.js)
  - GSAP + ScrollTrigger for pinning, scrubbing and staged reveals
  - Lenis (or Locomotive) smooth scroll
  - IntersectionObserver for lazy reveal/count-up when GSAP isn't used
  - Possible three.js / React Three Fiber for an interactive 3D bike/colour configurator (matches the VELOCITY-X style reference and modern moto sites)
  - Scroll-linked <video> or canvas image-sequence scrubbing for the cinematic product shots
  - CSS: clip-path section wipes, backdrop-filter on the sticky glass nav, CSS custom properties for theming, aspect-ratio for media, sticky position for pinned columns

**Functional tools**
  - Booking flow (book @ ₹1,000, city/variant/colour selection)
  - Colour/variant configurator with live render swap
  - Spec comparison table (T30 vs rivals)
  - Charging-station / dealer locator map
  - Newsletter / lead-capture
  - Companion app deep-links (Find My, Ping My, Raptee Maps)

**SEO.** H1: _India's First High-Voltage Electric Motorcycle_  
Keywords: electric motorcycle India, high-voltage electric bike, CCS2 fast charging motorcycle, Raptee HV T30, best electric motorcycle 200 km range, electric bike price India, fast charging electric two-wheeler
Title: `Electric Motorcycle in India | Raptee.HV T30 – India's First High-Voltage EV`

**Visual style.** Dark, premium, "engineering" aesthetic — near-black and charcoal backgrounds with a high-voltage accent (electric blue/cyan or a signature brand hue) used sparingly on CTAs, numbers and highlights. Studio product photography and CG renders (not lifestyle clutter), tight crops on the frame, battery and touchscreen. Large geometric sans-serif display type for numbers/headlines, generous negative space, motion that feels smooth and cinematic rather than playful. The look borrows from EV-car marketing (Tesla/Zero/LiveWire) to sell the "car-grade" story.

**Image ideas worth stealing**
  - Hero: T30 on a dark studio floor with rim-light and a faint electric-blue glow
  - Macro of the CCS2 port plugged into a public car fast-charger (proof of the headline claim)
  - Exploded/cutaway render of the high-voltage battery + motor showing the 240V architecture
  - Close-up of the 7-inch touchscreen showing Raptee Maps / AI Trip Planner UI in-context
  - Colour-swatch gallery renders (one clean image per available colour for the picker)
  - Rider action shot conveying 0-60 in <3.5s (motion blur / lean)

**Steal for Kinetic Green**
  - Own ONE ownable headline claim per product the way Raptee owns 'India's First High-Voltage': make E-Luna the 'India's Most Affordable Family Electric Moped' and hard-code that phrase into H1, title tag and hero — a single defensible superlative beats a generic 'buy electric scooter' page.
  - Build a Product + Offer + AggregateRating + FAQPage schema stack on every vehicle page (E-Luna, Zing, Safar). Raptee's structured data is weak; rich-result snippets (price, rating stars, FAQ accordions) are the fastest organic-CTR win for KG in Indian SERPs.
  - Lead with a scroll-animated 'key numbers' band (range, price, top speed, load capacity) using count-up + IntersectionObserver — cheap to build, instantly communicates value, and works great on low-end Android where heavy 3D would stall.
  - Ship a lightweight colour/variant configurator that swaps a pre-rendered image on click (not full three.js) — gives the premium 'configure it' feel Raptee implies, but stays fast on 3G/4G mobile which is KG's actual audience.
  - Copy the anchored single-scroll structure with a sticky nav + persistent 'Book Now @ ₹X' CTA and a sticky bottom bar on mobile — turns the homepage into a guided funnel toward booking/test-ride.

---

### https://www.vidaworld.com/ — Vida by Hero (Hero MotoCorp's electric-scooter brand; V1 / V2 / VX2 Go / VX2 Plus lineup). NOTE: the live domain is blocked by this environment's egress proxy, so all findings are reconstructed from WebSearch evidence, indexed sub-pages (all served as static-looking .html URLs), and documented feature coverage — not from direct DOM/network inspection. Treat the animation/library items as informed inference, not confirmed source reads.

**Positioning.** "Hero reimagines mobility" — an effortless, accessible and aspirational EV brand that pairs Hero's mass-market engineering/service scale with three ownership-anxiety killers: removable dual batteries, a pay-as-you-go battery subscription (BaaS), and a growing fast-charging network. Core tagline energy: "Charging Simple Hai" — the whole site is built to dissolve range/charging/upfront-cost fear rather than to sell horsepower.

**Hero.** Full-viewport product hero leading with the current flagship (VX2 Plus / V2) on a clean studio or lifestyle backdrop, a short aspirational headline, and a dual-CTA pattern: primary "Book Now" and secondary "Book a Test Ride" — commerce intent placed above the fold. Hero doubles as a model switcher (VX2 Go vs VX2 Plus vs V2 Lite tabs) so the first screen is both a brand statement and a product picker.

**Interactions & animation**
  - Scroll-triggered section reveals (fade/slide-up as spec blocks enter viewport) — standard AEM + IntersectionObserver pattern
  - 360-degree product spin in the 'Build Your Own' configurator (drag/auto-rotate) — the site's signature interaction
  - AR launch ('view in your space') firing WebXR / model-viewer / USDZ-GLB handoff to the phone camera
  - Live configurator state changes: swap body color, toggle seat, switch to rider-POV camera, turn headlight/DRL on/off with a real-time render update
  - Interactive charging-station map with pan/zoom and location filtering
  - Slider/number-input driven savings calculator that recomputes owning cost live
  - Sticky/pinned CTA and possibly a pinned model-spec comparison as you scroll

**Modern JS/CSS & likely stack**
  - Adobe Experience Manager (AEM) as the CMS/rendering layer — inferred strongly from the flat .html URL scheme (vx2-plus-electric-scooter.html, compare.html, dealers-locator.html) and Hero MotoCorp's known Adobe stack
  - AEM Dynamic Media / a 3D-configurator vendor (likely Metadome.ai — a Hero configurator asset surfaced in search — or similar) driving the 360 + AR 'Build Your Own'
  - model-viewer / WebXR with GLB + USDZ assets for the AR 'view in your space' feature
  - IntersectionObserver-based scroll reveals; likely GSAP or AOS for the entrance/timeline animations
  - Google Maps or Mapbox JS for the dealer + charging-station locators
  - Vanilla/JQuery-era progressive enhancement typical of AEM component output, with client JS for the calculator and configurator
  - Responsive image handling via AEM Dynamic Media (smart crops / srcset)

**Functional tools**
  - 3D 'Build Your Own' configurator: color, seat, rider-POV camera, headlight/DRL toggle, 360 spin
  - AR 'view in your space' (WebXR / GLB+USDZ)
  - Model comparison tool (compare.html — VX2 Plus vs VX2 Go spec table)
  - Test-ride booking flow (test-ride.html)
  - Dealer & showroom locator with map (dealers-locator.html)
  - Charging-station network map + slot pre-booking via MY VIDA app
  - Battery Subscription (BaaS) plan selector / pay-per-use explainer (vida-baas.html)

**SEO.** H1: _Likely a brand+category H1 such as 'VIDA Electric Scooters by Hero' on the homepage; each product page carries a model-specific H1 (e.g. 'VIDA VX2 Plus Electric Scooter | Long Range, Powerful Ride')_  
Keywords: electric scooter, VIDA electric scooter, Hero electric scooter, VX2 Plus / VX2 Go electric scooter, long range electric scooter India, removable battery electric scooter, battery subscription electric scooter (BaaS), electric scooter price India
Title: `Pattern observed on sub-pages: '[Model] Electric Scooter | [benefit], [benefit]' — e.g. 'VIDA VX2 Plus Electric Scooter | Long Range, Powerful Ride'; 'VIDA VX2 Go Electric Scooter | Lightweight, Smart & Efficient'`

**Visual style.** Clean, bright, mass-premium-but-accessible: high-key studio product photography plus aspirational urban-lifestyle shots (younger riders, Indian city context). Blends real photography with configurator 3D renders. Color language centers on Vida's signature accent (orange/coral) against white/light-grey space with dark text; generous whitespace; large, confident sans-serif type. Motion feel is smooth and reassuring rather than aggressive/performance-bro — matching the "effortless, simple" brand promise. Iconography-led feature blocks (battery, charging, app) keep it approachable.

**Image ideas worth stealing**
  - High-key 3-quarter studio hero of the flagship scooter on seamless white, floor reflection
  - Configurator-ready 360 render set (36 frames) per color for a spin viewer
  - Rider-POV shot from the saddle showing the display cluster and switchgear (mirrors their configurator POV mode)
  - Removable-battery hero: hands lifting the battery pack out, clean and effortless
  - Battery being charged at home wall socket + at a public fast-charge station (two-scene story for 'charging simple')
  - Animated/looped GIF or short MP4 of the app unlocking/finding the scooter

**Steal for Kinetic Green**
  - 1. Ship a 3D 'Build Your Own' configurator with 360 spin + AR 'view in your space' for the E-Luna and Zing. This is Vida's single strongest, most differentiated web feature and directly serves KG's two-wheeler buyers — let people pick color/accessories, spin the vehicle, and drop it in their driveway via WebXR (GLB+USDZ). Even a 36-frame drag-spin viewer (no full WebGL) is a cheap first version.
  - 2. Build a 'Switch to Electric' savings calculator tuned to Indian running costs — E-Luna vs a petrol moped (fuel Rs/km, service, 5-year TCO). KG's whole pitch is affordability/utility, so a live rupee-savings slider converts better than spec sheets and feeds SEO ('electric moped running cost vs petrol').
  - 3. Rebuild product-page SEO on Vida's proven pattern: H1 = '[Model] Electric [Moped/Scooter/3-Wheeler] | [benefit], [benefit]', one clear H1 per page, benefit-led title tags, and add Product+Offer, FAQPage, BreadcrumbList and AutoDealer schema. KG's pages should target 'electric moped India', 'e-Luna price/range', 'electric 3-wheeler Safar' with semantic H2/H3 clusters (range, charging, price, service).
  - 4. Add a first-class Test-Ride booking flow and a map-based Dealer/Service locator as persistent nav items with a sticky 'Book Now' CTA — Vida keeps commerce intent one click away on every screen. For KG's semi-rural/utility audience, 'find a dealer near me' + test-ride booking is high-intent lead capture.
  - 5. Turn KG's cost advantage into a 'charging/ownership is simple' reassurance section like Vida's dual-battery + BaaS + charging-network story: for E-Luna lean on 'charge from any home socket, swappable/removable battery, low running cost' with iconography and a short battery-removal video/GIF. Attack range/charging anxiety head-on.

---

### River Indie — https://www.rideriver.com/indie

**Positioning.** "The SUV of Scooters" — River sells the Indie not as a gadget but as a rugged, do-everything workhorse: class-leading 55L storage (12L glovebox + 43L under-seat), 14-inch wheels for rough Indian roads, steel dual-cradle chassis, and Red Dot-award design. The whole site reframes an EV scooter around strength, storage, safety and real-world usability rather than spec-sheet tech bragging.

**Hero.** Full-bleed cinematic hero of the scooter in a real environment (not a studio white cutout) with the confident one-liner "The SUV of Scooters" as the H1 and a single primary CTA ("Book Now" / "Book Your Indie") plus a soft secondary ("Test Ride"). Minimal chrome, heavy product photography, brand name River top-left. The line is emotional/positioning-led, not a feature dump — the spec proof comes on scroll.

**Interactions & animation**
  - Scroll-triggered fade/slide-up reveals on each section as it enters viewport (IntersectionObserver-style)
  - Pinned/sticky storage section where the seat/boot 'opens' or callouts fade in one-by-one as you scroll (the hero moment of the page)
  - Parallax layering — product stays sharp while background/foreground shift at different speeds
  - Number count-up animations on the stats band (120 km, 90 km/h, 55L, 3.9s)
  - Sticky product image with text panels swapping alongside it on scroll (scrollytelling)
  - Colour swatch clicks that cross-fade the scooter render/photo without page reload
  - Hover micro-interactions on CTAs and cards (lift, underline sweep, arrow nudge)

**Modern JS/CSS & likely stack**
  - Likely Webflow-built marketing site (common for premium Indian EV brands) or a React/Next-style SPA for the booking flow
  - GSAP + ScrollTrigger for pinned/scrollytelling storage and stats reveals
  - Lenis (or Locomotive) smooth-scroll for the eased inertia feel
  - IntersectionObserver for lightweight enter-animations
  - CSS position:sticky for pinned image + swapping text panels
  - responsive <picture>/srcset + lazy-loading for the heavy product photography
  - Possibly a lightweight 3D/render turntable (three.js) or, more likely, pre-rendered image-sequence scrubbing for the 360/colour views

**Functional tools**
  - Booking / reservation flow (choose city, pick colour, customise, reserve) at /indie/book
  - Colour + variant configurator ('customise the ride')
  - Dedicated Tech Specs page (/indie/specs) with performance/range/battery/charging/storage/wheels/safety groupings
  - Test-ride scheduler
  - Find-a-store / dealer locator
  - River Care support hub + FAQs (/care/faqs)
  - Companion mobile app (Google Play) for connected features

**SEO.** H1: _The SUV of Scooters_  
Keywords: River Indie, SUV of scooters, electric scooter India, River electric scooter, electric scooter with storage, 55 litre storage scooter, long range electric scooter, Red Dot award scooter
Title: `River Indie: The SUV of Scooters`

**Visual style.** Real-world lifestyle + environmental product photography (scooter on ramps, slushy roads, loaded with cargo) rather than sterile studio cutouts — reinforcing the 'SUV' toughness narrative. Confident, restrained typography (large geometric sans headlines, generous whitespace), a calm neutral/earthy palette letting the product colours pop, and slow, weighty motion that feels premium and deliberate rather than flashy. Red Dot badges used as trust anchors.

**Image ideas worth stealing**
  - Environmental hero: scooter mid-use on a real broken/steep/slushy road, not a white studio — proves the 'SUV' claim
  - Storage 'proof' shots: open under-seat boot swallowing a full-face helmet + groceries + laptop bag; open glovebox with phone/wallet
  - Loaded-up cargo shots with Lock & Load panniers and front foot-peg carrying a gas cylinder / delivery boxes (livelihood angle)
  - Macro detail crops: 14-inch alloy wheel, steel dual-cradle frame weld, twin-beam headlamp, disc brakes
  - Exploded/annotated diagram calling out storage volumes, chassis, motor and battery
  - Colour-swatch render set (one clean 3/4 hero per colour) for the configurator cross-fade

**Steal for Kinetic Green**
  - Adopt a single sticky, benefit-led positioning line per product the way 'The SUV of Scooters' works — e.g. give E-Luna a 'The Workhorse, Electrified' hero and Safar a '3-wheeler that pays for itself' line — instead of leading with spec sheets. This is the biggest, cheapest win.
  - Build the signature scrollytelling STORAGE/UTILITY section: pin the product image and reveal load-carrying proof one callout at a time (E-Luna's carrying capacity, milk cans / cylinders / delivery loads). River's storage section is the emotional core — KG's livelihood-vehicle story is even stronger for it.
  - Shoot real-world environmental + livelihood photography (broken roads, loaded cargo, small-business owners at work) instead of studio cutouts — this directly sells KG's rural/gig-economy value proposition and out-authenticates premium urban rivals.
  - Ship a proper spec-comparison + on-road-price-by-city + EMI/TCO calculator, and a running-cost-vs-petrol savings tool — decisive for KG's price-sensitive, income-generating buyers (E-Luna vs petrol moped, Safar earnings-per-day).
  - Make it a technical-SEO powerhouse: one H1 per page carrying the model + intent keyword, descriptive H2/H3s, and Product+Offer+FAQPage+Breadcrumb schema on every model and FAQ page — River's own schema looks thin, so KG can out-rank on 'e-moped/electric 3-wheeler India' terms.

---

### Gogoro Smartscooter — https://www.gogoro.com/smartscooter/ (live fetch was egress-blocked; analysis reconstructed from search evidence, the confirmed SERP title/tagline, sibling product pages, and Gogoro's known Apple-grade design system)

**Positioning.** Gogoro sells the Smartscooter not as a vehicle but as a connected, software-defined lifestyle platform — "A ride like no other" — where premium industrial design, the iQ System OS, and the 6-second GoStation battery-swap network combine into one seamless smart-mobility experience. The whole site frames electric two-wheelers the way Apple frames phones: an ecosystem you join, not a commodity you buy.

**Hero.** Full-bleed, edge-to-edge hero: an autoplaying muted looping cinematic video (or high-res render) of the scooter in motion / rotating on a clean seamless studio backdrop, with minimal centered or lower-left copy overlaid. Headline is aspirational and short ("A ride like no other." / "Ride refined" on 2-series), a single high-contrast primary CTA ("Explore" / "Find a store" / "Compare"), and a subtle scroll-cue. Type is large, thin, generous whitespace; the product is the hero, copy is secondary. No clutter above the fold — one product, one statement, one action.

**Interactions & animation**
  - Scroll-triggered fade/slide-up reveals on every section (IntersectionObserver / GSAP ScrollTrigger)
  - Pinned 'scrollytelling' feature section where the scooter stays fixed while spec callouts and captions swap as you scroll
  - Autoplay muted looping background hero video, often with scroll-scrubbed video playback (video frame tied to scroll position)
  - Image-sequence / sprite-frame scrubbing to rotate the scooter 360 degrees as you scroll
  - Animated number counters for performance stats (0-50 time, top speed, range) triggered on view
  - Parallax depth between product layer and background
  - Horizontal-scroll or draggable carousel for the model lineup

**Modern JS/CSS & likely stack**
  - React + Next.js style SPA/SSR framework (fast client routing, image optimization)
  - GSAP + ScrollTrigger for pinning and scroll-driven timelines
  - Smooth-scroll layer (Lenis or Locomotive) for the weighted, inertial scroll feel
  - IntersectionObserver for lazy reveal + lazy media loading
  - Scroll-linked <video> currentTime scrubbing and/or canvas image-sequence playback for the 360/hero
  - position: sticky for pinned sections; CSS scroll-driven animations as a progressive enhancement
  - backdrop-filter: blur() on the nav and overlay cards

**Functional tools**
  - Compare Specs tool (side-by-side spec table across all models at /smartscooter/specs/)
  - Model configurator / lineup selector
  - Store locator ('Find a Store') with map
  - Test-ride / booking flow
  - Battery-swap subscription (Gogoro Network) plan explainer
  - GoStation network map
  - Region / language selector

**SEO.** H1: _Gogoro Smartscooter® — A ride like no other._  
Keywords: Gogoro Smartscooter, electric scooter, battery swapping, iQ System, smart electric scooter, GoStation, electric two-wheeler, EV scooter
Title: `Gogoro Smartscooter® — A ride like no other.`

**Visual style.** Apple-grade minimalism: predominantly clean white and deep-black sections that alternate, seamless studio product photography and cinematic renders (no busy backgrounds), one accent hero color per model. Typography is large, light-weight, tight-tracked sans-serif with generous negative space. Motion feel is slow, weighted, and premium — everything eases in smoothly, nothing bounces. Product-first: imagery dominates, copy is sparse and confident. High-contrast dark sections used to make chrome/LED details glow.

**Image ideas worth stealing**
  - Seamless studio hero of the E-Luna / Zing on infinite-white and infinite-black cyclorama (no distracting background)
  - Cinematic in-motion lifestyle shots in recognizable Indian city contexts (dawn city streets, deliveries, family commute) with motion blur
  - Macro detail shots: LED headlight signature, weld-free chassis lines, dashboard/display, brake disks, seat texture — each shot able to anchor a scrollytelling callout
  - 360-degree turntable image sequence of each vehicle (60-120 frames) for scroll-scrub rotation
  - Exploded-view / cutaway render showing battery, motor, frame — for a 'what's inside' section
  - Color-swatch product renders so the same scooter appears in every available body color for a live color picker

**Steal for Kinetic Green**
  - Adopt a Product + Offer + AggregateRating + BreadcrumbList schema.org block on every KG model page (E-Luna, Zing, Safar) so Google shows price, rating and breadcrumbs in results — highest-ROI technical SEO win and Gogoro clearly does it.
  - Build a single, clean H1 per page with the model name + a benefit tagline (e.g. 'Kinetic E-Luna — India's Tough Electric Moped'), then H2s that carry intent keywords ('E-Luna price & range', 'Swappable battery', 'Book a test ride'), instead of decorative marketing headings with no keywords. Fix the H-tag hierarchy site-wide (one H1, logical H2/H3 nesting).
  - Ship a full-bleed cinematic hero (muted autoplay looping video/render on a seamless backdrop) with ONE tagline and ONE CTA per model — replace cluttered above-the-fold with product-first minimalism.
  - Add a scrollytelling 'pinned product + revealing spec callouts' section using GSAP ScrollTrigger to walk buyers through E-Luna's real differentiators (tough frame, 50 km range, swappable battery, side-stand, load capacity).
  - Build a proper Compare Specs tool — side-by-side table across E-Luna / Zing variants / Safar — Gogoro's /specs page is a strong conversion and long-tail SEO asset ('E-Luna vs Zing').

---

### https://www.gogoro.com/smartscooter/delight/ — Gogoro Delight ("The First Feel-Good-Ride"). NOTE: gogoro.com and every secondary source (Wikipedia, evmagz, bikes4sale, topgear, web.archive) were blocked by this environment's egress proxy, so the live DOM/source could not be inspected. Findings below are reconstructed from WebSearch evidence plus the well-known behavior of Gogoro product pages; technique inferences are marked as inferred where the source could not be confirmed.

**Positioning.** "Designed by her, for her" — the first feel-good ride. The Delight reframes an e-scooter as a refined, elegant, emotionally warm everyday companion rather than a spec sheet: a lighter, simpler, more human variant of Gogoro's Smartscooter, conceived by an all-women design team around real comfort and lifestyle needs (fragrance, cup holder, knee comfort, personalization). The value prop is emotional delight + effortless smart tech, not raw performance.

**Hero.** Full-viewport hero built around a silent autoplay looping product film (scooter gliding / lifestyle b-roll) rather than a static photo, overlaid with a large lightweight H1 ("All-New Gogoro Delight" / "The First Feel-Good-Ride") and a short poetic subline. Minimal CTA — a single "Reserve / Compare Models" button and a soft scroll-cue. Copy is short and feeling-led; the vehicle is the visual, chrome is stripped to near-zero.

**Interactions & animation**
  - Autoplay muted looping hero video that plays inline and pauses off-screen (IntersectionObserver-gated)
  - Scroll-triggered fade-up / mask reveals on each feature block as it enters the viewport
  - Pinned / sticky scroll sections where copy scrolls while the product media stays fixed and cross-fades between states
  - Video scrubbing or frame-swap tied to scroll for the cup-holder-unfolds and fragrance-capsule demos (media state driven by scroll progress)
  - Parallax layering — background scooter drifts slower than foreground text
  - Interactive color / dashboard-ring picker that live-swaps the hero render on click with a smooth crossfade
  - Hover micro-interactions on CTAs and spec cards (lift, underline-wipe, arrow slide)

**Modern JS/CSS & likely stack**
  - Modern JS SPA/SSR framework — inferred Nuxt/Vue (Gogoro's typical stack) or equivalent React/Next, hydrated client-side
  - GSAP + ScrollTrigger (inferred) for pinned sections, scroll-scrubbed media and staggered reveals
  - IntersectionObserver for lazy video play/pause and reveal triggers
  - Smooth-scroll layer (Lenis / Locomotive-style, inferred) for momentum feel
  - HTML5 <video> with muted autoplay/playsinline, and likely scroll-linked currentTime scrubbing
  - CSS backdrop-filter (frosted nav / overlays)
  - CSS clip-path / mask-image for reveal wipes on media

**Functional tools**
  - 'Compare Smartscooter Models' spec-comparison tool (/smartscooter/specs/?models=…) with side-by-side model columns
  - Interactive color selector for body colors (Blue/Green/Rose Gold/White)
  - Adjustable dashboard-ring color personalization preview
  - Reserve / pre-order and test-ride booking flow
  - 'Find a store' / dealer + GoStation battery-swap network locator (map)
  - Battery-subscription plan explainer (Gogoro Network swap pricing)
  - Ride-mode explainer (Smart / Normal / Super Boost / Low Energy) selector

**SEO.** H1: _All-New Gogoro Delight — The First Feel-Good-Ride_  
Keywords: Gogoro Delight, feel-good ride, electric scooter for women, designed by her, smart electric scooter, Gogoro Smartscooter, iQ System, refillable fragrance capsule
Title: `All New Gogoro Delight - The First Feel-Good-Ride`

**Visual style.** Premium, editorial, feminine-but-not-saccharine. Real cinematic photography and video of the scooter in soft daylight and warm interiors, not 3D renders — human, aspirational, lifestyle-led. Airy layouts with generous whitespace, pastel accent palette echoing the product colors (rose gold, mint green, sky blue, white), light neutral backgrounds. Large thin display type for headlines, clean humanist sans for body. Motion feel is calm, gliding and unhurried — long fades, gentle parallax — reinforcing the "feel-good, refined" positioning rather than aggressive/sporty energy.

**Image ideas worth stealing**
  - Full-bleed cinematic hero video of the scooter gliding through a soft-lit city with a rider, shot at golden hour
  - Macro slow-motion clip of the refillable fragrance capsule and the aluminium ring cup holder unfolding
  - 360-degree spin / color-swap render sequence for the interactive color picker
  - Close-up detail crops: AIRCUSH knee pad, dashboard ring glowing in chosen color, keycard tap-to-start
  - Lifestyle flat-lay of rider essentials (coffee cup in holder, keycard, phone) tying features to daily life
  - Split before/after of cup holder folded vs extended and fragrance on/off mood shots

**Steal for Kinetic Green**
  - Lead with an emotion, not specs. Gogoro sells 'the first feel-good ride,' not '150 km range.' Kinetic Green should give E-Luna and Zing a single ownable emotional promise in the H1 (e.g. E-Luna: 'The moped that earns its keep' / 'India's do-it-all family EV') and let specs be the supporting proof lower down.
  - Ship a full-viewport autoplay hero VIDEO (muted, inline, IntersectionObserver-gated) of the vehicle in real Indian streets, replacing static hero banners. This single change most raises perceived premium quality — do it for E-Luna, Zing and the Safar 3-wheeler landing pages.
  - Build an interactive color / variant picker that live-swaps the hero render with a crossfade — cheap to build with pre-rendered PNGs, huge for engagement and time-on-page. E-Luna and Zing both have color options worth showcasing this way.
  - Use pinned/sticky scroll storytelling for hero features: pin the product image while feature copy scrolls and the image cross-fades between states (GSAP ScrollTrigger). Kinetic can spotlight E-Luna's real load capacity, detachable battery and mileage this way, and Safar's payload/earning story.
  - Turn utility into signature 'delight' features with their own named sections and demo clips, the way Gogoro did with the fragrance capsule and folding cup holder. Kinetic's differentiators — E-Luna's telescopic suspension + real 150 kg payload, detachable/portable battery, low running cost per km — deserve named, animated feature blocks, not a spec table line.

---

### Ather Energy — https://www.atherenergy.com/

**Positioning.** Ather positions itself as India's premium, design-and-software-led EV brand — the "intelligent electric scooter" company (often framed as the Tesla-of-two-wheelers). Two clear product ladders: the performance-and-tech 450 series (450X/450S) and the practical, family-oriented Rizta, now extended by the mass-market EL-platform Konarc. The homepage sells confidence in range, connected/AtherStack software, and ownership economics rather than just specs.

**Hero.** Full-viewport hero that leads with a single high-fidelity product render/loop of the flagship (Rizta or 450) on a clean, near-monochrome studio backdrop, with a short benefit headline (range/family/performance), a price-anchoring line ("starting at ₹…"), and dual CTAs — primary "Book Test Ride" and secondary "Explore / Configure". The hero often auto-cycles model tiles and uses a muted looping product video rather than a static image. CTAs are persistent and repeated as a sticky bottom bar on mobile.

**Interactions & animation**
  - Scroll-triggered reveals — copy and imagery fade/slide up as sections enter the viewport (IntersectionObserver / ScrollTrigger)
  - Pinned/sticky scroll storytelling — a feature section stays fixed while the scooter zooms or swaps highlights, text panels cross-fading step by step
  - Video scrubbing — product/feature videos advance tied to scroll position for the 'the scooter builds/rotates as you scroll' effect
  - Animated stat counters for range, top speed, torque, boot litres that count up on entry
  - Configurator with 360° / multi-angle colour spin and real-time price + accessory toggles updating instantly
  - Hover-to-preview product tiles and micro-interactions on CTAs (fill/underline sweeps)
  - Sticky mobile CTA bar and sticky in-page section nav on long product pages

**Modern JS/CSS & likely stack**
  - Next.js (React) with SSG + ISR for 600+ pages and SSR for interactive routes — confirmed by search
  - GSAP + ScrollTrigger for pinning, scroll-scrubbed timelines and reveals
  - Smooth-scroll layer (Lenis or Locomotive-style) for the eased scroll feel
  - IntersectionObserver for lightweight enter-animations and lazy loading
  - HTML5 <video> with muted autoplay loops + scroll-synced currentTime scrubbing (frame sequences/canvas where higher fidelity is needed)
  - Client-side configurator state (React) driving real-time price + colour/accessory selection
  - Image optimization via next/image (responsive srcset, AVIF/WebP, lazy)

**Functional tools**
  - Vehicle configurator (450 and Rizta) — colour + accessory selection with live price and buy/book online
  - Test-ride booking flow with pincode/city + Experience Centre selection (/testride)
  - Experience Centre / dealer locator (geo + pincode)
  - Model comparison across variants (450X vs 450S vs Rizta)
  - Running-cost / savings vs petrol messaging and EMI/finance options
  - Ather Grid fast-charging network map
  - Connected-app / AtherStack feature showcase

**SEO.** H1: _Ather Electric Scooter in India_  
Keywords: electric scooter, electric scooter price in India, Ather 450X, Ather Rizta, electric scooter range, best electric scooter, EV scooter, electric scooter test ride
Title: `Electric Scooter in India | Price, Colours & Features (2026) | Ather Energy`

**Visual style.** Clean, premium, product-forward. High-resolution studio renders and product photography on white/light-grey and occasional deep-charcoal sections for contrast. Restrained accent color (Ather's signature green/teal) used sparingly for CTAs and highlights. Modern geometric sans-serif type with large, tight display headings and generous whitespace. Motion feel is smooth and deliberate — eased, physics-y transitions rather than bouncy; product is always the hero, UI chrome stays minimal.

**Image ideas worth stealing**
  - Hero-grade studio renders of each Kinetic model (E-Luna, Zing, Safar 3-wheeler) on seamless white + one dramatic charcoal set, shot from a consistent 3/4 angle
  - 360° colour-spin frame sequences per model (24-36 frames) to power a configurator and scroll-rotate hero
  - Scroll-scrub 'build/reveal' video of the E-Luna assembling or rotating
  - Real-world Indian lifestyle photography — family on the E-Luna, delivery/utility use of Safar 3-wheeler, daily commuter shots (relatable, aspirational, not stock-generic)
  - Close-up detail macros — dashboard/instrument cluster, battery/charging port, boot/loading space, build quality textures
  - Animated infographic assets for range, running cost per km, and payload (for the Safar)

**Steal for Kinetic Green**
  - Build a real-time online CONFIGURATOR per model (E-Luna, Zing, Safar): colour + accessory selection with live on-road price and a 'Book Online'/'Book Test Ride' CTA — this is Ather's highest-converting asset and Kinetic likely lacks it.
  - Add a 360° colour-spin viewer driven by a frame sequence — cheap to produce (turntable render/photo set), huge perceived-premium lift, reusable in hero and configurator.
  - Ship a TCO / 'EV vs petrol savings' calculator (₹/km, monthly fuel saved, break-even) — for the E-Luna vs petrol moped and Safar 3-wheeler vs diesel auto this is a powerful, share-worthy conversion tool aimed at value-driven Indian buyers.
  - Persistent 'Book Test Ride' CTA (sticky top button + sticky mobile bottom bar) plus a pincode-based Experience Centre / dealer locator — turn the site from a brochure into a lead-generation funnel.
  - Adopt Next.js SSG + ISR so 100s of model/city/dealer pages render server-side for SEO while interactive tools stay client-side; pair with next/image for fast, optimized product imagery.

---

### https://www.ultraviolette.com/ — Ultraviolette Automotive (Bangalore-based high-performance electric motorcycle & scooter maker; products: F77 Mach 2 / SuperStreet electric motorcycle, Tesseract electric scooter, Shockwave, plus Violette AI smart-tech layer)

**Positioning.** Ultraviolette positions itself as an aerospace-derived, hyper-performance EV brand — "high-performance electric motorcycles" defined by hard numbers (155 km/h top speed, 100 Nm torque, 0–60 in ~2.7s, up to 323 km IDC range). The core idea is aspirational engineering credibility: a fighter-jet / aviation design lineage that frames electric two-wheelers as precision performance machines rather than economical commuters — the exact opposite of the value/mileage framing most Indian EV brands lead with.

**Hero.** Full-viewport, dark, cinematic hero built around a hero motorcycle render/video (F77 Mach 2) rather than lifestyle photography. Minimal, confident copy — a short performance headline plus the signature stat triplet (top speed / torque / acceleration) surfaced immediately — with a single dominant CTA ("Book a Test Ride") and a secondary "Book Now / Configure" path. The vehicle is the hero; the background is near-black to make the machine and a UV/violet accent glow read as premium. Copy is terse and numbers-forward, no marketing fluff above the fold.

**Interactions & animation**
  - Scroll-triggered pinned product sections where the bike stays fixed while spec copy and callouts animate in (classic GSAP ScrollTrigger pin + timeline)
  - Animated number counters for the headline stats (top speed, torque, 0-60, range) that count up on enter
  - Video / image-sequence scrubbing tied to scroll to rotate or reveal the motorcycle as you scroll (canvas frame-by-frame playback)
  - Parallax layering of product render vs background vs text
  - Smooth/inertia scrolling (Lenis-style) for the cinematic momentum feel
  - Fade/slide/mask reveals of sections via IntersectionObserver as they enter viewport
  - Hover micro-interactions on CTAs and colour/variant swatches

**Modern JS/CSS & likely stack**
  - Component framework — React, almost certainly Next.js (SSR/SSG for SEO + per-country routing via ?country= param)
  - GSAP + ScrollTrigger for scroll-pinned timelines and reveal choreography
  - Lenis (or similar) for smooth/inertia scroll
  - Canvas-based image-sequence scrubbing for the scroll-driven bike reveal (pre-rendered frame sets), with WebGL/three.js plausible for any live 3D
  - IntersectionObserver for entrance animations and lazy-loading heavy media
  - CSS: clip-path masks for reveal wipes, backdrop-filter for frosted nav/overlays, CSS custom properties for the dark theme + UV accent token, sticky position for pinned CTAs, prefers-reduced-motion guards
  - Optimized media pipeline — responsive next/image, muted autoplay looped <video> heroes, lazy video, poster frames

**Functional tools**
  - Configurator (/configure) — pick variant, colours and tech, then book
  - Test ride booking flow (/testride) with location/slot selection
  - Book Now / reservation & pre-order flow
  - Tesseract 'register interest' / waitlist capture for unreleased product
  - Spec presentation with variant comparison (7.1 kWh vs 10.3 kWh; F77 vs Mach 2)
  - Region/country selector driving localized price & availability
  - Violette AI connected-vehicle feature showcase (ride analytics, OTA, safety alerts)

**SEO.** H1: _High-Performance Electric Motorcycles_  
Keywords: high-performance electric motorcycle, electric motorcycle India, F77 Mach 2, electric superbike India, fastest electric bike India, electric scooter, Tesseract electric scooter, book test ride electric motorcycle
Title: `High-Performance Electric Motorcycles | Ultraviolette`

**Visual style.** Dark, cinematic, near-black backgrounds with a signature ultraviolet/electric-purple accent and cool metallic highlights. Product-first: high-fidelity studio renders and CGI of the machines (often more render than lifestyle photo) shot dramatically with rim lighting. Typography is a tight, technical, mostly uppercase sans in confident weights — engineered and aerospace-inspired, lots of negative space, thin dividing rules and monospaced/tabular numerals for specs. Motion feel is heavy, precise and momentum-driven — slow cinematic reveals, not bouncy — reinforcing "precision machine."

**Image ideas worth stealing**
  - Hero-grade CGI/studio renders of Kinetic vehicles (E-Luna, Zing, Safar 3-wheeler) on near-black backgrounds with dramatic rim lighting and a single brand accent glow
  - Scroll-scrub image sequences: 36–60 frame turntable renders of each vehicle so it rotates as the user scrolls
  - Exploded / cutaway diagrams of the battery, motor and drivetrain to convey engineering credibility
  - Macro detail shots — LED DRL signature, TFT/instrument cluster, welds, tyres, brake discs
  - Colour/variant swatch renders for a configurator (same vehicle, multiple colourways)
  - Real-world Indian-context lifestyle shots for E-Luna (family utility, rural/semi-urban roads, load-carrying) and Safar (last-mile passenger/cargo) to balance the studio renders with relatable use

**Steal for Kinetic Green**
  - Lead with a numbers-forward, product-first dark hero for the flagship (E-Luna): put 2–3 hard proof-points (real range in km, running cost ~paise/km, payload) as animated counters above the fold with ONE dominant CTA (Book Test Ride / Book Now) — replace generic 'affordable green mobility' copy with concrete, comparable numbers.
  - Build a real configurator + test-ride/booking funnel (variant → colour → city → slot) as the primary conversion path, mirroring /configure and /testride — most Indian EV rivals bury this; a clean funnel with region/city selection directly drives leads.
  - Add semantic SEO structure: one keyword-rich H1 per page ('E-Luna Electric Moped — Range, Price & Booking'), a logical H2/H3 hierarchy per feature/spec, and Product+Offer, FAQPage, BreadcrumbList and Organization/WebSite JSON-LD so vehicles are eligible for rich results and price/availability snippets.
  - Implement scroll-driven storytelling with GSAP ScrollTrigger + a canvas image-sequence turntable so each vehicle rotates/reveals as users scroll — cinematic reveals with pinned sections make even a value product feel premium and high-tech.
  - Create a category-structured editorial blog (buying guides, running-cost comparisons, 'E-Luna vs petrol moped', maintenance tips) with BlogPosting schema — Ultraviolette uses this as an organic-traffic engine; it's high-ROI and cheap for KG to own long-tail EV search in India.

---

### CFMoto Global — https://www.cfmoto.com/global (home.html)

**Positioning.** CFMoto positions itself as a full-line global powersports maker ("Powersports Vehicles, Motorcycles, ATVs & SSVs") whose brand promise is "Experience More Together" — accessible, tech-loaded, value-for-money machines that let riders and families do more. The global site is a catalog-and-discovery hub organized by vehicle type rather than an emotional single-product showpiece, prioritizing breadth of lineup, spec credibility, and routing riders to their local market site/dealer.

**Hero.** Full-bleed hero occupying the first viewport: an autoplaying muted looping background video (or a high-res hero still on mobile) of a flagship model in motion — typically the 800MT/450MT adventure or 800NK naked — with a short overlaid headline ("Experience More Together"), a model name/eyebrow, and one or two CTAs ("Explore" / "Discover"). The hero is a rotating carousel/slider of 3-5 featured models or campaigns, each slide with its own CTA, pagination dots, and a subtle scroll-down cue prompting the viewer into the category grid below.

**Interactions & animation**
  - Autoplaying muted looping hero background video
  - Hero slider/carousel with autoplay, pagination dots and prev/next (Swiper-style)
  - Scroll-triggered fade/slide-up reveals on section entry (AOS/IntersectionObserver-style)
  - Sticky header that shrinks/changes background on scroll
  - Hover states on category cards (image zoom/scale, overlay caption reveal, CTA underline)
  - Mega-menu flyout with fade/slide expansion
  - Horizontal model carousels for range browsing

**Modern JS/CSS & likely stack**
  - Traditional CMS-served multi-page site (.html URLs like /global/home.html, /global/motorcycles/naked.html) rather than a headless SPA
  - jQuery + a slider library (Swiper.js or Slick) for the hero and range carousels
  - Scroll-reveal via IntersectionObserver or an AOS-type library (not heavy GSAP ScrollTrigger pinning)
  - HTML5 <video> autoplay/loop/muted/playsinline for hero and section backgrounds
  - CSS transforms/transitions for hover zoom and card lift; likely some backdrop-filter on the sticky nav
  - Responsive breakpoints + srcset/lazy-loading for the large model imagery
  - Region/geo redirect logic routing users to local market sites

**Functional tools**
  - Vehicle-type category browsing (Motorcycle / Scooter / 3-Wheeler) as top-level entry
  - Model index / lineup pages with filtering by category
  - Build & Price / configurator (color + variant + accessories) — present on CFMOTO USA (cfmotousa.com/inventory/customizer)
  - Dealer locator by city/state/pincode
  - Financing / EMI calculator (CFMOTO USA has a financing calculator)
  - Online booking / reserve / enquiry flow
  - Spec sheets and model comparison

**SEO.** H1: _CFMOTO Global — Powersports Vehicles, Motorcycles, ATVs & SSVs_  
Keywords: CFMOTO, CFMOTO motorcycles, powersports vehicles, sport motorcycle, naked motorcycle, adventure motorcycle, ATV, side-by-side / SSV
Title: `CFMOTO Global | Powersports Vehicles, Motorcycles, ATVs & SSVs`

**Visual style.** Photography-led, not 3D-render-led: cinematic on-location action shots and studio product photography on dark/neutral backgrounds. Confident, sporty, slightly industrial visual language — high-contrast imagery, orange/red CFMOTO accent against black/graphite/white, bold condensed uppercase display type for model names paired with clean sans body. Motion feel is restrained and corporate-premium: fades, gentle parallax, and video rather than experimental WebGL. Broad, catalog-first layout designed to scale across dozens of models and many market variants.

**Image ideas worth stealing**
  - Cinematic on-location action shots per use-case: E-Luna commuting through Indian city traffic, Safar 3-wheeler carrying passengers/cargo in a town market, Zing e-scooter on a college campus
  - Studio hero renders/photos of each model on a dark seamless background with dramatic rim lighting and the KG orange/green accent
  - Category entry tiles: one strong image each for E-Moped (E-Luna), E-Scooter (Zing/family), and Electric 3-Wheeler (Safar) — the CFMoto vehicle-type card pattern
  - TFT/instrument-cluster and app UI close-ups showing connectivity, range, ride modes (CFMoto leans on TFT + T-BOX/Ride app imagery)
  - Detail macro shots: motor, battery pack, LED headlamp, seat/load deck — to signal engineering credibility
  - Real Indian customer/family lifestyle photography reinforcing 'built for India' and total-cost-of-ownership story

**Steal for Kinetic Green**
  - Adopt CFMoto's vehicle-TYPE-first architecture: a homepage row of 3 bold category tiles — 'E-Moped (E-Luna)', 'E-Scooters (Zing family)', 'Electric 3-Wheelers (Safar)' — each an image card that routes to a filtered lineup. This scales as KG adds models and instantly communicates the full portfolio, which a single-hero EV site cannot.
  - Build a proper 'Build & Price' configurator like CFMOTO USA's customizer (color + variant + accessories + live price) plus an India-specific EMI/finance calculator and a petrol-vs-EV savings/TCO calculator — the highest-converting functional tools for a value/commuter EV buyer and a strong SEO/long-tail asset.
  - Ship a semantic SEO heading skeleton per model: H1 = '[Model] — [Category] Electric [Vehicle] in India' (e.g. 'Kinetic E-Luna — Electric Moped in India'), H2s for Range, Price & EMI, Specifications, Features, Colours, Book Test Ride; add Product + Offer + FAQPage + BreadcrumbList JSON-LD (CFMoto's catalog under-uses FAQ/Review schema — beat them there for rich results on 'E-Luna price', 'best electric moped India').
  - Use a restrained, video-led cinematic hero (autoplay muted looping clip of E-Luna/Safar in a real Indian setting) with one clear headline and CTA, matching CFMoto's confident hero — but keep it lightweight and mobile-first for India's bandwidth, with a static poster fallback.
  - Lead with a spec/tech-credibility band the way CFMoto leans on TFT + T-BOX + Ride app: showcase KG's connectivity, battery, range and instrument cluster with macro detail shots and count-up stats to build engineering trust against Ola/Ather/Bajaj.

---
