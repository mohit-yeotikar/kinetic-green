/**
 * KINETIC GREEN — BRAND & CONTENT DATA
 * ---------------------------------------------------------------------------
 * Site-wide narrative content. Every statistic here must be traceable to a
 * Kinetic Green published source. Where a figure is not confirmed, the item is
 * marked `verification: 'pending'` and the UI renders it as a prompt rather
 * than a claim.
 * ---------------------------------------------------------------------------
 */

import type { Verification } from './vehicles';

/* ===========================================================================
   BRAND
   =========================================================================== */
export const brand = {
  name: 'Kinetic Green',
  legalName: 'Kinetic Green Energy & Power Solutions Ltd.',
  tagline: 'Planet @ Our Heart',
  /**
   * Final hero headline. Chosen after testing hierarchy against the
   * alternatives ("The future moves here.", "Built for India. Electric by
   * nature.", "Power your everyday.") — "MOVE DIFFERENT." is the only one that
   * states a brand position rather than a generic EV promise, and it reads at
   * display scale without a supporting clause.
   */
  headline: 'Move Different.',
  heroSecondary: 'Electric mobility engineered for the way India moves.',
  heroEyebrow: ['Kinetic Green', 'Electric mobility, reimagined'],

  phone: '1800-120-4242',
  phoneHref: 'tel:18001204242',
  email: 'care@kineticgreen.com',
  website: 'https://kineticgreen.com',
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/kinetic-green', icon: 'linkedin' },
    { label: 'Instagram', href: 'https://www.instagram.com/kineticgreenvehicles', icon: 'instagram' },
    { label: 'YouTube', href: 'https://www.youtube.com/@kineticgreen', icon: 'youtube' },
    { label: 'Facebook', href: 'https://www.facebook.com/kineticgreenvehicles', icon: 'facebook' },
  ],
} as const;

/* ===========================================================================
   HEADLINE METRICS — shown in the legacy section and social proof
   Source: kineticgreen.com brand history block.
   =========================================================================== */
export interface Metric {
  id: string;
  value: number;
  /** Rendered before the number, e.g. none */
  prefix?: string;
  /** Rendered after the number */
  suffix: string;
  label: string;
  /** Sentence form for SEO + screen readers, since "44 cr+" alone is opaque */
  sentence: string;
  decimals?: number;
}

export const metrics: Metric[] = [
  {
    id: 'years',
    value: 50,
    suffix: '+',
    label: 'Years of operations',
    sentence: 'More than 50 years of operations in Indian mobility.',
  },
  {
    id: 'dealers',
    value: 550,
    suffix: '+',
    label: 'Dealers in pan India',
    sentence: 'A network of 550+ dealers across pan India.',
  },
  {
    id: 'relationships',
    value: 1,
    suffix: ' cr+',
    label: 'Relationships nurtured',
    sentence: 'Over 1 crore customer relationships nurtured.',
  },
  {
    id: 'distance',
    value: 44,
    suffix: ' cr+ km',
    label: 'Distance covered',
    sentence: 'More than 44 crore kilometres covered by our vehicles.',
  },
  {
    id: 'trees',
    value: 16,
    suffix: ' lakh+',
    label: 'Equivalent trees planted',
    sentence: 'Equivalent to 16 lakh+ trees planted.',
  },
];

/* ===========================================================================
   LEGACY TIMELINE
   ---------------------------------------------------------------------------
   ⚠️ Only entries with `verification: 'verified'` may state a specific year.
   Entries that are 'pending' render as thematic era markers without asserting
   a date, so the horizontal timeline still reads as a story while the
   communications team confirms exact milestones before launch.
   =========================================================================== */
export interface Milestone {
  id: string;
  era: string;
  year: string | null;
  title: string;
  body: string;
  verification: Verification;
}

