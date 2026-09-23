# Kinetic Green — real-data research (public sources)

> **Provenance & caveat.** This session's environment **could not reach kineticgreen.com**
> (or kineticgreenvehicles.com, the golf-cart microsite, or the spec aggregators) — the
> network egress policy blocked those hosts. Every figure below was reconstructed from
> **web-search snippets** of third-party sources (press, Wikipedia, Tracxn, aggregators),
> **not** a direct read of an official spec sheet. Under the repo's data-integrity contract
> nothing here qualifies as `verified` except a few non-spec facts (founder, the Tonino
> Lamborghini partnership, the legal entity, the PM E-DRIVE scheme). **Confirm every price,
> range and battery figure against kineticgreen.com before publishing.** To let a future
> session read the official site directly, broaden the environment's Network access (or add
> `kineticgreen.com` to its allowed domains) in the cloud environment settings.

---

No agent reached the official site, so verification stays capped. Here is the consolidated data sheet.

---

# Kinetic Green — Consolidated Research & Repo-Mapping Data Sheet
*Prepared for engineering mapping into `src/data/vehicles.ts` and `src/data/content.ts`. Compiled 2026-09-23 from six research agents. Verification contract: `verified` = confirmed on kineticgreen.com or an OEM spec sheet · `indicative` = aggregated from reputable public listings, confirm with OEM · `pending`/`unconfirmed` = no reliable source, never render as a claim.*

---

## 1. Reachability

**kineticgreen.com was NOT directly reachable by any agent.** All six research agents report `reachedOfficialSite: false`. The official domain (`kineticgreen.com`), the product portal (`kineticgreenvehicles.com`), the golf-cart microsite (`tlgolfcarts.com`), and every aggregator (BikeWale, BikeDekho, 91Wheels, ZigWheels, Smartprix) were blocked by the environment's network egress proxy. Every product figure below therefore comes from **WebSearch result snippets**, not a line-by-line read of an official spec sheet.

| Agent (key) | Scope | Official data? | Basis |
|---|---|---|---|
| `company` | Company facts + full lineup | No | Search snippets of Wikipedia/Tracxn/press |
| `eluna` | E-Luna family | No | Search snippets of aggregators/press |
| `zing` | Other 2W (Zing, Zoom, Flex, E-Zulu, Prime) | No | Search snippets of aggregators/press |
| `safar-passenger` | Passenger 3W | No | Search snippets of aggregators/press |
| `safar-cargo` | Cargo 3W | No | Search snippets of aggregators/press |
| `lifestyle-network` | Golf carts + dealer/finance network | No | Search snippets of press releases |
| `news` | 2024–2026 launches & milestones | No | Search snippets |

**Consequence:** Only a handful of *non-spec* facts reach `verified` (see below). **No product specification anywhere in this dataset is verified against kineticgreen.com.** The highest attainable grade for any price/range/battery number here is `indicative`.

**The only `verified` facts across the entire dataset:**

| Fact | Value | Source |
|---|---|---|
| Tonino Lamborghini partnership | JV/co-branding with **Tonino Lamborghini SpA (Italian lifestyle brand — NOT Automobili Lamborghini)** for luxury electric golf/lifestyle carts | lamborghini.it/en-int/blogs/news/kinetic-green-tonino-lamborghini-lifestyle-in-motion |
| Founder & CEO | Sulajja Firodia Motwani | en.wikipedia.org/wiki/Sulajja_Firodia_Motwani; crunchbase.com/person/sulajja-firodia-motwani |
| Legal entity | Kinetic Green Energy and Power Solutions Ltd. | crunchbase.com/person/sulajja-firodia-motwani |
| Subsidy scheme | PM E-DRIVE (1 Oct 2024 – 31 Mar 2026), e-2W incentive ₹2,500/kWh capped 15% of ex-factory, models < ₹1.5 lakh qualify | cleartax.in/s/pm-e-drive-scheme |

