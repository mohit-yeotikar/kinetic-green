# Kinetic Green — Product-led homepage

## Goal and current state
A quieter, premium automotive homepage: six focused sections, large product imagery,
a short journey to a test ride, and one useful running-cost calculator. Updated
22 September 2026 following approval of the simplified design direction.

- Stack: existing Astro 7 static site, TypeScript, vanilla browser controllers.
- Build: `npm run build` generates `dist/`.
- Preview: PM2 runs Wrangler Pages on port 3000.
- Production: not deployed during this redesign; no production resources changed.
- Preview URL: https://3000-i6djjadl0wkqz5oqw14qg-5c13a017.sandbox.novita.ai
- No application backend, CRM connection or live booking endpoint is configured.

## Completed features
1. **Hero** — oversized editorial headline, a single E-Luna product stage, one
   primary booking button and a secondary range link. Removed floating specs,
   technical grids and stacked conversion strips.
2. **Range** — E-Luna, Zing and Safar Smart product cards, All / Two-wheelers /
   Three-wheelers filters, native accessible product-detail dialogs, and
   vehicle-prefilled booking previews.
3. **Savings** — one daily-distance slider with optional cost assumptions;
   correctly server-rendered defaults and instant client updates.
4. **Ownership** — lifestyle photography and three expandable practical answers.
5. **Dealer access** — city/PIN search explicitly opens Google Maps. No invented
   addresses, proximity figures or claims of a live verified dealer feed.
6. **Final invitation** — one test-ride CTA, followed by a compact footer.

The corrected vector wordmark is retained. Header geometry is tested across
mobile/tablet/desktop; full name remains visible on small screens. Navigation has
four links. Duplicate marks, sticky mobile CTA and scroll-progress ornamentation
are removed from the homepage.

## Functional entry points
| URI / control | Behaviour |
| --- | --- |
| `/` and `/#top` | Six-section homepage |
| `/#vehicles` | Three-vehicle range; filters use `all`, `two`, `three` |
| Discover buttons | Open `#product-eluna-plus`, `#product-zing`, or `#product-safar-smart` native dialogs |
| `/#calculator` | Daily distance and expandable petrol-price, mileage, days/month assumptions |
| `/#ownership` | Charging, support and finance accordions |
| `/#dealers` | City or six-digit PIN input; popular-city prefills; customer-care link |
| `/#enquire` | Closing invitation |
| `[data-lead-open]` | Existing multi-step booking UI, explicitly in preview mode |
| `/api/lead` | **Not implemented and not called by the preview flow** |

Dealer search opens `https://www.google.com/maps/search/?api=1&query=...` in a new
tab with a Kinetic Green dealer query. Listings remain third-party results; users
are advised to confirm authorisation and availability before visiting.

## Booking and privacy limitations
The booking modal explicitly states that it is a design preview. Final submission
shows **“Preview complete / No booking has been made”** and sends no request to
`/api/lead`. Use test details. The inherited draft mechanism uses browser session
storage; there is no production lead database. The old transport utility remains
in source for future integration but is not invoked in preview mode.

Before enabling live requests, implement secure server-side validation, an approved
privacy notice and consent handling, abuse prevention, and a Cloudflare D1-backed
lead store / server-side CRM integration. Do not remove the preview flag until
that end-to-end integration is operational. API secrets must never enter client
code. Replace the reconstructed SVG logo with an approved brand master at launch.

## Calculation model
- Monthly km = daily km × riding days per month.
- Petrol / month = monthly km ÷ petrol mileage × petrol price.
- EV / month = monthly km × ₹1.10 (illustrative assumption, not a vehicle spec).
- Annual saving = max(0, petrol cost − EV cost) × 12.
- Default: 30 km/day, 25 days/month, 45 km/l, petrol ₹105/l.
- Default outputs: petrol ₹1,750/month; EV ₹825/month; saving ₹11,100/year.

Excludes purchase price, finance, insurance, servicing and battery replacement.
The interface discloses these exclusions; savings are not guaranteed. Input
values are bounded and negative savings are never shown as a positive claim.

## Data and imagery
`src/data/vehicles.ts` retains the previous catalogue for booking selections.
The curated homepage avoids unconfirmed numerical product specifications.
Zing is added with no invented price, range or battery figures.

Optimised assets under `public/media/`:
- `eluna-hero.webp`: existing E-Luna cutout, reused in hero/range.
- `scooter.webp`: copper Zing product cutout, found via image search; source listing
  https://kineticgreen.com/products
- `safar.webp`: Safar Smart product cutout; source listing
  https://kineticgreen.com/products?filter=3w
- `riding.webp`: E-Luna campaign lifestyle image; source
  https://bwautoworld.com/article/kinetic-green-unveils-new-tvc-for-e-luna-reviving-iconic-chal-meri-luna-legacy-548757

New imagery came through the image-search tool and was visually checked for model
identity. Obtain approved campaign assets / usage clearance before a public brand
launch. The lifestyle photo is illustrative, not a testimonial. Original download
intermediates are not shipped. No image-generation credits were used.

## Architecture
- `src/pages/index.astro`: six-section composition.
- `src/styles/redesign.css`: single campaign design layer.
- `src/scripts/main.ts`: navigation, range, calculator, dealer and booking only.
- `src/components/LeadModal.astro`: inherited booking UI with explicit preview gate.
- Previous long-page components remain in source/version history but are not
  rendered, linked from the homepage or loaded by its controller bundle.
- Static HTML stays readable without JavaScript; range descriptions use native
  details as a fallback and default savings values remain accurate.

## Development and verification
```sh
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000
node .review/functional.spec.cjs
```
The browser test uses the sandbox's installed Playwright package. For external CI,
install Playwright and update the require path in the test harness.

Verified:
- Eight viewport widths: 320, 390, 640, 768, 1024, 1200, 1440 and 1920px.
- Six sections, no horizontal overflow, contained wordmark and visible controls.
- Range filtering, dialog open/Escape/booking handoff, correct selected vehicle.
- Savings defaults, changed inputs, input bounds and zero-saving case.
- Ownership accordion and dealer query construction / invalid PIN rejection.
- Working internal anchors and mobile menu open/Escape close.
- Complete booking preview, valid quick-pick date, and zero lead POST requests.
- No-JavaScript content and default calculation.
- No browser console errors on the public preview.

Approximate gzip payload after redesign: HTML 18 KB (including campaign CSS),
shared CSS 7 KB, JS 10 KB. Product/lifestyle images are locally served WebP files.

## Recommended next steps
Review the visual direction in the preview. Then supply approved brand/product
assets, confirm the live catalogue and contact details, connect booking/CRM and a
verified dealer feed, and choose a production deployment path. Existing static
Astro output can be deployed to Cloudflare Pages; do not assume the default
Hono in-platform hosting path supports this non-default repository unchanged.
