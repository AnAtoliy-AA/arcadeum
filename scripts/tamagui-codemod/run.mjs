#!/usr/bin/env node
/**
 * Tamagui → Tailwind codemod (mechanical part only).
 *
 * Converts files that import from 'tamagui' (and the Stack primitives
 * re-exported by '@arcadeum/ui') into plain React elements with Tailwind
 * classes:
 *
 *  - XStack / YStack / Stack / ScrollView / View → <div>
 *  - Text / H1..H6 / Paragraph / SizableText → <span>
 *  - style props ($token values, shorthands, hoverStyle/pressStyle groups,
 *    $sm/$xs media groups) → Tailwind classes
 *  - onPress → onClick
 *  - useMedia / useTheme → new hooks (import + identifier rename)
 *  - <TamaguiProvider> wrappers (tests) → unwrapped
 *
 * `styled()` definitions and non-primitive tamagui components (Switch,
 * Checkbox, Dialog, Slider, ...) are NOT converted — they are reported for
 * the manual hand-refactor pass, and their imports are kept.
 *
 * Usage:
 *   node scripts/tamagui-codemod/run.mjs <file-or-dir> [--dry-run]
 */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');
const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/tamagui-codemod/run.mjs <file-or-dir> [--dry-run]');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Token dictionary (the migration contract)
// ---------------------------------------------------------------------------

/** Themed keys minted as CSS vars by ThemeContext (from themeDefinitions). */
const THEMED_KEYS = new Set([
  'background','backgroundHover','backgroundPress','backgroundFocus','backgroundColor',
  'color','colorHover','colorPress','colorFocus','borderColor','borderColorHover',
  'borderColorPress','borderColorFocus','shadowColor','overlayBg','primary','primaryText',
  'secondary','danger','error','errorText','errorBg','errorBgSoft','errorBorder',
  'success','warning','info','accent','mythicAccent','diamondAccent','platinumAccent',
  'goldAccent','silverAccent','bronzeAccent','neutral','gridLine','backgroundTransparent',
  'glassBg','glassBgHover','glassBorder','glassBorderHover','primaryGradientStart',
  'primaryGradientEnd','secondaryGradientStart','secondaryGradientEnd','dangerGradientStart',
  'dangerGradientEnd','infoText','secondaryText','textSecondary','dangerText','successText',
  'warningText','victoryText','victoryGradientStart','victoryGradientEnd',
  'backgroundRadialStart','backgroundRadialEnd','foreground','muted-foreground',
  'card-background','card-border','surface-background','primary-gradient-start',
]);

/** Static tokens (from tamagui.config.ts tokens.color) → literal value. */
const STATIC_COLORS = {
  white: '#f5f7ff', black: '#000000', transparent: 'transparent',
  cyberpunkBg: '#0f0518', cyberpunkPrimary: '#06b6d4', cyberpunkAccent: '#c026d3',
  underwaterBg: '#040b15', underwaterPrimary: '#22d3ee', underwaterAccent: '#0ea5e9',
  crimeBg: '#18181b', crimePrimary: '#dc2626', crimeAccent: '#991b1b',
  horrorBg: '#020617', horrorPrimary: '#10b981', horrorAccent: '#065f46',
  adventureBg: '#451a03', adventurePrimary: '#f59e0b', adventureAccent: '#b45309',
  hikeBg: '#020617', hikePrimary: '#38bdf8', hikeSecondary: '#0ea5e9',
  rolePremium: '#fbbf24', roleVip: '#e879f9', roleSupporter: '#f472b6',
  roleDeveloper: '#818cf8', outlineColor: '#32353d', placeholderColor: '#8e9196',
  red10: '#dc2626', red11: '#ef4444', blue10: '#0284c7', blue11: '#3b82f6',
  purple10: '#7c3aed', gray10: '#6b7280', gray11: '#94a3b8', gray12: '#cbd5e1',
  green11: '#10b981', gold: '#FFD700', goldLight: '#ffe866', goldDark: '#ff9500',
  goldHover: '#fff07a', goldPress: '#ffb500',
  successBorder: 'rgba(4, 120, 87, 0.4)', successBgSoft: 'rgba(4, 120, 87, 0.1)',
  warningBorder: 'rgba(146, 64, 14, 0.4)', warningBgSoft: 'rgba(146, 64, 14, 0.1)',
  dangerBorder: 'rgba(185, 28, 28, 0.4)', dangerBgSoft: 'rgba(185, 28, 28, 0.1)',
  infoBorder: 'rgba(37, 99, 235, 0.4)', infoBgSoft: 'rgba(37, 99, 235, 0.1)',
  neutralBorder: 'rgba(142, 145, 150, 0.4)', neutralBgSoft: 'rgba(142, 145, 150, 0.1)',
};

/** resolve a $token reference to a CSS value. */
function tokenToCssValue(token) {
  const raw = String(token);
  if (!raw.startsWith('$')) return raw;
  const name = raw.slice(1);
  if (THEMED_KEYS.has(name)) return `var(--${name})`;
  if (name in STATIC_COLORS) return STATIC_COLORS[name];
  return null; // unknown
}

const SPACE_SCALE = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, true: 4 };
const RADIUS_MAP = { 0: 'rounded-none', 1: 'rounded', 2: 'rounded-lg', true: 'rounded-lg', 3: 'rounded-xl', 4: 'rounded-2xl', 5: 'rounded-3xl', 6: 'rounded-[24px]' };
const ZINDEX_MAP = { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 };

const FONT_SIZE = { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 28, 8: 32, 9: 40, 10: 48, sm: 14, md: 16, lg: 18, xl: 20, true: 16 };
const LINE_HEIGHT = { 1: 16, 2: 18, 3: 20, 4: 24, 5: 28, 6: 30, 7: 34, 8: 38, 9: 46, 10: 54, sm: 18, md: 20, lg: 24, xl: 28, tight: 1.1, relaxed: 24, none: 1, normal: 22, true: 24 };

