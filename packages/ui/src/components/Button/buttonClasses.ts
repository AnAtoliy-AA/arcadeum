/**
 * Tailwind class maps for the shared Button/LinkButton.
 *
 * Colors reference the runtime CSS variables minted on <html> by the theme
 * provider (themeDefinitions via ThemeContext, tokens.scss), so the button
 * keeps working across web light/dark/neon/purple themes.
 */
import type { ButtonShape, ButtonVariant, GameVariant } from './types';
import { cx } from '../../utils/cx';
import { gameButtonVariants } from './gameButtonVariants';
export { gameButtonVariants };

export const buttonBase = [
  'relative',
  'inline-flex',
  'flex-row',
  'items-center',
  'justify-center',
  'cursor-pointer',
  'overflow-hidden',
  'select-none',
  'border',
  'p-0',
  'text-center',
  'no-underline',
  '[transition:transform_0.45s_cubic-bezier(0.34,1.56,0.64,1),background-color_0.25s_ease,border-color_0.25s_ease,box-shadow_0.4s_ease]',
  'disabled:cursor-not-allowed',
  'disabled:pointer-events-none',
  'focus:outline-none',
  'focus:border-[2px]',
  'focus:border-[var(--primary)]',
].join(' ');

export type ButtonSizeKey = 'sm' | 'md' | 'lg';

/** height / horizontal padding / vertical padding / radius */
export const buttonSizes: Record<ButtonSizeKey, string> = {
  sm: 'h-9 px-4 py-2 rounded-[12px]',
  md: 'h-12 px-6 py-3 rounded-[16px]',
  lg: 'h-[60px] px-8 py-4 rounded-[20px]',
};

/** Size classes without padding — used when a variant or `padding` owns spacing. */
export const buttonSizesWithoutPadding: Record<ButtonSizeKey, string> = {
  sm: 'h-9 rounded-[12px]',
  md: 'h-12 rounded-[16px]',
  lg: 'h-[60px] rounded-[20px]',
};

/**
 * Variants that define their own padding (`p-0`) — the chosen size must not
 * emit competing `px-*` / `py-*` utilities (shorthand-vs-longhand cascade
 * fights that previously required `!important` to resolve).
 */
const selfPaddedVariants: ReadonlySet<string> = new Set(['icon', 'icon glass', 'link']);

/**
 * Drop padding utilities (`p-*`, `px-*`, `py-*`, `pt/pr/pb/pl-*`, banged or
 * not) from a class string so an explicit `padding` config can win outright.
 */
function stripPaddingUtilities(classes: string): string {
  return classes
    .split(' ')
    .filter((c) => c !== '' && !/^\!?p([trblxy]?)-/.test(c))
    .join(' ');
}

/**
 * Corner shapes. Radius overrides from the size are named utilities
 * (`rounded-full`, `rounded-none`) that sort after arbitrary values in the
 * compiled CSS, so they deterministically win over size/variant radii.
 */
export const buttonShapes: Record<string, string> = {
  round: 'rounded-full',
  square: 'rounded-none',
  circle: 'aspect-square rounded-full p-0 justify-center items-center',
};

