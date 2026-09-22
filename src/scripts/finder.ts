/**
 * finder.ts — "Find your EV" controller.
 *
 * Matches EVFinder.astro exactly: question panels 1–3 are radio questions, panel
 * 4 is location, panel 5 is the result. Panels are real <fieldset>s and the
 * inputs are real radios, so keyboard/screen-reader behaviour is native — this
 * controller only moves between steps and fills in the result.
 *
 * The rules and the cost model live in src/data/finder.ts and are rendered into
 * the page both as readable prose (the answer table) and as a JSON island. This
 * file only reads the island; it never re-implements the logic. So the published
 * explanation cannot drift from the behaviour.
 *
 * No JS → all panels are visible in source order, the form still submits, and a
 * server-rendered seed recommendation is already in the result panel.
 */

import { track } from '../lib/analytics';
import { saveDraft } from '../lib/lead';

interface FinderVehicle {
  id: string;
  name: string;
  tagline: string;
  segment: string;
  priceFrom: number | null;
  rangeKm: number | null;
  batteryKwh: number | null;
  batteryType: string;
  useCases: string[];
}

interface FinderConfig {
  vehicles: FinderVehicle[];
  rules: { when: Record<string, string[]>; pick: string; why: string }[];
  distanceMidpoints: Record<string, number>;
  economics: {
    electricityPerKwh: number;
    petrolPerLitre: number;
    petrolKmpl: number;
    daysPerMonth: number;
    kwhPerKm: number;
  };
  dealers: { id: string; name: string; city: string; state: string; pincode: string; distanceKm: number; testRide: boolean }[];
}

const QUESTION_STEPS = [1, 2, 3, 4] as const;
const RESULT_STEP = 5;