/** media key → Tailwind variant prefix */
const MEDIA_PREFIX = {
  xs: 'max-[660px]:', sm: 'max-[800px]:', md: 'max-[1150px]:', tablet: 'max-[1023px]:',
  lg: 'max-[1280px]:', xl: 'max-[1420px]:', xxl: 'max-[1600px]:',
  gtXs: 'sm:', gtSm: 'md:', gtTablet: 'lg:', gtMd: 'xl:', gtLg: '2xl:',
  short: '[@media(max-height:480px)]:', tall: '[@media(min-height:820px)]:',
  hoverNone: '[@media(hover:none)]:', pointerCoarse: '[@media(pointer:coarse)]:',
};

const PSEUDO_PREFIX = {
  hoverStyle: 'hover:', pressStyle: 'active:', focusStyle: 'focus:',
  disabledStyle: 'disabled:',
};

// ---------------------------------------------------------------------------
// Value helpers
// ---------------------------------------------------------------------------

function num(v) {
  if (typeof v === 'number') return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function isPercent(v) {
  return typeof v === 'string' && /^-?[\d.]+%$/.test(v);
}

/** Tailwind class for a numeric/percent length. */
function lengthClass(prefix, v) {
  if (v === 0 || v === '0' || v === '0px') return `${prefix}-0`;
  if (v === '100%') return `${prefix}-full`;
  if (isPercent(v)) return `${prefix}-[${v}]`;
  const n = num(v);
  if (n === null) return null;
  return `${prefix}-[${n}px]`;
}

function spaceClass(value) {
  const raw = String(value).replace(/^[$-]/, '');
  const neg = String(value).startsWith('-');
  const scale = raw === 'true' ? 4 : SPACE_SCALE[raw];
  if (scale === undefined) return null;
  const signed = neg ? -scale : scale;
  return signed < 0 ? `-${Math.abs(signed)}` : String(scale);
}

/** spacing utility with sign: space('$3') → 'gap-3', space('-2') → '-mt-2'. */
function spaced(util, value, negative = false) {
  const s = spaceClass(value);
  if (s === null) return null;
  if (negative) {
    const n = Number(s);
    return Number.isNaN(n) ? null : (n < 0 ? util + Math.abs(n) : `-${util}${n}`);
  }
  return s.startsWith('-') ? `-${util}${s.slice(1)}` : util + s;
}

/** Arbitrary Tailwind value: collapse whitespace to underscores (commas are legal). */
function arbitrary(v) {
  return String(v).replace(/\s+/g, '_');
}

function radiusTail(value) {
  const k = String(value).replace(/^\$/, '');
  const cls = RADIUS_MAP[k];
  if (cls) return cls.replace('rounded', '') || '[4px]';
  return `[${String(value)}px]`;
}

function borderRadiusClass(value) {
  const k = String(value).replace(/^\$/, '');
  return RADIUS_MAP[k] ?? `rounded-[${String(value)}px]`;
}

function zIndexValue(value) {
  const k = String(value).replace(/^\$/, '');
  if (k === 'true') return 100;
  return ZINDEX_MAP[k] ?? num(value) ?? 100;
}

function colorValue(value) {
  const css = tokenToCssValue(value);
  if (css) return css;
  return String(value);
}

function flexDirClass(value) {
  const v = String(value);
  if (v === 'row' || v === 'column') return `flex-${v}`;
  if (v === 'row-reverse') return 'flex-row-reverse';
  if (v === 'column-reverse') return 'flex-col-reverse';
  return null;
}

/** RN `flex-start`/`flex-end` → Tailwind `start`/`end`. */
function alignValue(v) {
  const s = String(v);
  if (s === 'flex-start') return 'start';
  if (s === 'flex-end') return 'end';
  return s;
}

function displayClass(value) {
  const v = String(value);
  if (v === 'none') return 'hidden';
  if (v === 'flex') return 'flex';
  if (v === 'block') return 'block';
  if (v === 'inline-block') return 'inline-block';
  if (v === 'inline') return 'inline';
  if (v === 'grid') return 'grid';
  if (v === 'contents') return 'contents';
  return `[display:${v}]`;
}

function whiteSpaceClass(value) {
  const v = String(value);
  if (v === 'nowrap') return 'whitespace-nowrap';
  if (v === 'pre') return 'whitespace-pre';
  if (v === 'pre-wrap') return 'whitespace-pre-wrap';
  if (v === 'pre-line') return 'whitespace-pre-line';
  if (v === 'normal') return 'whitespace-normal';
  return `[white-space:${v}]`;
}

function weightClass(value) {
  const n = String(value).replace(/^\$/, '');
  const map = { 400: 'font-normal', 500: 'font-medium', 600: 'font-semibold', 700: 'font-bold', 800: 'font-extrabold', 900: 'font-black' };
  if (map[n]) return map[n];
  if (n === 'bold') return 'font-bold';
  return `font-[${n}]`;
}

function animationClass(value) {
  const v = String(value).replace(/^\$/, '');
  const d = { fast: 150, quick: 150, medium: 300, slow: 500 }[v] ?? 300;
  return `transition-all duration-${d} ease-out`;
}

function translateClass(value, axis) {
  const n = num(value);
  if (n === null) return null;
  if (n === 0) return `translate-${axis}-0`;
  const HALVES = { 1.5: '0.5', 3: '0.75', 4.5: '1.25', 6: '1.5', 9: '2.25', 10.5: '2.75', 12: '3', 15: '3.75', 18: '4.5', 21: '5.25', 24: '6' };
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return `${sign}translate-${axis}-${HALVES[abs] ?? `[${abs}px]`}`;
}

/** Convert a single style key/value pair into Tailwind classes (or null/undefined if unsupported). */
function mapStyle(prop, value, variantPrefix = '') {
  const p = variantPrefix;
  const kv = (cls) => cls.filter(Boolean).map((c) => p + c).join(' ');
  const s = (v) => (typeof v === 'string' && v.startsWith('$') ? v.slice(1) : v);

  // RN-style array values: [vertical, horizontal]
  if (Array.isArray(value)) {
    switch (prop) {
      case 'padding': case 'p':
        return kv([arraySpacing(value, (v) => spaced('py-', v), (v) => spaced('px-', v))]);
      case 'margin': case 'm':
        return kv([arraySpacing(value, (v) => spaced('my-', v, true), (v) => spaced('mx-', v, true))]);
      default: return null;
    }
  }

  // Tamagui space-separated shorthand: padding: '$2 $3' → [vertical, horizontal]
  if (typeof value === 'string' && /\s/.test(value)) {
    const parts = value.split(/\s+/);
    if (parts.length === 2 && prop === 'padding' || parts.length === 2 && prop === 'p') {
      const v = spaced('py-', parts[0]);
      const h = spaced('px-', parts[1]);
      if (v && h) return kv([`${v} ${h}`]);
    }
    if (parts.length === 2 && prop === 'margin' || parts.length === 2 && prop === 'm') {
      const v = spaced('my-', parts[0], true);
      const h = spaced('mx-', parts[1], true);
      if (v && h) return kv([`${v} ${h}`]);
    }
  }

  switch (prop) {
    case 'padding': case 'p': return kv([spaced('p-', value)]);
    case 'paddingVertical': case 'py': case 'pv': return kv([spaced('py-', value)]);
    case 'paddingHorizontal': case 'px': case 'ph': return kv([spaced('px-', value)]);
    case 'paddingTop': case 'pt': return kv([spaced('pt-', value)]);
    case 'paddingRight': case 'pr': return kv([spaced('pr-', value)]);
    case 'paddingBottom': case 'pb': return kv([spaced('pb-', value)]);
    case 'paddingLeft': case 'pl': return kv([spaced('pl-', value)]);
    case 'margin': case 'm': return kv([spaced('m-', value, true)]);
    case 'marginVertical': case 'my': case 'mv': return kv([spaced('my-', value, true)]);
    case 'marginHorizontal': case 'mx': case 'mh': return kv([spaced('mx-', value, true)]);
    case 'marginTop': case 'mt': return kv([spaced('mt-', value, true)]);
    case 'marginRight': case 'mr': return kv([spaced('mr-', value, true)]);
    case 'marginBottom': case 'mb': return kv([spaced('mb-', value, true)]);
    case 'marginLeft': case 'ml': return kv([spaced('ml-', value, true)]);
    case 'gap': case 'space': return kv([`gap-${spaceClass(value)}`]);
    case 'rowGap': case 'columnGap': return null;
    case 'borderRadius': return kv([borderRadiusClass(value)]);
    case 'borderTopLeftRadius': return kv([`rounded-tl-${radiusTail(value)}`]);
    case 'borderTopRightRadius': return kv([`rounded-tr-${radiusTail(value)}`]);
    case 'borderBottomLeftRadius': return kv([`rounded-bl-${radiusTail(value)}`]);
    case 'borderBottomRightRadius': return kv([`rounded-br-${radiusTail(value)}`]);
    case 'borderWidth': return String(value) === '1' ? kv(['border']) : kv([`border-[${value}px]`]);
    case 'borderTopWidth': return String(value) === '1' ? kv(['border-t']) : kv([`border-t-[${value}px]`]);
    case 'borderRightWidth': return String(value) === '1' ? kv(['border-r']) : kv([`border-r-[${value}px]`]);
    case 'borderBottomWidth': return String(value) === '1' ? kv(['border-b']) : kv([`border-b-[${value}px]`]);
    case 'borderLeftWidth': return String(value) === '1' ? kv(['border-l']) : kv([`border-l-[${value}px]`]);
    case 'borderStyle': return kv([`border-${value}`]);
    case 'borderColor': return kv([`border-[${arbitrary(colorValue(value))}]`]);
    case 'borderTopColor': return kv([`border-t-[${arbitrary(colorValue(value))}]`]);
    case 'borderRightColor': return kv([`border-r-[${arbitrary(colorValue(value))}]`]);
    case 'borderBottomColor': return kv([`border-b-[${arbitrary(colorValue(value))}]`]);
    case 'borderLeftColor': return kv([`border-l-[${arbitrary(colorValue(value))}]`]);
    case 'backgroundColor': case 'bg': case 'background': {
      if (typeof value === 'string' && value.includes('gradient')) {
        return kv([`bg-[${arbitrary(value.replace(/\$(\w+)/g, (m) => colorValue(m)))}]`]);
      }
      return kv([`bg-[${arbitrary(colorValue(value))}]`]);
    }
    case 'color': return kv([`text-[${arbitrary(colorValue(value))}]`]);
    case 'opacity': return kv([`opacity-[${value}]`]);
    case 'zIndex': return kv([`z-[${zIndexValue(value)}]`]);
    case 'display': return kv([displayClass(value)]);
    case 'flex': return String(value) === '1' ? kv(['flex-1']) : kv([`flex-[${value}]`]);
    case 'flexGrow': return String(value) === '1' ? kv(['grow']) : kv([`grow-[${value}]`]);
    case 'flexShrink': return String(value) === '0' ? kv(['shrink-0']) : kv([`shrink-[${value}]`]);
    case 'flexBasis': return kv([`basis-[${typeof value === 'number' ? `${value}px` : value}]`]);
    case 'flexDirection': case 'fd': return kv([flexDirClass(value)]);
    case 'flexWrap': case 'fw': return kv([String(value) === 'wrap' ? 'flex-wrap' : 'flex-nowrap']);
    case 'alignItems': case 'ai': return kv([`items-${alignValue(value)}`]);
    case 'alignContent': case 'ac': return kv([`content-${alignValue(value)}`]);
    case 'alignSelf': case 'as': return kv([`self-${alignValue(value)}`]);
    case 'justifyContent': case 'jc': return kv([`justify-${alignValue(value)}`]);
    case 'position': case 'pos': {
      const v = String(value);
      if (['absolute', 'relative', 'fixed', 'sticky', 'static'].includes(v)) return kv([v]);
      return null;
    }
    case 'top': case 'right': case 'bottom': case 'left':
      return kv([lengthClass(prop, value)]);
    case 'inset': return kv([lengthClass('inset', value)]);
    case 'width': case 'w': return kv([lengthClass('w', value)]);
    case 'height': case 'h': return kv([lengthClass('h', value)]);
    case 'minWidth': case 'minw': return kv([lengthClass('min-w', value)]);
    case 'minHeight': case 'minh': return kv([lengthClass('min-h', value)]);
    case 'maxWidth': case 'maxw': return kv([lengthClass('max-w', value)]);
    case 'maxHeight': case 'maxh': return kv([lengthClass('max-h', value)]);
    case 'overflow': return kv([`overflow-${value}`]);
    case 'overflowX': return kv([`overflow-x-${value}`]);
    case 'overflowY': return kv([`overflow-y-${value}`]);
    case 'cursor': return kv([`cursor-${value}`]);
    case 'userSelect': return kv([`select-${value}`]);
    case 'whiteSpace': return kv([whiteSpaceClass(value)]);
    case 'textAlign': case 'ta': return kv([`text-${value}`]);
    case 'textTransform': return kv([`${value}`]); // uppercase/lowercase/capitalize/none
    case 'textDecorationLine': return String(value) === 'none' ? kv(['no-underline']) : String(value) === 'underline' ? kv(['underline']) : null;
    case 'numberOfLines': return kv([`line-clamp-${value}`]);
    case 'testID': return null; // handled as data-testid rename
    case 'fontSize': {
      const k = s(value);
      const n = FONT_SIZE[k] ?? num(value);
      return n ? kv([`text-[${n}px]`]) : null;
    }
    case 'fontWeight': return kv([weightClass(value)]);
    case 'fontStyle': return String(value) === 'italic' ? kv(['italic']) : String(value) === 'normal' ? kv(['not-italic']) : null;
    case 'fontFamily': return (value === '$body' || value === '$heading' || value === 'inherit') ? '' : null;
    case 'lineHeight': {
      const k = s(value);
      const n = LINE_HEIGHT[k] ?? num(value);
      return n === null ? null : n <= 2 ? kv([`leading-[${n}]`]) : kv([`leading-[${n}px]`]);
    }
    case 'letterSpacing': {
      const n = num(value);
      return n === null ? null : kv([`tracking-[${n}px]`]);
    }
    case 'boxShadow': return kv([`shadow-[${arbitrary(value)}]`]);
    case 'elevation': {
      const v = String(value).replace(/^\$/, '');
      const map = {
        small: 'shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
        medium: 'shadow-[0_6px_14px_rgba(0,0,0,0.3)]',
        large: 'shadow-[0_10px_24px_rgba(0,0,0,0.35)]',
      };
      return kv([map[v] ?? 'shadow-[0_6px_14px_rgba(0,0,0,0.3)]']);
    }
    case 'scale': return kv([`scale-[${value}]`]);
    case 'rotate': return kv([`rotate-[${value}deg]`]);
    case 'translateX': return kv([`translate-x-[${value}px]`]);
    case 'translateY': return kv([`translate-y-[${value}px]`]);
    case 'y': return kv([translateClass(value, 'y')]);
    case 'x': return kv([translateClass(value, 'x')]);
    case 'animation': return kv([animationClass(value)]);
    case 'pointerEvents': return String(value) === 'none' ? kv(['pointer-events-none']) : kv(['pointer-events-auto']);
    case 'aspectRatio': return kv([`aspect-[${value}]`]);
    case 'textShadow': return kv([`[text-shadow:${arbitrary(value)}]`]);
    default: return undefined; // unknown — caller decides
  }
}

function arraySpacing(value, vMap, hMap) {
  if (value.length !== 2) return null;
  const v = vMap(value[0]);
  const h = hMap(value[1]);
  if (!v || !h) return null;
  return `${v} ${h}`;
}

/** Convert a style-object literal into Tailwind classes (media/pseudo keys → prefixes). */
function styleObjectToClasses(objNode, variantPrefix = '') {
  const classes = [];
  if (!objNode || !ts.isObjectLiteralExpression(objNode)) return classes;
  for (const prop of objNode.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : null;
    if (!key) continue;
    const mediaKey = key.startsWith('$') ? key : null;
    if (mediaKey && MEDIA_PREFIX[mediaKey.slice(1)]) {
      classes.push(...styleObjectToClasses(prop.initializer, MEDIA_PREFIX[mediaKey.slice(1)]));
      continue;
    }
    if (PSEUDO_PREFIX[key]) {
      classes.push(...styleObjectToClasses(prop.initializer, PSEUDO_PREFIX[key]));
      continue;
    }
    const value = stringifyValue(prop.initializer);
    const mapped = mapStyle(key, value, variantPrefix);
    if (mapped) classes.push(mapped);
  }
  return classes;
}

function stringifyValue(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) return `-${stringifyValue(node.operand)}`;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isArrayLiteralExpression(node)) {
    const items = node.elements.map(stringifyValue);
    return items.some((i) => i === undefined) ? undefined : items;
  }
  return undefined;
}

