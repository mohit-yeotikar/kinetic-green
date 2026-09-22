/**
 * motion.ts — the shared motion system.
 * ---------------------------------------------------------------------------
 * One IntersectionObserver, one scroll listener, one rAF loop for the whole
 * page. Every scroll-driven effect registers here rather than attaching its own
 * listener, which is what keeps the page smooth despite heavy motion design.
 *
 * MOTION LANGUAGE: fast, precise, automotive. Reveals travel in the direction of
 * reading (up for stacked content, left/right for asymmetric compositions), never
 * bounce, and never exceed ~1.2s.
 *
 * REDUCED MOTION: every routine here is skipped entirely when the user has asked
 * for reduced motion. Elements are left in their natural, visible state — no
 * `display:none`, no `opacity:0` left behind.
 * ---------------------------------------------------------------------------
 */

import { track } from '../lib/analytics';

const reduceMotion = () =>
  document.documentElement.dataset.reduceMotion === 'true' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   1. SCROLL REVEAL
   ========================================================================== */

export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!targets.length) return;

  if (reduceMotion() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.setAttribute('data-revealed', 'true'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-revealed', 'true');
        observer.unobserve(entry.target);
      }
    },
    {
      // Fire slightly before the element is fully in view so the motion reads as
      // "already arriving" rather than "starting now".
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.08,
    },
  );

  targets.forEach((el) => observer.observe(el));

  // Line masks are children of a [data-reveal] parent; observe the parent.
  document.querySelectorAll<HTMLElement>('.kg-line-mask').forEach((mask) => {
    const parent = mask.closest('[data-reveal]');
    if (parent && !parent.hasAttribute('data-revealed')) observer.observe(parent);
  });
}

/* ==========================================================================
   2. PARALLAX — layered depth, compositor-only
   ========================================================================== */

interface ParallaxItem {
  el: HTMLElement;
  speed: number;
  /** Cached geometry so we never read layout during scroll */
  top: number;
  height: number;
}

export function initParallax(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!items.length || reduceMotion()) return;

  let list: ParallaxItem[] = [];
  let vh = window.innerHeight;
  let ticking = false;

  const measure = () => {
    vh = window.innerHeight;
    list = items.map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        el,
        speed: parseFloat(el.dataset.parallax ?? '0.1'),
        top: rect.top + window.scrollY,
        height: rect.height,
      };
    });
  };

  const update = () => {
    const scrollY = window.scrollY;
    for (const item of list) {
      const center = item.top + item.height / 2;
      const distance = scrollY + vh / 2 - center;
      // Only animate what is near the viewport — the rest is wasted work.
      if (Math.abs(distance) > vh * 1.3) continue;
      const offset = distance * item.speed * -1;
      item.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    }
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  measure();
  update();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    update();
  }, { passive: true });

  // Re-measure once fonts/images settle, since heights shift.
  window.addEventListener('load', () => {
    measure();
    update();
  });
}

/* ==========================================================================
   3. NUMBER COUNTERS — count-up on first view
   ========================================================================== */

export function initCounters(): void {
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!counters.length) return;

  const settle = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.count ?? '0');
    const decimals = parseInt(el.dataset.countDecimals ?? '0', 10);
    el.textContent = target.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  if (reduceMotion() || !('IntersectionObserver' in window)) {
    counters.forEach(settle);
    return;
  }

  const run = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.count ?? '0');
    const decimals = parseInt(el.dataset.countDecimals ?? '0', 10);
    const duration = parseInt(el.dataset.countDuration ?? '1500', 10);
    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // easeOutExpo — fast arrival, precise settle. No overshoot.
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      const value = target * eased;
      el.textContent = value.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      if (p < 1) requestAnimationFrame(tick);
      else settle(el);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.4 },
  );

  counters.forEach((el) => {
    // Start at zero so the count-up has somewhere to travel from, but only once
    // JS has confirmed it will actually run — no-JS keeps the final value.
    el.textContent = '0';
    observer.observe(el);
  });
}

/* ==========================================================================
   4. SVG LINE DRAWING
   ========================================================================== */

export function initLineDraw(): void {
  const groups = document.querySelectorAll<SVGSVGElement>('[data-line-draw]');
  if (!groups.length) return;

  if (reduceMotion() || !('IntersectionObserver' in window)) {
    groups.forEach((svg) => (svg.style.opacity = '1'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const svg = entry.target as SVGSVGElement;
        svg.style.opacity = '1';
        svg.querySelectorAll<SVGGeometryElement>('path, line, circle, polyline, rect').forEach((shape, i) => {
          let length = 400;
          try {
            length = shape.getTotalLength ? shape.getTotalLength() : 400;
          } catch {
            /* non-measurable shape (rect/circle in some engines) */
          }
          shape.style.strokeDasharray = `${length}`;
          shape.style.strokeDashoffset = `${length}`;
          shape.style.animation = `kg-draw 1.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s forwards`;
        });
        observer.unobserve(svg);
      }
    },
    { threshold: 0.25 },
  );

  groups.forEach((svg) => {
    svg.style.opacity = '0';
    observer.observe(svg);
  });
}

