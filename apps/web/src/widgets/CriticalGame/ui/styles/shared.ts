import type { CSSProperties, HTMLAttributes } from 'react';

/**
 * Shared helpers for the CriticalGame plain-React + Tailwind migration.
 *
 * `$token` spacing / font scale mirrors the old Tamagui config
 * (`packages/ui/src/tamagui.config.ts`): space N = N×4px, font N =
 * [12,14,16,18,20,24,28,32,40,48]px. Fractional tokens (`$1.5`) resolve
 * to base × 1.5 like Tamagui's shorthand.
 */

const SPACE_SCALE: Record<string, number> = {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
};

const FONT_SIZE_SCALE: Record<string, number> = {
  '1': 12,
  '2': 14,
  '3': 16,
  '4': 18,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 40,
  '10': 48,
};

const LINE_HEIGHT_SCALE: Record<string, number> = {
  '1': 16,
  '2': 18,
  '3': 20,
  '4': 24,
  '5': 28,
  '6': 30,
  '7': 34,
  '8': 38,
  '9': 46,
  '10': 54,
  '13': 13,
  '48': 48,
};

const PX_RE = /^-?[\d.]+(px|rem|em|%|vh|vw|vmax|vmin)$/;
const NUM_RE = /^-?[\d.]+$/;

function resolveScaled(
  value: number | string | undefined,
  scale: Record<string, number>,
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value === 0 ? '0' : `${value}px`;
  const t = value.trim();
  if (t.startsWith('$')) {
    const raw = t.slice(1);
    if (raw in scale) return `${scale[raw]}px`;
    const m = /^(\d+)\.(\d+)$/.exec(raw);
    if (m && m[1] in scale) return `${scale[m[1]] * Number(`0.${m[2]}`)}px`;
    return undefined;
  }
  if (t === 'auto' || t === '0') return t;
  if (PX_RE.test(t)) return t;
  if (NUM_RE.test(t)) return `${t}px`;
  return undefined;
}

/** Resolve a `$token` / number / px string into a CSS length. */
export function resolveLength(
  value: number | string | undefined,
): string | undefined {
  return resolveScaled(value, SPACE_SCALE);
}

/** Resolve a `$token` font-size (token → px). */
export function resolveFontSize(
  value: number | string | undefined,
): string | undefined {
  return resolveScaled(value, FONT_SIZE_SCALE);
}

/** Resolve a `$token` line-height (token → px). */
export function resolveLineHeight(
  value: number | string | undefined,
): string | undefined {
  return resolveScaled(value, LINE_HEIGHT_SCALE);
}

function resolvePadding(
  value: number | string | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string' && /\s/.test(value)) {
    const parts = value.split(/\s+/);
    if (parts.length === 2) {
      const v = resolveLength(parts[0]);
      const h = resolveLength(parts[1]);
      if (v !== undefined && h !== undefined) return `${v} ${h}`;
    }
  }
  return resolveLength(value);
}

/**
 * Tamagui-style (RN) style props still passed by legacy callers of the
 * migrated styled components. Kept as a plain props bag — unknown keys
 * fall through to the DOM via the HTML attributes spread.
 */
export interface LegacyStyleProps {
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  padding?: number | string;
  paddingVertical?: number | string;
  paddingHorizontal?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  margin?: number | string;
  marginVertical?: number | string;
  marginHorizontal?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  gap?: number | string;
  flex?: number | string;
  flexGrow?: number | string;
  flexShrink?: number | string;
  flexBasis?: number | string;
  alignItems?: string;
  justifyContent?: string;
  flexDirection?: string;
  flexWrap?: string;
  borderRadius?: number | string;
  borderWidth?: number | string;
  borderColor?: string;
  borderStyle?: string;
  backgroundColor?: string;
  opacity?: number | string;
  zIndex?: number | string;
  position?: 'absolute' | 'relative' | 'fixed' | 'sticky' | 'static';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  aspectRatio?: number | string;
  cursor?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textAlign?: string;
  textTransform?: string;
  whiteSpace?: string;
  textOverflow?: string;
  color?: string;
  boxShadow?: string;
  clipPath?: string;
  scale?: number | string;
  rotate?: number | string;
  rotateY?: number | string;
  numberOfLines?: number;
  textShadow?: string;
  shadowColor?: string;
  shadowRadius?: number;
  shadowOpacity?: number;
  elevation?: number;
}