---

## 2. Company & Network Facts

| Fact | Value | Confidence | Source |
|---|---|---|---|
| Legal entity | Kinetic Green Energy & Power Solutions Ltd, part of Firodia (Kinetic) Group | verified | en.wikipedia.org/wiki/Sulajja_Firodia_Motwani |
| Group scale | ~$600M group; auto/2W roots since 1970s | indicative | tracxn.com/d/companies/kinetic-green |
| Founder & CEO | Sulajja Firodia Motwani (3rd-gen Firodia; MBA, Carnegie Mellon) | verified | en.wikipedia.org/wiki/Sulajja_Firodia_Motwani |
| **Founding year** | **CONFLICT — 2010 (Tracxn/Dealroom) / 2013 / 2015 (Wikipedia/press). Unresolved.** | unconfirmed | en.wikipedia.org/wiki/Kinetic_Engineering_Limited |
| Headquarters | Pune, Maharashtra (Kinetic Innovation Park, MIDC Chinchwad, Pune 411019) | indicative | kineticgreenvehicles.com/contact-us.html |
| Manufacturing | Ahmednagar/Supa, Maharashtra; ~100 acres; ~5,000–6,000 e-3W/month; DSIR-recognised R&D | indicative | kineticgreenvehicles.com/about-us.html; smev.in |
| **Dealer network** | **CONFLICT — official site "210+"; one 2024 snippet "550+"; another "300+"; "200 toward 400 by 2025"; aggregators 147–443. No stable figure.** | unconfirmed | kineticgreen.com/index.php/about-us; bikewale.com/dealer-showrooms/kinetic-green |
| Industry firsts | First ARAI-approved e-3W in India; first Li-ion in e-3W in India | indicative | autocarpro.in/.../24495 |
| E-Luna units sold | Over 25,000 by Sep-2025 Prime launch | indicative | timesdrive.in/.../152893124 |
| Sales (actual) | 8,355 e-2W Jan–Aug 2025 (1,513 in Aug 2025) — vs stated **ambition** of 100,000/yr | indicative | autocarpro.in/.../128453 |
| Growth target | USD 1B EV business by 2030 (ambition) | indicative | autocarpro.in/.../129447 |
| Tonino Lamborghini JV | Luxury e-golf/lifestyle carts; world premiere 17 Jul 2025, New Delhi | verified (partnership) / indicative (date) | lamborghini.it; autocarpro.in/.../80517 |
| Golf-cart distribution | India: Surge Systems; Maldives: Electrify Maldives; Gulf: Ventana | indicative | namastecar.com; autocarpro.in/.../129447 |
| Exponent Energy tie-up | 15-min rapid charging for L3 (Safar Smart, Shakti, Super DX) + L5N Jumbo | indicative | evreporter.com/.../15-minute-charging |
| Awards | Star EV Scooter of the Year (2025); founder 'Woman of the Year' | indicative | kineticgreen.com/uploads/news/... |
| **Email** | **CONFLICT — research: hello@kineticgreen.com; repo uses care@kineticgreen.com** | indicative | kineticgreenvehicles.com/contact-us.html |
| Toll-free phone | 1800-120-4242 | indicative | kineticgreen.com/index.php (lifestyle agent) — note: `company` agent could not confirm any toll-free |
| LinkedIn | linkedin.com/company/kinetic-green (~28.5k followers) | indicative | in.linkedin.com/company/kinetic-green |
| **Instagram / YouTube / Facebook / X** | **NOT confirmed by any agent — only LinkedIn verified. Repo's IG/YT/FB URLs are unverified guesses.** | unconfirmed | company agent |
| Revenue (external estimate) | ~$33.9M (2024); Aug-2024 debt raise ~$12.06M | unconfirmed | tracxn.com/d/companies/kinetic-green |

---

## 3. Products

