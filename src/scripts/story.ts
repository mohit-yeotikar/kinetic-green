/**
 * Story controller: one pinned stage, one scroll listener, one rAF loop.
 *
 *  scroll → progress (0..1 over the pinned travel) → step (0 = hero, 1..n)
 *  step → target transform for the product (zoom into a focus point) and
 *  class toggles for the hero block, chapter cards, markers and dots.
 *
 * The loop lerps scale/translate and writes ONE transform on the product
 * (compositor only), then sleeps when settled. Nothing here runs under
 * prefers-reduced-motion or below the tablet breakpoint, where the CSS
 * unpins the section and stacks the chapters.
 */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initStory(): void {
  const root = document.querySelector<HTMLElement>('[data-story]');
  if (!root) return;

  // Colour preview works everywhere, including reduced motion.
  const picker = root.querySelector<HTMLElement>('[data-paint-picker]');
  const nameOut = root.querySelector<HTMLElement>('[data-paint-name]');
  picker?.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    if (!input.matches('[data-paint-input]')) return;
    root.dataset.paint = input.value;
    const label = input.closest('label')?.getAttribute('title');
    if (nameOut && label) nameOut.textContent = label;
  });

  const motionOK = !matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(min-width: 1024px)').matches;
  if (!motionOK) return;

  const stage = root.querySelector<HTMLElement>('[data-story-stage]')!;
  const product = root.querySelector<HTMLElement>('[data-story-product]')!;
  const img = root.querySelector<HTMLImageElement>('[data-story-img]')!;
  const hero = root.querySelector<HTMLElement>('[data-story-hero]')!;
  const ghost = root.querySelector<HTMLElement>('[data-story-ghost]');
  const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
  const markers = Array.from(root.querySelectorAll<HTMLElement>('[data-marker]'));
  const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-dot]'));
  const cue = root.querySelector<HTMLElement>('[data-story-cue]');
  const steps = chapters.length + 1;

  // Geometry of the product at rest (scale 1), refreshed on resize.
  let rect = { x: 0, y: 0, w: 1, h: 1 };
  let stageBox = { w: 1, h: 1 };
  function measure(): void {
    product.style.transform = 'none';
    const r = img.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    rect = { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
    stageBox = { w: s.width, h: s.height };
    product.style.transform = current();
  }

  // Targets
  let step = 0;
  let tScale = 1, tX = 0, tY = 0;
  let cScale = 1, cX = 0, cY = 0;
  let tGhost = 0, cGhost = 0;
  let running = false;

  function setTargets(): void {
    if (step === 0) { tScale = 1; tX = 0; tY = 0; return; }
    const ch = chapters[step - 1];
    const fx = Number(ch.dataset.x) / 100, fy = Number(ch.dataset.y) / 100, z = Number(ch.dataset.zoom);
    // Point on the image we want at the stage's focal spot (right-of-centre so the chapter card has room).
    const focalX = stageBox.w * 0.68, focalY = stageBox.h * 0.5;
    const px = rect.x + rect.w * fx, py = rect.y + rect.h * fy;
    tScale = z;
    // transform-origin is the image's top-left; translate so the focus lands on the focal spot.
    tX = focalX - (rect.x + (px - rect.x) * z);
    tY = focalY - (rect.y + (py - rect.y) * z);
  }
  const current = () => `translate3d(${cX.toFixed(2)}px, ${cY.toFixed(2)}px, 0) scale(${cScale.toFixed(4)})`;

  function applyStep(next: number): void {
    if (next === step) return;
    step = next;
    root.dataset.step = String(step);
    hero.classList.toggle('is-out', step > 0);
    chapters.forEach((c, i) => c.classList.toggle('is-active', i + 1 === step));
    markers.forEach((m, i) => m.classList.toggle('is-active', i + 1 === step));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === step));
    if (cue) cue.textContent = step === 0 ? 'Scroll the story' : step < steps - 1 ? 'Keep going' : 'The range';
    setTargets();
    wake();
  }

  function readScroll(): void {
    const pin = window.innerHeight;
    const travel = Math.max(1, root.offsetHeight - pin * 2); // last 100svh is the curtain
    const p = Math.min(1, Math.max(0, window.scrollY / travel));
    tGhost = p;
    // Hero holds for the first 12% so the entrance lands; then even steps.
    const s = p < 0.12 ? 0 : Math.min(steps - 1, 1 + Math.floor(((p - 0.12) / 0.88) * (steps - 1)));
    applyStep(s);
    wake();
  }

  function frame(): void {
    const k = 0.085;
    cScale = lerp(cScale, tScale, k); cX = lerp(cX, tX, k); cY = lerp(cY, tY, k); cGhost = lerp(cGhost, tGhost, 0.12);
    product.style.transform = current();
    if (ghost) ghost.style.transform = `translate3d(${(-cGhost * 30).toFixed(2)}vw, 0, 0)`;
    const settled = Math.abs(cScale - tScale) < 0.0005 && Math.abs(cX - tX) < 0.05 && Math.abs(cY - tY) < 0.05 && Math.abs(cGhost - tGhost) < 0.001;
    if (settled) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function wake(): void { if (!running) { running = true; requestAnimationFrame(frame); } }

  const onResize = () => { measure(); setTargets(); wake(); };
  if (img.complete) measure(); else img.addEventListener('load', measure, { once: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll();
}

/** Cheap background parallax for [data-parallax] media: transform only, one listener. */
export function initParallax(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!items.length) return;
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const f = Number(el.dataset.parallax || 0.1);
      const offset = ((r.top + r.height / 2) - vh / 2) * f;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}
