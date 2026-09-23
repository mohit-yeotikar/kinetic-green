/**
 * Nav behaviour + scroll-linked section reveals for the premium homepage.
 * Reveals use IntersectionObserver (no scroll handler) and toggle one class;
 * the CSS does the rest with transform/opacity. Under reduced motion the
 * elements are simply visible.
 */
export function initPremiumNav(): void {
  const nav = document.querySelector<HTMLElement>('[data-p-nav]');
  if (!nav) return;
  const toggle = nav.querySelector<HTMLButtonElement>('[data-p-nav-toggle]');
  const sheet = nav.querySelector<HTMLElement>('[data-p-nav-sheet]');

  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 8);
    // Hide only when scrolling down past the first screen; reveal on any scroll up.
    const hide = y > window.innerHeight * 0.9 && y > lastY + 4 && !sheet?.classList.contains('is-open');
    nav.classList.toggle('is-hidden', hide);
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  const setOpen = (open: boolean) => {
    if (!toggle || !sheet) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    sheet.classList.toggle('is-open', open);
  };
  toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  sheet?.querySelectorAll('[data-p-nav-close]').forEach((el) => el.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // Active link tracking
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  const sections = links.map((l) => document.querySelector<HTMLElement>(l.getAttribute('href') || '')).filter(Boolean) as HTMLElement[];
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.toggleAttribute('aria-current', l.getAttribute('href') === `#${en.target.id}`));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => io.observe(s));
  }
}

export function initReveal(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}