> **Two E-Luna generations are conflated across sources.** (1) **2024 originals**: X1 (₹69,990 / 1.7 kWh / ~90 km) & X2 (₹74,990 / 2.0 kWh / ~110 km), both **1.2 kW** motor. (2) **2025 X3 series** (Go/X3/Plus/Pro/Prime): larger **2.3 kWh** pack, **2.2 kW** motor. Separately, the standalone **"E-Luna Prime"** (mass-commuter positioning) launched **25 Sep 2025 at ₹82,490** with 110/140 km options and 16-inch alloys — this is **not** the same as the "X3 Prime" trim (₹89,990). The repo currently prices its `eluna-prime` at ₹89,990, which matches X3 Prime, while describing the ₹82,490 commuter Prime — **a real conflict (see §4).**

### 3.1 E-Luna family (electric moped)

| Variant | Price (₹, ex-showroom) | Range (km) | Battery | Motor | Top speed | Charge | Payload | Seats | Colours | Confidence | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-Luna X1 (2024) | 69,990 | 90 | 1.7 kWh Li-ion, IP67, removable | 1.2 kW | 50 | ~3 h @ 10A | 150 kg | 2 | Red/Yellow/Black/Blue/Green | indicative | bikedekho.com/.../16474 |
| E-Luna X2 (2024) | 74,990 | 110 | 2.0 kWh Li-ion, removable | 1.2 kW | 50 | ~4 h @ 10A | 150 kg | 2 | Red/Yellow/Black/Blue/Green | indicative | evindia.online/.../e-luna-x2 |
| E-Luna X3 Go | 69,990 | — | 2.3 kWh (shared X3 pack) | 2.2 kW | 50 | ~4–5 h | 150 kg | 2 | — | unconfirmed | thebikejunction.com/.../x3-go |
| E-Luna X3 | 72,490 | 120 (105–120 varies) | 2.3 kWh | 2.2 kW | 50 | ~4–5 h | 150 kg | 2 | — | unconfirmed | bikes.tractorjunction.com/.../e-luna-x3 |
| E-Luna X3 Plus | 79,990 | — | 2.3 kWh | 2.2 kW | 50 | — | 150 kg | 2 | — | unconfirmed | bikewale.com/.../e-luna |
| E-Luna X3 Pro | 86,990 | — | 2.3 kWh | 2.2 kW | 50 | — | 150 kg | 2 | — | unconfirmed | thebikejunction.com/.../x3-pro |
| E-Luna X3 Prime | 89,990 | 105 | 2.3 kWh | 2.2 kW | 50 | 5 h | 150 kg | 2 | Night Star Black/Ocean Blue/Sparkling Green/Mulberry Red/Pearl Yellow | indicative | bikedekho.com/.../e-luna-x3-prime |
| **E-Luna Prime** (standalone commuter) | **82,490** | **140** (also 110 option) | 2.0–2.3 kWh Li-ion, IP67, removable | 2.2 kW (news agent: 1.2 kW) | 50 (Prime not explicitly confirmed) | ~4–5 h | — | **1** | Night Star Black/Sparkling Green/Pearl Yellow/Ocean Blue/Mulberry Red (6th "Red" in one list) | indicative (price/date strongly corroborated) | timesdrive.in/.../152893124; evreporter.com/.../82490; rushlane.com/.../12530962 |

*Warranty (family): 40,000 km / 36 months (indicative). Home charge from standard ~10A socket (indicative).*

### 3.2 Other two-wheelers