/** Variant → [base classes] applied via className. */
export const buttonVariants: Record<string, string> = {
  primary: [
    'border',
    'border-[var(--glassBorder)]',
    'border-t-[rgba(255,255,255,0.18)]',
    'text-[var(--primaryText)]',
    'font-extrabold',
    'bg-[var(--primary)]',
    'bg-[linear-gradient(160deg,var(--primaryGradientStart)_0%,var(--primaryGradientEnd)_100%)]',
    'shadow-[0_4px_2px_var(--primary)]',
    'hover:bg-[var(--accent)]',
    'hover:bg-[linear-gradient(160deg,var(--accent)_0%,var(--primaryGradientStart)_100%)]',
    'hover:shadow-[0_10px_24px_var(--primary)]',
    'active:shadow-[0_1px_2px_var(--primary)]',
  ].join(' '),

  secondary: [
    'border',
    'border-[var(--glassBorder)]',
    'border-t-[rgba(255,255,255,0.14)]',
    'text-[var(--secondaryText)]',
    'bg-[var(--secondary)]',
    'bg-[linear-gradient(160deg,var(--secondaryGradientStart)_0%,var(--secondaryGradientEnd)_100%)]',
    'shadow-[0_4px_2px_var(--secondary)]',
    'hover:bg-[var(--accent)]',
    'hover:bg-[linear-gradient(160deg,var(--accent)_0%,var(--secondaryGradientStart)_100%)]',
    'hover:shadow-[0_10px_22px_var(--secondary)]',
    'active:shadow-[0_1px_2px_var(--secondary)]',
  ].join(' '),

  danger: [
    'border',
    'border-[var(--glassBorder)]',
    'border-t-[rgba(255,255,255,0.14)]',
    'text-[var(--dangerText)]',
    'bg-[var(--danger)]',
    'bg-[linear-gradient(160deg,var(--dangerGradientStart)_0%,var(--dangerGradientEnd)_100%)]',
    'shadow-[0_4px_2px_var(--danger)]',
    'hover:shadow-[0_10px_24px_var(--danger)]',
    'active:shadow-[0_1px_2px_var(--danger)]',
  ].join(' '),

  glass: [
    'border',
    'border-[var(--glassBorder)]',
    'border-t-[rgba(255,255,255,0.2)]',
    'text-[var(--color)]',
    'bg-[var(--glassBg)]',
    'backdrop-blur-[12px]',
    'shadow-[0_4px_2px_rgba(0,0,0,0.4)]',
    'hover:bg-[var(--glassBgHover)]',
    'hover:border-[var(--glassBorderHover)]',
    'hover:backdrop-blur-[20px]',
    'hover:shadow-[0_10px_16px_var(--shadowColor,rgba(0,0,0,0.35))]',
    'active:shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
  ].join(' '),

  ghost: [
    'bg-transparent',
    'border-transparent',
    'text-[var(--color)]',
    'shadow-none',
    'hover:bg-[var(--glassBgHover)]',
    'hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)]',
    'active:shadow-none',
  ].join(' '),

  /** Outline/ghost forms of color variants — reached via the `outline`/`ghost` props. */
  'outline danger': [
    'border',
    'border-[var(--danger)]',
    'text-[var(--danger)]',
    'bg-transparent',
    'shadow-[0_3px_1px_rgba(0,0,0,0.3)]',
    'hover:bg-[color:color-mix(in_srgb,var(--danger)_12%,transparent)]',
    'hover:border-[var(--danger)]',
    'hover:shadow-[0_8px_12px_color-mix(in_srgb,var(--danger)_25%,transparent)]',
    'active:shadow-[0_1px_1px_rgba(0,0,0,0.3)]',
  ].join(' '),

  'ghost danger': [
    'bg-transparent',
    'border-transparent',
    'text-[var(--danger)]',
    'shadow-none',
    'hover:bg-[color:color-mix(in_srgb,var(--danger)_12%,transparent)]',
    'hover:shadow-none',
    'active:bg-[color:color-mix(in_srgb,var(--danger)_20%,transparent)]',
    'active:shadow-none',
  ].join(' '),

  outline: [
    'border',
    'border-[var(--borderColor)]',
    'bg-transparent',
    'text-[var(--color)]',
    'shadow-[0_3px_1px_rgba(0,0,0,0.3)]',
    'hover:bg-[var(--glassBgHover)]',
    'hover:border-[var(--glassBorderHover)]',
    'hover:shadow-[0_8px_12px_rgba(0,0,0,0.3)]',
    'active:shadow-[0_1px_1px_rgba(0,0,0,0.3)]',
  ].join(' '),

  icon: [
    'rounded-full',
    'aspect-square',
    'justify-center',
    'items-center',
    'p-0',
    'text-[var(--color)]',
    'shadow-none',
    'bg-[color:color-mix(in_srgb,var(--color)_8%,transparent)]',
    'border-[color:color-mix(in_srgb,var(--color)_18%,transparent)]',
    'hover:bg-[color:color-mix(in_srgb,var(--color)_14%,transparent)]',
    'hover:border-[color:color-mix(in_srgb,var(--color)_30%,transparent)]',
    'hover:scale-110',
    'hover:shadow-[0_4px_10px_rgba(0,0,0,0.3)]',
    'active:scale-95',
    'active:bg-[color:color-mix(in_srgb,var(--color)_10%,transparent)]',
    'active:shadow-none',
  ].join(' '),

  /** Dark frosted-glass circle for slides/hero controls (prev, next, fullscreen, play). */
  'icon glass': [
    'rounded-full',
    'aspect-square',
    'justify-center',
    'items-center',
    'p-0',
    'relative',
    'border',
    'border-white/20',
    'bg-black/45',
    'text-white',
    'backdrop-blur-[12px]',
    'backdrop-saturate-180',
    'shadow-[0_4px_15px_rgba(0,0,0,0.5)]',
    'hover:scale-[1.1]',
    'hover:border-white/50',
    'hover:bg-black/70',
    'hover:shadow-[0_6px_20px_rgba(0,0,0,0.6)]',
    'active:scale-95',
    'before:absolute',
    'before:inset-0',
    'before:rounded-full',
    'before:bg-primary',
    'before:opacity-0',
    'before:transition-opacity',
    'before:duration-200',
    'hover:before:opacity-100',
    '[&_svg]:relative',
    '[&_svg]:z-[1]',
  ].join(' '),

  link: [
    'bg-transparent',
    'border-transparent',
    'h-auto',
    'p-0',
    'shadow-none',
    'hover:opacity-70',
    'hover:shadow-none',
  ].join(' '),

  chip: [
    'border',
    'border-[var(--glassBorder)]',
    'h-[28px]',
    'px-3',
    'rounded-[16px]',
    'text-[var(--color)]',
    'shadow-[0_2px_1px_rgba(0,0,0,0.15)]',
    'bg-[var(--glassBg)]',
    'hover:bg-[var(--glassBgHover)]',
    'hover:border-[var(--glassBorderHover)]',
    'hover:shadow-[0_5px_8px_rgba(0,0,0,0.2)]',
    'active:shadow-none',
  ].join(' '),

  /**
   * Selected chip — gold tint. Not a public variant: reachable only via
   * `variant="chip"` + `active`, which swaps to this map in `resolveButtonClasses`.
   */
  'chip gold': [
    'border',
    'border-[var(--goldAccent,#ffd166)]',
    'h-[28px]',
    'px-3',
    'rounded-[16px]',
    'text-[var(--goldAccent,#ffd166)]',
    'shadow-[0_2px_1px_rgba(0,0,0,0.3)]',
    'bg-[rgba(255,209,102,0.1)]',
    'hover:bg-[rgba(255,209,102,0.15)]',
    'hover:border-[var(--goldAccent,#ffd166)]',
    'hover:shadow-[0_5px_8px_rgba(0,0,0,0.3)]',
    'active:shadow-none',
  ].join(' '),

  listItem: [
    'bg-transparent',
    'border-transparent',
    'h-[44px]',
    'justify-start',
    'w-full',
    'px-4',
    'text-[var(--color)]',
    'shadow-none',
    'hover:bg-[var(--glassBgHover)]',
    'hover:shadow-none',
  ].join(' '),

  victory: [
    'border-0',
    'border-t-[rgba(255,255,255,0.35)]',
    'bg-[#FFD700]',
    'bg-[linear-gradient(160deg,#ffe866_0%,#ff9500_100%)]',
    'text-[#1a1a1a]',
    'font-extrabold',
    'shadow-[0_4px_2px_rgba(255,165,0,0.7)]',
    'hover:bg-[linear-gradient(160deg,#fff07a_0%,#ffb500_100%)]',
    'hover:scale-[1.04]',
    'hover:shadow-[0_12px_28px_rgba(255,215,0,0.8)]',
    'active:scale-[0.98]',
    'active:shadow-[0_1px_4px_rgba(255,165,0,0.8)]',
  ].join(' '),
};



