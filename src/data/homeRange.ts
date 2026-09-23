/**
 * KINETIC GREEN — HOMEPAGE RANGE
 * ---------------------------------------------------------------------------
 * Single source of truth for the three vehicles shown in the homepage range
 * grid. Imported by BOTH <VehicleExplorer> (rendered DOM) and index.astro
 * (ItemList + Product JSON-LD), so the structured data can never drift from
 * what the page actually shows — schema always mirrors visible content.
 *
 * Specs below are the current publicly-reported Kinetic Green figures, added
 * for this demo build. They should be reconciled against the official
 * kineticgreen.com spec sheets before the site goes live
 * (see docs/kineticgreen-data-research.md).
 * ---------------------------------------------------------------------------
 */

export interface RangeSpec {
  label: string;
  value: string;
}

export interface HomeRangeItem {
  id: string;
  name: string;
  /** Filter bucket: two-wheeler | three-wheeler */
  category: 'two' | 'three';
  /** Keyword category noun rendered in the card H3 (e.g. "electric moped") */
  segmentShort: string;
  /** Fuller segment phrase for the dialog H2 + Product schema category */
  segment: string;
  /** Editorial eyebrow */
  label: string;
  /** One-line editorial hook */
  line: string;
  image: string;
  alt: string;
  class: string;
  description: string;
  features: string[];
  /** Display price string, e.g. "₹69,990" */
  price: string | null;
  /** Numeric ex-showroom starting price (INR) for Offer schema; null → no offer */
  priceFrom: number | null;
  /** Two headline specs surfaced on the card face */
  cardSpecs: RangeSpec[];
  /** Full spec grid shown in the product dialog */
  specs: RangeSpec[];
  /** Available colours (dialog swatch list) */
  colours: string[];
}

export const homeRange: HomeRangeItem[] = [
  {
    id: 'eluna-plus',
    name: 'E-Luna',
    category: 'two',
    segmentShort: 'electric moped',
    segment: 'Electric moped',
    label: 'THE EVERYDAY ICON',
    line: 'A little nostalgia. A whole new energy.',
    image: '/media/eluna-hero.webp',
    alt: 'Kinetic Green E-Luna electric moped in green, front three-quarter view',
    class: 'luna',
    description:
      'The familiar step-through design, reimagined as an electric moped for everyday riding. A removable lithium-ion pack charges from any home socket, so the commute, the market run and every detour in between cost a fraction of petrol.',
    features: ['Removable lithium-ion battery', 'Charges from a home socket', 'Front-loading cargo area'],
    price: '₹69,990',
    priceFrom: 69990,
    cardSpecs: [
      { label: 'Range', value: '110 km' },
      { label: 'Top speed', value: '50 km/h' },
    ],
    specs: [
      { label: 'Range', value: 'Up to 110 km' },
      { label: 'Top speed', value: '50 km/h' },
      { label: 'Battery', value: '2.0 kWh removable Li-ion' },
      { label: 'Motor', value: '2.2 kW' },
      { label: 'Charging', value: '≈4 hrs, home socket' },
      { label: 'Seats', value: '2' },
    ],
    colours: ['Night Star Black', 'Sparkling Green', 'Pearl Yellow', 'Ocean Blue', 'Mulberry Red'],
  },
  {
    id: 'zing',
    name: 'Zing',
    category: 'two',
    segmentShort: 'electric scooter',
    segment: 'Electric scooter',
    label: 'YOUR CITY. YOUR PACE.',
    line: 'Make the everyday a little more you.',
    image: '/media/scooter.webp',
    alt: 'Kinetic Green Zing electric scooter in copper, side profile',
    class: 'zing',
    description:
      'A light, low-speed electric scooter built for city hops — no licence or registration required. Slip through traffic, park anywhere and top up from any home socket overnight.',
    features: ['No licence or registration needed', 'Ride from age 16+', 'Home-socket charging'],
    price: '₹71,990',
    priceFrom: 71990,
    cardSpecs: [
      { label: 'Range', value: '70 km' },
      { label: 'Licence', value: 'Not needed' },
    ],
    specs: [
      { label: 'Range', value: 'Up to 70 km' },
      { label: 'Top speed', value: '25 km/h' },
      { label: 'Battery', value: '1.4 kWh Li-ion' },
      { label: 'Charging', value: '≈3.5 hrs' },
      { label: 'Licence', value: 'Not required' },
      { label: 'Seats', value: '2' },
    ],
    colours: ['Magic Blue', 'Romantic Red', 'Royal White'],
  },
  {
    id: 'safar-smart',
    name: 'Safar Smart',
    category: 'three',
    segmentShort: 'electric three-wheeler',
    segment: 'Electric passenger three-wheeler',
    label: 'A SMARTER WORKDAY',
    line: 'For the journeys that move your business.',
    image: '/media/safar.webp',
    alt: 'Kinetic Green Safar Smart electric passenger three-wheeler in white and blue',
    class: 'safar',
    description:
      'An electric passenger three-wheeler built for last-mile operators who measure the day in trips, not kilometres. Lithium or lead-acid packs to match your route economics, and a running cost that changes the daily arithmetic.',
    features: ['Lithium or lead-acid battery options', 'Seats 4 passengers', 'Built for daily commercial duty'],
    price: '₹1.53 Lakh',
    priceFrom: 153000,
    cardSpecs: [
      { label: 'Range', value: '120 km' },
      { label: 'Seats', value: '4' },
    ],
    specs: [
      { label: 'Range', value: 'Up to 120 km' },
      { label: 'Passengers', value: '4' },
      { label: 'Battery', value: '4 kWh Li-ion / lead-acid' },
      { label: 'Motor', value: '1.2 kW BLDC' },
      { label: 'Charging', value: '≈2 hrs (Li-ion)' },
      { label: 'From', value: '₹1.53 Lakh' },
    ],
    colours: [],
  },
];