const BOX_SHADOW_RE = /^-?[\d.]+(px|rem|em|%|vh|vw|vmax|vmin)$/;

function lengthOrRaw(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value === 0 ? '0' : `${value}px`;
  const t = value.trim();
  if (BOX_SHADOW_RE.test(t) || NUM_RE.test(t)) return resolveLength(value);
  return t;
}

function shadowFromRn(
  color: string | undefined,
  radius: number | undefined,
  _opacity: number | undefined,
): string | undefined {
  if (!color || radius === undefined) return undefined;
  return `0 ${radius / 2}px ${radius}px ${color}`;
}

/** Convert legacy Tamagui style props into a CSSProperties bag (or undefined). */
export function legacyStylePropsToCss(
  props: LegacyStyleProps,
): CSSProperties | undefined {
  const css: CSSProperties = {};

  const assign = (key: keyof CSSProperties, v: string | number | undefined) => {
    if (v !== undefined) {
      (css as Record<keyof CSSProperties, unknown>)[key] = v;
    }
  };

  assign('width', resolveLength(props.width));
  assign('height', resolveLength(props.height));
  assign('minWidth', resolveLength(props.minWidth));
  assign('maxWidth', resolveLength(props.maxWidth));
  assign('minHeight', resolveLength(props.minHeight));
  assign('maxHeight', resolveLength(props.maxHeight));
  assign('padding', resolvePadding(props.padding));
  if (props.paddingVertical !== undefined) {
    const v = resolveLength(props.paddingVertical);
    if (v !== undefined) {
      css.paddingTop = v;
      css.paddingBottom = v;
    }
  }
  if (props.paddingHorizontal !== undefined) {
    const v = resolveLength(props.paddingHorizontal);
    if (v !== undefined) {
      css.paddingLeft = v;
      css.paddingRight = v;
    }
  }
  assign('paddingTop', resolveLength(props.paddingTop));
  assign('paddingRight', resolveLength(props.paddingRight));
  assign('paddingBottom', resolveLength(props.paddingBottom));
  assign('paddingLeft', resolveLength(props.paddingLeft));
  assign('margin', resolveLength(props.margin));
  if (props.marginVertical !== undefined) {
    const v = resolveLength(props.marginVertical);
    if (v !== undefined) {
      css.marginTop = v;
      css.marginBottom = v;
    }
  }
  if (props.marginHorizontal !== undefined) {
    const v = resolveLength(props.marginHorizontal);
    if (v !== undefined) {
      css.marginLeft = v;
      css.marginRight = v;
    }
  }
  assign('marginTop', resolveLength(props.marginTop));
  assign('marginRight', resolveLength(props.marginRight));
  assign('marginBottom', resolveLength(props.marginBottom));
  assign('marginLeft', resolveLength(props.marginLeft));
  assign('gap', resolveLength(props.gap));
  assign('flex', props.flex);
  assign('flexGrow', props.flexGrow);
  assign('flexShrink', props.flexShrink);
  assign('flexBasis', props.flexBasis);
  assign('alignItems', props.alignItems);
  assign('justifyContent', props.justifyContent);
  assign('flexDirection', props.flexDirection);
  assign('flexWrap', props.flexWrap);
  assign('borderRadius', lengthOrRaw(props.borderRadius));
  assign('borderWidth', props.borderWidth);
  assign('borderColor', props.borderColor);
  assign('borderStyle', props.borderStyle);
  assign('backgroundColor', props.backgroundColor);
  assign('opacity', props.opacity);
  assign('zIndex', props.zIndex);
  assign('position', props.position);
  assign('top', resolveLength(props.top));
  assign('right', resolveLength(props.right));
  assign('bottom', resolveLength(props.bottom));
  assign('left', resolveLength(props.left));
  assign('overflow', props.overflow);
  assign('overflowX', props.overflowX);
  assign('overflowY', props.overflowY);
  assign('aspectRatio', props.aspectRatio);
  assign('cursor', props.cursor);
  assign('fontSize', resolveFontSize(props.fontSize));
  assign('fontWeight', props.fontWeight);
  assign('lineHeight', resolveLineHeight(props.lineHeight));
  assign('letterSpacing', props.letterSpacing);
  assign('textAlign', props.textAlign);
  assign('textTransform', props.textTransform);
  assign('whiteSpace', props.whiteSpace);
  assign('textOverflow', props.textOverflow);
  assign('color', props.color);
  assign('boxShadow', props.boxShadow);
  assign('clipPath', props.clipPath);
  assign('textShadow', props.textShadow);
  if (props.numberOfLines !== undefined) {
    css.display = '-webkit-box';
    css.WebkitLineClamp = props.numberOfLines;
    css.WebkitBoxOrient = 'vertical';
    css.overflow = 'hidden';
  }
  if (props.scale !== undefined) {
    css.transform = `scale(${props.scale})`;
  }
  if (props.rotate !== undefined) {
    css.transform = `rotate(${props.rotate}deg)`;
  }
  if (props.rotateY !== undefined) {
    css.transform = `rotateY(${props.rotateY})`;
  }
  const rnShadow = shadowFromRn(
    props.shadowColor,
    props.shadowRadius,
    props.shadowOpacity,
  );
  if (rnShadow) css.boxShadow = rnShadow;
  if (props.elevation !== undefined) {
    css.boxShadow = `0 ${props.elevation / 2}px ${props.elevation}px rgba(0, 0, 0, 0.3)`;
  }

  const has = Object.values(css).some((v) => v !== undefined);
  return has ? css : undefined;
}

