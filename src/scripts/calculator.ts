/**
 * calculator.ts — EV savings calculator.
 *
 * The model is deliberately simple and auditable, so it can be defended:
 *
 *   monthly km        = dailyKm × workingDays
 *   fuel cost / month = (monthly km ÷ mileage) × fuelPrice
 *   EV cost / month   = monthly km × evCostPerKm
 *   saving / month    = fuel − ev
 *   annual            = saving × 12
 *   5-year            = annual × 5
 *
 * Nothing here is compounded, discounted or otherwise massaged to produce a
 * bigger number. The whole point is that a sceptical visitor can reproduce it.
 *
 * Numbers are animated by counting to the new value on a rAF loop, and only the
 * digits change — the surrounding currency marks and units stay put, so nothing
 * reflows while the visitor drags a slider.
 */

import { track } from '../lib/analytics';

const EV_COST_PER_KM = 1.1;
const MONTHS_PER_YEAR = 12;
const FIVE_YEAR_TERM = 5;

/** Per-fuel economics. Fuel price is user-editable; mileage is a user input. */
const UNIT_BY_FUEL: Record<string, { fuelUnit: string; mileageUnit: string }> = {
  petrol: { fuelUnit: '₹/litre', mileageUnit: 'km/l' },
  diesel: { fuelUnit: '₹/litre', mileageUnit: 'km/l' },
  cng: { fuelUnit: '₹/kg', mileageUnit: 'km/kg' },
  other: { fuelUnit: '₹/unit', mileageUnit: 'km/unit' },
};

const form = document.querySelector<HTMLFormElement>('[data-calc-form]');
const section = document.querySelector<HTMLElement>('[data-calculator]');

if (form && section) init(form, section);

