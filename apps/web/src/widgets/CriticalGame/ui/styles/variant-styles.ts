import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { VariantTheme } from './variants/types';
import { resolveFontSize, resolveLineHeight } from './shared';

/**
 * Build a `VariantTheme`-shaped object from the live CSS-variable theme so
 * the variant config getters (`getVariantStyles(variant).players.getCardBackground(..., theme)`)
 * keep working unchanged. Values are plain strings on `{ val }`.
 */
export function useVariantTheme(): VariantTheme {
  const colors = useThemeColors();
  return useMemo(() => {
    const out: VariantTheme = {};
    for (const [key, value] of Object.entries(colors)) {
      if (value) out[key] = { val: value };
    }
    return out;
  }, [colors]);
}

/**
 * Normalize an RN-style `transform` array (`[{ translateX: -2 }, ...]`)
 * into a CSS transform string.
 */
function normalizeTransform(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const parts: string[] = [];
    for (const item of value) {
      if (typeof item !== 'object' || item === null) continue;
      const entries = Object.entries(item as Record<string, unknown>);
      const [key, v] = entries[0] ?? [];
      if (!key) continue;
      if (key === 'scale') parts.push(`scale(${v})`);
      else if (key === 'rotate') parts.push(`rotate(${v}deg)`);
      else if (key === 'rotateY') parts.push(`rotateY(${v})`);
      else parts.push(`${key}(${typeof v === 'number' ? `${v}px` : v})`);
    }
    return parts.length ? parts.join(' ') : undefined;
  }
  if (typeof value === 'string') return value;
  return undefined;
}

/** Convert one flat style bag (no pseudo/hover keys) into CSSProperties. */
function flatStyleToCss(value: unknown): CSSProperties | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  const css: CSSProperties = {};
  const source = value as Record<string, unknown>;
  for (const [key, v] of Object.entries(source)) {
    if (key === 'before' || key === 'after' || key === 'content') continue;
    if (v === undefined || v === null) continue;
    if (key === 'transform') {
      const normalized = normalizeTransform(v);
      if (normalized) css.transform = normalized;
      continue;
    }
    if (key === 'textShadowColor') {
      const shadow = typeof v === 'string' ? v : '';
      css.textShadow = shadow === 'inherit' ? 'none' : `0 0 8px ${shadow}`;
      continue;
    }
    if (key === 'fontSize') {
      css.fontSize = resolveFontSize(v as number | string);
      continue;
    }
    if (key === 'lineHeight') {
      css.lineHeight = resolveLineHeight(v as number | string);
      continue;
    }
    // The getters return plain CSS values; csstype doesn't index them.
    // Cast is scoped to this single assignment (no `any`).
    (css as Record<string, unknown>)[key] = v;
  }
  return Object.keys(css).length ? css : undefined;
}

export interface ResolvedVariantStyles {
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  pressStyle?: CSSProperties;
  focusStyle?: CSSProperties;
}

/**
 * Split a variant config style bag (`getStyles()`, `getTableStatStyles()`,
 * …) into inline CSS + hover/press/focus groups. Pseudo-element keys
 * (`before` / `after`) and `content` are decorative and don't port to
 * inline styles, so they're dropped.
 */
export function resolveVariantStyles(
  bag: Record<string, unknown> | null | undefined,
): ResolvedVariantStyles {
  if (!bag) return {};
  const out: ResolvedVariantStyles = {};
  out.style = flatStyleToCss(bag);
  if (bag.hoverStyle) out.hoverStyle = flatStyleToCss(bag.hoverStyle);
  if (bag.pressStyle) out.pressStyle = flatStyleToCss(bag.pressStyle);
  if (bag.focusStyle) out.focusStyle = flatStyleToCss(bag.focusStyle);
  return out;
}

type PseudoState = 'none' | 'hover' | 'press' | 'focus';

/**
 * Applies hover/press/focus style bags (dynamic variant colors) through
 * pointer/focus handlers instead of Tailwind `hover:` classes, which can't
 * reference runtime values.
 */
export function usePseudoStyles(
  hover?: CSSProperties,
  press?: CSSProperties,
  focus?: CSSProperties,
): {
  style: CSSProperties | undefined;
  handlers: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
  };
} {
  const [state, setState] = useState<PseudoState>('none');
  const pseudoStyle =
    state === 'hover'
      ? hover
      : state === 'press'
        ? press
        : state === 'focus'
          ? focus
          : undefined;
  return {
    style: pseudoStyle,
    handlers: {
      onMouseEnter: hover ? () => setState('hover') : undefined,
      onMouseLeave: hover || press ? () => setState('none') : undefined,
      onMouseDown: press ? () => setState('press') : undefined,
      onMouseUp: press ? () => setState('none') : undefined,
      onFocus: focus ? () => setState('focus') : undefined,
      onBlur: focus || press ? () => setState('none') : undefined,
    },
  };
}
