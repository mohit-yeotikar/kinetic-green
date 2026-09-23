import { initNav } from './nav';
import { initExplorer } from './explorer';
import { initDealer } from './dealer';
import { initReveal, initCounters } from './motion';
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
  // Scroll-reveal + count-up. Both no-op without their data-attributes and are
  // fully skipped under prefers-reduced-motion (content left visible).
  guard('reveal', initReveal);
  guard('counters', initCounters);
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
