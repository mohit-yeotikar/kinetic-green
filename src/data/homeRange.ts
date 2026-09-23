/**
 * KINETIC GREEN — HOMEPAGE RANGE
 * ---------------------------------------------------------------------------
 * Single source of truth for the three vehicles shown in the homepage range
 * grid. Imported by BOTH <VehicleExplorer> (rendered DOM) and index.astro
 * (ItemList + Product JSON-LD), so the structured data can never drift from
 * what the page actually shows — schema always mirrors visible content.
 *
 * `segmentShort` is the keyword-bearing category noun surfaced inside each
 * card <h3>; `segment` is the fuller phrase used in the product dialog <h2>
 * and the Product schema `category`.
 * ---------------------------------------------------------------------------
 */

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
  /** Ex-showroom starting price (INR) for Offer schema; null → no offer node */
  priceFrom: number | null;
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
      'The familiar step-through design, reimagined as an electric moped for everyday riding. An easy-going companion for the commute, the market and everything in between, charged from any 10A household socket.',
    features: ['Practical step-through design', 'Electric everyday mobility', 'Explore variants with your dealer'],
    priceFrom: 69990,
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
      'A city-ready electric scooter with a modern silhouette. Find the variant that suits your daily distance, charging setup and riding needs.',
    features: ['Electric scooter for the city', 'Designed for daily journeys', 'Ask your dealer about current variants'],
    priceFrom: null,
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
      'An electric passenger three-wheeler for last-mile journeys. Discuss passenger capacity, battery options and your daily operating needs with a dealer.',
    features: ['Passenger three-wheeler', 'Built for last-mile journeys', 'Business and fleet enquiries welcome'],
    priceFrom: null,
  },
];