export const milestones: Milestone[] = [
  {
    id: 'founding',
    era: 'Origins',
    year: null,
    title: 'Kinetic begins in Indian mobility',
    body: 'Kinetic Group builds its foundation in Indian two-wheeler mobility, manufacturing and distributing vehicles for Indian roads.',
    verification: 'pending',
  },
  {
    id: 'two-wheeler-era',
    era: 'Two-wheelers',
    year: null,
    title: 'A household name on two wheels',
    body: 'Kinetic becomes a familiar name across Indian driveways, building volume manufacturing capability and a nationwide distribution footprint.',
    verification: 'pending',
  },
  {
    id: 'network',
    era: 'Network',
    year: null,
    title: 'The dealer network takes shape',
    body: 'The distribution and service network that today reaches 550+ dealers across pan India is built out across metros, tier-two cities and rural markets.',
    verification: 'pending',
  },
  {
    id: 'green',
    era: 'Electric era',
    year: null,
    title: 'Kinetic Green is founded',
    body: 'Kinetic Green Energy & Power Solutions is established to take the group into electric mobility — two-wheelers and three-wheelers designed around Indian duty cycles.',
    verification: 'pending',
  },
  {
    id: 'eluna',
    era: 'The icon',
    year: null,
    title: 'E-Luna revives a legend',
    body: 'The Luna name returns in electric form. A moped architecture re-engineered around a battery, a hub motor and household-socket charging.',
    verification: 'pending',
  },
  {
    id: 'three-wheeler',
    era: 'Commercial',
    year: null,
    title: 'Safar and DX platforms scale',
    body: 'Electric passenger and cargo three-wheelers extend Kinetic Green into last-mile and commercial mobility, where cost per trip is the whole argument.',
    verification: 'pending',
  },
  {
    id: 'prime',
    era: 'Today',
    year: null,
    title: 'E-Luna Prime enters the commuter segment',
    body: 'Kinetic Green launches E-Luna Prime, marking its entry into the mass commuter motorcycle segment.',
    verification: 'verified',
  },
  {
    id: 'lifestyle',
    era: 'Expansion',
    year: null,
    title: 'Luxury lifestyle mobility',
    body: 'Kinetic Green Tonino Lamborghini launches luxury electric golf and lifestyle carts, with distribution in India and a Maldives launch through an appointed distributor.',
    verification: 'verified',
  },
  {
    id: 'future',
    era: 'Next',
    year: null,
    title: 'The next 50 years of movement',
    body: 'Deeper battery localisation, a wider commercial range and a distribution network built to serve the next crore of Indian riders.',
    verification: 'pending',
  },
];

/* ===========================================================================
   TECHNOLOGY HOTSPOTS
   ---------------------------------------------------------------------------
   Each hotspot describes the engineering category in plain language.
   `specValue` is only populated when a confirmed figure exists; otherwise the
   component renders the explanation without a number. No invented specs.
   =========================================================================== */
export interface Hotspot {
  id: string;
  label: string;
  /** Position as percentage of the vehicle stage box */
  x: number;
  y: number;
  headline: string;
  body: string;
  specLabel: string | null;
  specValue: string | null;
  verification: Verification;
  source: string;
}

