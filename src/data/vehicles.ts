/**
 * KINETIC GREEN — VEHICLE DATA
 * ---------------------------------------------------------------------------
 * Single source of truth for every product surface on the homepage.
 *
 * ⚠️  VERIFICATION CONTRACT
 * Each vehicle carries `verification`:
 *   'verified'  — published on kineticgreen.com or an OEM spec sheet
 *   'indicative'— aggregated from public spec listings; confirm with OEM before launch
 *   'pending'   — slot exists, awaiting official data. NEVER rendered as a claim.
 *
 * `source` records where a number came from so the marketing team can audit it.
 * Never present an estimated figure as guaranteed. See README → Data Integrity.
 * ---------------------------------------------------------------------------
 */

export type VehicleCategory =
  | 'personal'
  | 'commute'
  | 'family'
  | 'business'
  | 'last-mile'
  | 'cargo';

export type Verification = 'verified' | 'indicative' | 'pending';

export interface VehicleSpec {
  /** Claimed range in km. Always surfaced with the certification context. */
  rangeKm: number | null;
  rangeNote: string;
  /** Usable battery capacity in kWh */
  batteryKwh: number | null;
  batteryType: string;
  /** Rated motor output in kW */
  motorKw: number | null;
  topSpeedKmph: number | null;
  chargeTimeHours: number | null;
  chargeNote: string;
  payloadKg: number | null;
  seats: number | null;
}

export interface Vehicle {
  id: string;
  name: string;
  shortName: string;
  /** One-line positioning line — used in the explorer and price tools. */
  tagline: string;
  /** Longer editorial line used in the product story. */
  story: string;
  segment: string;
  categories: VehicleCategory[];
  /** Ex-showroom starting price in INR. Flat number so tools can compute. */
  priceFrom: number | null;
  priceNote: string;
  specs: VehicleSpec;
  useCases: string[];
  /** Highlights written as plain sentences — SEO-visible prose, not just chips. */
  highlights: string[];
  verification: Verification;
  source: string;
  /**
   * ART DIRECTION SLOT — official product photography drops in here.
   * `src` is intentionally null until the OEM supplies campaign imagery;
   * the <VehicleVisual> component renders the engineered SVG stand-in meanwhile.
   * See README → Image Replacement.
   */
  media: {
    /** Official product shot (AVIF/WebP), e.g. '/media/e-luna-hero.avif' */
    hero: string | null;
    /** Square-ish card crop for the explorer rail */
    card: string | null;
    /** Poster frame behind the hero section */
    poster: string | null;
    alt: string;
  };
  /** Accent used for the vehicle's energy trail in the visual system */
  accent: string;
}

/* ---------------------------------------------------------------------------
   PRICE / SPEC NOTES — repeated so every surface states them consistently
   --------------------------------------------------------------------------- */
export const PRICE_DISCLAIMER =
  'Ex-showroom, indicative. Prices vary by city, variant and applicable state subsidies. Confirm on-road price with your nearest dealer.';

export const RANGE_DISCLAIMER =
  'Manufacturer-claimed range under standard test conditions. Real-world range varies with load, terrain, riding style and battery age.';

export const SAVINGS_DISCLAIMER =
  'Savings are an estimate based on the values you enter and do not constitute a guarantee of cost or performance.';

/* ---------------------------------------------------------------------------
   PRODUCT LINEUP
   --------------------------------------------------------------------------- */
