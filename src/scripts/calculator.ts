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
  const shown: Record<string, number> = {};
  let tweenRaf = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tweenTo(values: Record<string, number>) {
    const outs = Array.from(root!.querySelectorAll<HTMLElement>('[data-calc-out]'));
    if (reduced) { outs.forEach(el => { el.textContent = fmt(values[el.dataset.calcOut!] ?? 0); }); return; }
    const from: Record<string, number> = {}; outs.forEach(el => { from[el.dataset.calcOut!] = shown[el.dataset.calcOut!] ?? (values[el.dataset.calcOut!] ?? 0); });
    const t0 = performance.now(), dur = 420;
    cancelAnimationFrame(tweenRaf);
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      outs.forEach(el => { const k = el.dataset.calcOut!; const v = from[k] + ((values[k] ?? 0) - from[k]) * e; shown[k] = v; el.textContent = fmt(v); });
      if (t < 1) tweenRaf = requestAnimationFrame(tick);
    };
    tweenRaf = requestAnimationFrame(tick);
  }
  function render() {
    const dailyKm = read('dailyKm');
    const km = dailyKm * read('workingDays');
    const fuel = km / read('mileage') * read('fuelPrice');
    const electric = km * 1.1;
    const values: Record<string, number> = { annualSaving: Math.max(0, fuel - electric) * 12, monthlyFuel: fuel, monthlyEv: electric, litres: km / read('mileage') };
    tweenTo(values);
    const readout = root!.querySelector('[data-calc-readout="dailyKm"]');
    if (readout) readout.textContent = String(dailyKm);
    const slider = form!.querySelector<HTMLInputElement>('[name="dailyKm"]');
    if (slider) slider.style.setProperty('--fill', `${((dailyKm - Number(slider.min)) / (Number(slider.max) - Number(slider.min))) * 100}%`);
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