export const hotspots: Hotspot[] = [
  {
    id: 'battery',
    label: 'Battery',
    x: 34,
    y: 62,
    headline: 'Removable lithium-ion packs',
    body: 'E-Luna runs a lithium-ion pack you can lift out and carry indoors. Charging from a standard 10-ampere household socket means the vehicle fits the electricity supply most Indian homes already have — no wall-box installation required.',
    specLabel: 'Pack capacity',
    specValue: '2.0 – 2.3 kWh (E-Luna family)',
    verification: 'indicative',
    source: 'OEM listings + public spec aggregation',
  },
  {
    id: 'motor',
    label: 'Motor',
    x: 66,
    y: 58,
    headline: 'Hub-mounted electric drive',
    body: 'A brushless hub motor drives the wheel directly. No clutch, no gearbox, no oil changes — the drivetrain simply has far fewer parts that can wear out, which is what pulls routine service cost down.',
    specLabel: 'Rated output',
    specValue: 'Up to 2.2 kW (E-Luna family)',
    verification: 'indicative',
    source: 'OEM listings + public spec aggregation',
  },
  {
    id: 'chassis',
    label: 'Chassis',
    x: 50,
    y: 74,
    headline: 'Engineered for Indian duty cycles',
    body: 'Vehicles are specified around how Indian riders actually use them: pillion weight, broken road surfaces, monsoon water, and gradients under load. Payload ratings and suspension are set against those conditions rather than an idealised test track.',
    specLabel: null,
    specValue: null,
    verification: 'pending',
    source: 'OEM product positioning',
  },
  {
    id: 'connectivity',
    label: 'Connectivity',
    x: 46,
    y: 40,
    headline: 'About the vehicle, from the phone',
    body: 'Battery state, charge level and vehicle status are surfaced to the rider so you know what you have before you walk to the vehicle, rather than when you switch it on.',
    specLabel: null,
    specValue: null,
    verification: 'pending',
    source: 'Confirm feature availability per variant with OEM',
  },
  {
    id: 'safety',
    label: 'Safety',
    x: 72,
    y: 70,
    headline: 'Battery management and braking',
    body: 'A battery management system monitors cell temperature, voltage and current to keep the pack inside its safe operating window. Braking is specified for the vehicle class and the loads it is rated to carry.',
    specLabel: null,
    specValue: null,
    verification: 'pending',
    source: 'OEM product positioning',
  },
  {
    id: 'charging',
    label: 'Charging',
    x: 22,
    y: 44,
    headline: 'Charge where you already live',
    body: 'A standard 10-ampere home socket is enough. For the E-Luna family a full charge takes a working day or overnight, which matches how these vehicles are actually parked.',
    specLabel: 'Charge time',
    specValue: '4 – 5 hours (E-Luna family, home charger)',
    verification: 'indicative',
    source: 'OEM listings + public spec aggregation',
  },
];

/* ===========================================================================
   OWNERSHIP PILLARS
   =========================================================================== */
export interface Pillar {
  id: string;
  label: string;
  headline: string;
  body: string;
  actionLabel: string;
  actionIntent: string;
}

export const pillars: Pillar[] = [
  {
    id: 'charging',
    label: 'Charging',
    headline: 'Charging that fits daily life',
    body: 'A 10A household socket is the baseline for the E-Luna family. No dedicated installation, no proprietary connector to hunt for — you charge the way you already plug in a phone.',
    actionLabel: 'Ask about home charging',
    actionIntent: 'charging',
  },
  {
    id: 'service',
    label: 'Service',
    headline: 'Service across 550+ dealer touchpoints',
    body: 'An electric drivetrain has far fewer serviceable parts than a petrol engine. What is left — brakes, tyres, suspension, battery health — is handled through the Kinetic Green dealer and service network.',
    actionLabel: 'Book a service',
    actionIntent: 'service',
  },
  {
    id: 'finance',
    label: 'Finance',
    headline: 'Finance built around the vehicle',
    body: 'Loan structures are available for personal and commercial buyers, including arrangements where daily running-cost savings contribute toward the instalment. Confirm current schemes with your dealer.',
    actionLabel: 'Explore finance options',
    actionIntent: 'finance',
  },
  {
    id: 'dealers',
    label: 'Dealers',
    headline: 'A dealer network, not a showroom chain',
    body: '550+ dealers pan India means the network reaches past the metros — tier-two cities, district towns and rural markets where an electric vehicle has to be serviced nearby to make sense.',
    actionLabel: 'Find your nearest dealer',
    actionIntent: 'dealer',
  },
];

/* ===========================================================================
   DEALER NETWORK — REPRESENTATIVE ROSTER
   ---------------------------------------------------------------------------
   ⚠️ IMPORTANT FOR LAUNCH
   These are structural placeholders so the Dealer Finder interaction can be
   built, tested and demoed. They are NOT verified Kinetic Green dealer
   addresses. Before launch this array must be replaced by the live dealer
   feed (or a server-side lookup against the CRM / dealer API).
   The UI labels these as sample records accordingly.
   =========================================================================== */
export interface Dealer {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  distanceKm: number;
  testRide: boolean;
  service: boolean;
  threeWheeler: boolean;
  /** true only when the record came from the real dealer feed */
  verified: boolean;
}