export const buttonFlags = {
  fullWidth: 'w-full',
  isActive: [
    '!bg-[var(--primary)]',
    '!bg-[linear-gradient(160deg,var(--primaryGradientStart)_0%,var(--primaryGradientEnd)_100%)]',
    '!text-[var(--primaryText)]',
    '-translate-y-[3px]',
    'shadow-[0_6px_3px_var(--primary)]',
  ].join(' '),
  rotatable: 'hover:rotate-180',
  disabled: ['opacity-40', 'cursor-not-allowed', 'pointer-events-none'].join(' '),
  pulse: 'animate-[btn-pulse_2s_ease-in-out_infinite]',
  jump: 'animate-[btn-jump_0.8s_ease-in-out_2]',
};

/**
 * Join button class parts into a single string.
 * In e2e mode (`NEXT_PUBLIC_E2E=true`) press-state (`active:`) classes and
 * infinite button animations (`pulse`/`jump` keyframes) are stripped so
 * elements stay stable for screenshots and Playwright actions.
 */
export function compileButtonClasses(
  parts: Array<string | false | null | undefined>,
): string {
  const joined = cx(...parts);
  if (process.env.NEXT_PUBLIC_E2E === 'true') {
    return joined
      .split(' ')
      .filter((c) => !c.startsWith('active:') && !c.startsWith('animate-[btn-'))
      .join(' ');
  }
  return joined;
}