| Model | Price (₹) | Range (km) | Battery | Motor | Top speed | Charge | Seats | Colours | Confidence | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Zing (Standard) | 71,990 (some 67,990) | 70 | 1.4 kWh Li-ion | 250 W | 25 | 3.5 h | 2 | Magic Blue/Romantic Red/Royal White | indicative | bikedekho.com/kinetic-green/zing |
| Zing (Big B) | 79,990 | 100 | 1.7 kWh Li-ion | 250 W | 25 | 3.5 h | 2 | as above | indicative | 91wheels.com/.../green-zing/big-b |
| Zoom (STD) | 71,531 | 70 | 1.4 kWh | 250 W | 25 (one source 40 — unconfirmed) | 3.5 h | 2 | Wine Red/Fun Teal/Matte Black | indicative | bikedekho.com/kinetic-green/zoom |
| Zoom (Big B) | 78,776 | 100 | 1.7 kWh | 250 W | 25 | 3.5 h | 2 | as above | indicative | smartprix.com/.../kinetic-green-zoom |
| Flex | 109,874 | 120 | 3.0 kWh (72V) | 1.2 kW | 72 | ~3 h (up to 5) | 2 | 5 options | indicative | zigwheels.com/kinetic-green-bikes/flex/specifications |
| E-Zulu (Zulu) | 94,990 (later 84,990; 69,000 subscription) | 104 | **CONFLICT — 2.27 kWh/2.1 kW vs 1.4 kWh/500 W** | 2.1 kW | 60 | 0–80% ~3 h @ 15A | 2 | 6 options | unconfirmed (specs) | newsbytesapp.com/.../kinetic-green-zulu...; ackodrive.com/.../94-990 |

*Zing and Zoom appear to be sibling/rebadged low-speed models on the same 250 W platform — confirm both are distinct current products.*

### 3.3 Passenger three-wheelers

| Model | Price (₹) | Range (km) | Battery | Motor | Top speed | Charge | Payload/Seats | Confidence | Source |
|---|---|---|---|---|---|---|---|---|---|
| Safar Smart | 153,000–218,000 (lead-acid ~1.53L / lithium ~2.18L) | 100–120 | 4 kWh Li-ion **or** 140 Ah lead-acid | 1.2 kW BLDC | 25 | ~8 h (lead-acid); ~2 h (Li) | GVW 679 kg / seats 4–5 | indicative | e-vehicleinfo.com/kinetic-safar-electric-rickshaw... |
| Super DX | **CONFLICT — 135,000 vs 160,000** | **CONFLICT — 100 vs 110** | 48V lead-acid (130 Ah) | 1.0 kW | 25 | ~7 h (fast <2 h) | 380 kg / 4 | unconfirmed | e-vehicleinfo.com/evdekho/.../super-dx |
| DX EV | — | — | Li-ion | — | — | — | seats 4 | unconfirmed (could not confirm distinct from Super DX) | kineticgreenvehicles.com/.../super-dx |
| Safar Star (2019) | 220,000 | 130 | 48V/150Ah Li-ion, swappable | — | 40 | swappable | 400 kg | indicative (but marketed as last-mile/cargo, classification ambiguous) | rushlane.com/.../12326970 |

*Do NOT conflate the passenger "DX EV / Super DX" three-wheeler with the unrelated "Kinetic DX / DX+" electric scooter (~3.1 kWh, 132 km).*

### 3.4 Cargo three-wheelers

| Model | Price (₹) | Range (km) | Battery | Motor | Top speed | Charge | Payload | Seats | Confidence | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Safar Shakti | 153,000 | 120 (one source 80) | Lead-acid 48V/130Ah standard; 4 kWh Li-ion variant | 1.2 kW BLDC (or 850 W PMDC — conflict) | 25 | ~8 h (some 10–12 h) | **350 kg** (dealer listings vary 350–500) | 2 (driver+1) | indicative | trucks.cardekho.com/en/trucks/kinetic/safar-shakti |
| Safar Jumbo | 250,000 (dealer 315,000–345,000 — conflict) | 120 | 8.2 kWh Li-ion 48V | — | — | ~3.5 h; Exponent 15-min | **500 kg** (1-tonne GVW, L5N) | 2 | indicative | e-vehicleinfo.com/evdekho/.../safar-jumbo |

*Warranty: lead-acid — motor 2 yr / battery 1 yr; lithium — 3 yr (FAME/PM E-DRIVE). Running cost ~₹0.50/km (Shakti, indicative).*

