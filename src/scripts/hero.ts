/**
 * Hero motion controller.
 *
 * One requestAnimationFrame loop, one scroll listener, one pointer listener.
 * Everything it writes is a CSS custom property that only feeds transform or
 * opacity, so the browser never lays out or paints — it composites.
 *
 *  • Pointer tilt/parallax on fine pointers (mouse/trackpad) only.
 *  • Scroll progress (--hero-p) drives the pinned-stage curtain transition.
 *  • The loop sleeps as soon as every value has settled.
 *  • Honours prefers-reduced-motion: nothing here runs at all.
 */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initHero(): void {
  const stage = document.querySelector<HTMLElement>('[data-hero-stage]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!stage || !hero) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  const scene = stage.querySelector<HTMLElement>('[data-hero-scene]');
  const tilt = stage.querySelector<HTMLElement>('[data-hero-tilt]');
  const layers = Array.from(stage.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
    el,
    depth: parseFloat(el.dataset.depth || '1'),
  }));

  // targets + currents
  let tx = 0, ty = 0, cx = 0, cy = 0;       // pointer -1..1
  let tp = 0, cp = 0;                       // scroll progress 0..1
  let running = false;
  let pointerActive = false;

  const finePointer = matchMedia('(pointer: fine)').matches;

  function readScroll(): void {
    const pinHeight = window.innerHeight;
    const travel = Math.max(1, hero!.offsetHeight - pinHeight);
    tp = Math.min(1, Math.max(0, window.scrollY / travel));
    wake();
  }

  function onPointer(e: PointerEvent): void {
    if (!scene) return;
    const r = scene.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    pointerActive = true;
    wake();
  }
  function onLeave(): void { tx = 0; ty = 0; pointerActive = false; wake(); }

  function frame(): void {
    // Faster follow while the pointer is live; softer glide back home.
    const k = pointerActive ? 0.11 : 0.07;
    cx = lerp(cx, tx, k);
    cy = lerp(cy, ty, k);
    cp = lerp(cp, tp, 0.16);

    if (tilt) tilt.style.setProperty('--rx', `${(-cy * 5).toFixed(3)}deg`);
    if (tilt) tilt.style.setProperty('--ry', `${(cx * 7).toFixed(3)}deg`);
    for (const { el, depth } of layers) {
      // Ghost wordmark also drifts with scroll for depth as the curtain rises.
      const sx = depth < 0 ? cp * -120 : 0;
      el.style.setProperty('--tx', `${(cx * 14 * depth + sx).toFixed(2)}px`);
      el.style.setProperty('--ty', `${(cy * 10 * depth).toFixed(2)}px`);
    }
    stage!.style.setProperty('--hero-p', cp.toFixed(4));

    const settled = Math.abs(cx - tx) < 0.001 && Math.abs(cy - ty) < 0.001 && Math.abs(cp - tp) < 0.0005;
    if (settled) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function wake(): void {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll, { passive: true });
  if (finePointer && scene) {
    stage.addEventListener('pointermove', onPointer, { passive: true });
    stage.addEventListener('pointerleave', onLeave, { passive: true });
  }
  reduced.addEventListener('change', () => { if (reduced.matches) location.reload(); });
  readScroll();

  // Count-up on the spec chips after the words have landed. Tiny, one-off.
  const counters = stage.querySelectorAll<HTMLElement>('[data-count]');
  if (counters.length) {
    setTimeout(() => {
      const t0 = performance.now();
      const dur = 900;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        counters.forEach((c) => { c.textContent = String(Math.round(ease(t) * Number(c.dataset.count))); });
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 820);
  }
}