/** Unquote a string literal value extracted from source text. */
function unquote(v) {
  if (typeof v !== 'string' || v.length < 2) return v;
  const first = v[0];
  if ((first === '"' || first === "'" || first === '`') && v[v.length - 1] === first) return v.slice(1, -1);
  return v;
}

/** Is the source text a literal the codemod can map (number / % / $-token / color)? */
function isMappableValueText(text) {
  if (text === undefined) return false;
  const t = String(text).trim().replace(/^["'`]+|["'`]+$/g, '');
  if (t === 'true') return true;
  return /^-?\d+(\.\d+)?$/.test(t)
    || /^-?\d+(\.\d+)?%$/.test(t)
    || /^[-$][\w.\-]*$/.test(t)
    || /^#[0-9a-fA-F]{3,8}$/.test(t)
    || /^rgba?\([^)]*\)$/.test(t)
    || /^(linear|radial|repeating-linear|repeating-radial)-gradient\(.*\)$/.test(t)
    || /^[-a-z]+$/.test(t);
}

const PRIMITIVE_TAG = {
  XStack: 'div', YStack: 'div', Stack: 'div', View: 'div', ScrollView: 'div',
  Text: 'span', H1: 'span', H2: 'span', H3: 'span', H4: 'span', H5: 'span', H6: 'span',
  Paragraph: 'span', SizableText: 'span',
};

function primitiveBaseClass(name) {
  switch (name) {
    case 'XStack': return 'box-border flex flex-row items-stretch';
    case 'YStack': return 'box-border flex flex-col items-stretch';
    case 'Stack': return 'box-border flex items-stretch';
    case 'View': return 'box-border';
    case 'ScrollView': return 'box-border overflow-auto';
    case 'H1': return 'box-border text-[40px] font-bold leading-[46px]';
    case 'H2': return 'box-border text-[28px] font-bold leading-[34px]';
    case 'H3': return 'box-border text-[20px] font-bold leading-[28px]';
    case 'H4': return 'box-border text-[16px] font-bold leading-[20px]';
    default: return 'box-border'; // Text, Paragraph, SizableText
  }
}

const DISPLAY_CLASSES = ['hidden', 'block', 'flex', 'grid', 'inline', 'contents', 'inline-block'];

/** Drop base classes that would be overridden by explicit classes in the same string. */
function mergeBaseAndExplicit(baseClasses, explicitClasses) {
  const explicit = explicitClasses.split(/\s+/).filter(Boolean);
  const conflicts = (c) => {
    if (c === 'items-stretch') return explicit.some((e) => e.startsWith('items-'));
    if (c === 'flex-row' || c === 'flex-col') {
      return explicit.some((e) => ['flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse'].includes(e));
    }
    if (c === 'flex-wrap') return explicit.some((e) => ['flex-wrap', 'flex-nowrap'].includes(e));
    if (c === 'overflow-auto') return explicit.some((e) => e.startsWith('overflow-'));
    if (c === 'flex') return explicit.some((e) => DISPLAY_CLASSES.includes(e));
    return false;
  };
  const base = baseClasses.split(' ').filter((c) => c && !conflicts(c));
  return [base.join(' '), explicitClasses.trim()].filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Transformer
// ---------------------------------------------------------------------------

function walk(node, cb) {
  node.forEachChild((child) => {
    cb(child);
    walk(child, cb);
  });
}

function isHeadingName(name) {
  return ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(name);
}

function findClosingElement(openEl, sourceFile) {
  const parent = openEl.parent;
  const tagName = openEl.tagName.getText();
  let depth = 0;
  let seenOpen = false;
  let result = null;
  function collect(node) {
    if (result) return;
    if (ts.isJsxSelfClosingElement(node)) return;
    if (node === openEl) { seenOpen = true; return; }
    if (!seenOpen) return;
    if (ts.isJsxOpeningElement(node)) {
      depth += 1;
    } else if (ts.isJsxClosingElement(node)) {
      if (depth === 0) {
        if (node.tagName.getText() === tagName) { result = node; return; }
      } else {
        depth -= 1;
      }
    }
    node.forEachChild(collect);
  }
  parent.forEachChild(collect);
  return result;
}

function removeStatementReplacement(sourceText, stmt) {
  // include the trailing newline so no blank line is left behind
  let end = stmt.getEnd();
  if (sourceText[end] === '\n') end += 1;
  if (sourceText[end] === '\r') end += 1;
  return { start: stmt.getStart(), end, text: '' };
}

/** RN/Tamagui style prop names that can be kept as inline styles when the value is dynamic. */
const STYLE_PROPS = new Set([
  'padding','p','paddingVertical','paddingHorizontal','paddingTop','paddingRight','paddingBottom','paddingLeft',
  'px','py','pt','pr','pb','pl','margin','m','marginVertical','marginHorizontal','marginTop','marginRight',
  'marginBottom','marginLeft','mx','my','mt','mr','mb','ml','gap','rowGap','columnGap','borderRadius',
  'borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius','borderWidth',
  'borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderStyle','borderColor',
  'borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','backgroundColor','bg','background',
  'color','opacity','zIndex','display','flex','flexGrow','flexShrink','flexBasis','flexDirection','flexWrap',
  'alignItems','alignContent','alignSelf','justifyContent','position','top','right','bottom','left','inset',
  'width','height','minWidth','minHeight','maxWidth','maxHeight','overflow','overflowX','overflowY','cursor',
  'userSelect','whiteSpace','textAlign','textTransform','textDecorationLine','fontSize','fontWeight','fontStyle',
  'fontFamily','lineHeight','letterSpacing','boxShadow','shadowColor','shadowOffset','shadowOpacity',
  'shadowRadius','elevation','transform','scale','rotate','translateX','translateY','y','x','animation',
  'pointerEvents','aspectRatio','transformOrigin','backdropFilter','textShadow','gridColumn','gridRow',
]);

function transformFile(sourceText) {
  const sourceFile = ts.createSourceFile('x.tsx', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const replacements = [];
  const reports = [];
  const lineOf = (pos) => sourceFile.getLineAndCharacterOfPosition(pos).line + 1;

  // --- imports -------------------------------------------------------------
  const importBindings = {}; // localName → { importedName, module, stmt }
  const consumedBindings = new Set();
  const tamaguiImportStatements = new Map(); // stmtStart → stmt (dedupe: one entry per statement)
  const arcadeumComponentBindings = new Set(); // local names of @arcadeum/ui non-Stack components

  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const moduleText = stmt.moduleSpecifier.getText().slice(1, -1);
    const isTamaguiModule = moduleText === 'tamagui' || moduleText.includes('tamagui.config') || moduleText.startsWith('@tamagui/');
    if (!isTamaguiModule && moduleText !== '@arcadeum/ui') continue;
    const clause = stmt.importClause;
    if (clause.name) {
      importBindings[clause.name.text] = { importedName: 'default', module: moduleText, stmt };
      if (isTamaguiModule) {
        tamaguiImportStatements.set(stmt.getStart(), stmt);
        consumedBindings.add(clause.name.text); // config default imports are provider-only
      }
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const el of clause.namedBindings.elements) {
        const local = el.name.text;
        const imported = el.propertyName ? el.propertyName.text : local;
        if (isTamaguiModule) {
          importBindings[local] = { importedName: imported, module: 'tamagui', stmt };
          tamaguiImportStatements.set(stmt.getStart(), stmt);
          if (moduleText.startsWith('@tamagui/') || moduleText.includes('tamagui.config')) {
            consumedBindings.add(local); // config/theme imports are provider-only
          }
        } else if (['XStack', 'YStack', 'ZStack', 'Stack', 'ScrollView', 'ThemeableStack'].includes(imported)) {
          importBindings[local] = { importedName: imported, module: '@arcadeum/ui', stmt };
        } else {
          arcadeumComponentBindings.add(local);
        }
      }
    }
  }

  const nonImportText = sourceText
    .split('\n')
    .filter((l) => !/^\s*import\s/.test(l) && !/^\s*}\s*from/.test(l))
    .join('\n');
  const countRefs = (name) => (nonImportText.match(new RegExp(`\\b${name}\\b`, 'g')) ?? []).length;

  // --- styled() sites — reported for the manual pass -----------------------
  const styledBaseNames = new Set(); // primitives referenced by styled() must keep their imports
  walk(sourceFile, (node) => {
    if (ts.isCallExpression(node) && node.expression.getText() === 'styled') {
      reports.push(`:${lineOf(node.getStart())} styled() — hand-refactor this component to Tailwind classes`);
      const base = node.arguments[0];
      if (base && ts.isIdentifier(base)) styledBaseNames.add(base.text);
    }
  });

  // --- JSX elements --------------------------------------------------------
  const jsxElements = [];
  walk(sourceFile, (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const nameNode = node.tagName;
      const name = nameNode.getText().replace(/^[\w$.]+\./, '');
      const binding = importBindings[nameNode.getText()];
      if (binding || arcadeumComponentBindings.has(nameNode.getText()) || PRIMITIVE_TAG[name] || isHeadingName(name)) {
        jsxElements.push(node);
      }
    }
  });

  for (const el of jsxElements) {
    const nameNode = el.tagName;
    const fullName = nameNode.getText();
    const binding = importBindings[fullName];
    const isHeading = isHeadingName(fullName);
    const baseName = fullName.split('.').pop();
    const isArcadeumComponent = arcadeumComponentBindings.has(fullName);

    if (!binding && !isHeading && !isArcadeumComponent) continue;

    // TamaguiProvider is handled by the dedicated unwrap pass below
    if (fullName === 'TamaguiProvider') continue;

    // @arcadeum/ui components — fold mappable style props into className
    if (isArcadeumComponent) {
      const mappedClasses = [];
      const kept = [];
      let originalClassName = null;
      let onClickExpr = null;
      for (const attr of el.attributes.properties) {
        if (ts.isJsxSpreadAttribute(attr)) { kept.push(attr.getText()); continue; }
        const pName = attr.name.getText();
        const init = attr.initializer;
        const rawValue = init && !ts.isJsxExpression(init)
          ? init.getText()
          : init && ts.isJsxExpression(init) && init.expression
            ? init.expression.getText()
            : undefined;
        if (pName === 'className') { originalClassName = rawValue; continue; }
        if (pName === 'onPress') { onClickExpr = rawValue; continue; }
        if (pName === 'testID') { kept.push(`data-testid={${rawValue}}`); continue; }
        if (pName.startsWith('$')) continue; // media props — not supported on components
        if (isPassthroughProp(pName)) { kept.push(attr.getText()); continue; }
        if (!isMappableValueText(rawValue)) { kept.push(attr.getText()); continue; }
        const m = mapStyle(pName, unquote(rawValue));
        if (m === undefined || m === null) kept.push(attr.getText());
        else if (m) mappedClasses.push(m);
      }
      const attrsOut = [];
      if (mappedClasses.length) {
        const mapped = mappedClasses.join(' ');
        attrsOut.push(originalClassName
          ? `className={${originalClassName} + ' ${mapped}'}`
          : `className="${mapped}"`);
      } else if (originalClassName) {
        attrsOut.push(`className={${originalClassName}}`);
      }
      if (onClickExpr) attrsOut.push(`onClick={${onClickExpr}}`);
      attrsOut.push(...kept);
      const closeSlash = ts.isJsxSelfClosingElement(el) ? ' /' : '';
      replacements.push({
        start: el.getStart(),
        end: el.getEnd(),
        text: `<${fullName}${attrsOut.length ? ' ' + attrsOut.join(' ') : ''}${closeSlash}>`,
      });
      continue;
    }

    // non-primitive tamagui components (Switch, Checkbox, Dialog, ...) are out of scope
    if (binding && !PRIMITIVE_TAG[binding.importedName]) {
      reports.push(`:${lineOf(el.getStart())} tamagui component <${fullName}> kept as-is — migrate manually`);
      continue;
    }

    const tag = PRIMITIVE_TAG[baseName] ?? (binding?.importedName === 'Text' ? 'span' : 'div');
    const baseClasses = binding
      ? primitiveBaseClass(binding.importedName)
      : primitiveBaseClass(baseName);

    let attrClasses = '';
    let classNameValue = '';
    const keptAttrs = [];
    const dynamicStyles = [];
    let existingStyleExpr = null;
    let onClickAttr = null;
    let unresolvedProps = [];

    const attrs = el.attributes.properties;
    for (const attr of attrs) {
      if (ts.isJsxSpreadAttribute(attr)) { keptAttrs.push(attr); continue; }
      const propName = attr.name.getText();
      const init = attr.initializer;

      const rawValue = init && !ts.isJsxExpression(init)
        ? init.getText()
        : init && ts.isJsxExpression(init) && init.expression
          ? init.expression.getText()
          : undefined;

      const mediaPrefix = propName.startsWith('$') ? MEDIA_PREFIX[propName.slice(1)] : MEDIA_PREFIX[propName];
      if (mediaPrefix && ts.isJsxExpression(init) && init.expression && ts.isObjectLiteralExpression(init.expression)) {
        attrClasses += ' ' + styleObjectToClasses(init.expression, mediaPrefix).join(' ');
        continue;
      }
      if (PSEUDO_PREFIX[propName] && ts.isJsxExpression(init) && init.expression && ts.isObjectLiteralExpression(init.expression)) {
        attrClasses += ' ' + styleObjectToClasses(init.expression, PSEUDO_PREFIX[propName]).join(' ');
        continue;
      }
      if (propName === 'className') {
        // unquote literal class strings so they merge cleanly into the new attribute
        const init = attr.initializer;
        const isLiteral = init && !ts.isJsxExpression(init);
        classNameValue = isLiteral ? unquote(rawValue) : (rawValue ?? '');
        continue;
      }
      if (propName === 'onPress') { onClickAttr = rawValue; continue; }
      if (propName === 'testID') {
        keptAttrs.push({ getText: () => `data-testid={${rawValue}}` });
        continue;
      }
      if (propName === 'style') {
        existingStyleExpr = rawValue;
        continue;
      }

      if (isPassthroughProp(propName)) { keptAttrs.push(attr); continue; }

      if (!isMappableValueText(rawValue)) {
        if (STYLE_PROPS.has(propName)) dynamicStyles.push({ name: propName, expr: rawValue });
        else keptAttrs.push(attr);
        unresolvedProps.push(propName);
        continue;
      }
      const mapped = mapStyle(propName, unquote(rawValue));
      if (mapped === undefined || mapped === null) {
        if (STYLE_PROPS.has(propName)) dynamicStyles.push({ name: propName, expr: rawValue });
        else keptAttrs.push(attr);
        unresolvedProps.push(propName);
      } else if (mapped !== '') {
        attrClasses += ' ' + mapped;
      }
    }

    if (unresolvedProps.length) {
      reports.push(`:${lineOf(el.getStart())} <${fullName}> prop(s) ${unresolvedProps.join(', ')} kept as inline style / as-is — verify`);
    }

    if (dynamicStyles.length) {
      const entries = dynamicStyles.map((s) => `${s.name}: ${s.expr}`).join(', ');
      keptAttrs.push({
        getText: () => `style={{ ${entries}${existingStyleExpr ? `, ...(${existingStyleExpr} ?? {})` : ''} }}`,
      });
      existingStyleExpr = null;
    }
    if (existingStyleExpr) {
      keptAttrs.push({ getText: () => `style={${existingStyleExpr}}` });
    }

    const mergedClass = (() => {
      const merged = mergeBaseAndExplicit(baseClasses, attrClasses);
      return classNameValue ? merged + ' ' + classNameValue : merged;
    })();
    const newAttrs = [];
    if (mergedClass) newAttrs.push(`className="${mergedClass}"`);
    if (onClickAttr) newAttrs.push(`onClick={${onClickAttr}}`);
    for (const attr of keptAttrs) newAttrs.push(attr.getText());

    if (ts.isJsxSelfClosingElement(el)) {
      const attrsText = newAttrs.length ? ' ' + newAttrs.join(' ') : '';
      replacements.push({ start: el.getStart(), end: el.getEnd(), text: `<${tag}${attrsText} />` });
    } else {
      const closing = findClosingElement(el, sourceFile);
      if (!closing) {
        reports.push(`:${lineOf(el.getStart())} could not find closing tag for <${fullName}>`);
        continue;
      }
      const attrsText = newAttrs.length ? ' ' + newAttrs.join(' ') : '';
      replacements.push({ start: el.getStart(), end: el.getEnd(), text: `<${tag}${attrsText}>` });
      replacements.push({ start: closing.getStart(), end: closing.getEnd(), text: `</${tag}>` });
    }

    if (binding) consumedBindings.add(fullName);
  }

  // --- TamaguiProvider unwrap (tests) -------------------------------------
  walk(sourceFile, (node) => {
    if (!ts.isJsxOpeningElement(node) || node.tagName.getText() !== 'TamaguiProvider') return;
    const closing = findClosingElement(node, sourceFile);
    if (!closing) {
      reports.push(`:${lineOf(node.getStart())} TamaguiProvider has no closing tag`);
      return;
    }
    // replace the whole element (wrapper + wrapper's own line) with its children
    const elementStart = node.getStart();
    let start = elementStart;
    // include the whitespace-only indentation of the opening tag's line
    const lineStart = sourceText.lastIndexOf('\n', elementStart - 1) + 1;
    if (/^[ \t]*$/.test(sourceText.slice(lineStart, elementStart))) start = lineStart;
    const closingEnd = closing.getEnd();
    let end = closingEnd;
    const after = sourceText.slice(closingEnd, closingEnd + 1);
    if (after === '\n') end += 1;
    const children = sourceText.slice(node.getEnd(), closing.getStart());
    // single `{expr}` child → unwrap to the bare expression (keeps Wrapper components valid)
    const singleExpr = children.trim().match(/^\{([\s\S]*)\}$/);
    const replacementText = singleExpr ? singleExpr[1].trim() : children;
    replacements.push({ start, end, text: replacementText });
    consumedBindings.add('TamaguiProvider');
  });

  // --- createTamagui configs (tests) — report for manual cleanup -----------
  walk(sourceFile, (node) => {
    if (ts.isCallExpression(node) && node.expression.getText() === 'createTamagui') {
      reports.push(`:${lineOf(node.getStart())} createTamagui() config — remove the now-unused config`);
    }
  });

  // --- import rewriting -----------------------------------------------------
  const addImports = [];
  const identifierRenames = []; // {from, to}

  for (const stmt of tamaguiImportStatements.values()) {
    const clause = stmt.importClause;
    const bindings = [];
    if (clause.name) bindings.push(clause.name);
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) bindings.push(...clause.namedBindings.elements);

    const keep = [];
    let hasHandled = false;
    for (const b of bindings) {
      const local = ts.isIdentifier(b) ? b.text : b.name.text;
      const imported = ts.isIdentifier(b) ? 'default' : (b.propertyName ? b.propertyName.text : b.name.text);
      if (imported === 'useMedia') {
        addImports.push(`import { useMediaQuery } from '@/shared/hooks/useMediaQuery';`);
        identifierRenames.push({ from: local, to: 'useMediaQuery' });
        consumedBindings.add(local);
        hasHandled = true;
        continue;
      }
      if (imported === 'useTheme') {
        addImports.push(`import { useThemeColors } from '@/shared/hooks/useThemeColors';`);
        identifierRenames.push({ from: local, to: 'useThemeColors' });
        consumedBindings.add(local);
        hasHandled = true;
        continue;
      }
      if (imported === 'TamaguiProvider' || imported === 'createTamagui') {
        consumedBindings.add(local);
        hasHandled = true;
        continue;
      }
      if (styledBaseNames.has(local)) {
        keep.push(b); // still referenced by styled() — hand-refactor keeps it
        continue;
      }
      if (consumedBindings.has(local)) {
        hasHandled = true;
        continue; // binding converted → drop
      }
      keep.push(b);
    }
    if (keep.length === 0) {
      replacements.push(removeStatementReplacement(sourceText, stmt));
    } else if (hasHandled) {
      replacements.push({
        start: stmt.getStart(),
        end: stmt.getEnd(),
        text: `import { ${keep.map((b) => b.getText()).join(', ')} } from 'tamagui';`,
      });
    }
  }

  // @arcadeum/ui imports — drop consumed Stack bindings
  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause || !stmt.importClause.namedBindings) continue;
    const moduleText = stmt.moduleSpecifier.getText().slice(1, -1);
    if (moduleText !== '@arcadeum/ui') continue;
    if (!ts.isNamedImports(stmt.importClause.namedBindings)) continue;
    const els = stmt.importClause.namedBindings.elements;
    const keep = els.filter((el) => !consumedBindings.has(el.name.text) || styledBaseNames.has(el.name.text));
    if (keep.length !== els.length) {
      if (keep.length === 0) {
        replacements.push(removeStatementReplacement(sourceText, stmt));
      } else {
        replacements.push({
          start: stmt.getStart(),
          end: stmt.getEnd(),
          text: `import { ${keep.map((el) => el.getText()).join(', ')} } from '@arcadeum/ui';`,
        });
      }
    }
  }

  // Append new hook imports after the last import statement
  const addImportsToInsert = addImports.filter((imp) => {
    const m = imp.match(/useMediaQuery|useThemeColors/);
    return m && !sourceText.includes(m[0]);
  });
  let lastImportEnd = 0;
  for (const stmt of sourceFile.statements) {
    if (ts.isImportDeclaration(stmt)) lastImportEnd = Math.max(lastImportEnd, stmt.getEnd());
  }
  if (addImportsToInsert.length) {
    replacements.push({ start: lastImportEnd, end: lastImportEnd, text: '\n' + addImportsToInsert.join('\n') + '\n' });
  }

  // apply replacements (reverse order)
  replacements.sort((a, b) => b.start - a.start || b.end - a.end);
  let result = sourceText;
  for (const r of replacements) {
    result = result.slice(0, r.start) + r.text + result.slice(r.end);
  }

  // rename identifiers (useMedia → useMediaQuery, useTheme → useThemeColors)
  for (const { from, to } of identifierRenames) {
    if (from === to) continue;
    result = result.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
  }

  return { result, reports };
}