### 3.5 Lifestyle / golf carts (Kinetic Green × Tonino Lamborghini)

| Range | Price (starting) | Range (km) | Motor | Battery | Seats | Confidence | Source |
|---|---|---|---|---|---|---|---|
| Genesis | ~USD 10,000 (no INR published) | 150 | 5.2 kW AC, 45 Nm, 30% gradeability | Li-ion, wireless charging, claimed 10-yr life | 2/4/6/8 | indicative (partnership verified) | zigwheels.com/.../56721; entrepreneurindia.com/.../57004 |
| Prestige | ~USD 14,000 (no INR published) | 150 | 5.2 kW AC, 45 Nm | Li-ion, wireless charging | 2/4/6/8 | indicative | entrepreneurindia.com/.../57004 |

*Common: MacPherson suspension, 4-wheel hydraulic brakes, TFT dash, LED, LHD/RHD, 5-yr battery warranty. kWh, top speed and charge time NOT disclosed. Designed in Italy, built near Pune.*

---

## 4. Ready-to-Apply Mapping

### 4.1 `vehicles.ts` — record-by-record

**`zing` (currently all-`pending`) → promote to `indicative`:**
- `priceFrom: 71990` (Standard; note ₹67,990 alt), `priceNote: 'Ex-showroom, indicative'`
- `specs.rangeKm: 70`, `batteryKwh: 1.4`, `batteryType: 'Lithium-ion'`, `motorKw: 0.25`, `topSpeedKmph: 25`, `chargeTimeHours: 3.5`, `payloadKg: null`, `seats: 2`
- `verification: 'indicative'`, `source: 'bikedekho.com / 91wheels.com listings — OEM confirmation pending'`
- Colours available: Magic Blue, Romantic Red, Royal White. **Caution:** confirm Zing is distinct from Zoom.

**`eluna-go` — reconcile generation mix (currently 2.0 kWh + 1.2 kW + ₹69,990):**
- Current record blends X2 battery (2.0 kWh) with X1/X3-Go price (₹69,990) and original motor (1.2 kW). Decide which product this represents:
  - If **X1 original**: `batteryKwh: 1.7`, `rangeKm: 90`, `motorKw: 1.2`.
  - If **X3 Go**: `batteryKwh: 2.3`, `motorKw: 2.2` (range unconfirmed → keep `rangeKm: null`).
- `payloadKg` currently 130 → research consistently says **150 kg**; update to 150 (indicative) or confirm.
- Keep `verification: 'indicative'`.

**`eluna-plus` (₹79,990 / 2.3 kWh / 2.2 kW / 110 km):** matches X3 Plus price and platform. Keep `indicative`. `rangeKm: 110` is inside the reported 105–120 band — acceptable as indicative; `payloadKg` 130 → 150 to match sources.

**`eluna-pro` (₹86,990 / 2.3 / 2.2 / 110):** matches X3 Pro. Keep `indicative`. Same payload note (→150).

**`eluna-prime` — FLAG CONFLICT (highest-priority fix):**
- Repo: `priceFrom: 89990`, `seats: 2`, everything else `null`/`pending`.
- Research: the **standalone E-Luna Prime launched 25 Sep 2025 at ₹82,490** (well-corroborated across TimesDrive, EVReporter, Rushlane, BikeWale), **140 km** (also 110 km option), **16-inch alloys**, **single seat (seats: 1)**, 2.2 kW, 50 km/h.
- ₹89,990 is the **X3 Prime trim**, a different SKU. **Either** the repo's `eluna-prime` should be repriced to **₹82,490** and populated (range 140 indicative, seats 1, top speed 50 indicative, charge ~5 h indicative) and moved `pending → indicative`, **or** the repo intends the X3 Prime trim and the *description* ("move into mass commuter segment", "The E-Luna grows up") must change — the description currently matches the ₹82,490 product, not ₹89,990. Engineering must pick one identity.
- `milestones.prime` (verified, Sep 2025 launch) is consistent with the ₹82,490 product — align the vehicle record to it.