export const vehicles: Vehicle[] = [
  {
    id: 'zing', name: 'Zing', shortName: 'Zing',
    tagline: 'Your city. Your pace.',
    story: 'A low-speed electric scooter for everyday city journeys. At 25 km/h it needs no licence or registration in India, and the 1.7 kWh Big B variant carries a claimed 100 km on a charge.',
    segment: 'Electric Scooter', categories: ['personal', 'commute'],
    priceFrom: 71990, priceNote: 'Ex-showroom, indicative (₹71,990–₹79,990 across variants)',
    specs: { rangeKm: 100, rangeNote: 'Claimed, 1.7 kWh Big B variant (70 km on 1.4 kWh)', batteryKwh: 1.7, batteryType: 'Lithium-ion (1.4 kWh or 1.7 kWh)', motorKw: null, topSpeedKmph: 25, chargeTimeHours: 4, chargeNote: 'Roughly 3–4 hours from a household socket', payloadKg: null, seats: 2 },
    useCases: ['City riding', 'Everyday journeys', 'No licence needed'],
    highlights: ['Low-speed (25 km/h) class: no driving licence or registration required in India.', 'Two battery options, 1.4 kWh (70 km) and 1.7 kWh (100 km claimed).', 'Light at 81 kg, with disc brakes front and rear.'],
    verification: 'indicative', source: 'Public spec listings (BikeWale, BikeDekho, ZigWheels), Sept 2026; confirm with OEM before launch',
    media: { hero: '/media/scooter.webp', card: '/media/scooter.webp', poster: null, alt: 'Copper Kinetic Green Zing electric scooter' },
    accent: '#00C853',
  },
  {
    id: 'eluna-go',
    name: 'E-Luna Go',
    shortName: 'E-Luna Go',
    tagline: 'Built for everyday freedom.',
    story:
      'The entry point to the E-Luna family. A light, upright electric moped engineered for the short daily loop — work, market, drop-offs — with running costs a fraction of a petrol equivalent.',
    segment: 'Electric Moped',
    categories: ['personal', 'commute'],
    priceFrom: 69990,
    priceNote: 'Ex-showroom, indicative',
    specs: {
      rangeKm: 110,
      rangeNote: 'Claimed range',
      batteryKwh: 2.0,
      batteryType: 'Lithium-ion (removable)',
      motorKw: 1.2,
      topSpeedKmph: 50,
      chargeTimeHours: 4,
      chargeNote: 'Standard home charger',
      payloadKg: 130,
      seats: 2,
    },
    useCases: ['City commute', 'Errands', 'Short daily trips'],
    highlights: [
      'Removable battery means you can charge from any 10A household socket.',
      'Upright riding position and a low kerb weight make it easy to handle in traffic.',
      'Low running cost compared with a petrol moped of similar duty cycle.',
    ],
    verification: 'indicative',
    source: 'kineticgreen.com listing + OEM spec aggregation',
    media: {
      hero: null,
      card: null,
      poster: null,
      alt: 'Kinetic Green E-Luna Go electric moped, three-quarter front view',
    },
    accent: '#00C853',
  },
  {
    id: 'eluna-plus',
    name: 'E-Luna Plus',
    shortName: 'Plus',
    tagline: 'More range. More everyday.',
    story:
      'A larger-capacity battery extends the daily loop. Built for riders who commute further or carry a pillion regularly without changing how they charge.',
    segment: 'Electric Moped',
    categories: ['commute', 'family'],
    priceFrom: 79990,
    priceNote: 'Ex-showroom, indicative',
    specs: {
      rangeKm: 110,
      rangeNote: 'Claimed range',
      batteryKwh: 2.3,
      batteryType: 'Lithium-ion (removable)',
      motorKw: 2.2,
      topSpeedKmph: 50,
      chargeTimeHours: 5,
      chargeNote: 'Standard home charger',
      payloadKg: 130,
      seats: 2,
    },
    useCases: ['Longer commute', 'Pillion and family use', 'Errands'],
    highlights: [
      'Higher-capacity pack for riders covering more ground per day.',
      'Stronger 2.2 kW motor helps with pillions and inclines.',
      'Same household-socket charging as the rest of the E-Luna family.',
    ],
    verification: 'indicative',
    source: 'kineticgreen.com listing + OEM spec aggregation',
    media: {
      hero: null,
      card: '/media/eluna-hero.webp',
      poster: '/media/eluna-hero.webp',
      alt: 'Green Kinetic E-Luna Plus electric moped, three-quarter front view',
    },
    accent: '#00C853',
  },
  {
    id: 'eluna-pro',
    name: 'E-Luna Pro',
    shortName: 'Pro',
    tagline: 'The icon, sharpened.',
    story:
      'Adds specification and presence to the E-Luna formula — the variant for riders who use their vehicle as primary transport and want the top of the family’s everyday range.',
    segment: 'Electric Moped',
    categories: ['commute', 'family'],
    priceFrom: 86990,
    priceNote: 'Ex-showroom, indicative',
    specs: {
      rangeKm: 110,
      rangeNote: 'Claimed range',
      batteryKwh: 2.3,
      batteryType: 'Lithium-ion (removable)',
      motorKw: 2.2,
      topSpeedKmph: 50,
      chargeTimeHours: 5,
      chargeNote: 'Standard home charger',
      payloadKg: 130,
      seats: 2,
    },
    useCases: ['Primary daily transport', 'Commute', 'Family use'],
    highlights: [
      'Top of the E-Luna everyday range on range and motor output.',
      'Designed as a primary vehicle, not an occasional second one.',
      'Serviceable through the Kinetic Green dealer network.',
    ],
    verification: 'indicative',
    source: 'kineticgreen.com listing + OEM spec aggregation',
    media: {
      hero: null,
      card: null,
      poster: null,
      alt: 'Kinetic Green E-Luna Pro electric moped, three-quarter rear view',
    },
    accent: '#00C853',
  },
  {
    id: 'eluna-prime',
    name: 'E-Luna Prime',
    shortName: 'Prime',
    tagline: 'The E-Luna grows up.',
    story:
      'Kinetic Green’s move into the mass commuter motorcycle segment — a step up in presence and specification while keeping the electric running-cost advantage that defines the family.',
    segment: 'Electric Motorcycle',
    categories: ['commute', 'business'],
    priceFrom: 89990,
    priceNote: 'Ex-showroom, indicative',
    specs: {
      rangeKm: null,
      rangeNote: 'Awaiting confirmed figure',
      batteryKwh: null,
      batteryType: 'Lithium-ion',
      motorKw: null,
      topSpeedKmph: null,
      chargeTimeHours: null,
      chargeNote: 'Confirm with OEM',
      payloadKg: null,
      seats: 2,
    },
    useCases: ['Long commute', 'Daily business use', 'High-mileage riding'],
    highlights: [
      'Kinetic Green’s entry into the mass commuter motorcycle segment.',
      'Positioned for riders who clock serious daily mileage.',
      'Specification pending final confirmation — talk to a dealer for current figures.',
    ],
    verification: 'pending',
    source: 'Official launch announcement (spec sheet pending)',
    media: {
      hero: null,
      card: null,
      poster: null,
      alt: 'Kinetic Green E-Luna Prime electric motorcycle',
    },
    accent: '#00C853',
  },
  {
    id: 'safar-smart',
    name: 'Safar Smart',
    shortName: 'Safar Smart',
    tagline: 'Passenger transport, electrified.',
    story:
      'A passenger three-wheeler engineered for last-mile operations. Built for drivers who measure their day in trips, not kilometres — where uptime and cost per trip decide the business.',
    segment: 'Electric Passenger 3W',
    categories: ['business', 'last-mile', 'family'],
    priceFrom: 145000,
    priceNote: 'Ex-showroom, indicative; varies by battery option and state',
    specs: {
      rangeKm: 100,
      rangeNote: 'Claimed, per charge (Li-ion pack)',
      batteryKwh: 4,
      batteryType: 'Lithium-ion 4 kWh (lead-acid option available)',
      motorKw: 1.2,
      topSpeedKmph: 25,
      chargeTimeHours: 3,
      chargeNote: 'About 3 hours (Li-ion); lead-acid pack takes longer',
      payloadKg: null,
      seats: 4,
    },
    useCases: ['Passenger transport', 'Last-mile shared mobility', 'School and staff runs'],
    highlights: [
      'Available in lead-acid and lithium configurations to match route economics.',
      'Finance structures designed around daily-earning operators.',
      'Backed by the Kinetic Green service network.',
    ],
    verification: 'indicative',
    source: 'Public listings (CarDekho Trucks, TractorJunction, EVDekho), Sept 2026; confirm with OEM',
    media: {
      hero: null,
      card: '/media/safar.webp',
      poster: null,
      alt: 'Kinetic Green Safar Smart electric passenger three-wheeler',
    },
    accent: '#4CE88A',
  },
  {
    id: 'super-dx',
    name: 'Super DX',
    shortName: 'Super DX',
    tagline: 'The workhorse, re-engineered.',
    story:
      'Passenger three-wheeler built for high-duty operation — the kind of vehicle that has to start every morning and earn every day.',
    segment: 'Electric Passenger 3W',
    categories: ['business', 'last-mile'],
    priceFrom: null,
    priceNote: 'Price on enquiry',
    specs: {
      rangeKm: null,
      rangeNote: 'Confirm with dealer',
      batteryKwh: null,
      batteryType: 'Lithium-ion',
      motorKw: null,
      topSpeedKmph: null,
      chargeTimeHours: null,
      chargeNote: 'Confirm with dealer',
      payloadKg: null,
      seats: 4,
    },
    useCases: ['Passenger transport', 'Fleet operations', 'Daily commercial duty'],
    highlights: [
      'Engineered for continuous daily commercial operation.',
      'Electric drivetrain removes clutch, gearbox and engine service load.',
      'Fleet and bulk purchase conversations supported.',
    ],
    verification: 'pending',
    source: 'OEM product page (spec sheet pending)',
    media: {
      hero: null,
      card: null,
      poster: null,
      alt: 'Kinetic Green Super DX electric passenger three-wheeler',
    },
    accent: '#4CE88A',
  },
  {
    id: 'safar-shakti',
    name: 'Safar Shakti',
    shortName: 'Shakti',
    tagline: 'Load it. Move it.',
    story:
      'A cargo three-wheeler for moving goods, not people. The business case is arithmetic: fewer moving parts, lower cost per delivery, and a deck sized for real loads.',
    segment: 'Electric Cargo 3W',
    categories: ['cargo', 'business', 'last-mile'],
    priceFrom: null,
    priceNote: 'Price on enquiry',
    specs: {
      rangeKm: 120,
      rangeNote: 'Claimed range',
      batteryKwh: null,
      batteryType: 'Lithium-ion',
      motorKw: null,
      topSpeedKmph: null,
      chargeTimeHours: null,
      chargeNote: 'Confirm with dealer',
      payloadKg: 500,
      seats: 1,
    },
    useCases: ['Goods delivery', 'Warehouse and market runs', 'Fleet cargo operations'],
    highlights: [
      'Flat cargo deck configured for commercial loads.',
      'Suited to last-mile distribution and market logistics.',
      'Fleet and commercial enquiry route available on this page.',
    ],
    verification: 'indicative',
    source: 'OEM product listing + public spec aggregation',
    media: {
      hero: null,
      card: null,
      poster: null,
      alt: 'Kinetic Green Safar Shakti electric cargo three-wheeler with flat deck',
    },
    accent: '#4CE88A',
  },
  {
    id: 'dx-ev',
    name: 'DX EV',
    shortName: 'DX EV',
    tagline: 'Three wheels. Zero compromise.',
    story:
      'The DX platform in electric form — a passenger three-wheeler positioned for operators who want the economics of electric without stepping down in vehicle class.',
    segment: 'Electric Passenger 3W',
    categories: ['business', 'last-mile', 'family'],
    priceFrom: 111000,
    priceNote: 'Ex-showroom, indicative range entry',
    specs: {
      rangeKm: null,
      rangeNote: 'Confirm with dealer',
      batteryKwh: null,
      batteryType: 'Lithium-ion',
      motorKw: null,
      topSpeedKmph: null,
      chargeTimeHours: null,
      chargeNote: 'Confirm with dealer',
      payloadKg: null,
      seats: 4,
    },
    useCases: ['Passenger transport', 'Family transport', 'Commercial operations'],
    highlights: [
      'Electric drivetrain in the established DX three-wheeler package.',
      'Lower routine service load than a comparable petrol or CNG three-wheeler.',
      'Finance and fleet options available through Kinetic Green.',
    ],
    verification: 'indicative',
    source: 'Public pricing listing (variant breakdown pending)',
    media: {
      hero: null,
      card: null,
      poster: null,
      alt: 'Kinetic Green DX EV electric passenger three-wheeler',
    },
    accent: '#4CE88A',
  },
  {
    id: 'golf-lifestyle',
    name: 'Tonino Lamborghini Carts',
    shortName: 'Lifestyle Carts',
    tagline: 'Electric mobility, off the road.',
    story:
      'A licensed collaboration bringing luxury electric golf and lifestyle carts to resorts, estates and campuses in India and the Maldives.',
    segment: 'Lifestyle / Golf Cart',
    categories: ['business'],
    priceFrom: null,
    priceNote: 'Price on enquiry',
    specs: {
      rangeKm: null,
      rangeNote: 'Confirm with dealer',
      batteryKwh: null,
      batteryType: 'Lithium-ion',
      motorKw: null,
      topSpeedKmph: null,
      chargeTimeHours: null,
      chargeNote: 'Confirm with dealer',
      payloadKg: null,
      seats: 4,
    },
    useCases: ['Resorts and hospitality', 'Golf courses', 'Campus and estate transport'],
    highlights: [
      'Kinetic Green Tonino Lamborghini branded lifestyle and golf carts.',
      'Distributor-led sales for hospitality and leisure operators.',
      'Business and dealership enquiry route available below.',
    ],
    verification: 'verified',
    source: 'Official press announcements (Maldives launch, India distributor appointment)',
    media: {
      hero: null,
      card: null,
      poster: null,
      alt: 'Kinetic Green Tonino Lamborghini luxury electric golf cart',
    },
    accent: '#A8F5C4',
  },
];

