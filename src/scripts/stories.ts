/**
 * stories.ts — Kinetic Stories category filter.
 *
 * Progressive enhancement, strictly: with JS off every card is visible in the
 * rail, which is the correct baseline for an editorial section. JS adds
 * filtering only.
 *
 * The filter buttons form a group, not a tablist — they filter a single
 * collection rather than swapping panels — so they use aria-pressed rather than
 * aria-selected. That distinction is the reason this is a role="group" in the
 * markup, and it is worth keeping correct: a tablist here would promise keyboard
 * users arrow-key semantics that filter buttons do not have.
 */

import { track } from '../lib/analytics';

export function initStories(): void {
  const root = document.querySelector<HTMLElement>('[data-stories]');
  if (!root) return;

  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-story-filter]'));
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-story-card]'));
  const empty = root.querySelector<HTMLElement>('[data-stories-empty]');
  if (!buttons.length || !cards.length) return;

  function apply(category: string): void {
    let visible = 0;

    cards.forEach((card) => {
      const match = category === 'All' || card.dataset.storyCard === category;
      card.hidden = !match;
      if (match) visible += 1;
    });

    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.storyFilter === category ? 'true' : 'false');
    });

    // Announce an empty result rather than leaving a blank rail with no
    // explanation. Every category currently has content, but the filter must
    // still behave correctly if that changes.
    if (empty) empty.hidden = visible > 0;
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.storyFilter ?? 'All';
      apply(category);
      track('story_click', { source: 'stories-filter', category });
    });
  });

  /* ---------------------------------------------------------- bootstrap */
  const initial = buttons.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.storyFilter ?? 'All';
  apply(initial);
}