type StyleSplitProps = HTMLAttributes<HTMLDivElement> &
  LegacyStyleProps & { style?: CSSProperties };

/**
 * Destructure the legacy Tamagui style props out of a component's props and
 * return the merged inline style + the remaining DOM props. Unknown keys
 * fall through to the DOM element.
 */
export function splitStyleProps(props: StyleSplitProps): {
  style: CSSProperties | undefined;
  domProps: Omit<StyleSplitProps, keyof LegacyStyleProps | 'style'>;
} {
  const {
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    padding,
    paddingVertical,
    paddingHorizontal,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    margin,
    marginVertical,
    marginHorizontal,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    gap,
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignItems,
    justifyContent,
    flexDirection,
    flexWrap,
    borderRadius,
    borderWidth,
    borderColor,
    borderStyle,
    backgroundColor,
    opacity,
    zIndex,
    position,
    top,
    right,
    bottom,
    left,
    overflow,
    overflowX,
    overflowY,
    aspectRatio,
    cursor,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textAlign,
    textTransform,
    whiteSpace,
    textOverflow,
    color,
    boxShadow,
    clipPath,
    scale,
    rotate,
    rotateY,
    numberOfLines,
    textShadow,
    shadowColor,
    shadowRadius,
    shadowOpacity,
    elevation,
    style,
    ...domProps
  } = props;

  const css = legacyStylePropsToCss({
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    padding,
    paddingVertical,
    paddingHorizontal,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    margin,
    marginVertical,
    marginHorizontal,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    gap,
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignItems,
    justifyContent,
    flexDirection,
    flexWrap,
    borderRadius,
    borderWidth,
    borderColor,
    borderStyle,
    backgroundColor,
    opacity,
    zIndex,
    position,
    top,
    right,
    bottom,
    left,
    overflow,
    overflowX,
    overflowY,
    aspectRatio,
    cursor,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textAlign,
    textTransform,
    whiteSpace,
    textOverflow,
    color,
    boxShadow,
    clipPath,
    scale,
    rotate,
    rotateY,
    numberOfLines,
    textShadow,
    shadowColor,
    shadowRadius,
    shadowOpacity,
    elevation,
  });

  return {
    style: css ? { ...css, ...style } : style,
    domProps,
  };
}