/* ---------------------------------------------------------------------------
   CATEGORY TAXONOMY — drives the “Choose Your Move” explorer
   --------------------------------------------------------------------------- */
export interface Category {
  id: VehicleCategory;
  label: string;
  /** Editorial line shown when the category is active */
  blurb: string;
  /** Secondary metric shown under the vehicle name */
  metric: string;
  /** Default vehicle to feature when this category is selected */
  lead: string;
  match: string[];
}

export const categories: Category[] = [
  {
    id: 'personal',
    label: 'Personal',
    blurb: 'One rider. Every day. Your own pace.',
    metric: 'Solo daily travel',
    lead: 'eluna-go',
    match: ['eluna-go', 'eluna-plus'],
  },
  {
    id: 'commute',
    label: 'Commute',
    blurb: 'The daily distance, minus the fuel bill.',
    metric: 'Work and back',
    lead: 'eluna-plus',
    match: ['eluna-go', 'eluna-plus', 'eluna-pro', 'eluna-prime'],
  },
  {
    id: 'family',
    label: 'Family',
    blurb: 'Two up, every trip, without the compromise.',
    metric: 'Pillion and household duty',
    lead: 'eluna-pro',
    match: ['eluna-plus', 'eluna-pro', 'safar-smart', 'dx-ev'],
  },
  {
    id: 'business',
    label: 'Business',
    blurb: 'Vehicles that have to earn, every single day.',
    metric: 'Revenue-generating assets',
    lead: 'super-dx',
    match: ['super-dx', 'dx-ev', 'safar-smart', 'eluna-prime', 'golf-lifestyle'],
  },
  {
    id: 'last-mile',
    label: 'Last-Mile',
    blurb: 'Short haul, high frequency, low cost per drop.',
    metric: 'Shared and delivery mobility',
    lead: 'safar-smart',
    match: ['safar-smart', 'super-dx', 'dx-ev', 'safar-shakti'],
  },
  {
    id: 'cargo',
    label: 'Cargo',
    blurb: 'Load capacity first. Operating cost a close second.',
    metric: 'Goods and load movement',
    lead: 'safar-shakti',
    match: ['safar-shakti'],
  },
];

/* ---------------------------------------------------------------------------
   LOOKUPS
   --------------------------------------------------------------------------- */
export const vehicleById = (id: string): Vehicle | undefined =>
  vehicles.find((v) => v.id === id);

export const vehiclesByCategory = (cat: VehicleCategory): Vehicle[] => {
  const c = categories.find((x) => x.id === cat);
  if (!c) return [];
  // Preserve the curated order in `match`, not the raw data order.
  return c.match.map((id) => vehicleById(id)).filter((v): v is Vehicle => Boolean(v));
};

/** Vehicles that have enough confirmed data to appear in the price / EMI tools */
export const priceableVehicles = vehicles.filter((v) => v.priceFrom !== null);

export const formatINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
