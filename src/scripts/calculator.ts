import { track } from '../lib/analytics';

// Running-cost comparison only. Keep defaults aligned with SavingsCalculator.astro.
const root = document.querySelector<HTMLElement>('[data-calculator]');
const form = root?.querySelector<HTMLFormElement>('[data-calc-form]');
if (root && form) {
  const defaults: Record<string, number> = { dailyKm: 30, fuelPrice: 105, workingDays: 25, mileage: 45 };
  const read = (name: string): number => {
    const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
    const parsed = parseFloat(input.value);
    return Math.min(Number(input.max), Math.max(Number(input.min), Number.isFinite(parsed) ? parsed : defaults[name]));
  };
  const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
  // Tailpipe CO2 from burning one litre of petrol (kg). Used for the
  // "petrol CO2 avoided" estimate — labelled as such in the UI.
  const CO2_PER_LITRE = 2.31;
  function render() {
    const dailyKm = read('dailyKm');
    const km = dailyKm * read('workingDays');
    const fuel = km / read('mileage') * read('fuelPrice');
    const electric = km * 1.1;
    const annualSaving = Math.max(0, fuel - electric) * 12;
    const litresPerYear = (km / read('mileage')) * 12;
    const values: Record<string, number> = {
      annualSaving,
      monthlyFuel: fuel,
      monthlyEv: electric,
      fiveYearSaving: annualSaving * 5,
      co2Annual: litresPerYear * CO2_PER_LITRE,
    };
    root!.querySelectorAll<HTMLElement>('[data-calc-out]').forEach(el => {
      el.textContent = fmt(values[el.dataset.calcOut!] ?? 0);
    });
    const readout = root!.querySelector('[data-calc-readout="dailyKm"]');
    if (readout) readout.textContent = String(dailyKm);
    const bar = root!.querySelector<HTMLElement>('[data-electric-bar]');
    if (bar) bar.style.width = `${Math.min(100, electric / fuel * 100)}%`;
  }
  let started = false;
  form.addEventListener('submit', event => event.preventDefault());
  form.querySelectorAll<HTMLInputElement>('[data-calc-input]').forEach(input => {
    input.addEventListener('input', () => {
      if (!started) { track('savings_calculator_start', { source: 'homepage' }); started = true; }
      render();
    });
    input.addEventListener('change', () => { input.value = String(read(input.name)); render(); });
  });
  render();
}
