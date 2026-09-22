/**
 * tech.ts — Technology section controller.
 *
 * Six hotspot buttons over a drawn vehicle driving a single detail panel.
 * The buttons are real <button>s in DOM order positioned over the visual, so
 * keyboard users tab through them in a sensible order without any ARIA
 * re-implementation of a control.
 *
 * A <details> transcript of every explanation is rendered below the stage, so
 * no-JS visitors and crawlers get the full content regardless of this script.
 *
 * The readout label updates to name the selected system — it is a small piece of
 * feedback that makes the section feel like an instrument panel rather than a
 * static diagram.
 */

import { track } from '../lib/analytics';

export function initTech(): void {
  const root = document.querySelector<HTMLElement>('[data-tech]');
  if (!root) return;

  const pins = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tech-hotspot]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-tech-panel]'));
  const readout = root.querySelector<HTMLElement>('[data-tech-readout]');
  if (!pins.length) return;

  let seen = false;

  function select(id: string, focus = false): void {
    pins.forEach((pin) => {
      const active = pin.dataset.techHotspot === id;
      pin.setAttribute('aria-pressed', active ? 'true' : 'false');
      pin.dataset.active = active ? 'true' : 'false';
    });

    panels.forEach((panel) => {
      const active = panel.dataset.techPanel === id;
      panel.dataset.active = active ? 'true' : 'false';
      // Panels are hidden rather than removed so the content stays in the
      // accessibility tree only when active — but remains in the transcript.
      panel.hidden = !active;
    });

    const activePin = pins.find((p) => p.dataset.techHotspot === id);
    const label = activePin?.querySelector<HTMLElement>('.kg-tech__pin-label')?.textContent?.trim();
    if (readout && label) readout.textContent = label;

    if (!seen) {
      seen = true;
      track('section_view', { section: 'technology', source: 'hotspot-interaction' });
    }

    if (focus) activePin?.focus();
  }

  pins.forEach((pin) => {
    pin.addEventListener('click', () => {
      const id = pin.dataset.techHotspot;
      if (id) select(id);
    });
  });

  /* Arrow keys move between hotspots, matching the visual layout order. */
  const list = root.querySelector<HTMLElement>('[data-tech-hotspots]');
  list?.addEventListener('keydown', (e: KeyboardEvent) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    const current = pins.findIndex((p) => p.dataset.active === 'true');
    const base = current >= 0 ? current : 0;

    let next = base;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (base + 1) % pins.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (base - 1 + pins.length) % pins.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = pins.length - 1;

    const id = pins[next]?.dataset.techHotspot;
    if (id) select(id, true);
  });

  /* -------------------------------------------------------- bootstrap */
  const initial = pins.find((p) => p.dataset.active === 'true')?.dataset.techHotspot ?? pins[0].dataset.techHotspot;
  if (initial) select(initial);
}
