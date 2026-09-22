/**
 * finance.ts — EMI estimator.
 *
 * Standard reducing-balance amortisation, mirrored exactly in Finance.astro so
 * the server-rendered numbers and the client-updated numbers come from the same
 * formula with the same inputs. If they diverged, a visitor who loaded the page
 * and a visitor who dragged a slider would see different answers to the same
 * question — which is precisely how a finance widget loses trust.
 *
 *   r  = annualRate / 12 / 100
 *   emi = P · r · (1+r)^n / ((1+r)^n − 1)
 *   (with the r = 0 edge case handled explicitly)
 *
 * Two things this widget shows that most do not, because a low monthly figure is
 * not automatically a good deal:
 *   • total interest payable over the term
 *   • total repayment (loan + interest)
 *
 * The rate is a labelled illustrative assumption with a visible disclaimer.
 */

import { track } from '../lib/analytics';

const MONTHS_PER_YEAR = 12;
const RIDING_DAYS_PER_YEAR = 300;
const DAILY_KM = 30;

export function initFinance(): void {
  const root = document.querySelector<HTMLElement>('[data-finance]');
  if (!root) return;

  const form = root.querySelector<HTMLFormElement>('[data-finance-form]');
  const vehicleSelect = root.querySelector<HTMLSelectElement>('[data-finance-vehicle]');
  const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('[data-finance-input]'));
  const readouts = Array.from(root.querySelectorAll<HTMLElement>('[data-finance-readout]'));
  const labelEl = root.querySelector<HTMLElement>('[data-finance-out-label]');
  const downPctEl = root.querySelector<HTMLElement>('[data-finance-down-pct]');
  const bar = root.querySelector<HTMLElement>('[data-finance-bar]');
  const contextEl = root.querySelector<HTMLElement>('[data-finance-context]');
  const cta = root.querySelector<HTMLElement>('[data-finance-cta]');
  if (!form) return;

  let seen = false;

  /* -------------------------------------------------------------- inputs */
  function read() {
    const get = (name: string, fallback: number) => {
      const el = form!.querySelector<HTMLInputElement>(`input[name="${name}"]`);
      const v = parseFloat(el?.value ?? '');
      return Number.isFinite(v) ? v : fallback;
    };
    const option = vehicleSelect?.selectedOptions[0];
    return {
      price: parseFloat(option?.dataset.price ?? '') || 0,
      vehicleName: option?.textContent?.split('—')[0]?.trim() ?? 'your vehicle',
      down: get('down', 20000),
      tenure: get('tenure', 24),
      rate: get('rate', 10.5),
    };
  }

  /**
   * Reducing-balance EMI. Exported behaviour is mirrored in the Astro frontmatter.
   */
  function emi(principal: number, annualRate: number, months: number): number {
    if (principal <= 0 || months <= 0) return 0;
    const r = annualRate / 12 / 100;
    if (r === 0) return principal / months;
    const pow = Math.pow(1 + r, months);
    return (principal * r * pow) / (pow - 1);
  }

  function compute() {
    const { price, down, tenure, rate, vehicleName } = read();

    // A down payment larger than the vehicle must not produce a negative loan.
    const effectiveDown = Math.min(down, price);
    const principal = Math.max(0, price - effectiveDown);
    const monthly = emi(principal, rate, tenure);
    const total = monthly * tenure;
    const interest = Math.max(0, total - principal);

    return {
      price,
      down: effectiveDown,
      principal,
      monthly,
      total,
      interest,
      tenure,
      rate,
      vehicleName,
      downPct: price > 0 ? Math.round((effectiveDown / price) * 100) : 0,
      // Daily context: what this instalment works out to per riding day.
      perDay: monthly / RIDING_DAYS_PER_YEAR,
    };
  }

  /* -------------------------------------------------------------- render */
  const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  function render(): void {
    const r = compute();

    const set = (name: string, text: string) => {
      const el = root!.querySelector<HTMLElement>(`[data-finance-out="${name}"]`);
      if (el) el.textContent = text;
    };

    set('emi', Math.round(r.monthly).toLocaleString('en-IN'));
    set('price', inr(r.price));
    set('down', inr(r.down));
    set('principal', inr(r.principal));
    set('interest', inr(r.interest));
    set('total', inr(r.total));
    set('tenureLabel', `${r.tenure} months`);

    if (labelEl) labelEl.textContent = r.vehicleName;

    readouts.forEach((el) => {
      const name = el.dataset.financeReadout;
      if (name === 'down') el.textContent = Math.round(r.down).toLocaleString('en-IN');
      else if (name === 'tenure') el.textContent = String(r.tenure);
      else if (name === 'rate') el.textContent = String(r.rate);
    });

    if (downPctEl) downPctEl.textContent = String(r.downPct);

    // Bar shows what share of the total repayment is interest — the honest
    // visual, rather than a flattering "you only pay X per month" meter.
    if (bar) {
      const share = r.total > 0 ? (r.interest / r.total) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, share)).toFixed(1)}%`;
    }

    if (contextEl) {
      contextEl.textContent = `At ${DAILY_KM} km a day and ${RIDING_DAYS_PER_YEAR} riding days a year, an indicative EMI of this size works out to roughly ${inr(
        r.perDay,
      )} per riding day.`;
    }

    if (cta) cta.dataset.leadVehicle = vehicleSelect?.value ?? '';
  }

  /* ----------------------------------------------------------- listeners */
  inputs.forEach((input) => input.addEventListener('input', render));
  vehicleSelect?.addEventListener('change', render);

  form.addEventListener(
    'focusin',
    () => {
      if (seen) return;
      seen = true;
      track('finance_calculator', { source: 'finance' });
    },
    { once: true },
  );

  // Record the estimate with the lead so the dealer conversation starts from the
  // visitor's own numbers rather than a blank sheet.
  cta?.addEventListener('click', () => {
    const r = compute();
    track('finance_calculator', {
      source: 'finance',
      vehicle: vehicleSelect?.value,
      emi: Math.round(r.monthly),
      tenure: r.tenure,
      rate: r.rate,
      down_payment: Math.round(r.down),
    });
  });

  render();
}