function init(formEl: HTMLFormElement, root: HTMLElement): void {
  const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('[data-calc-input]'));
  const fuelRadios = Array.from(root.querySelectorAll<HTMLInputElement>('[data-calc-fuel]'));
  const outs = Array.from(root.querySelectorAll<HTMLElement>('[data-calc-out]'));
  const readouts = Array.from(root.querySelectorAll<HTMLElement>('[data-calc-readout]'));
  const bar = root.querySelector<HTMLElement>('[data-calc-bar]');
  const unitEl = root.querySelector<HTMLElement>('[data-calc-unit]');
  const mileageUnitEl = root.querySelector<HTMLElement>('[data-calc-mileage-unit]');
  const cta = root.querySelector<HTMLButtonElement>('[data-calc-cta]');

  /* ------------------------------------------------- number animation cache */
  const displayed = new Map<string, number>();

  const reduced = () =>
    document.documentElement.dataset.reduceMotion === 'true' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const format = (value: number): string =>
    Math.round(value).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  /** Count from the currently displayed value to the target. */
  function animate(el: HTMLElement, key: string, target: number): void {
    const from = displayed.get(key) ?? target;
    displayed.set(key, target);

    if (reduced() || Math.abs(target - from) < 1) {
      el.textContent = format(target);
      return;
    }

    const duration = 460;
    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = format(target);
    };
    requestAnimationFrame(tick);
  }

  /* --------------------------------------------------------------- compute */
  function readInputs() {
    const get = (name: string, fallback: number) => {
      const el = formEl.querySelector<HTMLInputElement>(`[name="${name}"]`);
      const v = parseFloat(el?.value ?? '');
      return Number.isFinite(v) ? v : fallback;
    };

    const fuelType = formEl.querySelector<HTMLInputElement>('[data-calc-fuel]:checked')?.value ?? 'petrol';

    return {
      fuelType,
      dailyKm: get('dailyKm', 30),
      fuelPrice: get('fuelPrice', 105),
      workingDays: get('workingDays', 25),
      mileage: Math.max(1, get('mileage', 45)),
    };
  }

  function compute() {
    const { dailyKm, fuelPrice, workingDays, mileage } = readInputs();

    const monthlyKm = dailyKm * workingDays;
    const annualKm = monthlyKm * MONTHS_PER_YEAR;

    const monthlyFuel = (monthlyKm / mileage) * fuelPrice;
    const monthlyEv = monthlyKm * EV_COST_PER_KM;

    // Guard: never report a negative saving. If the electric vehicle would cost
    // more to run than the comparison vehicle, say so honestly.
    const rawSaving = monthlyFuel - monthlyEv;
    const monthlySaving = Math.max(0, rawSaving);

    return {
      monthlyKm,
      annualKm,
      monthlyFuel,
      monthlyEv,
      monthlySaving,
      annualFuel: monthlyFuel * MONTHS_PER_YEAR,
      annualEv: monthlyEv * MONTHS_PER_YEAR,
      annualSaving: monthlySaving * MONTHS_PER_YEAR,
      fiveYear: monthlySaving * MONTHS_PER_YEAR * FIVE_YEAR_TERM,
      savingRatio: monthlyFuel > 0 ? Math.min(1, monthlySaving / monthlyFuel) : 0,
      negative: rawSaving < 0,
    };
  }

  /* ---------------------------------------------------------------- render */
  let firstRun = true;

  function render(flash = false): void {
    const r = compute();

    for (const el of outs) {
      const name = el.dataset.calcOut;
      if (!name) continue;

      let target = 0;
      switch (name) {
        case 'monthlyFuel': target = r.monthlyFuel; break;
        case 'monthlyEv': target = r.monthlyEv; break;
        case 'monthlySaving': target = r.monthlySaving; break;
        case 'annualFuel': target = r.annualFuel; break;
        case 'annualEv': target = r.annualEv; break;
        case 'annualSaving': target = r.annualSaving; break;
        case 'fiveYear': target = r.fiveYear; break;
        case 'annualKm': target = r.annualKm; break;
        default: continue;
      }

      // The rupee-prefixed totals already carry their currency mark in markup,
      // except the km figure which carries its unit.
      if (name === 'annualKm') {
        animate(el, name, target);
        // the unit is a sibling; keep it simple by appending nothing here
      } else {
        animate(el, name, target);
      }

      if (flash && !firstRun) {
        const host = el.closest<HTMLElement>('.kg-calc__value, .kg-calc__headline-value');
        if (host) {
          host.dataset.flash = 'true';
          window.setTimeout(() => host.removeAttribute('data-flash'), 500);
        }
      }
    }

    // Slider readouts update instantly — they are the control's own feedback.
    for (const el of readouts) {
      const name = el.dataset.calcReadout;
      if (!name) continue;
      const value = readInputs()[name as 'dailyKm' | 'fuelPrice' | 'workingDays' | 'mileage'];
      el.textContent = value.toLocaleString('en-IN');
    }

    // Fuel-unit labels follow the segmented control
    const { fuelType } = readInputs();
    const units = UNIT_BY_FUEL[fuelType] ?? UNIT_BY_FUEL.petrol;
    if (unitEl) unitEl.textContent = units.fuelUnit;
    if (mileageUnitEl) mileageUnitEl.textContent = units.mileageUnit;

    // Saving ratio bar
    if (bar) {
      bar.style.width = `${(r.savingRatio * 100).toFixed(1)}%`;
      bar.style.background = r.negative ? 'var(--kg-graphite-2)' : 'var(--kg-green)';
    }

    // Context notes under the two cost cards, so each number explains itself
    const fuelNote = root.querySelector<HTMLElement>('[data-calc-note="fuel"]');
    if (fuelNote) {
      fuelNote.textContent = `${Math.round(r.monthlyKm).toLocaleString('en-IN')} km/month ÷ ${readInputs().mileage} km/l × ₹${readInputs().fuelPrice}`;
    }
    const evNote = root.querySelector<HTMLElement>('[data-calc-note="ev"]');
    if (evNote) {
      evNote.textContent = `${Math.round(r.monthlyKm).toLocaleString('en-IN')} km/month × ₹${EV_COST_PER_KM}/km`;
    }

    firstRun = false;
  }

  /* -------------------------------------------------------------- listeners */
  let started = false;

  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      if (!started) {
        started = true;
        track('savings_calculator_start', { source: 'savings-calculator' });
      }
      render(true);
    });
    // Keyboard users get the same live feedback as pointer users.
    input.addEventListener('change', () => render(true));
  });

  fuelRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      // Selecting a fuel type also nudges the price slider to a realistic default
      // so the estimate is not left comparing diesel mileage to a petrol price.
      const priceSlider = formEl.querySelector<HTMLInputElement>('[name="fuelPrice"]');
      const priceByFuel: Record<string, number> = { petrol: 105, diesel: 92, cng: 88, other: 105 };
      const { fuelType } = readInputs();
      if (priceSlider && priceByFuel[fuelType]) priceSlider.value = String(priceByFuel[fuelType]);
      render(true);
    });
  });

  // The explicit CTA hands the computed numbers to the lead form. This is the
  // moment the calculator stops being a toy and becomes a qualified lead.
  cta?.addEventListener('click', () => {
    const r = compute();
    const { dailyKm, workingDays, fuelType, mileage, fuelPrice } = readInputs();

    track('savings_calculator_complete', {
      source: 'savings-calculator',
      daily_km: dailyKm,
      working_days: workingDays,
      fuel_type: fuelType,
      mileage,
      fuel_price: fuelPrice,
      monthly_saving: Math.round(r.monthlySaving),
      five_year_saving: Math.round(r.fiveYear),
    });

    // Stash the model so the lead payload can carry it.
    try {
      sessionStorage.setItem(
        'kg_calc_result',
        JSON.stringify({
          daily_km: dailyKm,
          working_days: workingDays,
          fuel_type: fuelType,
          monthly_saving: Math.round(r.monthlySaving),
          annual_saving: Math.round(r.annualSaving),
          five_year_saving: Math.round(r.fiveYear),
        }),
      );
    } catch {
      /* noop */
    }

    // Open the lead form through the shared trigger contract.
    const trigger = document.createElement('button');
    trigger.dataset.leadOpen = '';
    trigger.dataset.leadType = 'callback';
    trigger.dataset.leadIntent = 'medium';
    trigger.dataset.leadSource = 'savings-calculator';
    trigger.style.display = 'none';
    document.body.appendChild(trigger);
    trigger.click();
    trigger.remove();
  });

  // Initial paint uses the server-rendered defaults so there is no layout jump;
  // this simply syncs the animation cache to those values.
  outs.forEach((el) => {
    const name = el.dataset.calcOut;
    if (name) displayed.set(name, 0);
  });
  render();
}
