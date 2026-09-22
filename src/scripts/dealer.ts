/**
 * dealer.ts — DealerFinder controller.
 *
 * The locator is the section where honesty matters most: sending a customer to a
 * dealer that does not exist is worse than having no locator at all. So this
 * controller reads from the same roster the component renders, and every record
 * carries a `verified` flag. Unverified records are labelled in the UI, and the
 * "no results" path is a soft lead capture rather than a dead end.
 *
 * Search accepts a city name OR a PIN code. City matching is prefix-based so
 * "beng" finds Bengaluru; PIN matching is prefix-based so "5600" narrows within
 * a city.
 *
 * Without JS the component renders a plain roster grouped by state, so the
 * dealer information is still fully readable and indexable.
 */

import { track } from '../lib/analytics';
import { submitLead, validateLead, normalisePhone } from '../lib/lead';

interface Dealer {
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

export function initDealer(): void {
  const root = document.querySelector<HTMLElement>('[data-dealer]');
  const dataEl = document.querySelector<HTMLScriptElement>('[data-dealer-data]');
  if (!root || !dataEl) return;

  let dealers: Dealer[] = [];
  try {
    dealers = JSON.parse(dataEl.textContent ?? '[]') as Dealer[];
  } catch {
    return;
  }
  if (!dealers.length) return;

  const form = root.querySelector<HTMLFormElement>('[data-dealer-form]');
  const query = root.querySelector<HTMLInputElement>('[data-dealer-query]');
  const error = root.querySelector<HTMLElement>('[data-dealer-error]');
  const results = root.querySelector<HTMLElement>('[data-dealer-results]');
  const countEl = root.querySelector<HTMLElement>('[data-dealer-count]');
  const noteEl = root.querySelector<HTMLElement>('[data-dealer-results-note]');
  const listEl = root.querySelector<HTMLElement>('[data-dealer-list]');
  const fallback = root.querySelector<HTMLElement>('[data-dealer-fallback]');

  /* ---------------------------------------------------------------- search */
  function search(q: string): Dealer[] {
    const term = q.trim().toLowerCase();
    if (!term) return [];

    const isPin = /^\d{2,6}$/.test(term);

    const matches = dealers.filter((d) => {
      if (isPin) return d.pincode.startsWith(term);
      return (
        d.city.toLowerCase().startsWith(term) ||
        d.name.toLowerCase().includes(term) ||
        d.state.toLowerCase().startsWith(term)
      );
    });

    // Closest first — distance is the number a customer actually cares about.
    return matches.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  function renderCard(d: Dealer): string {
    const flags = [
      d.testRide ? 'Test rides' : 'Test ride on request',
      d.service ? 'Service centre' : null,
      d.threeWheeler ? '3W support' : null,
    ].filter(Boolean);

    return `
      <li class="kg-dealer__item">
        <article class="kg-dealer__card">
          <header class="kg-dealer__card-head">
            <h3 class="kg-dealer__card-name">${d.name}</h3>
            ${d.verified ? '' : '<span class="kg-tag">Unverified sample</span>'}
          </header>
          <p class="kg-dealer__card-addr">
            ${d.city}, ${d.state} — ${d.pincode}
          </p>
          <ul class="kg-dealer__card-flags">
            ${flags.map((f) => `<li class="kg-tag">${f}</li>`).join('')}
          </ul>
          <p class="kg-dealer__card-dist">
            <b class="kg-num">${d.distanceKm}</b> km away
          </p>
          <div class="kg-dealer__card-actions">
            <a class="kg-btn kg-btn--outline" href="tel:${d.phone.replace(/[^\d+]/g, '')}"
               data-track="dealer_contact" data-track-source="dealer-card">
              Call dealer
            </a>
            <button type="button" class="kg-btn" data-book-dealer="${d.id}"
                    data-lead-open data-lead-type="test-ride" data-lead-intent="high"
                    data-lead-source="dealer-card" data-track="test_ride_start">
              Book test ride
            </button>
          </div>
        </article>
      </li>`;
  }

  function run(q: string, source: string): void {
    const matches = search(q);

    if (error) error.textContent = '';

    track('dealer_search', { source, query: q, results: matches.length });

    if (!matches.length) {
      // Soft capture: a visitor who searched has intent even if we could not
      // place them, so we offer to find the closest dealer for them.
      if (results) results.hidden = true;
      if (fallback) {
        fallback.hidden = false;
        fallback.querySelector<HTMLInputElement>('[data-dealer-city]')?.setAttribute('value', q);
        const cityInput = fallback.querySelector<HTMLInputElement>('[data-dealer-city]');
        if (cityInput) cityInput.value = q;
      }
      return;
    }

    if (fallback) fallback.hidden = true;
    if (results) results.hidden = false;
    if (countEl) countEl.textContent = String(matches.length);
    if (noteEl) {
      noteEl.textContent =
        matches.length === 1 ? 'nearest to you' : `sorted by distance from ${q}`;
    }
    if (listEl) listEl.innerHTML = matches.map(renderCard).join('');
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = query?.value.trim() ?? '';
    if (!q) {
      if (error) error.textContent = 'Enter a city or PIN code to search.';
      query?.focus();
      return;
    }
    run(q, 'dealer-form');
  });

  root.querySelectorAll<HTMLButtonElement>('[data-dealer-quick]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const city = chip.dataset.dealerQuick ?? '';
      if (query) query.value = city;
      run(city, 'dealer-quickpick');
    });
  });

  /* ------------------------------------------------- soft-capture fallback */
  const leadForm = root.querySelector<HTMLFormElement>('[data-dealer-lead-form]');
  const leadMsg = root.querySelector<HTMLElement>('[data-dealer-lead-msg]');

  leadForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = root.querySelector<HTMLInputElement>('[data-dealer-name]')?.value.trim() ?? '';
    const phone = root.querySelector<HTMLInputElement>('[data-dealer-phone]')?.value.trim() ?? '';
    const city = root.querySelector<HTMLInputElement>('[data-dealer-city]')?.value.trim() ?? '';
    const whatsapp = root.querySelector<HTMLInputElement>('[data-dealer-whatsapp]')?.checked ?? false;

    // Validate, then paint each message next to its own field so the visitor is
    // never hunting for which input failed.
    const errors = validateLead({ name, phone, city }, ['name', 'phone', 'city']);
    root.querySelectorAll<HTMLElement>('[data-dealer-error-for]').forEach((el) => (el.textContent = ''));
    for (const [field, msg] of Object.entries(errors)) {
      const el = root.querySelector<HTMLElement>(`[data-dealer-error-for="${field}"]`);
      if (el) el.textContent = msg;
    }
    if (Object.keys(errors).length) {
      root.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    const submitBtn = root.querySelector<HTMLButtonElement>('[data-dealer-lead-submit]');
    if (submitBtn) submitBtn.disabled = true;

    const result = await submitLead(
      {
        type: 'test-ride',
        intent: 'medium',
        source: 'dealer-fallback',
        name,
        phone: normalisePhone(phone),
        city,
        whatsapp_consent: whatsapp,
        answers: { search_query: query?.value ?? city, surface: 'dealer-finder-fallback' },
      },
      ['name', 'phone', 'city'],
      'callback_submit',
    );

    if (submitBtn) submitBtn.disabled = false;
    if (leadMsg) {
      leadMsg.hidden = false;
      leadMsg.textContent = result.message;
      leadMsg.dataset.state = result.ok ? (result.offline ? 'queued' : 'ok') : 'error';
    }
    if (result.ok) leadForm.reset();
  });

  /* ---------------------------------------------------------- bootstrap */
  // If the visitor arrived with ?city= (or a hash query) we run it immediately.
  const initial = new URLSearchParams(window.location.search).get('city');
  if (initial && query) {
    query.value = initial;
    run(initial, 'dealer-deeplink');
  }
}
