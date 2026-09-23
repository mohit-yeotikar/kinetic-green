import { initStory, initParallax } from './story';
import { initPremiumNav, initReveal, initTilt, initOdometers, initKinetic } from './premium';
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
  guard('story', initStory);
  guard('parallax', initParallax);
  guard('odometers', initOdometers);
  guard('reveal', initReveal);
  guard('tilt', initTilt);
  guard('kinetic', initKinetic);
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
