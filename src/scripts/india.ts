/**
 * india.ts — "Built for the way India moves" region controller.
 *
 * Two parallel affordances drive one panel:
 *   • the map shapes (pointer affordance, decorative to AT — they live inside a
 *     single labelled <svg role="group">)
 *   • the region tablist (the accessible path, with roving tabindex + arrow keys)
 *
 * Both must stay in sync. Whichever one the visitor uses, the other reflects it.
 *
 * The badge label reports the *published national* dealer figure, never a
 * per-state split — those are not published, and inventing them would be exactly
 * the kind of fake specificity this build is designed to avoid.
 */

import { track } from '../lib/analytics';

interface IndiaData {
  regions: { id: string; state: string }[];
  nationalDealerFigure: string;
}

export function initIndia(): void {
  const root = document.querySelector<HTMLElement>('[data-india]');
  const dataEl = document.querySelector<HTMLScriptElement>('[data-india-data]');
  if (!root) return;

  let data: IndiaData = { regions: [], nationalDealerFigure: '550+ dealers pan India' };
  try {
    if (dataEl) data = JSON.parse(dataEl.textContent ?? '{}') as IndiaData;
  } catch {
    /* keep the defaults — the map still works, the badge stays honest */
  }

  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-india-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-india-panel]'));
  const paths = Array.from(root.querySelectorAll<SVGPathElement>('[data-region-path]'));
  const nodes = Array.from(root.querySelectorAll<SVGCircleElement>('[data-region-node]'));
  const door = root.querySelector<HTMLElement>('.kg-drawer__close');
  const badge = root.querySelector<HTMLElement>('[data-india-badge-label]');
  if (!tabs.length || !panels.length) return;

  let seen = false;

  function select(id: string, focus = false): void {
    tabs.forEach((tab) => {
      const active = tab.dataset.indiaTab === id;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.dataset.indiaPanel === id;
      panel.dataset.active = active ? 'true' : 'false';
      panel.hidden = !active;
    });

    // Map shapes mirror the selection so the map never contradicts the panel.
    [...paths, ...nodes].forEach((shape) => {
      const shapeId = shape.dataset.regionPath ?? shape.dataset.regionNode;
      const active = shapeId === id;
      shape.dataset.active = active ? 'true' : 'false';
      if (shape instanceof SVGPathElement) {
        shape.setAttribute('fill', active ? 'url(#india-active)' : 'url(#india-fill)');
        shape.setAttribute('stroke', active ? '#00C853' : '#4B555C');
        shape.setAttribute('stroke-width', active ? '0.7' : '0.4');
      }
    });

    // Badge reports the region name plus the *national* figure — never a
    // fabricated per-state count.
    const region = data.regions.find((r) => r.id === id);
    if (badge) {
      badge.textContent = region
        ? `${region.state} · ${data.nationalDealerFigure}`
        : data.nationalDealerFigure;
    }

    if (!seen) {
      seen = true;
      track('section_view', { section: 'india', source: 'region-selection' });
    }

    if (focus) tabs.find((t) => t.dataset.indiaTab === id)?.focus();
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.indiaTab;
      if (id) select(id);
    });
  });

  /* Map shapes are clickable but intentionally not focusable — the tablist is
     the keyboard path, and duplicating 9 more tab stops would be hostile. */
  [...paths, ...nodes].forEach((shape) => {
    const id = shape.dataset.regionPath ?? shape.dataset.regionNode;
    if (!id) return;
    shape.addEventListener('click', () => select(id));
    shape.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(id);
      }
    });
  });

  const tablist = root.querySelector<HTMLElement>('.kg-india__tabs');
  tablist?.addEventListener('keydown', (e: KeyboardEvent) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    const current = tabs.findIndex((t) => t.dataset.indiaActive === 'true' || t.getAttribute('aria-selected') === 'true');
    const base = current >= 0 ? current : 0;

    let next = base;
    if (e.key === 'ArrowRight') next = (base + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (base - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;

    const id = tabs[next]?.dataset.indiaTab;
    if (id) select(id, true);
  });

  /* ---------------------------------------------------------- bootstrap */
  const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.indiaTab ?? tabs[0].dataset.indiaTab;
  if (initial) select(initial);

  void door; // reserved for drawer-aware focus handling
}
