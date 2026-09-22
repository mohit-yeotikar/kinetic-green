/**
 * price.ts — on-road price request controller.
 *
 * High-intent lead surface: on-road price is the last question before a purchase
 * decision, so this form is short and its validation messages sit next to the
 * field that failed.
 *
 * What this does NOT do: invent an on-road price. Ex-showroom is shown from the
 * structured data as a starting point, and the actual city-specific on-road
 * figure is what we send the visitor. Printing a fabricated "on-road price" from
 * a national average would be exactly the kind of number a buyer discovers is
 * wrong when they reach the showroom.
 *
 * No JS → the selects and inputs are real form controls; the request is still a
 * meaningful payload and the privacy line is visible.
 */

import { track } from '../lib/analytics';
import { submitLead, validateLead, normalisePhone, saveDraft } from '../lib/lead';

interface PriceVehicle {
  id: string;
  name: string;
  price: number;
}

export function initPrice(): void {
  const form = document.querySelector<HTMLFormElement>('[data-price-form]');
  if (!form) return;

  let vehicles: PriceVehicle[] = [];
  const dataEl = document.querySelector<HTMLScriptElement>('[data-price-data]');
  try {
    if (dataEl) vehicles = JSON.parse(dataEl.textContent ?? '[]') as PriceVehicle[];
  } catch {
    vehicles = [];
  }

  const city = form.querySelector<HTMLSelectElement>('[data-price-city]');
  const vehicle = form.querySelector<HTMLSelectElement>('[data-price-vehicle]');
  const msg = form.querySelector<HTMLElement>('[data-price-msg]');
  const submit = form.querySelector<HTMLButtonElement>('[data-price-submit]');

  let started = false;

  /* Clear a field's error the moment the visitor fixes it. */
  form.querySelectorAll<HTMLElement>('input, select').forEach((el) => {
    el.addEventListener('input', () => {
      const field = (el as HTMLInputElement).name;
      const err = form.querySelector<HTMLElement>(`[data-price-error-for="${field}"]`);
      if (err) err.textContent = '';
      el.removeAttribute('aria-invalid');
    });
  });

  form.addEventListener('focusin', () => {
    if (started) return;
    started = true;
    track('price_check_start', { source: 'on-road-price' });
  }, { once: true });

  // Keep the vehicle choice in the session draft so the other lead surfaces
  // (modal, finance) open already knowing which vehicle the visitor cares about.
  vehicle?.addEventListener('change', () => {
    if (vehicle.value) saveDraft({ vehicle: vehicle.value });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector<HTMLInputElement>('[data-price-name]')?.value.trim() ?? '';
    const phone = form.querySelector<HTMLInputElement>('[data-price-phone]')?.value.trim() ?? '';
    const email = form.querySelector<HTMLInputElement>('[data-price-email]')?.value.trim() ?? '';
    const variant = form.querySelector<HTMLSelectElement>('[data-price-variant]')?.value ?? '';
    const whatsapp = form.querySelector<HTMLInputElement>('[data-price-whatsapp]')?.checked ?? false;

    const errors = validateLead(
      { name, phone, email, city: city?.value, vehicle: vehicle?.value },
      ['city', 'vehicle', 'name', 'phone'],
    );

    form.querySelectorAll<HTMLElement>('[data-price-error-for]').forEach((el) => (el.textContent = ''));
    for (const [field, text] of Object.entries(errors)) {
      const el = form.querySelector<HTMLElement>(`[data-price-error-for="${field}"]`);
      if (el) el.textContent = text;
      form.querySelector<HTMLElement>(`[name="${field}"]`)?.setAttribute('aria-invalid', 'true');
    }

    if (Object.keys(errors).length) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    if (submit) submit.disabled = true;

    const chosen = vehicles.find((v) => v.id === vehicle?.value);

    track('price_check_submit', {
      source: 'on-road-price',
      city: city?.value,
      vehicle: vehicle?.value,
      variant,
    });

    const result = await submitLead(
      {
        type: 'on-road-price',
        intent: 'high',
        source: 'on-road-price',
        name,
        phone: normalisePhone(phone),
        email: email || undefined,
        city: city?.value,
        vehicle: vehicle?.value,
        variant,
        whatsapp_consent: whatsapp,
        answers: {
          ex_showroom_from: chosen?.price ?? null,
          surface: 'on-road-price-form',
        },
      },
      ['city', 'vehicle', 'name', 'phone'],
      'price_check_submit',
    );

    if (submit) submit.disabled = false;
    if (msg) {
      msg.hidden = false;
      msg.textContent = result.message;
      msg.dataset.state = result.ok ? (result.offline ? 'queued' : 'ok') : 'error';
    }
    if (result.ok) form.reset();
  });
}
