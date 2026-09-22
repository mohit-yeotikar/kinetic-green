/**
 * interactions.ts — the smaller interactive surfaces, in one module.
 *
 * Bundling these together keeps the page's JS to a handful of requests while each
 * routine stays independent and additive: if one surface is absent from the DOM,
 * its initialiser returns immediately. Every routine is opt-in via a data
 * attribute, so a component can drop its markup in without a code change here.
 *
 * Covered: technology hotspots · India region map · story filtering ·
 * product-story pinned scroll · FAQ accordion telemetry.
 */

import { track } from '../lib/analytics';

/* ==========================================================================
   TECHNOLOGY HOTSPOTS
   ========================================================================== */

export function initTech(): void {
  const root = document.querySelector<HTMLElement>('[data-tech]');
  if (!root) return;

  const pins = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tech-hotspot]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-tech-panel]'));
  const readout = root.querySelector<HTMLElement>('[data-tech-readout]');
  if (!pins.length || !panels.length) return;

  function select(id: string): void {
    pins.forEach((pin) => {
      pin.setAttribute('aria-pressed', pin.dataset.techHotspot === id ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      const active = panel.dataset.techPanel === id;
      panel.hidden = !active;
      panel.dataset.active = active ? 'true' : 'false';
      if (active) {
        // Restart the entrance animation so switching feels responsive.
        panel.style.animation = 'none';
        void panel.offsetWidth;
        panel.style.animation = '';
      }
    });

    const activePin = pins.find((p) => p.dataset.techHotspot === id);
    const label = activePin?.querySelector<HTMLElement>('.kg-tech__pin-label')?.textContent;
    if (readout && label) readout.textContent = label;

    track('section_view', { section: 'technology', system: id, source: 'hotspot' });
  }

  pins.forEach((pin) => {
    pin.addEventListener('click', () => select(pin.dataset.techHotspot ?? ''));
  });

  // Arrow-key navigation between hotspots, as expected of a button group.
  pins.forEach((pin, i) => {
    pin.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = pins[(i + dir + pins.length) % pins.length];
      next.focus();
      next.click();
    });
  });

  select(pins[0].dataset.techHotspot ?? '');
}

/* ==========================================================================
   INDIA REGION MAP
   ========================================================================== */

export function initIndia(): void {
  const root = document.querySelector<HTMLElement>('[data-india]');
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-india-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-india-panel]'));
  const shapes = Array.from(root.querySelectorAll<SVGGElement>('[data-region]'));
  const badge = root.querySelector<HTMLElement>('[data-india-badge-label]');
  if (!tabs.length || !panels.length) return;

  function select(id: string): void {
    tabs.forEach((tab) => {
      const active = tab.dataset.indiaTab === id;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.dataset.indiaPanel === id;
      panel.hidden = !active;
      panel.dataset.active = active ? 'true' : 'false';
    });

    shapes.forEach((shape) => {
      shape.dataset.active = shape.dataset.region === id ? 'true' : 'false';
    });

    const state = tabs.find((t) => t.dataset.indiaTab === id)?.textContent?.trim();
    if (badge && state) badge.textContent = `${state} · 550+ dealers pan India`;

    track('dealer_search', { source: 'india-map', state, region: id });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.indiaTab ?? ''));
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      next.click();
    });
  });

  // The map paths are a pointer affordance onto the same tab list.
  shapes.forEach((shape) => {
    const id = shape.dataset.region;
    if (!id) return;
    const activate = () => {
      select(id);
      root.querySelector<HTMLElement>(`[data-india-panel="${id}"]`)?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    };
    shape.addEventListener('click', activate);
    shape.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault();
        activate();
      }
    });
    // Make the paths focusable and announced as buttons.
    shape.setAttribute('tabindex', '0');
    shape.setAttribute('role', 'button');
    shape.setAttribute('aria-label', `Show mobility context for ${id}`);
  });

  // Only unhide the first panel on load — the rest are toggled by selection.
  const current = tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.indiaTab;
  if (current) select(current);
}

/* ==========================================================================
   STORY FILTERING
   ========================================================================== */