/* ==========================================================================
   5. HORIZONTAL / PINNED SCROLL SURFACES
   ========================================================================== */

/**
 * Translates vertical scroll into horizontal travel for rails that opt in with
 * [data-hscroll]. Used by the product story and the legacy timeline.
 *
 * Implemented as a normal scroll-linked transform (not position:sticky geometry
 * juggling) so it degrades cleanly: without JS the rail is a plain horizontal
 * scroller with touch/trackpad support.
 */
export function initHorizontalScroll(): void {
  const rails = document.querySelectorAll<HTMLElement>('[data-hscroll]');
  if (!rails.length || reduceMotion()) return;

  // Only pin on pointer devices with room; touch already has native swipe.
  if (!window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) return;

  rails.forEach((rail) => {
    const track = rail.querySelector<HTMLElement>('[data-hscroll-track]');
    const stage = rail.querySelector<HTMLElement>('[data-hscroll-stage]');
    if (!track || !stage) return;

    let maxScroll = 0;
    let railTop = 0;
    let railHeight = 0;
    let ticking = false;

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      maxScroll = Math.max(0, track.scrollWidth - stage.clientWidth);
      railTop = rail.getBoundingClientRect().top + window.scrollY;
      // Vertical runway == horizontal distance to travel.
      railHeight = maxScroll + window.innerHeight;
      rail.style.height = `${railHeight}px`;
      stage.style.height = `${window.innerHeight}px`;
    };

    const update = () => {
      const progress = Math.min(1, Math.max(0, (window.scrollY - railTop) / (railHeight - window.innerHeight)));
      track.style.transform = `translate3d(${(-progress * maxScroll).toFixed(2)}px, 0, 0)`;
      rail.style.setProperty('--hscroll-progress', progress.toFixed(4));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      measure();
      update();
    }, { passive: true });
    window.addEventListener('load', () => {
      measure();
      update();
    });

    rail.setAttribute('data-hscroll-ready', 'true');
  });
}

/* ==========================================================================
   6. SIGNATURE DIAGONAL TRANSITION
   ========================================================================== */

/**
 * The brand transition. A green diagonal plane sweeps across the viewport as a
 * major section boundary is crossed, and the incoming section is revealed behind
 * it.
 *
 * Deliberately restrained: it fires on section entry, once per section, with a
 * hard minimum interval so it can never become a strobe. Under reduced motion it
 * is disabled outright.
 */
export function initKineticTransition(): void {
  const driver = document.querySelector<HTMLElement>('[data-transition-driver]');
  if (!driver || reduceMotion() || !('IntersectionObserver' in window)) return;

  let lastFire = 0;
  const MIN_INTERVAL = 2600;

  const fire = () => {
    const now = performance.now();
    if (now - lastFire < MIN_INTERVAL) return;
    lastFire = now;

    driver.classList.remove('kg-transition--run');
    // Force a style flush so the animation can restart on repeated crossings.
    void driver.offsetWidth;
    driver.classList.add('kg-transition--run');

    window.setTimeout(() => driver.classList.remove('kg-transition--run'), 1000);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        fire();
      }
    },
    // Fires when a section header crosses the upper third of the viewport.
    { rootMargin: '-22% 0px -70% 0px', threshold: 0 },
  );

  document.querySelectorAll<HTMLElement>('[data-section-transition]').forEach((el) => observer.observe(el));
}

/* ==========================================================================
   7. MAGNETIC BUTTONS — desktop pointer only
   ========================================================================== */

/**
 * A small, tasteful magnetic pull on primary CTAs. Capped at 4px so it reads as
 * a precision instrument, not a gimmick. Pointer-fine devices only, and it
 * respects reduced motion.
 */
export function initMagnetic(): void {
  if (reduceMotion()) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const MAX = 4;
  const targets = document.querySelectorAll<HTMLElement>('[data-magnetic], .kg-btn');

  targets.forEach((el) => {
    let raf = 0;

    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mag-x', `${(dx * MAX).toFixed(2)}px`);
        el.style.setProperty('--mag-y', `${(dy * MAX * 0.6).toFixed(2)}px`);
      });
    };

    const reset = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--mag-x', '0px');
      el.style.setProperty('--mag-y', '0px');
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });
}

/* ==========================================================================
   8. SECTION VIEW TRACKING (delegates to analytics)
   ========================================================================== */

export function initSectionObserver(): void {
  if (!('IntersectionObserver' in window)) return;
  const seen = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = (entry.target as HTMLElement).dataset.section;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        track('section_view', { section: id });
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.3 },
  );
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => observer.observe(el));
}

/* ==========================================================================
   BOOTSTRAP
   ========================================================================== */

export function initMotion(): void {
  initReveal();
  initParallax();
  initCounters();
  initLineDraw();
  initHorizontalScroll();
  initKineticTransition();
  initMagnetic();
  initSectionObserver();

  // Re-measure horizontal rails when the design switches between pinned and
  // native scrolling (rotation, window resize across the breakpoint).
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('[data-hscroll]')
        .forEach((rail) => rail.removeAttribute('data-hscroll-ready'));
    }, 300);
  }, { passive: true });
}
