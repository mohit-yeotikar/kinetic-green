import { initNav } from './nav';
import { initExplorer } from './explorer';
import { initDealer } from './dealer';
import { initReveal, initCounters, initKineticTransition, initMagnetic, initParallax } from './motion';
import { initSmooth } from './smooth';
import { track, initScrollDepth, initSectionViews } from '../lib/analytics';
import './calculator';
import './leadModal';

// Only ship controllers used by the six-section homepage.
function guard(name: string, fn: () => void): void {
  try { fn(); } catch (error) { console.error(`[kg] ${name}`, error); }
}
function boot(): void {
  guard('nav', initNav);
  guard('range', initExplorer);
  guard('dealer', initDealer);
  // Momentum smooth scroll (skipped under reduced motion / on touch wheel).
  guard('smooth', initSmooth);
  // Scroll-reveal + count-up. Both no-op without their data-attributes and are
  // fully skipped under prefers-reduced-motion (content left visible).
  guard('reveal', initReveal);
  guard('counters', initCounters);
  // Signature diagonal transition, magnetic CTAs, parallax. Each no-ops unless
  // its markup ([data-transition-driver]/[data-magnetic]/[data-parallax]) is on
  // the page — so these only activate on the concept page, not the homepage.
  guard('kinetic', initKineticTransition);
  guard('magnetic', initMagnetic);
  guard('parallax', initParallax);
  guard('analytics', () => {
    initScrollDepth();
    initSectionViews();
    document.addEventListener('click', event => {
      const element = (event.target as HTMLElement).closest<HTMLElement>('[data-track]');
      if (element?.dataset.track) track(element.dataset.track, { source: element.dataset.trackSource ?? element.dataset.leadSource ?? 'homepage' });
    });
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