export function initStories(): void {
  const root = document.querySelector<HTMLElement>('[data-stories]');
  if (!root) return;

  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-story-filter]'));
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-story-card]'));
  const empty = root.querySelector<HTMLElement>('[data-stories-empty]');
  if (!buttons.length || !cards.length) return;

  function filter(category: string): void {
    let visible = 0;
    cards.forEach((card) => {
      const match = category === 'All' || card.dataset.storyCard === category;
      card.hidden = !match;
      if (match) visible += 1;
    });

    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.storyFilter === category ? 'true' : 'false');
    });

    if (empty) empty.hidden = visible > 0;

    track('story_click', { source: 'stories-filter', category, results: visible });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => filter(btn.dataset.storyFilter ?? 'All'));
  });
}

/* ==========================================================================
   FAQ — telemetry only (native <details> handles the behaviour)
   ========================================================================== */

export function initFaq(): void {
  const items = document.querySelectorAll<HTMLDetailsElement>('[data-faq-item]');
  items.forEach((item) => {
    // Native details handles open/close; we just record which answers land.
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      const question = item.querySelector('.kg-faq__q span')?.textContent?.trim() ?? '';
      track('faq_open', { source: 'faq', question: question.slice(0, 80) });
    });
  });

  // Keep the accordion to one open answer at a time — it reads as a considered
  // list rather than a wall of expanding text.
  const list = document.querySelector<HTMLElement>('[data-faq-list]');
  list?.addEventListener('toggle', (e) => {
    const target = e.target as HTMLDetailsElement;
    if (!target.open) return;
    items.forEach((other) => {
      if (other !== target) other.open = false;
    });
  }, true);
}

/* ==========================================================================
   PRODUCT STORY — pinned scroll + chapter tracking + tab jumps
   ========================================================================== */

export function initStory(): void {
  const root = document.querySelector<HTMLElement>('[data-story]');
  if (!root) return;

  const track = root.querySelector<HTMLElement>('[data-hscroll-track]');
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-story-tab]'));
  const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
  const progress = root.querySelector<HTMLElement>('[data-story-progress]');
  if (!track || !chapters.length) return;

  const reduced = () =>
    document.documentElement.dataset.reduceMotion === 'true' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------- report the active chapter */
  const seen = new Set<string>();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.chapter;
          if (!id || seen.has(id)) continue;
          seen.add(id);

          tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.storyTab === id ? 'true' : 'false'));
          track('product_story_scroll', { source: 'product-story', chapter: id });
        }
      },
      { threshold: 0.55 },
    );
    chapters.forEach((c) => observer.observe(c));
  }

  /* ------------------------------------------------- tab → chapter jumps */
  function goTo(id: string): void {
    const chapter = chapters.find((c) => c.dataset.chapter === id);
    if (!chapter) return;

    const rail = root.querySelector<HTMLElement>('[data-hscroll]') ?? root;
    const pinned = rail.getAttribute('data-hscroll-ready') === 'true';

    if (pinned && !reduced()) {
      // In pinned mode, travel is vertical: scroll the document to the offset
      // that produces the right horizontal position.
      const targetX = chapter.offsetLeft - track!.offsetLeft;
      const railTop = rail.getBoundingClientRect().top + window.scrollY;
      const maxScroll = Math.max(0, track!.scrollWidth - window.innerWidth);
      const railHeight = maxScroll + window.innerHeight;
      const progress = maxScroll > 0 ? targetX / maxScroll : 0;
      window.scrollTo({
        top: railTop + progress * (railHeight - window.innerHeight),
        behavior: 'smooth',
      });
    } else {
      // Native scroller: scroll the track itself.
      track!.scrollTo({ left: chapter.offsetLeft - track!.offsetLeft, behavior: reduced() ? 'auto' : 'smooth' });
    }

    tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.storyTab === id ? 'true' : 'false'));
    track('product_story_tab_select', { source: 'product-story', chapter: id });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => goTo(tab.dataset.storyTab ?? ''));
  });

  /* ------------------------------------- native scroll → tab + progress sync */
  track.addEventListener(
    'scroll',
    () => {
      if (progress) {
        const max = track!.scrollWidth - track!.clientWidth;
        progress.style.width = max > 0 ? `${((track!.scrollLeft / max) * 100).toFixed(1)}%` : '0%';
      }
    },
    { passive: true },
  );

  // Initial progress
  if (progress) progress.style.width = '0%';
}

/* ==========================================================================
   BOOTSTRAP
   ========================================================================== */

export function initInteractions(): void {
  initTech();
  initIndia();
  initStories();
  initFaq();
  initStory();
}
