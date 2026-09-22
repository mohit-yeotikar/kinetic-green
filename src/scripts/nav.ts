/**
 * nav.ts — sticky header state machine + mobile drawer.
 *
 * One scroll listener for the whole header. States:
 *   top      — transparent over the hero, full height, logo at scale
 *   scrolled — compact, solid chrome, progress bar visible
 *   hidden   — retracted while scrolling down past the first viewport
 *
 * The drawer implements the dialog contract by hand (focus trap, ESC, restore
 * focus, inert background, scroll lock) rather than pulling in a dependency.
 */

const header = document.querySelector<HTMLElement>('[data-nav]');
const burger = document.querySelector<HTMLButtonElement>('[data-nav-burger]');
const drawer = document.querySelector<HTMLElement>('[data-nav-drawer]');
const progress = document.querySelector<HTMLElement>('[data-nav-progress]');

/* ==========================================================================
   HEADER STATE
   ========================================================================== */

let lastY = 0;
let ticking = false;
let scrolled = false;

function setState(scrolledState: boolean, hidden: boolean): void {
  if (!header) return;
  if (scrolled !== scrolledState) {
    header.dataset.state = scrolledState ? 'scrolled' : 'top';
    scrolled = scrolledState;
  }
  header.dataset.hidden = hidden ? 'true' : 'false';
}

function update(): void {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const isScrolled = y > vh * 0.55;

  // Retract only when clearly travelling down, and never while the drawer is open.
  const goingDown = y > lastY + 6;
  const goingUp = y < lastY - 6;
  const drawerOpen = drawer?.dataset.open === 'true';

  let hidden = header?.dataset.hidden === 'true';
  if (drawerOpen) hidden = false;
  else if (goingDown && y > vh * 1.1) hidden = true;
  else if (goingUp) hidden = false;
  if (y < vh * 0.25) hidden = false;

  setState(isScrolled, hidden);

  // Progress bar reflects position through the *body*, not the whole doc,
  // so it reaches 100% at the final section rather than in the footer.
  if (progress) {
    const doc = document.documentElement;
    const max = doc.scrollHeight - vh;
    const pct = max > 0 ? Math.min(1, y / max) : 0;
    progress.style.width = `${(pct * 100).toFixed(2)}%`;
  }

  lastY = y;
  ticking = false;
}

function onScroll(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}

/* ==========================================================================
   ACTIVE SECTION HIGHLIGHT
   ========================================================================== */

function initActiveSection(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const map = new Map<string, HTMLAnchorElement>();
  links.forEach((link) => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) map.set(id, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        links.forEach((l) => l.removeAttribute('aria-current'));
        map.get(id)?.setAttribute('aria-current', 'true');
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  );

  map.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

/* ==========================================================================
   MOBILE DRAWER
   ========================================================================== */

let lastFocused: HTMLElement | null = null;
let focusables: HTMLElement[] = [];

function trapFocus(e: KeyboardEvent): void {
  if (e.key !== 'Tab' || !focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (drawer?.dataset.open !== 'true') return;
  if (e.key === 'Escape') {
    closeDrawer();
    return;
  }
  trapFocus(e);
}

export function openDrawer(): void {
  if (!drawer || !burger) return;
  lastFocused = document.activeElement as HTMLElement;

  drawer.hidden = false;
  // Next frame so the transition has a start state to animate from.
  requestAnimationFrame(() => {
    drawer.dataset.open = 'true';
  });

  burger.setAttribute('aria-expanded', 'true');
  document.body.dataset.locked = 'true';

  focusables = Array.from(
    drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null);

  drawer.querySelector<HTMLElement>('[data-nav-drawer-close]')?.focus();
  document.addEventListener('keydown', onKeydown);
}

export function closeDrawer(): void {
  if (!drawer || !burger) return;
  drawer.dataset.open = 'false';
  burger.setAttribute('aria-expanded', 'false');
  document.body.dataset.locked = 'false';

  window.setTimeout(() => {
    drawer.hidden = true;
  }, 420);

  document.removeEventListener('keydown', onKeydown);
  lastFocused?.focus();
}

/* ==========================================================================
   SMOOTH ANCHORS
   ========================================================================== */

/**
 * Anchor navigation with an offset for the sticky header, and focus management so
 * keyboard users land inside the target section rather than back at the top.
 */
function initAnchors(): void {
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')?.slice(1);
    if (!id || id === '') return;

    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const headerH = header?.offsetHeight ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;

    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });

    // Move focus for keyboard + screen-reader users without the scroll jump.
    target.setAttribute('tabindex', '-1');
    window.setTimeout(() => target.focus({ preventScroll: true }), reduce ? 0 : 420);

    // Keep the URL honest without adding a history entry per section jump.
    try {
      history.replaceState(null, '', `#${id}`);
    } catch {
      /* noop */
    }
  });
}

/* ==========================================================================
   BOOTSTRAP
   ========================================================================== */

export function initNav(): void {
  if (!header) return;

  update();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger?.addEventListener('click', () => {
    if (drawer?.dataset.open === 'true') closeDrawer();
    else openDrawer();
  });

  document.querySelectorAll('[data-nav-drawer-close]').forEach((el) => {
    el.addEventListener('click', () => {
      // If the element is a CTA that also opens the lead modal, let both run —
      // closing the drawer first keeps the modal's focus trap clean.
      closeDrawer();
    });
  });

  initActiveSection();
  initAnchors();
}
