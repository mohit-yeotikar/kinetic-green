/**
 * explorer.ts — VehicleExplorer controller.
 *
 * The static HTML ships every category panel AND the full catalogue of every
 * vehicle as real <article> prose. That means:
 *   • with JS off, the whole lineup is readable and indexable
 *   • with JS on, we collapse it to a single stage + switcher
 *
 * JS therefore only ever *hides* things that are already in the DOM. It never
 * constructs content, so a failed script can never cost the visitor information.
 *
 * The model switcher reads its spec values from a JSON island rendered by the
 * component, so the numbers shown when switching models are the same numbers
 * that were server-rendered — one source of truth, no drift.
 */

interface ModelData {
  id: string;
  name: string;
  tagline: string;
  range: string;
  battery: string;
  price: string;
  uses: string[];
}

interface CategoryData {
  id: string;
  models: ModelData[];
}

import { track } from '../lib/analytics';
import { saveDraft } from '../lib/lead';

export function initExplorer(): void {
  const root = document.querySelector<HTMLElement>('[data-explorer]');
  if (!root) return;

  const dataEl = document.querySelector<HTMLScriptElement>('[data-explorer-data]');
  let categories: CategoryData[] = [];
  try {
    categories = dataEl ? (JSON.parse(dataEl.textContent ?? '[]') as CategoryData[]) : [];
  } catch {
    categories = [];
  }

  const rail = root.querySelector<HTMLElement>('[data-explorer-rail]');
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'));
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-category]'));

  if (!rail || !panels.length || !tabs.length) return;

  const defaultId = root.dataset.defaultCategory ?? tabs[0]?.dataset.category ?? '';

  /* ------------------------------------------------------------- category */
  function showCategory(id: string, focus = false): void {
    tabs.forEach((tab) => {
      const active = tab.dataset.category === id;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      // Roving tabindex — only the selected tab is in the tab order, which is
      // the ARIA tablist contract and stops 6 tab stops accumulating.
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.dataset.panel === id;
      panel.dataset.active = active ? 'true' : 'false';
      // Non-active panels are taken out of the a11y tree but stay in the DOM
      // (and in the HTML source) so they remain indexable.
      panel.hidden = !active;
    });

    saveDraft({ category: id });

    if (focus) {
      const tab = tabs.find((t) => t.dataset.category === id);
      tab?.focus();
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.category;
      if (!id) return;
      track('vehicle_category_select', { source: 'vehicle-explorer', category: id });
      showCategory(id);
    });
  });

  /* Arrow-key traversal across the tablist — expected of any role="tablist" */
  rail.addEventListener('keydown', (e: KeyboardEvent) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    const current = tabs.findIndex((t) => t.dataset.category === root.dataset.active);
    const base = current >= 0 ? current : 0;

    let next = base;
    if (e.key === 'ArrowRight') next = (base + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (base - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;

    const id = tabs[next]?.dataset.category;
    if (id) {
      root.dataset.active = id;
      showCategory(id, true);
      track('vehicle_category_select', { source: 'vehicle-explorer-keyboard', category: id });
    }
  });

  /* -------------------------------------------------------- model switcher */
  function showModel(panel: HTMLElement, modelId: string): void {
    const categoryId = panel.dataset.panel ?? '';
    const category = categories.find((c) => c.id === categoryId);
    const model = category?.models.find((m) => m.id === modelId);
    if (!model) return;

    const set = (sel: string, text: string) => {
      const el = panel.querySelector<HTMLElement>(sel);
      if (el) el.textContent = text;
    };

    set('[data-model-name]', model.name);
    set('[data-model-tagline]', model.tagline);
    set('[data-model-range]', model.range);
    set('[data-model-battery]', model.battery);
    set('[data-model-price]', model.price);

    const usesEl = panel.querySelector<HTMLElement>('[data-model-uses]');
    if (usesEl) {
      usesEl.innerHTML = model.uses
        .map(
          (u) =>
            `<li><svg class="kg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4.5 4.5L19 7"/></svg> ${u}</li>`,
        )
        .join('');
    }

    // Every CTA in this panel must carry the model the visitor is now looking
    // at — otherwise "Book Test Ride" would book the wrong vehicle.
    panel.querySelectorAll<HTMLElement>('[data-lead-open]').forEach((btn) => {
      btn.dataset.leadVehicle = model.id;
    });

    const cta = panel.querySelector<HTMLAnchorElement>('[data-model-cta]');
    if (cta) {
      cta.setAttribute('data-track-vehicle', model.id);
      const label = cta.textContent?.replace(/Explore .*/, '') ?? '';
      cta.innerHTML = `Explore ${model.name}<svg class="kg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>${label ? '' : ''}`;
    }

    panel.querySelectorAll<HTMLButtonElement>('[data-model]').forEach((btn) => {
      const active = btn.dataset.model === modelId;
      btn.dataset.active = active ? 'true' : 'false';
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    saveDraft({ vehicle: model.id });
  }

  root.querySelectorAll<HTMLButtonElement>('[data-model]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.closest<HTMLElement>('[data-panel]');
      const modelId = btn.dataset.model;
      if (!panel || !modelId) return;
      track('vehicle_view', {
        source: 'vehicle-explorer',
        vehicle: modelId,
        category: panel.dataset.panel,
      });
      showModel(panel, modelId);
    });
  });

  /* -------------------------------------------------------------- bootstrap */
  root.dataset.active = defaultId;
  showCategory(defaultId);
}
