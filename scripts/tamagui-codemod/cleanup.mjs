#!/usr/bin/env node
/**
 * Cleanup pass for files already converted by run.mjs.
 *
 * Finds JSX elements that carry a `className` (signature of a converted
 * element) plus leftover style props that the codemod couldn't fold in
 * (dynamic values, or props mapped after the first run):
 *
 *  - static values → mapped to Tailwind classes and merged into className
 *  - dynamic values → moved into `style={{ ... }}`
 *  - testID → data-testid
 *
 * Also repairs `useTheme(` / `useMedia(` call sites whose imports were
 * swapped to useThemeColors / useMediaQuery, and rewrites broken
 * `const Wrapper = ({children}) => (\n\n {children}\n );` shapes left by
 * provider unwrapping.
 *
 * Usage: node scripts/tamagui-codemod/cleanup.mjs <file-or-dir> [--dry-run]
 */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');
const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/tamagui-codemod/cleanup.mjs <file-or-dir> [--dry-run]');
  process.exit(1);
}

// Same mapping primitives as run.mjs (kept in sync manually)
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
function tokenToCssValue(token) {
  const raw = String(token);
  if (!raw.startsWith('$')) return raw;
  const name = raw.slice(1);
  if (THEMED_KEYS.has(name)) return `var(--${name})`;
  if (name in STATIC_COLORS) return STATIC_COLORS[name];
  return null;
}
function num(v) {
  if (typeof v === 'number') return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}
