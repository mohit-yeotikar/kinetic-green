/**
 * ANALYTICS — single event bus for GA4 / GTM / Meta Pixel / Google Ads
 * ---------------------------------------------------------------------------
 * Every CTA and interactive surface calls `track('<event_name>', payload)`.
 * Nothing else in the codebase talks to a third-party SDK directly.
 *
 * Design rules:
 *  - Never throws. A blocked analytics script must not break a conversion path.
 *  - Queues events fired before the dataLayer exists, then flushes.
 *  - UTM + attribution is captured once per session and merged into every event
 *    so downstream lead payloads carry full campaign context automatically.
 * ---------------------------------------------------------------------------
 */

export type EventName =
  // Hero / top of funnel
  | 'hero_test_ride_click'
  | 'hero_explore_click'
  | 'hero_calculator_click'
  | 'nav_test_ride_click'
  | 'nav_menu_open'
  | 'conversion_bar_click'
  // Discovery
  | 'vehicle_view'
  | 'vehicle_category_select'
  | 'vehicle_cta_click'
  | 'product_story_tab_select'
  | 'product_story_scroll'
  // EV finder
  | 'ev_finder_start'
  | 'ev_finder_step'
  | 'ev_finder_complete'
  | 'ev_finder_result_cta'
  // Savings calculator
  | 'savings_calculator_start'
  | 'savings_calculator_input'
  | 'savings_calculator_complete'
  | 'savings_expert_click'
  // Price / finance
  | 'price_check_start'
  | 'price_check_submit'
  | 'finance_calculator'
  | 'finance_submit'
  // Dealer
  | 'dealer_search'
  | 'dealer_result_view'
  | 'dealer_contact'
  | 'dealer_directions'
  // Test ride funnel
  | 'test_ride_start'
  | 'test_ride_step'
  | 'test_ride_complete'
  // Business / partnership
  | 'business_enquiry_start'
  | 'business_enquiry_submit'
  | 'callback_submit'
  // Engagement
  | 'scroll_depth'
  | 'section_view'
  | 'faq_open'
  | 'story_click'
  | 'sticky_cta_click'
  | 'footer_link_click';

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
  page_url?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
}

export interface TrackPayload extends Record<string, unknown> {
  /** Interaction origin, e.g. 'hero' | 'explorer' | 'modal' */
  source?: string;
  vehicle?: string;
  city?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __kgAnalyticsEnabled?: boolean;
  }
}

/* ------------------------------------------------------------------ helpers */

const ANALYTICS_ENABLED =
  typeof document !== 'undefined' &&
  // Honour an explicit consent flag if a cookie banner sets one later.
  // Defaults to on for the demo so the event map can be verified in DevTools.
  document.documentElement.dataset.analytics !== 'off';

const queue: Array<[EventName | string, TrackPayload]> = [];

function deviceType(): Attribution['device'] {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1100) return 'tablet';
  return 'desktop';
}

/** Read campaign attribution from the URL once per session. */
function readAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const stored = sessionStorage.getItem('kg_attribution');
    if (stored) return JSON.parse(stored) as Attribution;

    const attr: Attribution = {
      utm_source: params.get('utm_source') ?? undefined,
      utm_medium: params.get('utm_medium') ?? undefined,
      utm_campaign: params.get('utm_campaign') ?? undefined,
      utm_content: params.get('utm_content') ?? undefined,
      utm_term: params.get('utm_term') ?? undefined,
      gclid: params.get('gclid') ?? undefined,
      fbclid: params.get('fbclid') ?? undefined,
      referrer: document.referrer || undefined,
      landing_page: window.location.pathname + window.location.search,
      page_url: window.location.href,
      device: deviceType(),
    };
    sessionStorage.setItem('kg_attribution', JSON.stringify(attr));
    return attr;
  } catch {
    // Private mode / storage disabled — attribution is a nice-to-have.
    return { page_url: window.location.href, device: deviceType() };
  }
}

export const attribution: Attribution = readAttribution();

/* ---------------------------------------------------------------- transport */

function dispatch(name: string, payload: TrackPayload): void {
  const data = { ...attribution, ...payload, event: name };

  // Google Tag Manager / GA4
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);

  // gtag direct (when GTM is not present)
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', name, data);
    } catch {
      /* noop */
    }
  }

  // Meta Pixel — standard events mapped where a natural equivalent exists
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', name, data);
    } catch {
      /* noop */
    }
  }

  // Dev visibility: the event map is verifiable without a tag manager present.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[kg:event]', name, data);
  }
}

/**
 * Fire an analytics event. Safe to call at any point in the page lifecycle —
 * events fired before the tag manager loads are queued and flushed.
 */
export function track(name: EventName | string, payload: TrackPayload = {}): void {
  if (typeof window === 'undefined') return;
  if (!ANALYTICS_ENABLED) return;

  if (window.__kgAnalyticsEnabled === false) {
    queue.push([name, payload]);
    return;
  }
  dispatch(name, payload);
}

/** Called by the GTM bootstrap once the container has loaded. */
export function flushQueue(): void {
  window.__kgAnalyticsEnabled = true;
  while (queue.length) {
    const next = queue.shift();
    if (next) dispatch(next[0], next[1]);
  }
}

/* ------------------------------------------------------- scroll depth meter */

let scrollDepthTracked = 0;

/**
 * Reports scroll depth at 25/50/75/100% in a single pass.
 * Uses a passive listener and a rAF throttle so it never blocks scrolling.
 */
export function initScrollDepth(): void {
  if (typeof window === 'undefined') return;
  let ticking = false;

  const measure = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const pct = Math.min(100, Math.round((window.scrollY / max) * 100));
    const marks = [25, 50, 75, 100];
    for (const mark of marks) {
      if (pct >= mark && scrollDepthTracked < mark) {
        scrollDepthTracked = mark;
        track('scroll_depth', { depth: mark, percent: pct });
      }
    }
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    },
    { passive: true },
  );
}

/* --------------------------------------------------- section view observer  */

/**
 * Reports which major sections were actually seen. Cheap way to learn where
 * visitors drop out of the DISCOVER → LEAD funnel.
 */
export function initSectionViews(): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const seen = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = (entry.target as HTMLElement).dataset.section;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        track('section_view', { section: id });
        // Section-level listening is one-shot: unobserve once reported.
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.35 },
  );

  document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => observer.observe(el));
}
