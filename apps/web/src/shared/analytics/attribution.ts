// Campaign attribution capture (roadmap 6C). Records UTM and ?ref= params on
// first touch and last touch so funnel events can be attributed to campaigns
// and invite links (virality K-factor). Storage follows the manual pattern of
// settings-storage.ts: SSR guards, try/catch, validated parsing.

export const ATTRIBUTION_STORAGE_KEY = 'arcadeum_attribution_v1';

const ATTRIBUTION_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
] as const;

type AttributionParamKey = (typeof ATTRIBUTION_PARAM_KEYS)[number];

/** camelCase storage shape per param key, e.g. utm_source -> utmSource */
type AttributableField = Exclude<
  keyof AttributionTouch,
  'landingPage' | 'timestamp'
>;

const STORAGE_FIELDS: Record<AttributionParamKey, AttributableField> = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_term: 'utmTerm',
  utm_content: 'utmContent',
  ref: 'ref',
};

export type AttributionTouch = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  ref?: string;
  landingPage: string;
  timestamp: number;
};

export type AttributionData = {
  firstTouch: AttributionTouch;
  lastTouch: AttributionTouch;
};

function readStringParam(
  params: URLSearchParams,
  key: AttributionParamKey,
): string | undefined {
  const value = params.get(key)?.trim();
  // Truncate defensively: attribution values end up as event payload props.
  return value ? value.slice(0, 256) : undefined;
}

function parseTouch(
  search: string,
  landingPage: string,
): AttributionTouch | null {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(
      search.startsWith('?') ? search.slice(1) : search,
    );
  } catch {
    return null;
  }

  const fields: Partial<Record<AttributableField, string>> = {};
  let hasAny = false;

  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const value = readStringParam(params, key);
    if (!value) continue;
    fields[STORAGE_FIELDS[key]] = value;
    hasAny = true;
  }

  if (!hasAny) return null;

  return {
    landingPage,
    timestamp: Date.now(),
    ...fields,
  };
}

function touchesEqual(a: AttributionTouch, b: AttributionTouch): boolean {
  return (
    a.utmSource === b.utmSource &&
    a.utmMedium === b.utmMedium &&
    a.utmCampaign === b.utmCampaign &&
    a.utmTerm === b.utmTerm &&
    a.utmContent === b.utmContent &&
    a.ref === b.ref
  );
}

function loadStored(): AttributionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const first = (parsed as AttributionData | null)?.firstTouch;
    const last = (parsed as AttributionData | null)?.lastTouch;
    if (
      !first ||
      !last ||
      typeof first !== 'object' ||
      typeof last !== 'object' ||
      typeof first.timestamp !== 'number' ||
      typeof last.timestamp !== 'number'
    ) {
      return null;
    }
    return { firstTouch: first, lastTouch: last };
  } catch {
    return null;
  }
}

function saveStored(data: AttributionData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private mode / quota errors — attribution is best-effort.
  }
}

/**
 * Captures attribution from a query string. First touch is stored once and
 * never overwritten; last touch updates whenever a new attributed visit with
 * different campaign params arrives. Returns true when a change was saved.
 * No recognized params → no-op.
 */
export function captureAttribution(search: string): boolean {
  if (typeof window === 'undefined') return false;

  const landingPage =
    typeof window.location?.pathname === 'string'
      ? window.location.pathname
      : '/';
  const touch = parseTouch(search, landingPage);
  if (!touch) return false;

  const existing = loadStored();
  if (!existing) {
    saveStored({ firstTouch: touch, lastTouch: touch });
    return true;
  }
  if (touchesEqual(existing.lastTouch, touch)) return false;

  saveStored({ firstTouch: existing.firstTouch, lastTouch: touch });
  return true;
}

export function getAttribution(): AttributionData | null {
  return loadStored();
}

/**
 * Compact attribution props for event payloads. Prefers last-touch source,
 * falling back to the ref code, then 'direct'. Keeps payloads small enough to
 * attach to every funnel event.
 */
export function attributionEventProps(): AnalyticsAttributionProps {
  const data = loadStored();
  const source = data?.lastTouch.utmSource ?? data?.lastTouch.ref ?? 'direct';
  return {
    attributionSource: source,
    attributionCampaign: data?.lastTouch.utmCampaign ?? null,
    attributionFirstSource:
      data?.firstTouch.utmSource ?? data?.firstTouch.ref ?? 'direct',
  };
}

export type AnalyticsAttributionProps = {
  attributionSource: string;
  attributionCampaign: string | null;
  attributionFirstSource: string;
};
