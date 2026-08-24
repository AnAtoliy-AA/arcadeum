/**
 * Color-vision accessibility transforms (ARC-896).
 *
 * Pure logic — no DOM, no React. Consumed by:
 * - `useVisionModeSetting()` (persistence + `<html data-vision-mode>` sync)
 * - `createGameThemeContext` (recolors every game theme at resolution time)
 *
 * Dichromacy modes use empirical daltonization matrices applied directly on
 * gamma-encoded sRGB channels: they redistribute the missing cone dimension
 * onto the surviving axes so previously confusable hues separate while grays,
 * black, and white are preserved exactly.
 */

export const VISION_MODES = [
  'none',
  'deuteranopia',
  'protanopia',
  'tritanopia',
  'highContrast',
] as const;

export type VisionMode = (typeof VISION_MODES)[number];

export type DichromacyMode = Exclude<VisionMode, 'none' | 'highContrast'>;

export const DEFAULT_VISION_MODE: VisionMode = 'none';

const DICHROMACY_MODES: readonly DichromacyMode[] = [
  'deuteranopia',
  'protanopia',
  'tritanopia',
];

export function isVisionMode(value: unknown): value is VisionMode {
  return (
    typeof value === 'string' &&
    (VISION_MODES as readonly string[]).includes(value)
  );
}

export function isDichromacyMode(mode: VisionMode): mode is DichromacyMode {
  return DICHROMACY_MODES.includes(mode as DichromacyMode);
}

/** Row-major 3x3 daltonization matrix. */
type Matrix3 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const DALTONIZATION_MATRICES: Record<DichromacyMode, Matrix3> = {
  // Red-green blindness: shift green information into the blue channel.
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  // Red weakness: similar redistribution with a stronger red collapse.
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  // Blue-yellow blindness: shift blue information into green/red.
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
};

type Rgba = { r: number; g: number; b: number; a: number };

function clampChannel(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function applyDaltonization(color: Rgba, matrix: Matrix3): Rgba {
  const { r, g, b, a } = color;
  return {
    r: clampChannel(matrix[0] * r + matrix[1] * g + matrix[2] * b),
    g: clampChannel(matrix[3] * r + matrix[4] * g + matrix[5] * b),
    b: clampChannel(matrix[6] * r + matrix[7] * g + matrix[8] * b),
    a,
  };
}

const HEX_RE =
  /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})/g;
const FUNC_COLOR_RE = /\b(rgba?)\(([^()]*)\)/gi;
const NUMBER_RE = /[\d.]+/g;

function parseHex(match: string): Rgba | null {
  let body = match.slice(1);
  if (body.length === 3 || body.length === 4) {
    body = body
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (body.length !== 6 && body.length !== 8) return null;

  const num = Number.parseInt(body, 16);
  if (Number.isNaN(num)) return null;

  // #RRGGBBAA packs one byte per channel; #RRGGBB leaves no alpha byte.
  const hasAlpha = body.length === 8;
  return {
    r: hasAlpha ? (num >>> 24) & 255 : (num >> 16) & 255,
    g: hasAlpha ? (num >>> 16) & 255 : (num >> 8) & 255,
    b: hasAlpha ? (num >>> 8) & 255 : num & 255,
    a: hasAlpha ? (num & 255) / 255 : 1,
  };
}

function serializeHex({ r, g, b, a }: Rgba): string {
  const channel = (value: number) =>
    clampChannel(value).toString(16).padStart(2, '0');
  const base = `#${channel(r)}${channel(g)}${channel(b)}`;
  return a < 1 ? `${base}${channel(a * 255)}` : base;
}

function parseFuncColor(inner: string): Rgba | null {
  const parts = inner.match(NUMBER_RE);
  if (!parts || parts.length < 3) return null;

  const raw = parts.slice(0, 4).map((part) => Number.parseFloat(part));
  if (raw.some((v) => Number.isNaN(v))) return null;

  const isPercent = inner.includes('%');
  const channel = (v: number) => (isPercent ? v * 2.55 : v);

  return {
    r: channel(raw[0]),
    g: channel(raw[1]),
    b: channel(raw[2]),
    a: raw.length > 3 ? Math.min(1, Math.max(0, raw[3])) : 1,
  };
}

function formatAlpha(a: number): string {
  return String(Number.parseFloat(a.toFixed(3)));
}

/**
 * Transforms every color literal inside an arbitrary CSS value string
 * (hex and rgb()/rgba(), including inside gradients/shadows). Non-color
 * text passes through untouched.
 */
export function transformCssColors(value: string, mode: VisionMode): string {
  if (!isDichromacyMode(mode)) return value;
  const matrix = DALTONIZATION_MATRICES[mode];

  let result = value.replace(HEX_RE, (match) => {
    const parsed = parseHex(match);
    return parsed ? serializeHex(applyDaltonization(parsed, matrix)) : match;
  });

  result = result.replace(FUNC_COLOR_RE, (match, fn: string, inner: string) => {
    const parsed = parseFuncColor(inner);
    if (!parsed) return match;
    const out = applyDaltonization(parsed, matrix);
    const channels = `${clampChannel(out.r)}, ${clampChannel(out.g)}, ${clampChannel(out.b)}`;
    return parsed.a < 1
      ? `rgba(${channels}, ${formatAlpha(parsed.a)})`
      : `${fn.toLowerCase()}(${channels})`;
  });

  return result;
}

const MAX_WALK_DEPTH = 8;

function walkValue(
  value: unknown,
  mode: DichromacyMode,
  depth: number,
): unknown {
  if (typeof value === 'string') {
    return transformCssColors(value, mode);
  }
  if (depth >= MAX_WALK_DEPTH || value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => walkValue(item, mode, depth + 1));
  }
  if (
    Object.getPrototypeOf(value) === Object.prototype ||
    value.constructor === Object
  ) {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = walkValue(item, mode, depth + 1);
    }
    return out;
  }
  return value;
}

/**
 * Returns a deep copy of the game theme with every embedded CSS color
 * recolored for the requested dichromacy mode. `none` and `highContrast`
 * (CSS-only) return the theme untouched.
 */
export function applyVisionModeToGameTheme<T>(theme: T, mode: VisionMode): T {
  if (!isDichromacyMode(mode)) return theme;
  return walkValue(theme, mode, 0) as T;
}
