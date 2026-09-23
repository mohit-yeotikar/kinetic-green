import { initHero } from './hero';
import { initPremiumNav, initReveal } from './premium';
import { initExplorer } from './explorer';
import { initDealer } from './dealer';
import { track, initScrollDepth, initSectionViews } from '../lib/analytics';
import './calculator';
import './leadModal';

function guard(name: string, fn: () => void): void {
  try { fn(); } catch (error) { console.error(`[kg] ${name}`, error); }
}
function boot(): void {
  guard('nav', initPremiumNav);
  guard('hero', initHero);
  guard('reveal', initReveal);
  guard('range', initExplorer);
  guard('dealer', initDealer);
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
