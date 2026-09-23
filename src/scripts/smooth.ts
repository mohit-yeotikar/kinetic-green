/**
 * smooth.ts — momentum smooth scrolling (Lenis).
 *
 * Lenis 1.x drives the *real* document scroll (no transform wrapper), so the
 * page's IntersectionObserver reveals, position:sticky header, scrollspy and the
 * mobile-CTA observer all keep working unchanged — it only adds inertia to the
 * wheel. Touch keeps native scrolling (syncTouch:false), which feels better on
 * phones. Entirely skipped under prefers-reduced-motion.
 *
 * Exposes the instance on window.__lenis so nav.ts routes in-page anchor jumps
 * through Lenis (one smoothing engine, no double-smooth fighting native).
 */
import Lenis from 'lenis';

export function initSmooth(): void {
  const reduce =
    document.documentElement.dataset.reduceMotion === 'true' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
  });

  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Freeze momentum while a full-screen surface locks the body (drawer / modal),
  // then resume — otherwise inertia would scroll the page behind the overlay.
  const sync = () => {
    if (document.body.dataset.locked === 'true') lenis.stop();
    else lenis.start();
  };
  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ['data-locked'],
  });
}