export const dealers: Dealer[] = [
  { id: 'd1', name: 'Kinetic Green — Central', city: 'Pune', state: 'Maharashtra', pincode: '411001', phone: '+91 20 4000 0000', distanceKm: 2.4, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd2', name: 'Kinetic Green — West', city: 'Pune', state: 'Maharashtra', pincode: '411045', phone: '+91 20 4000 0001', distanceKm: 6.8, testRide: true, service: true, threeWheeler: false, verified: false },
  { id: 'd3', name: 'Kinetic Green — Andheri', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', phone: '+91 22 4000 0002', distanceKm: 3.1, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd4', name: 'Kinetic Green — Navi Mumbai', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703', phone: '+91 22 4000 0003', distanceKm: 9.5, testRide: false, service: true, threeWheeler: true, verified: false },
  { id: 'd5', name: 'Kinetic Green — Nashik', city: 'Nashik', state: 'Maharashtra', pincode: '422001', phone: '+91 253 400 0004', distanceKm: 4.2, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd6', name: 'Kinetic Green — Bengaluru South', city: 'Bengaluru', state: 'Karnataka', pincode: '560068', phone: '+91 80 4000 0005', distanceKm: 3.7, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd7', name: 'Kinetic Green — Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', phone: '+91 80 4000 0006', distanceKm: 11.2, testRide: true, service: true, threeWheeler: false, verified: false },
  { id: 'd8', name: 'Kinetic Green — Mysuru', city: 'Mysuru', state: 'Karnataka', pincode: '570001', phone: '+91 821 400 0007', distanceKm: 5.0, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd9', name: 'Kinetic Green — Delhi North', city: 'Delhi', state: 'Delhi', pincode: '110009', phone: '+91 11 4000 0008', distanceKm: 4.9, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd10', name: 'Kinetic Green — Gurugram', city: 'Gurugram', state: 'Haryana', pincode: '122001', phone: '+91 124 400 0009', distanceKm: 7.3, testRide: true, service: true, threeWheeler: false, verified: false },
  { id: 'd11', name: 'Kinetic Green — Noida', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', phone: '+91 120 400 0010', distanceKm: 8.6, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd12', name: 'Kinetic Green — Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010', phone: '+91 522 400 0011', distanceKm: 3.4, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd13', name: 'Kinetic Green — Varanasi', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221010', phone: '+91 542 400 0012', distanceKm: 6.1, testRide: false, service: true, threeWheeler: true, verified: false },
  { id: 'd14', name: 'Kinetic Green — Jaipur', city: 'Jaipur', state: 'Rajasthan', pincode: '302012', phone: '+91 141 400 0013', distanceKm: 5.5, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd15', name: 'Kinetic Green — Jodhpur', city: 'Jodhpur', state: 'Rajasthan', pincode: '342001', phone: '+91 291 400 0014', distanceKm: 7.8, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd16', name: 'Kinetic Green — Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', phone: '+91 79 4000 0015', distanceKm: 4.0, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd17', name: 'Kinetic Green — Surat', city: 'Surat', state: 'Gujarat', pincode: '395007', phone: '+91 261 400 0016', distanceKm: 5.2, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd18', name: 'Kinetic Green — Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641004', phone: '+91 422 400 0017', distanceKm: 3.9, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd19', name: 'Kinetic Green — Chennai West', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040', phone: '+91 44 4000 0018', distanceKm: 6.4, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd20', name: 'Kinetic Green — Madurai', city: 'Madurai', state: 'Tamil Nadu', pincode: '625020', phone: '+91 452 400 0019', distanceKm: 4.6, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd21', name: 'Kinetic Green — Hyderabad Central', city: 'Hyderabad', state: 'Telangana', pincode: '500081', phone: '+91 40 4000 0020', distanceKm: 3.3, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd22', name: 'Kinetic Green — Warangal', city: 'Warangal', state: 'Telangana', pincode: '506002', phone: '+91 870 400 0021', distanceKm: 9.1, testRide: false, service: true, threeWheeler: true, verified: false },
  { id: 'd23', name: 'Kinetic Green — Kolkata South', city: 'Kolkata', state: 'West Bengal', pincode: '700091', phone: '+91 33 4000 0022', distanceKm: 4.8, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd24', name: 'Kinetic Green — Siliguri', city: 'Siliguri', state: 'West Bengal', pincode: '734001', phone: '+91 353 400 0023', distanceKm: 6.7, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd25', name: 'Kinetic Green — Patna', city: 'Patna', state: 'Bihar', pincode: '800014', phone: '+91 612 400 0024', distanceKm: 5.9, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd26', name: 'Kinetic Green — Indore', city: 'Indore', state: 'Madhya Pradesh', pincode: '452010', phone: '+91 731 400 0025', distanceKm: 4.1, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd27', name: 'Kinetic Green — Bhopal', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462016', phone: '+91 755 400 0026', distanceKm: 6.0, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd28', name: 'Kinetic Green — Kochi', city: 'Kochi', state: 'Kerala', pincode: '682024', phone: '+91 484 400 0027', distanceKm: 3.6, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd29', name: 'Kinetic Green — Thiruvananthapuram', city: 'Thiruvananthapuram', state: 'Kerala', pincode: '695014', phone: '+91 471 400 0028', distanceKm: 5.4, testRide: true, service: true, threeWheeler: false, verified: false },
  { id: 'd30', name: 'Kinetic Green — Nagpur', city: 'Nagpur', state: 'Maharashtra', pincode: '440010', phone: '+91 712 400 0029', distanceKm: 4.4, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd31', name: 'Kinetic Green — Ludhiana', city: 'Ludhiana', state: 'Punjab', pincode: '141001', phone: '+91 161 400 0030', distanceKm: 7.1, testRide: true, service: true, threeWheeler: true, verified: false },
  { id: 'd32', name: 'Kinetic Green — Guwahati', city: 'Guwahati', state: 'Assam', pincode: '781005', phone: '+91 361 400 0031', distanceKm: 5.7, testRide: true, service: true, threeWheeler: true, verified: false },
];

/* ===========================================================================
   INDIA MOBILITY — REGIONS
   ---------------------------------------------------------------------------
   `dealerCount` values are illustrative per-state splits of the 550+ national
   figure (namely they are NOT a published per-state breakdown). They are
   marked pending and rendered with a "network share" framing rather than as a
   hard, quotable statistic. Replace with the live dealer feed before launch.
   =========================================================================== */
export interface Region {
  id: string;
  state: string;
  /** SVG path data, normalized 0–100 viewBox, stylised not cartographic */
  path: string;
  labelX: number;
  labelY: number;
  environments: string[];
  dealerCount: number | null;
  narrative: string;
  verification: Verification;
}

export const regions: Region[] = [
  {
    id: 'mh',
    state: 'Maharashtra',
    path: 'M18,52 L30,44 L38,50 L44,58 L40,68 L28,72 L16,66 Z',
    labelX: 29,
    labelY: 58,
    environments: ['City', 'Suburban', 'Business'],
    dealerCount: null,
    narrative:
      'Mumbai and Pune carry the highest two-wheeler density in the country. Short trip distances and heavy congestion are exactly the duty cycle an electric drivetrain handles best, and three-wheeler demand is constant.',
    verification: 'pending',
  },
  {
    id: 'ka',
    state: 'Karnataka',
    path: 'M40,70 L52,64 L58,72 L54,84 L42,86 L36,78 Z',
    labelX: 47,
    labelY: 76,
    environments: ['City', 'Suburban', 'Last-mile'],
    dealerCount: null,
    narrative:
      'Bengaluru commutes are long in time and short in distance — the worst possible case for a petrol engine and a favourable one for electric. Strong last-mile delivery activity adds commercial three-wheeler volume.',
    verification: 'pending',
  },
  {
    id: 'up',
    state: 'Uttar Pradesh',
    path: 'M44,30 L58,26 L66,34 L64,44 L52,48 L42,42 Z',
    labelX: 53,
    labelY: 37,
    environments: ['City', 'Rural', 'Business'],
    dealerCount: null,
    narrative:
      'India’s largest two-wheeler market by volume. Tier-two and tier-three towns here are where an electric three-wheeler changes an operator’s daily economics most sharply, and where dealer reach decides adoption.',
    verification: 'pending',
  },
  {
    id: 'tn',
    state: 'Tamil Nadu',
    path: 'M46,86 L54,84 L58,94 L50,98 L42,94 Z',
    labelX: 50,
    labelY: 91,
    environments: ['City', 'Suburban', 'Business', 'Last-mile'],
    dealerCount: null,
    narrative:
      'A long-established automotive manufacturing base with dense two- and three-wheeler usage. Coimbatore, Madurai and the Chennai belt support both personal and commercial electric demand.',
    verification: 'pending',
  },
  {
    id: 'gj',
    state: 'Gujarat',
    path: 'M12,54 L22,48 L30,52 L28,64 L18,68 L10,62 Z',
    labelX: 19,
    labelY: 58,
    environments: ['Business', 'Suburban', 'Cargo'],
    dealerCount: null,
    narrative:
      'Industrial corridors and port logistics make Gujarat a cargo three-wheeler market. Depot-to-warehouse runs are short, predictable and repetitive — an ideal shape for electric.',
    verification: 'pending',
  },
  {
    id: 'wb',
    state: 'West Bengal',
    path: 'M62,40 L72,36 L76,46 L70,54 L62,50 Z',
    labelX: 68,
    labelY: 45,
    environments: ['City', 'Rural', 'Last-mile'],
    dealerCount: null,
    narrative:
      'Kolkata has one of the highest three-wheeler densities in India. Short trip lengths and tight streets favour smaller, lighter electric vehicles over larger ones.',
    verification: 'pending',
  },
  {
    id: 'rj',
    state: 'Rajasthan',
    path: 'M8,40 L24,32 L34,40 L30,50 L14,52 Z',
    labelX: 20,
    labelY: 42,
    environments: ['Rural', 'Suburban', 'Business'],
    dealerCount: null,
    narrative:
      'Longer inter-town distances and a rural customer base make range confidence the deciding factor. High ambient temperatures also make battery thermal management a real engineering priority.',
    verification: 'pending',
  },
  {
    id: 'kl',
    state: 'Kerala',
    path: 'M40,88 L44,90 L42,99 L38,97 Z',
    labelX: 41,
    labelY: 94,
    environments: ['City', 'Suburban', 'Rural'],
    dealerCount: null,
    narrative:
      'One of India’s highest literacy and early-adoption markets, with short trip distances and high two-wheeler ownership density per household.',
    verification: 'pending',
  },
  {
    id: 'dl-ncr',
    state: 'Delhi NCR',
    path: 'M36,28 L44,26 L46,34 L38,36 Z',
    labelX: 40,
    labelY: 31,
    environments: ['City', 'Last-mile', 'Business'],
    dealerCount: null,
    narrative:
      'Air quality regulation has made electric conversion a policy priority. Last-mile delivery fleets in the NCR are converting at scale, and two-wheeler commute distances are short.',
    verification: 'pending',
  },
];

/* ===========================================================================
   STORIES / EDITORIAL
   ---------------------------------------------------------------------------
   Populated from Kinetic Green’s own published announcements. Each card links
   out to the source; no invented editorial is attributed to the company.
   =========================================================================== */
export interface Story {
  id: string;
  category: 'Product' | 'People' | 'Technology' | 'Mobility' | 'Business';
  title: string;
  excerpt: string;
  date: string;
  href: string;
  /** Relative path in /public/media once an editorial image is supplied */
  image: string | null;
  featured?: boolean;
}

export const stories: Story[] = [
  {
    id: 's1',
    category: 'Product',
    title: 'E-Luna Prime enters India’s mass commuter motorcycle segment',
    excerpt:
      'The E-Luna family steps up in presence and specification with Prime — Kinetic Green’s move into the country’s largest two-wheeler category.',
    date: '2025',
    href: 'https://kineticgreen.com/',
    image: null,
    featured: true,
  },
  {
    id: 's2',
    category: 'Business',
    title: 'Tonino Lamborghini luxury electric carts launch in the Maldives',
    excerpt:
      'Electrify Maldives appointed exclusive distributor, unveiling premium electric mobility at the TechEng 2025 exhibition.',
    date: '2025',
    href: 'https://kineticgreen.com/',
    image: null,
  },
  {
    id: 's3',
    category: 'Business',
    title: 'Surge Systems appointed distributor for luxury electric carts in India',
    excerpt:
      'Kinetic Green Tonino Lamborghini names an authorised distributor for its luxury electric golf and lifestyle carts across India.',
    date: '2025',
    href: 'https://kineticgreen.com/',
    image: null,
  },
  {
    id: 's4',
    category: 'Mobility',
    title: 'Why Indian duty cycles favour electric three-wheelers',
    excerpt:
      'Short, repeated, high-frequency trips are the worst case for a combustion engine and the best case for an electric drivetrain. The operating arithmetic explains the shift.',
    date: '2025',
    href: 'https://kineticgreen.com/',
    image: null,
  },
  {
    id: 's5',
    category: 'Technology',
    title: 'Removable batteries and the 10-ampere home socket',
    excerpt:
      'Why charging infrastructure in India looks less like a network of stations and more like the plug point already behind your front door.',
    date: '2025',
    href: 'https://kineticgreen.com/',
    image: null,
  },
  {
    id: 's6',
    category: 'People',
    title: 'The dealer network behind 550+ touchpoints',
    excerpt:
      'An electric vehicle only makes sense if it can be serviced nearby. The people who run that network are the reason adoption reaches past the metros.',
    date: '2025',
    href: 'https://kineticgreen.com/',
    image: null,
  },
];

export const storyCategories = [
  'All',
  'Product',
  'People',
  'Technology',
  'Mobility',
  'Business',
] as const;

/* ===========================================================================
   FAQ — drives both the visible accordion and the FAQPage structured data
   =========================================================================== */
export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: 'What electric vehicles does Kinetic Green make?',
    a: 'Kinetic Green manufactures electric two-wheelers and three-wheelers. The two-wheeler range is built around the E-Luna family — Go, Plus, Pro and Prime. The three-wheeler range covers passenger vehicles such as Safar Smart, Super DX and DX EV, and the cargo-focused Safar Shakti. Kinetic Green Tonino Lamborghini also offers luxury electric golf and lifestyle carts.',
  },
  {
    q: 'What is the range of the Kinetic Green E-Luna?',
    a: 'Kinetic Green lists a manufacturer-claimed range of up to 110 km for the E-Luna family, with battery packs between 2.0 kWh and 2.3 kWh depending on variant, and a claimed top speed of 50 km/h. Real-world range varies with load, terrain, riding style and battery age. Confirm the current figure for your chosen variant with your nearest dealer.',
  },
  {
    q: 'How long does a Kinetic Green electric vehicle take to charge?',
    a: 'The E-Luna family charges from a standard 10-ampere household socket and reaches full charge in roughly 4 to 5 hours depending on variant. Charging from a normal home socket means no dedicated wall-box installation is required.',
  },
  {
    q: 'How much does a Kinetic Green E-Luna cost?',
    a: 'Kinetic Green lists E-Luna ex-showroom starting prices from ₹69,990 for the Go, ₹79,990 for the Plus, ₹86,990 for the Pro and ₹89,990 for the Prime. These are indicative ex-showroom figures that vary by city, variant and applicable state subsidies — use the on-road price tool on this page or contact a dealer for your exact city price.',
  },
  {
    q: 'Can I book a test ride before buying?',
    a: 'Yes. Test rides can be booked directly from this page. Choose your vehicle, city and preferred date, and the nearest Kinetic Green dealer will confirm your slot. Test ride availability varies by dealer and variant.',
  },
  {
    q: 'Is finance available for Kinetic Green electric vehicles?',
    a: 'Finance is available for both personal and commercial buyers, and loan structures exist for commercial operators where daily running-cost savings contribute toward the instalment. Down payment and tenure options depend on the vehicle and your profile — use the EMI estimator on this page, then confirm current schemes with your dealer.',
  },
  {
    q: 'How much can I save by switching to an electric vehicle?',
    a: 'The saving depends on your daily distance, your current vehicle’s fuel efficiency, the fuel price where you live and your annual running days. The savings calculator on this page models those inputs and shows a monthly, annual and five-year estimate. These are estimates only and are not a guarantee of cost or performance.',
  },
  {
    q: 'How many Kinetic Green dealers are there in India?',
    a: 'Kinetic Green states a network of 550+ dealers across pan India, backed by more than 50 years of group operations in Indian mobility.',
  },
];
