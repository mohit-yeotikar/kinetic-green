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
| Hero | Two-line headline rises out of clipped lines on load. The E-Luna sits on a 3D stage that tilts toward the pointer; spec chips, ghost wordmark and floor shadow sit at different depths and parallax. Real figures on the chips (110 km, 50 km/h, 4 h, ₹69,990). Tonino Lamborghini partner badge. |
| Signature transition | The hero is pinned for one viewport of scroll while the Range section slides over it as a rounded curtain; the stage scales back and dims as it is covered. |
| Range | E-Luna, Zing and Safar Smart cards with real ex-showroom prices and specs, hover lift, one “Book a test ride” each (prefills the modal). |
| Proof | The one full-green band: 550+ dealers, 50+ years, 44 cr+ km, counted up on reveal. Figures from `src/data/content.ts`. |
| Savings | Daily-distance slider with adjustable assumptions; logic in `src/scripts/calculator.ts`. |
| Ownership | Lifestyle photo plus charging / service / finance answers. |
| Dealers | City or PIN search that opens Google Maps (no invented dealer records). |
| Closing + footer | One final test-ride CTA, compact footer with price/spec disclaimer. |

## Motion contract
- One `requestAnimationFrame` loop (`src/scripts/hero.ts`) lerps pointer tilt and
  scroll progress; it writes CSS custom properties that feed `transform`/`opacity`
  only, and sleeps once values settle. Pointer tilt runs on fine pointers only.
- Section reveals and count-ups use `IntersectionObserver` (`src/scripts/premium.ts`).
- `prefers-reduced-motion: reduce` disables every animation and transition, unpins
  the hero and shows all content immediately.
- Mobile (< 768px) never pins the hero; it scrolls naturally.
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
- `src/components/premium/*` — Nav, Hero, Range, Proof, Savings, Ownership, Dealers, Closing, Footer
- `src/styles/premium.css` — the whole visual system (inlined in `<head>` by BaseLayout)
- `src/scripts/hero.ts`, `src/scripts/premium.ts` — motion controllers
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