/** Style configuration shared by `<Button>` and `<LinkButton>`. */
export type ButtonStyleConfig = {
  variant?: ButtonVariant | ButtonVariant[];
  gameVariant?: GameVariant;
  size?: ButtonSizeKey;
  shape?: ButtonShape;
  /** Explicit padding utility — replaces size/variant padding instead of competing with it. */
  padding?: string;
  active?: boolean;
  outline?: boolean;
  ghost?: boolean;
  rotatable?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  pulse?: boolean;
  jump?: boolean;
  className?: string;
};

/**
 * Single source of truth for button/link-button styling.
 *
 * - `variant` may be a string or an array — arrays compose class maps.
 * - `active` selects the variant's "selected" look: for `chip` it swaps to
 *   the gold-tinted `'chip gold'` map; for every other variant it applies the
 *   primary highlight.
 * - `outline` / `ghost` switch a color variant to its `'outline <color>'` /
 *   `'ghost <color>'` form; variants without a form fall back to the base.
 * - `shape` overrides corner radius (`round` = pill, `square` = sharp).
 * - `rotatable` adds a 180° hover spin (used on `icon` / `icon glass`).
 */
export function resolveButtonClasses(config: ButtonStyleConfig): string {
  const {
    variant = 'primary',
    gameVariant,
    size = 'md',
    shape,
    padding,
    active = false,
    outline = false,
    ghost = false,
    rotatable = false,
    fullWidth = false,
    disabled = false,
    loading = false,
    pulse = false,
    jump = false,
    className,
  } = config;

  const variantList = Array.isArray(variant) ? variant : [variant];
  const chipActiveSwapped = active && variantList.includes('chip');

  // Variants that own their padding (or an explicit `padding` override) must
  // not receive the size's `px-*` / `py-*` utilities — otherwise shorthand vs
  // longhand cascade order decides the winner and only `!important` could.
  const ownsPadding =
    padding !== undefined ||
    shape === 'circle' ||
    variantList.some((v) => selfPaddedVariants.has(v));

  const resolvedVariants = variantList
    .map((v) => {
      const baseKey = chipActiveSwapped && v === 'chip' ? 'chip gold' : v;
      const styledKey =
        outline && buttonVariants[`outline ${baseKey}`]
          ? `outline ${baseKey}`
          : ghost && buttonVariants[`ghost ${baseKey}`]
            ? `ghost ${baseKey}`
            : baseKey;
      return buttonVariants[styledKey];
    })
    .join(' ');

  return compileButtonClasses([
    buttonBase,
    ownsPadding ? buttonSizesWithoutPadding[size] : buttonSizes[size],
    gameVariant
      ? gameButtonVariants[gameVariant]
      : padding !== undefined
        ? stripPaddingUtilities(resolvedVariants)
        : resolvedVariants,
    shape === 'round' && buttonShapes.round,
    shape === 'square' && buttonShapes.square,
    shape === 'circle' && buttonShapes.circle,
    padding,
    fullWidth && buttonFlags.fullWidth,
    active && !chipActiveSwapped && buttonFlags.isActive,
    rotatable && buttonFlags.rotatable,
    (disabled || loading) && buttonFlags.disabled,
    pulse && buttonFlags.pulse,
    jump && buttonFlags.jump,
    className,
  ]);
}
