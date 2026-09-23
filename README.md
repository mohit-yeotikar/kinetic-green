# Kinetic Green — Premium light homepage

## Direction
Bright white, one bold brand accent (Kinetic Green #00C853), huge confident type,
one hero product as the star, generous whitespace. Ather × Apple precision, no dark
theme. Updated 23 September 2026.

- Stack: Astro 7 static site, TypeScript, vanilla browser controllers, no framework.
- Build: `npm run build` → `dist/`. Preview: `npm run preview` or serve `dist/`.
- Fonts: self-hosted Inter Tight (display) and Inter (body) variable woff2 in
  `public/fonts`, preloaded, with metric-adjusted fallbacks (CLS 0).
- No backend, CRM or booking endpoint is wired; the booking modal is a design
  preview and says so.

## Page
| Section | What it does |
| --- | --- |
| Story (hero) | One pinned stage. Step 0 is the hero: “Chal meri Luna.” at display size, the E-Luna oversized and cropped on a tinted colour wash, a five-paint colour preview (real E-Luna paint names; hue-shifts the single studio photo and is labelled as a preview). Steps 1–4 keep the same bike on screen and zoom it to the battery, frame and console, then pull back for range, each with a glass chapter card and a marker on the part. |
| Signature transition | After the last chapter the Range section slides over the pinned stage as a rounded curtain. |
| Range | E-Luna, Zing and Safar Smart cards with real ex-showroom prices and specs, hover lift, one “Book a test ride” each (prefills the modal). |
| Lifestyle | Full-bleed riding photograph with a slow parallax and “Not a statement. A Tuesday.” |
| Proof | The one full-green band: 550+ dealers, 50+ years, 44 cr+ km, counted up on reveal. Figures from `src/data/content.ts`. |
| Savings | Daily-distance slider with adjustable assumptions; logic in `src/scripts/calculator.ts`. |
| Ownership | Lifestyle photo plus charging / service / finance answers. |
| Dealers | City or PIN search that opens Google Maps (no invented dealer records). |
| Closing + footer | One final test-ride CTA, compact footer with price/spec disclaimer. |

## Motion contract
- One `requestAnimationFrame` loop (`src/scripts/story.ts`) turns scroll into a
  story step and lerps a single transform on the product (compositor only); it
  sleeps once values settle. Chapter cards, markers and dots are class toggles.
- The colour preview is a `data-paint` attribute driving CSS variables (`hue-rotate`
  on the photo, a tinted radial wash); it works without JS motion and under reduced motion.
- Section reveals and count-ups use `IntersectionObserver` (`src/scripts/premium.ts`).
- `prefers-reduced-motion: reduce` disables every animation and transition, unpins
  the hero and shows all content immediately.
- Below 1024px the story never pins: the bike, the hero copy and the four chapters stack.
- LCP is the product image (`fetchpriority=high`, preloaded, never opacity-animated).
  Measured locally: LCP ≈ 110 ms after load, CLS 0.

## Data integrity
`src/data/vehicles.ts` is the single source of truth. E-Luna prices/specs are the
listed OEM figures; Zing and Safar Smart figures are aggregated from public
listings (Sept 2026) and marked `indicative` in the data, with the disclaimer
printed under the cards and in the footer. Confirm with Kinetic Green before launch.
Product photography: the four images in `public/media` (E-Luna cutout, Zing, Safar,
lifestyle). Swap in official campaign shots at the same paths.

## Files
- `src/pages/index.astro` — page composition
- `src/components/premium/*` — Nav, Story, Range, Lifestyle, Proof, Savings, Ownership, Dealers, Closing, Footer
- `src/styles/premium.css` — the whole visual system (inlined in `<head>` by BaseLayout)
- `src/scripts/story.ts`, `src/scripts/premium.ts` — motion controllers
- `src/components/LeadModal.astro` + `src/scripts/leadModal.ts` — booking flow (skinned by premium.css)
- Legacy components from earlier iterations remain in `src/components` but are not rendered.

## Review
`.review/functional.spec.cjs` drives the built site with Playwright: structure,
booking prefill, calculator maths, dealer search, breakpoints 320–1920, mobile menu,
reduced-motion contract and LCP/CLS.

```
npm run build && npx serve -l 4173 dist
BASE_URL=http://127.0.0.1:4173 CHROME_PATH=/path/to/chrome node .review/functional.spec.cjs
```
