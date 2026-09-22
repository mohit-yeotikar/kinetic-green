/**
 * forms.ts — the inline lead forms that are NOT the modal.
 *
 * These are the three conversion surfaces that live in the page body:
 *   • On-road price  (PriceLead)   — high intent
 *   • Dealer search + soft capture (DealerFinder)
 *   • Finance EMI estimator        (Finance)
 *
 * Each one validates only its own fields, submits through the shared `submitLead`
 * transport, and reports its own analytics events. They all write into the same
 * progressive-profiling draft, so a visitor who uses the savings calculator and
 * then asks for a price does not retype anything.
 */

import { track } from '../lib/analytics';
import { submitLead, normalisePhone, validateLead, loadDraft, saveDraft } from '../lib/lead';

const formatINR = (v: number) => '₹' + Math.round(v).toLocaleString('en-IN', { maximumFractionDigits: 0 });

/* ==========================================================================
   1. ON-ROAD PRICE
   ========================================================================== */

function initPrice(): void {
  const form = document.querySelector<HTMLFormElement>('[data-price-form]');
  if (!form) return;

  const msg = document.querySelector<HTMLElement>('[data-price-msg]');
  const submit = form.querySelector<HTMLButtonElement>('[data-price-submit]');
  const submitLabel = submit?.querySelector('span');
  let started = false;

  const fields = {
    city: () => form.querySelector<HTMLSelectElement>('[data-price-city]'),
    vehicle: () => form.querySelector<HTMLSelectElement>('[data-price-vehicle]'),
    variant: () => form.querySelector<HTMLSelectElement>('[data-price-variant]'),
    name: () => form.querySelector<HTMLInputElement>('[data-price-name]'),
    phone: () => form.querySelector<HTMLInputElement>('[data-price-phone]'),
    email: () => form.querySelector<HTMLInputElement>('[data-price-email]'),
    whatsapp: () => form.querySelector<HTMLInputElement>('[data-price-whatsapp]'),
  };

  function clearErrors(): void {
    form.querySelectorAll<HTMLElement>('[data-price-error-for]').forEach((el) => (el.textContent = ''));
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  }

  function showErrors(errors: Record<string, string | undefined>): void {
    clearErrors();
    for (const [field, message] of Object.entries(errors)) {
      if (!message) continue;
      const el = form.querySelector<HTMLElement>(`[data-price-error-for="${field}"]`);
      if (el) el.textContent = message;
      form.querySelector<HTMLElement>(`[name="${field}"]`)?.setAttribute('aria-invalid', 'true');
    }
    form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }

  // Rehydrate from the draft so nothing is asked twice.
  const draft = loadDraft() as { city?: string; vehicle?: string; name?: string; phone?: string; email?: string };
  if (draft.city && fields.city()) {
    const opt = Array.from(fields.city()!.options).find((o) => o.value === draft.city || o.text.includes(draft.city!));
    if (opt) fields.city()!.value = opt.value;
  }
  if (draft.vehicle && fields.vehicle()) fields.vehicle()!.value = draft.vehicle;
  if (draft.name && fields.name()) fields.name()!.value = draft.name;
  if (draft.phone && fields.phone()) fields.phone()!.value = draft.phone;
  if (draft.email && fields.email()) fields.email()!.value = draft.email;

  form.addEventListener(
    'focusin',
    () => {
      if (started) return;
      started = true;
      track('price_check_start', { source: 'on-road-price' });
    },
    { once: true },
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      city: fields.city()?.value,
      vehicle: fields.vehicle()?.value,
      variant: fields.variant()?.value,
      name: fields.name()?.value.trim(),
      phone: fields.phone()?.value.trim(),
      email: fields.email()?.value.trim() || undefined,
    };

    const errors = validateLead(
      { ...data, phone: data.phone ? normalisePhone(data.phone) : undefined },
      ['city', 'vehicle', 'name', 'phone'],
    );
    if (Object.keys(errors).length) {
      showErrors(errors);
      return;
    }

    if (submit) submit.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';

    const result = await submitLead(
      {
        type: 'on-road-price',
        intent: 'high',
        source: 'on-road-price',
        city: data.city,
        vehicle: data.vehicle,
        variant: data.variant,
        name: data.name,
        phone: normalisePhone(data.phone!),
        email: data.email,
        whatsapp_consent: fields.whatsapp()?.checked ?? false,
        answers: {
          fuel_type: null,
          calculator: loadDraft().finder_recommended ?? null,
        },
      },
      ['city', 'vehicle', 'name', 'phone'],
      'price_check_submit',
    );

    if (submit) submit.disabled = false;
    if (submitLabel) submitLabel.textContent = 'Send me the on-road price';

    if (msg) {
      msg.hidden = false;
      msg.textContent = result.ok
        ? `${result.message} Reference: ${result.reference}.`
        : result.message;
      msg.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Remember the choice for later surfaces.
    saveDraft({ city: data.city, vehicle: data.vehicle, name: data.name, phone: data.phone, email: data.email });
  });

  // Clear a field's error as soon as it is corrected.
  form.querySelectorAll<HTMLElement>('input, select').forEach((input) => {
    input.addEventListener('input', () => {
      const name = (input as HTMLInputElement).name;
      const el = form.querySelector<HTMLElement>(`[data-price-error-for="${name}"]`);
      if (el) el.textContent = '';
      input.removeAttribute('aria-invalid');
    });
  });
}

