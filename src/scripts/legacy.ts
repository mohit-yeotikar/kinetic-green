/**
 * legacy.ts — LegacyTimeline controller.
 *
 * Two jobs:
 *   1. Fill the horizontal progress rail as the timeline travels.
 *   2. Mark each milestone card as in-view so the active era reads as current.
 *
 * The rail itself is a native horizontal scroller. When the shared motion system
 * pins it ([data-hscroll-ready]), scrollLeft is driven by vertical scroll — but
 * this controller never assumes which mode is active: it reads the track's real
 * scrollLeft in both cases and reacts to whatever changed. That means the rail
 * and the progress bar cannot desynchronise, and it still works if the pinning
 * is disabled (touch, small screens, reduced motion).
 *
 * The counters are handled centrally by motion.ts ([data-count]), so this file
 * deliberately does not duplicate that work.
 */

import { track } from '../lib/analytics';

export function initLegacy(): void {
  const root = document.querySelector<HTMLElement>('[data-legacy]');
  if (!root) return;

  const track_ = root.querySelector<HTMLElement>('[data-hscroll-track]');
  const fill = root.querySelector<HTMLElement>('[data-legacy-progress]');
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-milestone]'));
  if (!track_) return;

  let ticking = false;
  let reported = false;

  function update(): void {
    const max = track_!.scrollWidth - track_!.clientWidth;
    const progress = max > 0 ? Math.min(1, Math.max(0, track_!.scrollLeft / max)) : 0;

    if (fill) fill.style.width = `${(progress * 100).toFixed(2)}%`;
    root!.style.setProperty('--legacy-progress', progress.toFixed(4));

    // Mark the card whose centre is closest to the viewport centre of the rail
    // as current. Using proximity rather than intersection avoids two cards
    // flickering as current at the boundary.
    if (items.length) {
      const railRect = track_!.getBoundingClientRect();
      const railCenter = railRect.left + railRect.width / 2;

      let closest = 0;
      let closestDistance = Infinity;
      items.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - railCenter);
        if (d < closestDistance) {
          closestDistance = d;
          closest = i;
        }
      });

      items.forEach((item, i) => {
        item.dataset.current = i === closest ? 'true' : 'false';
      });

      if (!reported && progress > 0.05) {
        reported = true;
        track('section_view', { section: 'legacy', source: 'timeline-interaction' });
      }
    }

    ticking = false;
  }

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  track_.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // The pinned mode sets scrollLeft from a scroll handler, which fires the
  // track's own scroll event. If pinning is off, the rail is dragged by hand
  // and the element scroll event fires directly. Either way this listener runs.
  window.addEventListener('scroll', onScroll, { passive: true });

  update();
}