export function initFinder(): void {
  const root = document.querySelector<HTMLElement>('[data-finder]');
  const configEl = document.querySelector<HTMLScriptElement>('[data-finder-config]');
  if (!root || !configEl) return;

  let config: FinderConfig;
  try {
    config = JSON.parse(configEl.textContent ?? '{}') as FinderConfig;
  } catch {
    return;
  }

  const form = root.querySelector<HTMLFormElement>('[data-finder-form]');
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-finder-panel]'));
  const stepItems = Array.from(root.querySelectorAll<HTMLElement>('[data-finder-stepitem]'));
  const locationInput = root.querySelector<HTMLInputElement>('[data-finder-location]');
  const cta = root.querySelector<HTMLElement>('[data-finder-cta]');
  if (!form || !panels.length) return;

  let cursor: number = QUESTION_STEPS[0];
  let started = false;

  const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  /* ------------------------------------------------------------- answers */
  function answers(): Record<string, string> {
    const val = (name: string) =>
      form!.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? '';
    return {
      need: val('need'),
      distance: val('distance'),
      priority: val('priority'),
      location: locationInput?.value.trim() ?? '',
    };
  }

  /* ---------------------------------------------------------- reputation */
  /**
   * Resolve against the ordered rule table. First rule whose conditions are all
   * satisfied wins; the last rule is unconditional so this always resolves.
   */
  function matchRule(a: Record<string, string>) {
    for (const rule of config.rules) {
      const keys = Object.keys(rule.when);
      if (!keys.length) return rule;
      const ok = keys.every((k) => rule.when[k]?.includes(a[k] ?? ''));
      if (ok) return rule;
    }
    return config.rules[config.rules.length - 1];
  }

  function economics(distance: string) {
    const e = config.economics;
    const dailyKm = config.distanceMidpoints[distance] ?? 30;
    const monthlyKm = dailyKm * e.daysPerMonth;
    const ev = monthlyKm * e.kwhPerKm * e.electricityPerKwh;
    const petrol = (monthlyKm / e.petrolKmpl) * e.petrolPerLitre;
    return {
      dailyKm,
      monthlyKm,
      ev: Math.round(ev),
      petrol: Math.round(petrol),
      // Floored at zero — never report a "saving" that is actually a loss.
      saving: Math.max(0, Math.round(petrol - ev)),
    };
  }

  function nearestDealer(location: string) {
    const q = location.toLowerCase();
    if (!q) return config.dealers[0];
    return (
      config.dealers.find((d) => d.city.toLowerCase().startsWith(q)) ??
      // A PIN code search should match on the PIN, not fall through to city.
      config.dealers.find((d) => /^\d{3,6}$/.test(q) && d.pincode.startsWith(q)) ??
      config.dealers.find((d) => q.includes(d.city.toLowerCase())) ??
      config.dealers[0]
    );
  }

  /* -------------------------------------------------------------- render */
  function renderResult(): void {
    const a = answers();
    const rule = matchRule(a);
    const vehicle = config.vehicles.find((v) => v.id === rule.pick) ?? config.vehicles[0];
    const eco = economics(a.distance);
    const dealer = nearestDealer(a.location);

    const set = (sel: string, text: string) => {
      const el = root!.querySelector<HTMLElement>(sel);
      if (el) el.textContent = text;
    };

    set('[data-result-name]', `Kinetic Green ${vehicle.name}`);
    set('[data-result-why]', rule.why);
    set('[data-result-bestsuited]', vehicle.useCases.slice(0, 2).join(' · ') || vehicle.segment);
    set('[data-result-range]', vehicle.rangeKm ? `${vehicle.rangeKm} km claimed` : 'Confirm with dealer');
    set(
      '[data-result-battery]',
      vehicle.batteryKwh ? `${vehicle.batteryKwh} kWh ${vehicle.batteryType}` : vehicle.batteryType,
    );
    set('[data-result-price]', vehicle.priceFrom ? `${inr(vehicle.priceFrom)} ex-showroom` : 'On enquiry');
    set(
      '[data-result-dealer]',
      dealer ? `${dealer.name} · ${dealer.city} · ${dealer.distanceKm} km` : 'We will confirm your nearest dealer',
    );

    // The cost rows are produced by the same function that produced the total,
    // so the breakdown and the headline can never disagree.
    const rowsEl = root!.querySelector<HTMLElement>('[data-result-costrows]');
    if (rowsEl) {
      rowsEl.innerHTML = [
        { label: 'Distance per day', value: `${eco.dailyKm} km` },
        { label: 'Monthly distance', value: `${eco.monthlyKm.toLocaleString('en-IN')} km` },
        { label: 'Electric running cost', value: `${inr(eco.ev)}/mo` },
        { label: 'Petrol equivalent', value: `${inr(eco.petrol)}/mo` },
      ]
        .map(
          (r) =>
            `<li><span>${r.label}</span><b class="kg-num">${r.value}</b></li>`,
        )
        .join('');
    }

    const savingEl = root!.querySelector<HTMLElement>('[data-result-saving]');
    if (savingEl) savingEl.textContent = eco.saving.toLocaleString('en-IN');

    // Carry the whole answer set on the CTA so the enquiry arrives qualified.
    if (cta) {
      cta.dataset.leadVehicle = vehicle.id;
      cta.dataset.leadSource = 'ev-finder';
    }

    saveDraft({
      vehicle: vehicle.id,
      purpose: a.need,
      distance: a.distance,
      priority: a.priority,
      city: a.location,
      finder_recommended: vehicle.id,
      finder_daily_km: eco.dailyKm,
      finder_monthly_saving: eco.saving,
    });

    track('ev_finder_complete', {
      source: 'ev-finder',
      recommended: vehicle.id,
      need: a.need,
      distance: a.distance,
      priority: a.priority,
      city: a.location,
      monthly_saving: eco.saving,
    });
  }

  /* ---------------------------------------------------------- navigation */
  function showStep(step: number, focus = false): void {
    cursor = step;

    panels.forEach((panel) => {
      const n = parseInt(panel.dataset.finderPanel ?? '0', 10);
      const active = n === step;
      panel.dataset.active = active ? 'true' : 'false';
      panel.hidden = !active;
    });

    // Step rail state: done / current / todo. aria-hidden on the marker itself
    // because the button text already carries the meaning.
    stepItems.forEach((item) => {
      const n = parseInt(item.dataset.finderStepitem ?? '0', 10);
      const state = n < step ? 'done' : n === step ? 'current' : 'todo';
      item.dataset.state = state;
      const marker = root!.querySelector<HTMLElement>(`[data-finder-stepstate="${n}"]`);
      if (marker?.parentElement) marker.parentElement.dataset.state = state;
    });

    // The tabs let a visitor jump back to change an answer, but never forward
    // past something they have not answered.
    root!.querySelectorAll<HTMLButtonElement>('[data-finder-goto]').forEach((btn) => {
      const n = parseInt(btn.dataset.finderGoto ?? '0', 10);
      btn.disabled = n > step;
    });

    if (focus) {
      const panel = panels.find((p) => p.dataset.finderPanel === String(step));
      const target = panel?.querySelector<HTMLElement>(
        'input[type="radio"]:checked, input, select, textarea, button',
      );
      window.setTimeout(() => target?.focus({ preventScroll: true }), 60);
    }
  }

  function advance(): void {
    if (cursor < QUESTION_STEPS[QUESTION_STEPS.length - 1]) {
      showStep(cursor + 1, true);
      return;
    }
    // Moving off the location step produces the recommendation.
    renderResult();
    showStep(RESULT_STEP, true);
    track('ev_finder_complete', { source: 'ev-finder', step: 'result' });
  }

  function back(): void {
    if (cursor === RESULT_STEP) {
      showStep(QUESTION_STEPS[QUESTION_STEPS.length - 1], true);
      return;
    }
    if (cursor > QUESTION_STEPS[0]) showStep(cursor - 1, true);
  }

  /* ---------------------------------------------------------- listeners */
  root.querySelectorAll<HTMLButtonElement>('[data-finder-next]').forEach((b) =>
    b.addEventListener('click', advance),
  );
  root.querySelectorAll<HTMLButtonElement>('[data-finder-prev]').forEach((b) =>
    b.addEventListener('click', back),
  );
  root.querySelector<HTMLButtonElement>('[data-finder-reveal]')?.addEventListener('click', advance);

  root.querySelectorAll<HTMLButtonElement>('[data-finder-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const n = parseInt(btn.dataset.finderGoto ?? '0', 10);
      if (n < cursor) showStep(n, true);
    });
  });

  root.querySelector<HTMLButtonElement>('[data-finder-restart]')?.addEventListener('click', () => {
    form.reset();
    if (locationInput) locationInput.value = '';
    showStep(QUESTION_STEPS[0], true);
    track('ev_finder_start', { source: 'ev-finder-restart' });
  });

  // Answering the last radio in a question advances one step — one less tap and
  // it makes the tool feel like it is responding to you.
  form.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.type !== 'radio') return;

    if (!started) {
      started = true;
      track('ev_finder_start', { source: 'ev-finder' });
    }
    track('ev_finder_step', {
      source: 'ev-finder',
      question: target.name,
      answer: target.value,
      step: cursor,
    });

    // Question steps only. The location step is free text and waits for Enter
    // or the Reveal button.
    if (cursor <= QUESTION_STEPS[QUESTION_STEPS.length - 1] && cursor !== 4) {
      window.setTimeout(() => {
        if (cursor < QUESTION_STEPS[QUESTION_STEPS.length - 1]) {
          showStep(cursor + 1, true);
        } else {
          showStep(4, true);
        }
      }, 200);
    }
  });

  locationInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      advance();
    }
  });

  form.addEventListener(
    'focusin',
    () => {
      if (started) return;
      started = true;
      track('ev_finder_start', { source: 'ev-finder' });
    },
    { once: true },
  );

  /* -------------------------------------------------------- bootstrap */
  // The seed recommendation is already server-rendered, so a visitor who never
  // interacts still sees a real match. We only take over navigation here.
  renderResult();
  showStep(QUESTION_STEPS[0]);
}