/* ==========================================================================
   2. DEALER FINDER
   ========================================================================== */

interface DealerRecord {
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
  verified: boolean;
}

function initDealer(): void {
  const root = document.querySelector<HTMLElement>('[data-dealer]');
  if (!root) return;

  const configEl = root.querySelector<HTMLScriptElement>('[data-dealer-data]');
  const roster: DealerRecord[] = configEl ? JSON.parse(configEl.textContent ?? '[]') : [];
  if (!roster.length) return;

  const form = root.querySelector<HTMLFormElement>('[data-dealer-form]');
  const query = root.querySelector<HTMLInputElement>('[data-dealer-query]');
  const results = root.querySelector<HTMLElement>('[data-dealer-results]');
  const list = root.querySelector<HTMLElement>('[data-dealer-list]');
  const count = root.querySelector<HTMLElement>('[data-dealer-count]');
  const resultsNote = root.querySelector<HTMLElement>('[data-dealer-results-note]');
  const fallback = root.querySelector<HTMLElement>('[data-dealer-fallback]');
  const errorEl = root.querySelector<HTMLElement>('[data-dealer-error]');
  const leadForm = root.querySelector<HTMLFormElement>('[data-dealer-lead-form]');
  const leadMsg = root.querySelector<HTMLElement>('[data-dealer-lead-msg]');

  /* --------------------------------------------------------------- search */
  function search(raw: string): DealerRecord[] {
    const q = raw.trim().toLowerCase();
    if (!q) return [];

    return roster
      .filter((d) => {
        // Match city, state or PIN — and a prefix of any of them, so "411" finds
        // Pune's 411001 without the visitor knowing the full code.
        return (
          d.city.toLowerCase().startsWith(q) ||
          d.state.toLowerCase().startsWith(q) ||
          d.pincode.startsWith(q) ||
          d.pincode.includes(q) ||
          d.city.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  }

  function renderDealers(matches: DealerRecord[], term: string): void {
    if (!list || !results) return;

    if (!matches.length) {
      results.hidden = true;
      if (fallback) fallback.hidden = false;
      if (resultsNote) resultsNote.textContent = '';
      track('dealer_search', { source: 'dealer-finder', term, results: 0 });
      return;
    }

    results.hidden = false;
    if (fallback) fallback.hidden = true;
    if (count) count.textContent = String(matches.length);
    if (resultsNote) resultsNote.textContent = `Nearest to “${term}”`;

    list.innerHTML = matches
      .map((d) => {
        const tags = [
          d.testRide ? '<span class="kg-tag kg-tag--green">Test ride</span>' : '',
          d.service ? '<span class="kg-tag">Service</span>' : '',
          d.threeWheeler ? '<span class="kg-tag">3-wheeler</span>' : '',
        ]
          .filter(Boolean)
          .join('');

        // encodeURIComponent guards the query string against odd city names.
        const maps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          `${d.name}, ${d.city}, ${d.state} ${d.pincode}`,
        )}`;

        return `
          <li class="kg-dealer__item">
            <div class="kg-dealer__item-head">
              <div>
                <p class="kg-dealer__item-name">${d.name}</p>
                <p class="kg-dealer__item-addr">${d.city}, ${d.state} — ${d.pincode}</p>
              </div>
              <span class="kg-dealer__item-dist">${d.distanceKm} km</span>
            </div>
            <div class="kg-dealer__item-tags">${tags}</div>
            <div class="kg-dealer__item-actions">
              <button type="button" class="kg-dealer__item-btn kg-dealer__item-btn--primary"
                data-dealer-book data-dealer-id="${d.id}" data-dealer-name="${d.name}" data-dealer-city="${d.city}">
                <svg class="kg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
                Book test ride
              </button>
              <a class="kg-dealer__item-btn" href="tel:${d.phone.replace(/\s/g, '')}" data-dealer-call data-dealer-id="${d.id}">
                <svg class="kg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z"/></svg>
                Call
              </a>
              <a class="kg-dealer__item-btn" href="${maps}" target="_blank" rel="noopener noreferrer" data-dealer-dir data-dealer-id="${d.id}">
                <svg class="kg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                Directions
              </a>
            </div>
          </li>`;
      })
      .join('');

    track('dealer_search', { source: 'dealer-finder', term, results: matches.length });
    track('dealer_result_view', { source: 'dealer-finder', term, results: matches.length });
  }

  function runSearch(term: string): void {
    if (!term.trim()) {
      if (errorEl) errorEl.textContent = 'Enter a city or PIN code to search.';
      query?.focus();
      return;
    }
    if (errorEl) errorEl.textContent = '';
    renderDealers(search(term), term.trim());
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    runSearch(query?.value ?? '');
  });

  // Quick-pick chips
  root.querySelectorAll<HTMLButtonElement>('[data-dealer-quick]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const city = chip.dataset.dealerQuick ?? '';
      if (query) query.value = city;
      runSearch(city);
      results?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });

  /* ------------------------------------------- actions on a rendered dealer */
  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const book = target.closest<HTMLElement>('[data-dealer-book]');
    if (book) {
      // Hand off to the shared modal with the dealer's city prefilled.
      track('dealer_contact', { source: 'dealer-finder', dealer: book.dataset.dealerId });

      const trigger = document.createElement('button');
      trigger.dataset.leadOpen = '';
      trigger.dataset.leadType = 'test-ride';
      trigger.dataset.leadIntent = 'high';
      trigger.dataset.leadSource = 'dealer-finder';
      trigger.style.display = 'none';
      document.body.appendChild(trigger);
      trigger.click();
      trigger.remove();

      // Prefill the city field on the modal's step 2.
      const cityInput = document.querySelector<HTMLInputElement>('[data-lead-city]');
      if (cityInput && book.dataset.dealerCity) {
        cityInput.value = book.dataset.dealerCity;
        cityInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }

    if (target.closest('[data-dealer-call]')) {
      track('dealer_contact', { source: 'dealer-finder', method: 'call', dealer: target.closest<HTMLElement>('[data-dealer-call]')?.dataset.dealerId });
      return;
    }

    if (target.closest('[data-dealer-dir]')) {
      track('dealer_directions', { source: 'dealer-finder', dealer: target.closest<HTMLElement>('[data-dealer-dir]')?.dataset.dealerId });
    }
  });

  /* ---------------------------------------------------- soft-capture form */
  leadForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = leadForm.querySelector<HTMLInputElement>('[data-dealer-name]')?.value.trim();
    const phone = leadForm.querySelector<HTMLInputElement>('[data-dealer-phone]')?.value.trim();
    const city = leadForm.querySelector<HTMLInputElement>('[data-dealer-city]')?.value.trim();

    const errors = validateLead({ name, phone: phone ? normalisePhone(phone) : undefined, city }, ['name', 'phone', 'city']);

    leadForm.querySelectorAll<HTMLElement>('[data-dealer-error-for]').forEach((el) => (el.textContent = ''));
    if (Object.keys(errors).length) {
      for (const [field, message] of Object.entries(errors)) {
        const el = leadForm.querySelector<HTMLElement>(`[data-dealer-error-for="${field}"]`);
        if (el) el.textContent = message ?? '';
      }
      return;
    }

    const result = await submitLead(
      {
        type: 'dealer',
        intent: 'high',
        source: 'dealer-finder-fallback',
        name,
        phone: normalisePhone(phone!),
        city,
        whatsapp_consent: leadForm.querySelector<HTMLInputElement>('[data-dealer-whatsapp]')?.checked ?? false,
      },
      ['name', 'phone', 'city'],
      'dealer_contact',
    );

    if (leadMsg) {
      leadMsg.hidden = false;
      leadMsg.textContent = result.ok ? `${result.message} Reference: ${result.reference}.` : result.message;
    }

    saveDraft({ name, phone, city });
  });
}

/* ==========================================================================
   3. FINANCE EMI
   ========================================================================== */

function initFinance(): void {
  const root = document.querySelector<HTMLElement>('[data-finance]');
  if (!root) return;

  const dataEl = root.querySelector<HTMLScriptElement>('[data-finance-data]');
  const priceMap: Record<string, number> = dataEl ? JSON.parse(dataEl.textContent ?? '{}') : {};

  const vehicleSel = root.querySelector<HTMLSelectElement>('[data-finance-vehicle]');
  const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('[data-finance-input]'));
  const outs = Array.from(root.querySelectorAll<HTMLElement>('[data-finance-out]'));
  const readouts = Array.from(root.querySelectorAll<HTMLElement>('[data-finance-readout]'));
  const downPct = root.querySelector<HTMLElement>('[data-finance-down-pct]');
  const bar = root.querySelector<HTMLElement>('[data-finance-bar]');
  const context = root.querySelector<HTMLElement>('[data-finance-context]');
  const label = root.querySelector<HTMLElement>('[data-finance-out-label]');
  const cta = root.querySelector<HTMLElement>('[data-finance-cta]');

  if (!inputs.length) return;

  const displayed = new Map<string, number>();
  const reduced = () =>
    document.documentElement.dataset.reducedMotion === 'true' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate(el: HTMLElement, key: string, target: number, prefix = ''): void {
    const from = displayed.get(key) ?? target;
    displayed.set(key, target);

    if (reduced() || Math.abs(target - from) < 1) {
      el.textContent = prefix + Math.round(target).toLocaleString('en-IN');
      return;
    }

    const start = performance.now();
    const duration = 380;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(from + (target - from) * eased).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + Math.round(target).toLocaleString('en-IN');
    };
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------- EMI amortisation
     Standard amortisation:  EMI = P·r·(1+r)^n / ((1+r)^n − 1)
     where r is the monthly rate and n the number of months.                  */
  function compute() {
    const vehicleId = vehicleSel?.value ?? '';
    const price = priceMap[vehicleId] ?? Number(vehicleSel?.selectedOptions[0]?.dataset.price ?? 0);

    const get = (name: string, fallback: number) => {
      const v = parseFloat(root.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value ?? '');
      return Number.isFinite(v) ? v : fallback;
    };

    const down = Math.min(get('down', 20000), Math.max(0, price - 1000));
    const months = Math.max(1, get('tenure', 24));
    const annualRate = get('rate', 10.5);

    const principal = Math.max(0, price - down);
    const monthlyRate = annualRate / 100 / 12;

    let emi: number;
    if (monthlyRate === 0) {
      emi = principal / months;
    } else {
      const factor = Math.pow(1 + monthlyRate, months);
      emi = (principal * monthlyRate * factor) / (factor - 1);
    }

    const total = emi * months;
    const interest = Math.max(0, total - principal);

    return { price, down, months, annualRate, principal, emi, total, interest };
  }

  let started = false;

  function render(flash = false): void {
    const r = compute();

    for (const el of outs) {
      const name = el.dataset.financeOut;
      if (!name) continue;
      switch (name) {
        case 'emi': animate(el, name, r.emi); break;
        case 'price': animate(el, name, r.price, '₹'); break;
        case 'down': animate(el, name, r.down, '₹'); break;
        case 'principal': animate(el, name, r.principal, '₹'); break;
        case 'interest': animate(el, name, r.interest, '₹'); break;
        case 'total': animate(el, name, r.total, '₹'); break;
        case 'tenureLabel': el.textContent = `${r.months} months`; break;
        default: break;
      }
    }

    for (const el of readouts) {
      const name = el.dataset.financeReadout;
      if (!name) continue;
      const v = { down: r.down, tenure: r.months, rate: r.annualRate }[name as 'down' | 'tenure' | 'rate'];
      el.textContent = name === 'rate' ? String(v) : Math.round(v).toLocaleString('en-IN');
    }

    if (downPct && r.price > 0) downPct.textContent = String(Math.round((r.down / r.price) * 100));
    if (label) label.textContent = vehicleSel?.selectedOptions[0]?.text.split('—')[0].trim() ?? '';

    // The bar shows the loan as a share of the vehicle price.
    if (bar && r.price > 0) bar.style.width = `${Math.round((r.principal / r.price) * 100)}%`;

    // Context line: frame the EMI against a real daily distance.
    if (context) {
      const perDay = r.emi / 30;
      context.textContent =
        `At 30 km a day over about 30 days of use a month, an indicative EMI of ${formatINR(r.emi)} ` +
        `works out to roughly ₹${Math.round(perDay)} per day. Over the ${r.months}-month term you would ` +
        `repay ${formatINR(r.total)} in total, of which ${formatINR(r.interest)} is interest.`;
    }

    if (flash) {
      const card = root.querySelector<HTMLElement>('[data-finance-emi-card]');
      if (card) {
        card.dataset.flash = 'true';
        window.setTimeout(() => card.removeAttribute('data-flash'), 500);
      }
    }
  }

  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      if (!started) {
        started = true;
        track('finance_calculator', { source: 'finance' });
      }
      render(true);
    });
  });

  vehicleSel?.addEventListener('change', () => {
    // A more expensive vehicle needs headroom on the down-payment slider.
    const price = priceMap[vehicleSel.value] ?? 0;
    const downSlider = root.querySelector<HTMLInputElement>('[name="down"]');
    if (downSlider && price > 0) {
      downSlider.max = String(Math.round(price * 0.9 / 1000) * 1000);
      if (Number(downSlider.value) > Number(downSlider.max)) {
        downSlider.value = String(Math.round(Number(downSlider.max) / 2 / 1000) * 1000);
      }
    }
    render(true);
  });

  // The CTA carries the computed figures into the lead so finance intent is qualified.
  cta?.addEventListener('click', () => {
    const r = compute();
    saveDraft({
      vehicle: vehicleSel?.value,
      finance_emi: Math.round(r.emi),
      finance_months: r.months,
      finance_down: r.down,
    });
    track('finance_submit', {
      source: 'finance',
      vehicle: vehicleSel?.value,
      emi: Math.round(r.emi),
      months: r.months,
      down_payment: r.down,
    });
  });

  outs.forEach((el) => {
    const name = el.dataset.financeOut;
    if (name) displayed.set(name, 0);
  });
  render();
}

/* ==========================================================================
   BOOTSTRAP
   ========================================================================== */

export function initForms(): void {
  initPrice();
  initDealer();
  initFinance();
}
