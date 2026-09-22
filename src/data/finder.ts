/**
 * finder.ts (data) — the matching logic and cost model for the "Find your EV"
 * recommendation engine.
 *
 * WHY THIS IS A SHARED MODULE
 * The rules are rendered into the page as visible, readable prose (the answer
 * table in EVFinder.astro) AND executed on the client. Keeping them in one
 * place means the published explanation can never drift from the behaviour —
 * which is the whole reason the explanation is trustworthy.
 *
 * The rules are an ordered list: the first rule whose conditions are *all*
 * satisfied wins. This is deliberately not a black-box scoring model. A
 * salesperson could read it out loud.
 *
 * COST MODEL — every assumption is also printed in the UI.
 *   electricity ₹8/kWh · petrol ₹105/l · petrol comparison 55 km/l (110cc
 *   moped class) · E-Luna class consumption ≈0.022 kWh/km · 26 riding days a
 *   month. These are illustrative Indian metro averages, labelled as such.
 *   Nothing here is compounded or discounted to inflate the result, and the
 *   saving is floored at zero rather than allowed to go negative.
 */

export type AnswerKey = 'need' | 'distance' | 'priority';

export interface FinderAnswers {
  need?: string;
  distance?: string;
  priority?: string;
  location?: string;
}

export interface FinderRule {
  /** Every key present must contain one of the listed answers for the rule to fire */
  when: Partial<Record<AnswerKey, string[]>>;
  /** Vehicle id — must exist in data/vehicles.ts */
  pick: string;
  /** The explanation shown to the visitor, in plain language */
  why: string;
}

/**
 * Ordered match table. Order matters — first full match wins.
 * The final two rules are unconditional fallbacks so the engine always resolves
 * to something sensible rather than an empty result.
 */
export const finderRules: FinderRule[] = [
  {
    when: { need: ['cargo'], priority: ['load'] },
    pick: 'safar-shakti',
    why: 'You are moving loads, so deck capacity decides the vehicle before anything else.',
  },
  {
    when: { need: ['passenger', 'business'], priority: ['load', 'comfort'] },
    pick: 'safar-smart',
    why: 'Passenger duty rewards low cost per trip and easy boarding more than outright speed.',
  },
  {
    when: { need: ['passenger', 'business'], priority: ['performance', 'range'] },
    pick: 'super-dx',
    why: 'Higher duty cycles need a stronger drivetrain and a more robust platform.',
  },
  {
    when: { need: ['commute', 'multiple'], distance: ['70+'], priority: ['range', 'performance'] },
    pick: 'eluna-prime',
    why: 'High daily mileage puts the commuter motorcycle variant ahead of the moped family.',
  },
  {
    when: { need: ['family'], priority: ['comfort', 'load'] },
    pick: 'eluna-pro',
    why: 'Regular pillion use favours the strongest everyday E-Luna specification.',
  },
  {
    when: { need: ['commute', 'multiple'], distance: ['40-70'] },
    pick: 'eluna-plus',
    why: 'A longer daily loop is exactly where the larger battery pack pays for itself.',
  },
  {
    when: { priority: ['range', 'performance'] },
    pick: 'eluna-plus',
    why: 'Range and drive quality are what separate the Plus from the base E-Luna.',
  },
  {
    when: { priority: ['affordability'] },
    pick: 'eluna-go',
    why: 'Lowest entry price in the E-Luna family, with the same household-socket charging.',
  },
  {
    when: { priority: ['running-cost'], distance: ['0-20', '20-40'] },
    pick: 'eluna-go',
    why: 'Short daily distances are where the cheapest electric option saves the most per km.',
  },
  {
    when: { need: ['commute', 'multiple'], priority: ['running-cost'] },
    pick: 'eluna-plus',
    why: 'The broadest everyday fit across the E-Luna family.',
  },
  /**
   * FALLBACK — no conditions, so it always matches. Kept last.
   */
  { when: {}, pick: 'eluna-plus', why: 'The balanced choice across most everyday use cases.' },
];

/** Representative daily distance for each answer band, in km */
export const distanceMidpoints: Record<string, number> = {
  '0-20': 15,
  '20-40': 30,
  '40-70': 55,
  '70+': 85,
};

export const finderEconomics = {
  electricityPerKwh: 8,
  petrolPerLitre: 105,
  petrolKmpl: 55,
  daysPerMonth: 26,
  /** E-Luna class consumption from a 2.0 kWh pack and ~110 km claimed range */
  kwhPerKm: 0.022,
} as const;

export interface CostRow {
  label: string;
  value: string;
}

export interface CostEstimate {
  dailyKm: number;
  monthlyKm: number;
  evMonthly: number;
  petrolMonthly: number;
  saving: number;
  rows: CostRow[];
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/**
 * Transparent running-cost comparison. Returns both the numbers and the
 * human-readable row list the result panel renders, so the displayed
 * breakdown is produced by the same code that produced the total.
 */
export function estimateCosts(distance: string | undefined): CostEstimate {
  const e = finderEconomics;
  const dailyKm = (distance && distanceMidpoints[distance]) ?? distanceMidpoints['20-40'];
  const monthlyKm = dailyKm * e.daysPerMonth;

  const evMonthly = Math.round(monthlyKm * e.kwhPerKm * e.electricityPerKwh);
  const petrolMonthly = Math.round((monthlyKm / e.petrolKmpl) * e.petrolPerLitre);
  const saving = Math.max(0, petrolMonthly - evMonthly);

  return {
    dailyKm,
    monthlyKm,
    evMonthly,
    petrolMonthly,
    saving,
    rows: [
      { label: 'Distance per day', value: `${dailyKm} km` },
      { label: 'Monthly distance', value: `${monthlyKm.toLocaleString('en-IN')} km` },
      { label: `Electricity @ ₹${e.electricityPerKwh}/kWh`, value: `${inr(evMonthly)}/mo` },
      { label: `Petrol @ ₹${e.petrolPerLitre}/l`, value: `${inr(petrolMonthly)}/mo` },
    ],
  };
}

/**
 * Resolve the recommended vehicle id for a set of answers.
 * Returns the winning rule alongside the id so the UI can quote its reasoning.
 */
export function matchRule(answers: FinderAnswers): FinderRule {
  for (const rule of finderRules) {
    // An empty `when` is the unconditional fallback.
    const keys = Object.keys(rule.when) as AnswerKey[];
    if (!keys.length) return rule;

    const ok = keys.every((key) => {
      const allowed = rule.when[key];
      const answer = answers[key];
      if (!allowed || !answer) return false;
      return allowed.includes(answer);
    });

    if (ok) return rule;
  }
  // Unreachable — the last rule is unconditional — but keeps the return type honest.
  return finderRules[finderRules.length - 1];
}

/** Shown in the UI wherever the estimate appears. Not optional, not hidden. */
export const FINDER_ASSUMPTION_NOTE =
  'Estimates for illustration only. Actual costs depend on tariffs, routes, load, terrain and battery age, and are not a guarantee of savings.';
