/**
 * sticky.ts — mobile sticky conversion bar controller (§28).
 *
 * Deliberately reads geometry rather than guessing at scroll offsets, so it
 * behaves correctly on any page length:
 *
 *   reveal   — once the hero has been cleared
 *   retract  — while travelling down (give the screen back to content)
 *   hide     — once the final CTA / footer is in view (stop duplicating it)
 *
 * It also stands down entirely while the lead modal is open, so two conversion
 * surfaces never stack on top of each other.
 *
 * The bar only exists on coarse pointers — on desktop the header CTA is
 * permanently in view and a second persistent button would just be chrome. This
 * checks the same media query as the CSS (which also `display:none`s the bar),
 * so the script and the stylesheet agree on where it belongs.
 */

import { track } from '../lib/analytics';

export function initSticky(): void {
  const bar = document.querySelector<HTMLElement>('[data-sticky-cta]');
  if (!bar) return;

  const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isMobile) return;

  // Reveal the element (it ships hidden so no-JS visitors never see a
  // permanently parked bar with a broken control).
  bar.hidden = false;

  const hero = document.getElementById('top');
  const terminal = document.getElementById('enquire');
  const footer = document.getElementById('footer');

  let lastY = window.scrollY;
  let ticking = false;
  let visible = false;
  let reported = false;

  function setVisible(next: boolean): void {
    if (next === visible) return;
    visible = next;
    bar!.dataset.visible = next ? 'true' : 'false';
  }

  function update(): void {
    const y = window.scrollY;
    const vh = window.innerHeight;

    // The modal owns the screen — stand down completely.
    if (document.body.dataset.locked === 'true') {
      setVisible(false);
      ticking = false;
      return;
    }

    const heroHeight = hero ? hero.offsetHeight : vh;
    const pastHero = y > heroHeight * 0.85;

    // Hide once the closing section has started: its own buttons are already on
    // screen, so a second copy of the same CTA is noise rather than persistence.
    let terminalReached = false;
    for (const el of [terminal, footer]) {
      if (!el) continue;
      if (el.getBoundingClientRect().top < vh * 0.7) {
        terminalReached = true;
        break;
      }
    }

    const travellingDown = y > lastY + 8;
    const travellingUp = y < lastY - 8;

    if (!pastHero || terminalReached) {
      setVisible(false);
    } else if (travellingDown) {
      setVisible(false);
    } else if (travellingUp) {
      setVisible(true);
    }

    // Report the first time the bar actually becomes useful to the visitor.
    if (visible && !reported) {
      reported = true;
      track('section_view', { section: 'sticky-cta', source: 'sticky-cta' });
    }

    lastY = y;
    ticking = false;
  }

  function onScroll(): void {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  // Reveal after a short dwell so a fast flick through the hero does not cause
  // a flash of chrome.
  window.setTimeout(
    () => {
      window.addEventListener('scroll', onScroll, { passive: true });
      update();
    },
    reduce ? 0 : 600,
  );

  window.addEventListener('resize', onScroll, { passive: true });

  // The lead modal sets body[data-locked]; mirror it immediately.
  if ('MutationObserver' in window) {
    new MutationObserver(() => update()).observe(document.body, {
      attributes: true,
      attributeFilter: ['data-locked'],
    });
  }
}
