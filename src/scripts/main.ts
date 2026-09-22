/**
 * main.ts — the single client entry point.
 *
 * Everything that runs in the browser is imported from here, so the page ships
 * ONE bundled module rather than a scattering of inline scripts. That matters for
 * three reasons:
 *   • it is fetched once and cached across navigations
 *   • it is a module, so it is deferred — never blocking parse or first paint
 *   • every controller below is written to *enhance* markup that already works,
 *     so a failure in this file degrades the page rather than breaking it
 *
 * ORDER OF OPERATIONS
 *  1. Analytics first, so every subsequent controller can emit events immediately.
 *  2. Section controllers — each guarded, so one throwing never stops the rest.
 *  3. Global behaviours (tracking delegation, lead bridge, offline queue).
 *
 * A failure in any individual controller is contained by the guard wrapper; the
 * visitor keeps a fully readable, fully functional page either way.
 */

import { track, flushQueue, initScrollDepth, initSectionViews } from '../lib/analytics';
import { pendingLeadCount } from '../lib/lead';

/* ------------------------------------------------------------------ nav */
import { initNav } from './nav';

/* --------------------------------------------------------------- motion */
import { initMotion } from './motion';

/* --------------------------------------------- section controllers (new) */
import { initExplorer } from './explorer';
import { initFinder } from './finder';
import { initTech } from './tech';
import { initIndia } from './india';
import { initLegacy } from './legacy';
import { initStories } from './stories';
import { initDealer } from './dealer';
import { initPrice } from './price';
import { initFinance } from './finance';
import { initSticky } from './sticky';

/* -------------------------------------------------- calculators + modal
   These two are imported for their side effects: they attach themselves to
   [data-calculator] and [data-lead-modal] respectively and are no-ops when
   those surfaces are absent from the page. */
import './calculator';
import './leadModal';

/**
 * Run a controller, isolating any failure. One broken enhancement must never
 * take down the rest of the page — especially not the conversion surfaces.
 */
function guard(name: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    // Reported rather than swallowed, so a real bug is visible in the console
    // during review instead of silently disappearing.
    console.error(`[kg] ${name} failed to initialise`, err);
  }
}

/* ==========================================================================
   TRACKING DELEGATION
   ========================================================================== */

/**
 * One delegated listener for the whole page.
 *
 * Markup declares intent with data attributes and never calls analytics
 * directly, which means the event map can be audited by grepping the components
 * rather than by reading JavaScript. The payload keys mirror the measurement
 * plan exactly (source, vehicle, category, chapter, section, city, story).
 */
function initTrackingDelegation(): void {
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
      if (!el) return;

      const name = el.dataset.track;
      if (!name) return;

      const payload: Record<string, unknown> = {};
      const map: Array<[string, string]> = [
        ['trackSource', 'source'],
        ['trackVehicle', 'vehicle'],
        ['trackCategory', 'category'],
        ['trackChapter', 'chapter'],
        ['trackSection', 'section'],
        ['trackCity', 'city'],
        ['trackStory', 'story'],
        ['trackQuestion', 'question'],
        ['trackState', 'state'],
      ];

      for (const [attr, key] of map) {
        const value = el.dataset[attr];
        if (value) payload[key] = value;
      }

      // Which surface fired it — useful for every funnel question we will ask.
      payload.surface =
        el.closest<HTMLElement>('[data-section]')?.dataset.section ?? 'unknown';

      track(name, payload);

      // Stamp the attribution onto the element so a later lead submission can
      // attribute itself to the exact click that started the journey.
      try {
        const clickId = `kg_click_${name}`;
        sessionStorage.setItem(clickId, JSON.stringify({ at: Date.now(), ...payload }));
      } catch {
        /* sessionStorage unavailable — attribution falls back to the session */
      }
    },
    // Capture phase so a link that navigates still reports before leaving.
    true,
  );
}

/* ==========================================================================
   LEAD BRIDGE
   ========================================================================== */

/**
 * Lets any controller open the lead modal without knowing how it works:
 *
 *   document.dispatchEvent(new CustomEvent('kg:open-lead', {
 *     detail: { type, intent, source, vehicle, city }
 *   }));
 *
 * The modal already listens for [data-lead-open] clicks, so the bridge
 * synthesises a hidden trigger and clicks it. This keeps ONE opening contract —
 * there is no second code path into the modal that could drift out of sync.
 */
function initLeadBridge(): void {
  document.addEventListener('kg:open-lead', (e) => {
    const detail = ((e as CustomEvent).detail ?? {}) as Record<string, string>;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.hidden = true;
    trigger.setAttribute('data-lead-open', '');
    if (detail.type) trigger.dataset.leadType = detail.type;
    if (detail.intent) trigger.dataset.leadIntent = detail.intent;
    if (detail.source) trigger.dataset.leadSource = detail.source;
    if (detail.vehicle) trigger.dataset.leadVehicle = detail.vehicle;
    if (detail.city) trigger.dataset.leadCity = detail.city;

    document.body.appendChild(trigger);
    trigger.click();
    trigger.remove();
  });
}

/* ==========================================================================
   OFFLINE LEAD QUEUE SURFACE
   ========================================================================== */

/**
 * If the lead endpoint is unreachable, submissions are held in localStorage so
 * nothing a visitor typed is lost. This paints that state into the conversion
 * bar's status rail, and flushes the queue as soon as we are back online.
 *
 * Being explicit about it — rather than silently dropping the lead — is the
 * difference between a visitor who thinks they requested a test ride and one who
 * knows their request is held on their own device.
 */
function initLeadQueueStatus(): void {
  const rail = document.querySelector<HTMLElement>('[data-lead-status]');
  if (!rail) return;

  const paint = () => {
    const pending = pendingLeadCount();
    rail.hidden = pending === 0;
    rail.textContent =
      pending === 1
        ? '1 request held on this device — we will send it when you are back online.'
        : `${pending} requests held on this device — we will send them when you are back online.`;
  };

  paint();

  window.addEventListener('online', () => {
    flushQueue();
    paint();
  });

  // Also expose a manual paint so a controller can refresh it after submitting.
  document.addEventListener('kg:lead-queued', paint);
}

/* ==========================================================================
   BOOTSTRAP
   ========================================================================== */

function boot(): void {
  /* ------------------------------------------------------- analytics first */
  guard('analytics', () => {
    initScrollDepth();
    initSectionViews();
    initTrackingDelegation();
    initLeadBridge();
  });

  /* ------------------------------------------------------ chrome + motion */
  guard('nav', initNav);
  guard('motion', initMotion);

  /* -------------------------------------------------- section controllers */
  guard('explorer', initExplorer);
  guard('finder', initFinder);
  guard('tech', initTech);
  guard('india', initIndia);
  guard('legacy', initLegacy);
  guard('stories', initStories);
  guard('dealer', initDealer);
  guard('price', initPrice);
  guard('finance', initFinance);
  guard('sticky', initSticky);

  /* --------------------------------------------------------- housekeeping */
  guard('lead-queue', initLeadQueueStatus);

  // Flush anything queued offline on load, in case the visitor is back online.
  guard('flush', () => flushQueue());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