function isPassthroughProp(propName) {
  const passthrough = new Set([
    'style', 'id', 'key', 'ref', 'name', 'type', 'value', 'title', 'role', 'tabIndex',
    'disabled', 'defaultValue', 'placeholder', 'autoFocus', 'src', 'alt', 'href', 'target',
    'rel', 'download', 'htmlFor', 'contentEditable', 'suppressHydrationWarning',
    'onClick', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyUp',
    'onChange', 'onInput', 'onSubmit', 'onScroll', 'onTouchStart', 'onTouchEnd',
    'onTouchMove', 'onWheel', 'onAnimationEnd', 'onTransitionEnd', 'onDoubleClick',
    'onContextMenu', 'onPointerDown', 'onPointerUp', 'onPointerEnter', 'onPointerLeave',
    'onMouseDown', 'onMouseUp', 'onMouseMove', 'onDragStart', 'onDragOver', 'onDrop',
  ]);
  return passthrough.has(propName) || propName.startsWith('data-') || propName.startsWith('aria-');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function processFile(file) {
  const ext = path.extname(file);
  if (!['.tsx', '.ts'].includes(ext)) return;
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes("from 'tamagui'") && !text.includes("from '@arcadeum/ui'")) return;

  const { result, reports } = transformFile(text);
  const changed = result !== text;
  if (!changed && reports.length === 0) return;

  if (DRY_RUN) {
    console.log(`\n== ${file} ${changed ? '(would change)' : '(reports only)'}`);
    if (changed) {
      const a = text.split('\n');
      const b = result.split('\n');
      console.log(`   diff: ${a.length === b.length ? 'same line count' : `±${Math.abs(a.length - b.length)} lines`}`);
    }
  } else {
    fs.writeFileSync(file, result);
    if (changed) console.log(`✓ ${file}`);
  }
  for (const r of reports) console.log(`  ⚠ ${file}${r}`);
}

function run(targetPath) {
  const stat = fs.statSync(targetPath);
  const files = [];
  if (stat.isDirectory()) {
    const walkDir = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkDir(full);
        else files.push(full);
      }
    };
    walkDir(targetPath);
  } else {
    files.push(targetPath);
  }
  let changed = 0;
  for (const f of files) {
    const before = fs.readFileSync(f, 'utf8');
    processFile(f);
    if (!DRY_RUN && fs.readFileSync(f, 'utf8') !== before) changed++;
  }
  if (DRY_RUN) console.log(`\nDry run complete — ${files.length} files scanned.`);
  else console.log(`\nDone — ${changed}/${files.length} files modified.`);
}

run(target);
