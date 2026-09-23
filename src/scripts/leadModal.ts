/**
 * leadModal.ts — controller for the multi-step conversion modal.
 *
 * Trigger contract (any element anywhere on the page):
 *   [data-lead-open]
 *     data-lead-type       low-intent type: test-ride | on-road-price | finance | callback | ...
 *     data-lead-intent     low | medium | high | business
 *     data-lead-vehicle    vehicle id to pre-select
 *     data-lead-source     surface name for attribution, e.g. 'hero'
 *
 * The modal configures itself from the trigger, so one modal serves every
 * conversion surface on the page. `configure()` swaps the step count, headings
 * and required fields per lead type — a callback request is 2 steps, a test ride
 * is 5, and neither shows a field it does not need.
 */

import { track } from '../lib/analytics';
import { submitLead, saveDraft, loadDraft, validateLead, normalisePhone, type LeadType, type LeadIntent } from '../lib/lead';
import { vehicles, vehicleById, formatINR } from '../data/vehicles';

const modal = document.querySelector<HTMLElement>('[data-lead-modal]');
if (modal) init();

function init(): void {
  const dialog = modal!.querySelector<HTMLElement>('[data-lead-dialog]')!;
  const form = modal!.querySelector<HTMLFormElement>('[data-lead-form]')!;
  const panels = Array.from(modal!.querySelectorAll<HTMLElement>('[data-lead-step]'));
  const railFill = modal!.querySelector<HTMLElement>('[data-lead-progress]');
  const dotsWrap = modal!.querySelector<HTMLElement>('[data-lead-dots]');
  const stepLabel = modal!.querySelector<HTMLElement>('[data-lead-step-label]');
  const heading = modal!.querySelector<HTMLElement>('[data-lead-heading]');
  const eyebrow = modal!.querySelector<HTMLElement>('[data-lead-eyebrow]');
  const backBtn = modal!.querySelector<HTMLButtonElement>('[data-lead-back]');
  const submitBtn = modal!.querySelector<HTMLButtonElement>('[data-lead-submit]');
  const submitLabel = modal!.querySelector<HTMLElement>('[data-lead-submit-label]');
  const foot = modal!.querySelector<HTMLElement>('[data-lead-foot]');
  const hint = modal!.querySelector<HTMLElement>('[data-lead-hint] span');
  const cityInput = modal!.querySelector<HTMLInputElement>('[data-lead-city]');
  const dealerPreview = modal!.querySelector<HTMLElement>('[data-lead-dealer-preview]');

  /* ------------------------------------------------------------------ state */
  interface Config {
    type: LeadType;
    intent: LeadIntent;
    source: string;
    /** Ordered step ids this lead type actually needs */
    steps: number[];
    eyebrow: string;
    headings: Record<number, string>;
    submitLabels: Record<number, string>;
  }

  let config: Config = {
    type: 'test-ride',
    intent: 'high',
    source: 'direct',
    steps: [1, 2, 3, 4, 5],
    eyebrow: 'Book a test ride',
    headings: {
      1: 'Choose your vehicle',
      2: 'Where should we arrange it?',
      3: 'When would you like to ride?',
      4: 'How should the dealer reach you?',
      5: 'Confirmed',
    },
    submitLabels: { 1: 'Continue', 2: 'Continue', 3: 'Continue', 4: 'Book my test ride' },
  };

  let cursor = 1;
  let lastFocused: HTMLElement | null = null;
  let submitting = false;

  /** Answers gathered across the funnel — submitted with the lead regardless of
   *  which step the visitor reached, so the CRM gets the qualification data. */
  const answers: Record<string, unknown> = {};

  /* -------------------------------------------------------------- configure */
  const configs: Record<string, Partial<Config>> = {
    'test-ride': {},
    'vehicle-enquiry': {
      eyebrow: 'Vehicle enquiry',
      steps: [1, 2, 4, 5],
      headings: {
        1: 'Which vehicle?',
        2: 'Your location',
        4: 'Your details',
        5: 'Enquiry received',
      },
      submitLabels: { 1: 'Continue', 2: 'Continue', 4: 'Send my enquiry' },
    },
    'on-road-price': {
      eyebrow: 'Get on-road price',
      steps: [1, 2, 4, 5],
      headings: {
        1: 'Which vehicle?',
        2: 'Where are you buying?',
        4: 'Where should we send the price?',
        5: 'Price on its way',
      },
      submitLabels: { 1: 'Continue', 2: 'Continue', 4: 'Get my on-road price' },
    },
    finance: {
      eyebrow: 'Finance options',
      steps: [1, 4, 5],
      headings: { 1: 'Which vehicle?', 4: 'Your details', 5: 'Finance request received' },
      submitLabels: { 1: 'Continue', 4: 'Check my finance options' },
    },
    callback: {
      eyebrow: 'Request a callback',
      steps: [2, 4, 5],
      headings: { 2: 'Where are you located?', 4: 'Your details', 5: 'Callback requested' },
      submitLabels: { 2: 'Continue', 4: 'Request my callback' },
    },
    dealer: {
      eyebrow: 'Dealer enquiry',
      steps: [2, 4, 5],
      headings: { 2: 'Where are you located?', 4: 'Your details', 5: 'Enquiry received' },
      submitLabels: { 2: 'Continue', 4: 'Send my enquiry' },
    },
    commercial: {
      eyebrow: 'Commercial EV enquiry',
      steps: [1, 2, 4, 5],
      headings: {
        1: 'Which vehicle are you considering?',
        2: 'Your operating location',
        4: 'Business details',
        5: 'Enquiry received',
      },
      submitLabels: { 1: 'Continue', 2: 'Continue', 4: 'Submit business enquiry' },
    },
  };

  function configure(trigger: HTMLElement): void {
    const type = (trigger.dataset.leadType ?? 'test-ride') as LeadType;
    const intent = (trigger.dataset.leadIntent ?? 'medium') as LeadIntent;
    const source = trigger.dataset.leadSource ?? 'unknown';

    const base: Config = {
      type,
      intent,
      source,
      steps: [1, 2, 3, 4, 5],
      eyebrow: 'Book a test ride',
      headings: config.headings,
      submitLabels: config.submitLabels,
    };

    config = { ...base, ...(configs[type] ?? {}) };
    config.type = type;
    config.intent = intent;
    config.source = source;

    // Render the step dots for this configuration
    if (dotsWrap) {
      dotsWrap.innerHTML = config.steps.map(() => '<i></i>').join('');
    }

    if (eyebrow) eyebrow.textContent = config.eyebrow;

    // Pre-select a vehicle if the trigger carried one
    const presetVehicle = trigger.dataset.leadVehicle;
    if (presetVehicle) {
      const input = form.querySelector<HTMLInputElement>(`input[name="vehicle"][value="${presetVehicle}"]`);
      if (input) input.checked = true;
    }

    // Rehydrate anything this visitor already told us earlier in the session.
    const draft = loadDraft() as {
      vehicle?: string;
      city?: string;
      name?: string;
      phone?: string;
      email?: string;
    };
    if (draft.vehicle && !form.querySelector<HTMLInputElement>('input[name="vehicle"]:checked')) {
      const input = form.querySelector<HTMLInputElement>(`input[name="vehicle"][value="${draft.vehicle}"]`);
      if (input) input.checked = true;
    }
    if (draft.city && cityInput) cityInput.value = draft.city;
    if (draft.name) {
      const el = form.querySelector<HTMLInputElement>('[data-lead-name]');
      if (el) el.value = draft.name;
    }
    if (draft.phone) {
      const el = form.querySelector<HTMLInputElement>('[data-lead-phone]');
      if (el) el.value = draft.phone;
    }
    if (draft.email) {
      const el = form.querySelector<HTMLInputElement>('[data-lead-email]');
      if (el) el.value = draft.email;
    }

    // Commercial/business leads collect one extra field
    const companyField = form.querySelector<HTMLElement>('[data-lead-company-wrap]');
    if (companyField) companyField.hidden = !(type === 'commercial' || type === 'dealership' || type === 'fleet');
  }

  /* ------------------------------------------------------------ navigation */
  function showStep(step: number, direction: 1 | -1 = 1): void {
    cursor = step;

    panels.forEach((panel) => {
      const n = parseInt(panel.dataset.leadStep ?? '0', 10);
      const active = n === step;
      panel.hidden = !active;
      if (active) {
        panel.style.animation = 'none';
        void panel.offsetWidth;
        panel.style.animation = '';
      }
    });

    const index = config.steps.indexOf(step);
    const total = config.steps.length;

    if (railFill) railFill.style.width = `${((index + 1) / total) * 100}%`;
    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((dot, i) => {
        (dot as HTMLElement).dataset.done = i <= index ? 'true' : 'false';
      });
    }
    if (stepLabel) stepLabel.textContent = `Step ${index + 1} of ${total}`;
    if (heading) heading.textContent = config.headings[step] ?? config.eyebrow;
    if (backBtn) backBtn.hidden = index === 0 || step === 5;
    if (foot) foot.hidden = step === 5;
    if (submitLabel) submitLabel.textContent = config.submitLabels[step] ?? 'Continue';

    // On the final step, the button submits directly in one tap.
    if (submitBtn) submitBtn.dataset.role = step === config.steps[config.steps.length - 2] ? 'submit' : 'next';

    track('test_ride_step', {
      source: config.source,
      step: index + 1,
      step_id: step,
      lead_type: config.type,
    });

    // Focus the first meaningful control in the new panel for keyboard users.
    const focusTarget = modal!.querySelector<HTMLElement>(
      `[data-lead-step="${step}"] input:not([type="hidden"]):not([disabled]), [data-lead-step="${step}"] button.kg-chip`,
    );
    window.setTimeout(() => focusTarget?.focus(), 60);
  }

  function next(): void {
    const index = config.steps.indexOf(cursor);
    if (index < 0 || index >= config.steps.length - 1) return;
    showStep(config.steps[index + 1], 1);
  }

  function back(): void {
    const index = config.steps.indexOf(cursor);
    if (index <= 0) return;
    showStep(config.steps[index - 1], -1);
  }

  /* ------------------------------------------------------------ validation */
  function clearErrors(): void {
    modal!.querySelectorAll<HTMLElement>('.kg-error').forEach((el) => (el.textContent = ''));
    modal!.querySelectorAll<HTMLElement>('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  }

  function showErrors(errors: Record<string, string | undefined>): void {
    clearErrors();
    for (const [field, message] of Object.entries(errors)) {
      if (!message) continue;
      const errorEl = modal!.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
      if (errorEl) errorEl.textContent = message;
      const input = form.querySelector<HTMLElement>(`[name="${field}"]`);
      input?.setAttribute('aria-invalid', 'true');
    }
    const firstInvalid = modal!.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
  }

  function readVehicle(): string | undefined {
    const checked = form.querySelector<HTMLInputElement>('input[name="vehicle"]:checked');
    return checked?.value;
  }

  /** Validate only the current step. Never ask for what we do not need yet. */
  function validateStep(step: number): boolean {
    clearErrors();

    if (step === 1 && config.steps.includes(1)) {
      if (!readVehicle()) {
        showErrors({ vehicle: 'Choose a vehicle to continue.' });
        return false;
      }
    }

    if (step === 2) {
      const city = cityInput?.value.trim() ?? '';
      if (!city) {
        showErrors({ city: 'Enter your city or PIN code.' });
        return false;
      }
      answers.city = city;
      saveDraft({ city });

      const vehicle = readVehicle() ? vehicleById(readVehicle()!) : null;
      track('ev_finder_step', { source: config.source, step: 'city', city, vehicle: vehicle?.id });
    }

    if (step === 4) {
      const data = {
        name: form.querySelector<HTMLInputElement>('[data-lead-name]')?.value.trim(),
        phone: form.querySelector<HTMLInputElement>('[data-lead-phone]')?.value.trim(),
        email: form.querySelector<HTMLInputElement>('[data-lead-email]')?.value.trim(),
      };

      const errors = validateLead(data, ['name', 'phone']);
      if (Object.keys(errors).length) {
        showErrors(errors);
        return false;
      }

      answers.name = data.name;
      answers.phone = data.phone;
      answers.email = data.email || undefined;
      saveDraft({ name: data.name, phone: data.phone, email: data.email });
    }

    return true;
  }

  /* ---------------------------------------------------------------- submit */
  async function handleSubmit(): Promise<void> {
    if (submitting) return;

    // Walk forward through any remaining required steps first.
    const lastInputStep = config.steps[config.steps.length - 2];
    if (cursor !== lastInputStep) {
      if (!validateStep(cursor)) return;
      next();
      return;
    }

    for (const step of config.steps) {
      if (step === 5) continue;
      const saved = cursor;
      cursor = step;
      if (!validateStep(step)) {
        showStep(step);
        cursor = saved;
        return;
      }
    }
    cursor = lastInputStep;

    submitting = true;
    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';

    const vehicleId = readVehicle();
    const vehicle = vehicleId ? vehicleById(vehicleId) : undefined;
    const dateInput = form.querySelector<HTMLInputElement>('[data-lead-date]');

    const isPreview = modal!.dataset.preview === 'true';
    const result = isPreview ? { ok: true, message: 'Preview complete. No booking has been made or sent. Call 1800-120-4242 to arrange a test ride.', reference: 'Not submitted', offline: false } : await submitLead(
      {
        type: config.type,
        intent: config.intent,
        source: config.source,
        name: answers.name as string | undefined,
        phone: answers.phone ? normalisePhone(answers.phone as string) : undefined,
        email: answers.email as string | undefined,
        city: answers.city as string | undefined,
        vehicle: vehicleId,
        variant: vehicle?.segment,
        preferred_date: dateInput?.value || undefined,
        preferred_time: (form.querySelector<HTMLSelectElement>('select[name="preferred_time"]')?.value) || undefined,
        whatsapp_consent: form.querySelector<HTMLInputElement>('[data-lead-whatsapp]')?.checked ?? false,
        answers: { ...answers },
        prefill: {
          category: loadDraft().category ?? null,
          source_surface: config.source,
        },
      },
      ['name', 'phone'],
      config.type === 'test-ride' ? 'test_ride_complete' : 'callback_submit',
    );

    submitting = false;
    if (submitBtn) submitBtn.disabled = false;

    if (!result.ok) {
      if (submitLabel) submitLabel.textContent = 'Try again';
      return;
    }

    // ------------------------------------------------ success / confirmation
    const set = (sel: string, value: string) => {
      const el = modal!.querySelector<HTMLElement>(sel);
      if (el) el.textContent = value;
    };

    set('[data-lead-success-message]', result.message);
    set('[data-done-vehicle]', vehicle?.name ?? 'Any vehicle');
    set('[data-done-city]', (answers.city as string) ?? '—');

    if (dateInput?.value) {
      const d = new Date(dateInput.value);
      set(
        '[data-done-date]',
        d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      );
    } else {
      set('[data-done-date]', 'Dealer will confirm');
    }
    set('[data-done-reference]', result.reference ?? '—');

    showStep(5);
    if (isPreview) {
      set('[data-lead-heading]', 'Preview complete');
      set('.kg-done__title', 'No booking has been made.');
      return;
    }

    // If the lead was queued offline, reflect it in the status rail.
    if (result.offline) {
      const status = document.querySelector<HTMLElement>('[data-lead-status]');
      if (status) {
        status.hidden = false;
        status.textContent = 'You have a request queued on this device — call 1800-120-4242 to confirm now.';
      }
    }

    // Fire the outcome event with the full qualification payload.
    track('test_ride_complete', {
      source: config.source,
      vehicle: vehicleId,
      city: answers.city as string,
      lead_type: config.type,
      intent: config.intent,
      reference: result.reference,
      offline: result.offline ?? false,
    });
  }

  /* --------------------------------------------------------------- opening */
  function open(trigger: HTMLElement): void {
    lastFocused = document.activeElement as HTMLElement;
    configure(trigger);

    modal!.hidden = false;
    requestAnimationFrame(() => (modal!.dataset.open = 'true'));
    document.body.dataset.locked = 'true';

    // Resume mid-flow only if the retained cursor is a real step of the CURRENT
    // lead type's flow and not the completed-confirmation step (5); otherwise
    // start this lead type from its own first step. Guards against a stale
    // cursor left by a different lead type showing an out-of-config step.
    const start =
      config.steps.includes(cursor) && cursor !== 5 ? cursor : config.steps[0];
    showStep(start, 1);

    document.addEventListener('keydown', onKeydown);

    const evt =
      config.type === 'test-ride'
        ? 'test_ride_start'
        : config.type === 'on-road-price'
          ? 'price_check_start'
          : config.type === 'commercial'
            ? 'business_enquiry_start'
            : config.type === 'finance'
              ? 'finance_calculator'
              : 'callback_submit';
    track(evt, { source: config.source, vehicle: trigger.dataset.leadVehicle });
  }

  function close(): void {
    modal!.dataset.open = 'false';
    document.body.dataset.locked = 'false';
    document.removeEventListener('keydown', onKeydown);
    window.setTimeout(() => (modal!.hidden = true), 380);
    lastFocused?.focus();
  }

  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]):not([hidden]), input:not([type="hidden"]):not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* -------------------------------------------------------------- listeners */

  // Any trigger on the page opens the modal, configured from its own data attrs.
  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-lead-open]');
    if (!trigger) return;
    e.preventDefault();
    open(trigger);
  });

  modal!.querySelectorAll('[data-lead-close]').forEach((el) => {
    el.addEventListener('click', close);
  });

  backBtn?.addEventListener('click', back);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    void handleSubmit();
  });

  // Date quick-picks
  modal!.querySelectorAll<HTMLButtonElement>('.kg-chip[data-date-offset]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const offset = chip.dataset.dateOffset ?? '1';
      const d = new Date();

      if (offset === 'weekend') {
        const day = d.getDay();
        const add = day === 6 ? 0 : day === 0 ? 6 : 6 - day;
        d.setDate(d.getDate() + add);
      } else {
        d.setDate(d.getDate() + parseInt(offset, 10));
      }

      modal!.querySelectorAll('.kg-chip[data-date-offset]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      const dateInput = form.querySelector<HTMLInputElement>('[data-lead-date]');
      if (dateInput) dateInput.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
  });

  // "Not sure which one?" routes to the recommendation engine rather than
  // asking the visitor to guess.
  modal!.querySelector('[data-lead-not-sure]')?.addEventListener('click', () => {
    close();
    document.getElementById('vehicles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('ev_finder_start', { source: 'lead-modal-not-sure' });
  });

  // No verified live dealer feed: never display sample addresses or distances.
  if (dealerPreview) dealerPreview.hidden = true;

  // Clear a field's error as soon as the visitor corrects it.
  form.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
    input.addEventListener('input', () => {
      const errorEl = modal!.querySelector<HTMLElement>(`[data-error-for="${input.name}"]`);
      if (errorEl) errorEl.textContent = '';
      input.removeAttribute('aria-invalid');
    });
  });
}

// Formats are re-exported for other scripts that need the same currency style.
export { formatINR, vehicles };
