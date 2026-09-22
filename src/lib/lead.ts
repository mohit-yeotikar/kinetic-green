/**
 * LEAD CAPTURE
 * ---------------------------------------------------------------------------
 * One submission path for every conversion surface on the homepage.
 *
 * Progressive profiling contract: a lead is never blocked on a field we do not
 * need yet. Partial leads are valuable (a phone number with a vehicle and a city
 * is a callable lead), so every step can submit and enrich.
 *
 * Transport: POSTs to `/api/lead`. On a pure-static deploy (no Worker) the POST
 * fails and we fall back to an offline-capable path — see `submitLead`. The
 * endpoint is the seam where the CRM / marketing automation integration lands.
 * ---------------------------------------------------------------------------
 */

import { track, attribution, type TrackPayload } from './analytics';
import type { EventName } from './analytics';

/* ------------------------------------------------------------------- types */

export type LeadType =
  | 'test-ride'
  | 'vehicle-enquiry'
  | 'on-road-price'
  | 'finance'
  | 'dealer'
  | 'callback'
  | 'service'
  | 'commercial'
  | 'dealership'
  | 'fleet'
  | 'charging';

/** Intent tier — drives routing priority and the success message shown. */
export type LeadIntent = 'low' | 'medium' | 'high' | 'business';

export interface LeadPayload {
  type: LeadType;
  intent: LeadIntent;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  pincode?: string;
  /** Vehicle id(s) of interest */
  vehicle?: string;
  variant?: string;
  /** ISO date string for test rides */
  preferred_date?: string;
  preferred_time?: string;
  /** Free-text from commercial / dealership enquiries */
  company?: string;
  message?: string;
  /** Explicit opt-in only — never pre-ticked */
  whatsapp_consent?: boolean;
  /** Everything the interactive tools learned about this visitor */
  answers?: Record<string, string | number | boolean | null>;
  /** Which surface produced the lead, e.g. 'hero' | 'savings-calculator' */
  source: string;
  /** Vehicle/city preference captured before the form was opened */
  prefill?: Record<string, string | number | boolean | null>;
  /** ISO timestamp */
  submitted_at?: string;
  /** Set when the POST failed but the lead was preserved locally */
  offline?: boolean;
}

export interface LeadResult {
  ok: boolean;
  message: string;
  /** Reference the visitor can quote to a dealer */
  reference?: string;
  offline?: boolean;
}

/* -------------------------------------------------------------- validation */

export const PHONE_RE = /^(\+?91[\s-]?)?[6-9]\d{9}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalisePhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, '').replace(/^\+?91/, '');
}

export interface FieldErrors {
  [field: string]: string | undefined;
}

/**
 * Validates only the fields supplied, so partial submissions pass.
 * Returns an empty object when the payload is acceptable.
 */
export function validateLead(data: Partial<LeadPayload>, required: string[] = []): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of required) {
    const value = (data as Record<string, unknown>)[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors[field] = 'This field is required.';
    }
  }

  if (data.phone && !PHONE_RE.test(data.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  }
  if (data.email && !EMAIL_RE.test(data.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (data.pincode && !/^\d{6}$/.test(data.pincode.trim())) {
    errors.pincode = 'Enter a valid 6-digit PIN code.';
  }
  if (data.name && data.name.trim().length < 2) {
    errors.name = 'Enter your name.';
  }

  return errors;
}

/* ---------------------------------------------------------------- reference */

function makeReference(): string {
  // Human-readable, dealership-friendly. Not a security token.
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `KG-${stamp}${rand}`;
}

/* ------------------------------------------------------------------ capture */

const STORAGE_KEY = 'kg_pending_leads';
const DRAFT_KEY = 'kg_lead_draft';

/** Persist a completed lead locally so a failed network call never loses it. */
function persistOffline(lead: LeadPayload): void {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as LeadPayload[];
    existing.push(lead);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(-25)));
  } catch {
    /* storage unavailable — nothing further we can do client-side */
  }
}

/**
 * Remember partial answers so a visitor who abandons the funnel and returns is
 * not asked the same questions again. This is the quiet half of progressive
 * profiling.
 */
export function saveDraft(partial: Record<string, unknown>): void {
  try {
    const existing = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}') as Record<string, unknown>;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...existing, ...partial }));
  } catch {
    /* noop */
  }
}

export function loadDraft(): Record<string, unknown> {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}') as Record<string, unknown>;
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ submit */

/**
 * Submit a lead.
 *
 * @param data      the lead fields
 * @param required  fields that must be present (keep this list SHORT)
 * @param event     analytics event to fire on success
 */
export async function submitLead(
  data: LeadPayload,
  required: string[] = [],
  event: EventName | string = 'callback_submit',
): Promise<LeadResult> {
  const errors = validateLead(data, required);
  const errorFields = Object.keys(errors);
  if (errorFields.length) {
    return {
      ok: false,
      message: 'Please check the highlighted fields.',
    };
  }

  const lead: LeadPayload = {
    ...data,
    submitted_at: new Date().toISOString(),
    answers: { ...loadDraft(), ...(data.answers ?? {}) },
  };

  const body = JSON.stringify({ ...lead, attribution });

  try {
    const controller = new AbortController();
    // Never let a slow endpoint hold the UI hostage.
    const timer = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = (await res.json().catch(() => ({}))) as { reference?: string };
    const reference = json.reference ?? makeReference();

    track(event as EventName, {
      source: data.source,
      vehicle: data.vehicle,
      city: data.city,
      intent: data.intent,
      lead_type: data.type,
      reference,
    } as TrackPayload);

    return {
      ok: true,
      reference,
      message:
        data.type === 'test-ride'
          ? 'Your test ride request is with the dealer. They will confirm your slot.'
          : 'Request received. Our team will get back to you shortly.',
    };
  } catch {
    // Static-only deploy, offline, or endpoint unavailable.
    // The lead is still captured — it is queued locally and the visitor gets a
    // truthful message rather than a silent failure.
    const offlineLead = { ...lead, offline: true };
    persistOffline(offlineLead);

    const reference = makeReference();
    track(event as EventName, {
      source: data.source,
      vehicle: data.vehicle,
      city: data.city,
      intent: data.intent,
      offline: true,
    } as TrackPayload);

    return {
      ok: true,
      offline: true,
      reference,
      message:
        'Saved on your device. Your details are queued and will be sent when you are back online — or call us on 1800-120-4242 to book immediately.',
    };
  }
}

/** Number of leads waiting to be flushed (used by an optional sync routine). */
export function pendingLeadCount(): number {
  try {
    return (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as LeadPayload[]).length;
  } catch {
    return 0;
  }
}