**`safar-smart` (currently all-`pending`) → promote to `indicative`:**
- `priceNote`: keep "Price on enquiry" but can note range ₹1.53L (lead-acid) – ₹2.18L (lithium)
- `specs.rangeKm: 100` (100–120 band), `batteryType: 'Lead-acid (140 Ah) or 4 kWh lithium-ion'`, `batteryKwh: 4` (lithium), `motorKw: 1.2`, `topSpeedKmph: 25`, `chargeTimeHours: 8` (lead-acid), `seats: 4`
- `verification: 'indicative'`, source e-vehicleinfo.com.

**`super-dx` (all-`pending`) → partial `indicative`, keep price pending:**
- `batteryType: '48V lead-acid (130 Ah)'`, `motorKw: 1.0`, `topSpeedKmph: 25`, `payloadKg: 380` (indicative). **Leave `priceFrom: null`** — ₹1.35L vs ₹1.60L conflict is unresolved.

**`dx-ev` — FLAG:** repo has `priceFrom: 111000` (`indicative`). Research **could not confirm DX EV as a model distinct from Super DX**, and ₹111,000 does not appear in any research source. **Recommend reverting `dx-ev` price to `null` / `pending`** until the OEM confirms the model exists as a separate SKU and supplies a price. Flag the ₹111,000 as currently **unsourced**.

**`safar-shakti` — FLAG payload conflict:**
- Repo: `payloadKg: 500`. Research: **Safar Shakti payload is ~350 kg**; the **500 kg belongs to Safar Jumbo (L5N, 1-tonne GVW)**. **Change `safar-shakti.payloadKg` to 350** (indicative) or confirm. `rangeKm: 120` is fine (indicative). `seats` repo=1 vs research=2 (driver+1) — update to 2 or confirm. Add `batteryKwh: 4` (lithium variant) / `batteryType: 'Lead-acid 48V/130Ah or 4 kWh lithium'`, `topSpeedKmph: 25`, `motorKw: 1.2`.
- **Consider adding a `safar-jumbo` record** (500 kg, 8.2 kWh, 120 km, ₹2.5L) — it is the true 500 kg cargo vehicle and is currently absent.

**`golf-lifestyle` (verified) → keep `verified` for partnership, populate specs as `indicative`:**
- `specs.rangeKm: 150`, `motorKw: 5.2`, `seats: 8` (max; 2/4/6/8 configs), `batteryType: 'Lithium-ion, wireless charging'`. **Keep `priceFrom: null`** (only USD prices published, no INR). The record-level `verification: 'verified'` is justified for the *partnership/existence*; add a note that *specs* are indicative.

### 4.2 `content.ts` — facts, metrics, FAQs

**`brand` block:**
- `email: 'care@kineticgreen.com'` → **research says `hello@kineticgreen.com`.** Confirm which is correct; research supports `hello@`.
- `phone: '1800-120-4242'` — indicative (one agent found it, one could not). Verify.
- `social` — **Instagram, YouTube, Facebook URLs are unverified.** Only LinkedIn (`linkedin.com/company/kinetic-green`) is confirmed. Verify the other three resolve before launch or they risk 404/wrong-handle.
- `legalName`, `website`, `name`, founder attribution in milestones — all fine (`verified`).