function isPercent(v) { return typeof v === 'string' && /^-?[\d.]+%$/.test(v); }
function lengthClass(prefix, v) {
  if (v === 0 || v === '0' || v === '0px') return `${prefix}-0`;
  if (v === '100%') return `${prefix}-full`;
  if (isPercent(v)) return `${prefix}-[${v}]`;
  const n = num(v);
  if (n === null) return null;
  return `${prefix}-[${n}px]`;
}
const SPACE_SCALE = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, true: 4 };
const RADIUS_MAP = { 0: 'rounded-none', 1: 'rounded', 2: 'rounded-lg', true: 'rounded-lg', 3: 'rounded-xl', 4: 'rounded-2xl', 5: 'rounded-3xl', 6: 'rounded-[24px]' };
const ZINDEX_MAP = { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 };
const FONT_SIZE = { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 28, 8: 32, 9: 40, 10: 48, sm: 14, md: 16, lg: 18, xl: 20, true: 16 };
const LINE_HEIGHT = { 1: 16, 2: 18, 3: 20, 4: 24, 5: 28, 6: 30, 7: 34, 8: 38, 9: 46, 10: 54, sm: 18, md: 20, lg: 24, xl: 28, tight: 1.1, relaxed: 24, none: 1, normal: 22, true: 24 };
function spaceClass(value) {
  const raw = String(value).replace(/^[$-]/, '');
  const neg = String(value).startsWith('-');
  const scale = raw === 'true' ? 4 : SPACE_SCALE[raw];
  if (scale === undefined) return null;
  const signed = neg ? -scale : scale;
  return signed < 0 ? `-${Math.abs(signed)}` : String(scale);
}
function spaced(util, value, negative = false) {
  const s = spaceClass(value);
  if (s === null) return null;
  if (negative) {
    const n = Number(s);
    return Number.isNaN(n) ? null : (n < 0 ? util + Math.abs(n) : `-${util}${n}`);
  }
  return s.startsWith('-') ? `-${util}${s.slice(1)}` : util + s;
}
function arbitrary(v) { return String(v).replace(/\s+/g, '_'); }
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
function flexDirClass(v) {
  if (v === 'row' || v === 'column') return `flex-${v}`;
  if (v === 'row-reverse') return 'flex-row-reverse';
  if (v === 'column-reverse') return 'flex-col-reverse';
  return null;
}
function alignValue(v) {
  const s = String(v);
  if (s === 'flex-start') return 'start';
  if (s === 'flex-end') return 'end';
  return s;
}
function displayClass(v) {
  if (v === 'none') return 'hidden';
  if (v === 'flex') return 'flex';
  if (v === 'block') return 'block';
  if (v === 'inline-block') return 'inline-block';
  if (v === 'inline') return 'inline';
  if (v === 'grid') return 'grid';
  if (v === 'contents') return 'contents';
  return `[display:${v}]`;
}
function whiteSpaceClass(v) {
  if (v === 'nowrap') return 'whitespace-nowrap';
  if (v === 'pre') return 'whitespace-pre';
  if (v === 'pre-wrap') return 'whitespace-pre-wrap';
  if (v === 'pre-line') return 'whitespace-pre-line';
  if (v === 'normal') return 'whitespace-normal';
  return `[white-space:${v}]`;
}
function weightClass(v) {
  const n = String(v).replace(/^\$/, '');
  const map = { 400: 'font-normal', 500: 'font-medium', 600: 'font-semibold', 700: 'font-bold', 800: 'font-extrabold', 900: 'font-black' };
  if (map[n]) return map[n];
  if (n === 'bold') return 'font-bold';
  return `font-[${n}]`;
}
function animationClass(v) {
  const d = { fast: 150, quick: 150, medium: 300, slow: 500 }[String(v).replace(/^\$/, '')] ?? 300;
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
function mapStyle(prop, value, variantPrefix = '') {
  const p = variantPrefix;
  const kv = (cls) => cls.filter(Boolean).map((c) => p + c).join(' ');
  const s = (v) => (typeof v === 'string' && v.startsWith('$') ? v.slice(1) : v);
  if (Array.isArray(value)) {
    if (prop === 'padding' || prop === 'p') {
      const v = spaced('py-', value[0]); const h = spaced('px-', value[1]);
      if (v && h) return `${v} ${h}`;
    }
    return null;
  }
  if (typeof value === 'string' && /\s/.test(value)) {
    const parts = value.split(/\s+/);
    if (parts.length === 2 && (prop === 'padding' || prop === 'p')) {
      const v = spaced('py-', parts[0]); const h = spaced('px-', parts[1]);
      if (v && h) return `${v} ${h}`;
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
    case 'top': case 'right': case 'bottom': case 'left': return kv([lengthClass(prop, value)]);
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
    case 'textTransform': return kv([`${value}`]);
    case 'textDecorationLine': return String(value) === 'none' ? kv(['no-underline']) : String(value) === 'underline' ? kv(['underline']) : null;
    case 'numberOfLines': return kv([`line-clamp-${value}`]);
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
      const map = { small: 'shadow-[0_2px_8px_rgba(0,0,0,0.25)]', medium: 'shadow-[0_6px_14px_rgba(0,0,0,0.3)]', large: 'shadow-[0_10px_24px_rgba(0,0,0,0.35)]' };
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
    default: return undefined;
  }
}

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

const PASSTHROUGH = new Set([
  'id', 'key', 'ref', 'name', 'type', 'value', 'title', 'role', 'tabIndex', 'disabled',
  'defaultValue', 'placeholder', 'autoFocus', 'src', 'alt', 'href', 'target', 'rel', 'download',
  'htmlFor', 'contentEditable', 'suppressHydrationWarning', 'className', 'style',
  'onClick', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyUp',
  'onChange', 'onInput', 'onSubmit', 'onScroll', 'onTouchStart', 'onTouchEnd', 'onTouchMove',
  'onWheel', 'onAnimationEnd', 'onTransitionEnd', 'onDoubleClick', 'onContextMenu',
  'onPointerDown', 'onPointerUp', 'onPointerEnter', 'onPointerLeave', 'onMouseDown', 'onMouseUp',
  'onMouseMove', 'onDragStart', 'onDragOver', 'onDrop',
]);

function walk(node, cb) {
  node.forEachChild((child) => { cb(child); walk(child, cb); });
}

/** Convert Tamagui/RN style values into CSS-compatible values. */
function styleValueExpr(exprText) {
  let out = exprText;
  // $tokens → CSS values (spacing scale is 4px)
  out = out.replace(/\$(\d+)/g, (_, n) => `${(Number(n) || 4) * 4}px`);
  out = out.replace(/\$([\w-]+)/g, (_, name) => {
    if (THEMED_KEYS.has(name)) return `var(--${name})`;
    if (name in STATIC_COLORS) return STATIC_COLORS[name];
    return `var(--${name})`;
  });
  // RN transform arrays → CSS transform strings
  out = out.replace(/transform:\s*\[\{\s*translateX:\s*(-?\d+(?:\.\d+)?)\s*\}\]/g, (_, n) => `transform: 'translateX(${n}px)'`);
  out = out.replace(/transform:\s*\[\{\s*translateY:\s*(-?\d+(?:\.\d+)?)\s*\}\]/g, (_, n) => `transform: 'translateY(${n}px)'`);
  out = out.replace(/transform:\s*\[\{\s*scale:\s*(-?\d+(?:\.\d+)?)\s*\}\]/g, (_, n) => `transform: 'scale(${n})'`);
  // RN-only style keys → CSS pairs
  out = out.replace(/paddingHorizontal\s*:/g, 'paddingLeft:');
  out = out.replace(/paddingVertical\s*:/g, 'paddingTop:');
  out = out.replace(/marginHorizontal\s*:/g, 'marginLeft:');
  out = out.replace(/marginVertical\s*:/g, 'marginTop:');
  return out;
}

function transformFile(sourceText) {
  const sourceFile = ts.createSourceFile('x.tsx', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const replacements = [];
  const reports = [];
  const lineOf = (pos) => sourceFile.getLineAndCharacterOfPosition(pos).line + 1;

  // --- leftover style props on className-carrying elements -----------------
  walk(sourceFile, (node) => {
    if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
    const attrs = node.attributes.properties;
    const hasClassName = attrs.some(
      (a) => !ts.isJsxSpreadAttribute(a) && a.name.getText() === 'className',
    );
    if (!hasClassName) return;

    const styleProps = [];
    const kept = [];
    let classNameAttr = null;
    let styleAttr = null;
    let onPressAttr = null;

    for (const attr of attrs) {
      if (ts.isJsxSpreadAttribute(attr)) { kept.push(attr.getText()); continue; }
      const propName = attr.name.getText();
      const init = attr.initializer;
      const rawValue = init && !ts.isJsxExpression(init)
        ? init.getText()
        : init && ts.isJsxExpression(init) && init.expression
          ? init.expression.getText()
          : undefined;
      if (propName === 'className') { classNameAttr = attr; continue; }
      if (propName === 'style') { styleAttr = attr; continue; }
      if (propName === 'onPress') { onPressAttr = attr; continue; }
      if (propName === 'testID') {
        kept.push(`data-testid={${rawValue}}`);
        continue;
      }
      if (PASSTHROUGH.has(propName) || propName.startsWith('data-') || propName.startsWith('aria-')) {
        kept.push(attr.getText());
        continue;
      }
      if (!STYLE_PROPS.has(propName)) {
        kept.push(attr.getText());
        continue;
      }
      if (isMappableValueText(rawValue)) {
        const mapped = mapStyle(propName, String(rawValue).trim().replace(/^["'`]+|["'`]+$/g, ''));
        if (mapped && mapped !== '') {
          styleProps.push({ mapped, dynamic: false, key: propName, expr: rawValue });
          continue;
        }
      }
      styleProps.push({ mapped: null, dynamic: true, key: propName, expr: rawValue });
    }

    if (styleProps.length === 0 && !onPressAttr && classNameAttr && !styleAttr) return;

    // build replacement
    const outAttrs = [];
    const staticClasses = styleProps.filter((p) => p.dynamic === false).map((p) => p.mapped);
    const dynamicProps = styleProps.filter((p) => p.dynamic);

    if (classNameAttr) {
      // merge static classes into the existing className expression
      const init = classNameAttr.initializer;
      const exprText = init && ts.isJsxExpression(init) && init.expression
        ? init.expression.getText()
        : undefined;
      if (staticClasses.length) {
        const merged = staticClasses.join(' ');
        if (exprText === undefined) {
          outAttrs.push(`className="${merged}"`);
        } else if (/^['"`]/.test(exprText) && /['"`]$/.test(exprText)) {
          outAttrs.push(`className="${exprText.slice(1, -1)} ${merged}"`);
        } else {
          outAttrs.push(`className={\`${merged} \${${exprText}}\`}`);
        }
      } else {
        outAttrs.push(exprText === undefined ? `className={'${init.getText()}'}` : `className={${exprText}}`);
      }
    } else if (staticClasses.length) {
      outAttrs.push(`className="${staticClasses.join(' ')}"`);
    }

    const styleExpr = styleAttr
      ? (() => {
          const init = styleAttr.initializer;
          return init && ts.isJsxExpression(init) && init.expression
            ? init.expression.getText()
            : undefined;
        })()
      : undefined;

    if (dynamicProps.length) {
      const entries = dynamicProps
        .map((p) => `${p.key}: ${styleValueExpr(p.expr)}`)
        .join(', ');
      outAttrs.push(styleExpr
        ? `style={{ ${entries}, ...((${styleExpr}) ?? {}) }}`
        : `style={{ ${entries} }}`);
    } else if (styleExpr) {
      outAttrs.push(`style={${styleExpr}}`);
    }

    if (onPressAttr) {
      const init = onPressAttr.initializer;
      const expr = init && ts.isJsxExpression(init) && init.expression ? init.expression.getText() : undefined;
      outAttrs.push(`onClick={${expr}}`);
    }

    outAttrs.push(...kept);

    const closeSlash = ts.isJsxSelfClosingElement(node) ? ' /' : '';
    const tag = node.tagName.getText();
    replacements.push({
      start: node.getStart(),
      end: node.getEnd(),
      text: `<${tag}${outAttrs.length ? ' ' + outAttrs.join(' ') : ''}${closeSlash}>`,
    });
    reports.push(`:${lineOf(node.getStart())} style props folded`);
  });

  // --- leftover hook renames ----------------------------------------------
  if (/\buseTheme\(/.test(sourceText) && /useThemeColors/.test(sourceText) && !/import\s*\{[^}]*useTheme\b/.test(sourceText)) {
    replacements.push({ start: 0, end: 0, text: '\u0000RENAME:useTheme' });
  }
  if (/\buseMedia\(/.test(sourceText) && /useMediaQuery/.test(sourceText) && !/import\s*\{[^}]*useMedia\b/.test(sourceText)) {
    replacements.push({ start: 0, end: 0, text: '\u0000RENAME:useMedia' });
  }

  // --- broken Wrapper shapes: `({ children }) => (\n\n    {children}\n  );` --
  const wrapperRe = /=>\s*\(\s*\n[ \t]*\n[ \t]*\{\s*(children)\s*\}\s*,?\n[ \t]*\)\s*;/g;
  const wrapperMatches = [...sourceText.matchAll(wrapperRe)];

  replacements.sort((a, b) => b.start - a.start || b.end - a.end);
  let result = sourceText;
  for (const r of replacements) {
    if (r.text === '\u0000RENAME:useTheme') {
      result = result.replace(/\buseTheme\(/g, 'useThemeColors(');
    } else if (r.text === '\u0000RENAME:useMedia') {
      result = result.replace(/\buseMedia\(/g, 'useMediaQuery(');
    } else {
      result = result.slice(0, r.start) + r.text + result.slice(r.end);
    }
  }

  if (wrapperMatches.length) {
    result = result.replace(wrapperRe, '=> $1;');
    reports.push(`:1 repaired ${wrapperMatches.length} broken Wrapper component(s)`);
  }

  return { result, reports };
}

function processFile(file) {
  if (!['.tsx', '.ts'].includes(path.extname(file))) return;
  const text = fs.readFileSync(file, 'utf8');
  // only touch files that look like codemod output
  const looksConverted =
    /className="box-border|className=\{`[^`]*box-border|useThemeColors\(|useMediaQuery\(|data-testid=\{/.test(text) ||
    /=>\s*\(\s*\n[ \t]*\n[ \t]*\{\s*children\s*\}/.test(text);
  if (!looksConverted) return;
  const { result, reports } = transformFile(text);
  const changed = result !== text;
  if (!changed && reports.length === 0) return;
  if (DRY_RUN) {
    console.log(`\n== ${file} ${changed ? '(would change)' : '(reports only)'}`);
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
  console.log(`\nDone — ${changed}/${files.length} files modified.`);
}

run(target);