**`metrics` — FLAG unsourced/conflicting:**
| Metric | Repo value | Status | Action |
|---|---|---|---|
| `years` = 50+ | Group roots ~1972 | indicative | Plausible (2025−1972≈53). Confirm the "50+ years" phrasing maps to group, not Kinetic Green Ltd. |
| `dealers` = 550+ | **CONFLICT** | unconfirmed | **550+ is one 2024 snippet; official site says 210+.** This 550+ figure is repeated in `metrics`, `pillars` (×2: service & dealers), `stories.s6`, and `faqs` (dealer answer). **All five occurrences must be reconciled to a single OEM-confirmed number.** Until confirmed, treat as unverified. |
| `relationships` = 1 cr+ | **No source in research** | pending | No agent found this. Mark pending / confirm with OEM brand block. |
| `distance` = 44 cr+ km | **No source in research** | pending | No agent found this. Confirm. |
| `trees` = 16 lakh+ | **No source in research** | pending | No agent found this. Confirm. |

> The `relationships`, `distance`, and `trees` metrics have **no supporting source anywhere in the research**. They read like kineticgreen.com brand-history figures, but no agent reached the site. **Do not present these three as verified claims** — either source them from the live site or gate them behind a pending state.

**`faqs`:**
- FAQ "range of E-Luna" says "up to 110 km" — safe as indicative, but note the standalone **Prime advertises 140 km**; if the Prime record is corrected to ₹82,490/140 km, update this FAQ to mention the 140 km Prime option.
- FAQ "how much does E-Luna cost" lists **Prime at ₹89,990** — **contradicts the ₹82,490 launch price.** Correct once the `eluna-prime` identity is resolved (§4.1).
- FAQ "how many dealers" states **550+** — same unresolved conflict as metrics; reconcile.

**`milestones`:** correctly all `pending` except `prime` and `lifestyle` (`verified`). The founding-year conflict (2010/2013/2015) is correctly handled by `year: null` — **keep pending**; do not assert a year.

**`dealers[]` and `regions[]`:** already correctly flagged as placeholders (`verified: false`, `dealerCount: null`, `verification: 'pending'`). No change needed — must be replaced by the live dealer feed before launch, as the file comments already state.

### 4.3 Must stay `pending` (no reliable source)

- E-Luna Prime full spec sheet (range/charge officially — 140 km is indicative only)
- Super DX price (₹1.35L vs ₹1.60L unresolved)
- DX EV as a distinct model + its ₹111,000 price
- Zulu battery/motor (2.27 kWh/2.1 kW vs 1.4 kWh/500 W conflict)
- Founding year
- Exact national dealer count
- `relationships` / `distance` / `trees` metrics
- Instagram / YouTube / Facebook handles
- Golf-cart INR pricing, kWh, top speed, charge time

---

## 5. Gaps — needs client / OEM confirmation

1. **Direct kineticgreen.com read** — nothing here is verified against the official site; the whole sheet needs one pass against official spec sheets before publishing.
2. **E-Luna Prime identity & price** — ₹82,490 (standalone commuter) vs ₹89,990 (X3 Prime trim); confirm which SKU the site sells and its seat count (1 vs 2), range (110/140) and top speed.
3. **National dealer count** — reconcile 210+ / 300+ / 400 / 550+ to one OEM figure (touches metrics, 2 pillars, 1 story, 1 FAQ).
4. **Brand metrics** — official numbers for years of operation, customer relationships (1 cr+), distance covered (44 cr+ km), trees-equivalent (16 lakh+).
5. **Founding year** of Kinetic Green Ltd (2010 vs 2013 vs 2015).
6. **Contact email** — `care@` vs `hello@kineticgreen.com`; **toll-free** 1800-120-4242 confirmation; **social handles** for IG/YT/FB.
7. **Safar Shakti payload** (350 vs 500 kg) and seats; whether to add a distinct **Safar Jumbo** record.
8. **Super DX price** and whether **DX EV** is a real, separate model.
9. **Zulu specification** (two conflicting powertrains) and current price/variant.
10. **Golf-cart INR pricing** and undisclosed specs (battery kWh, top speed, charge time).
11. **Per-variant E-Luna X3 specs** (Go/Plus/Pro differ by features vs hardware — not cleanly separated in sources).
12. **Official product photography** — every `media.hero/card/poster` is null; OEM campaign imagery still required.