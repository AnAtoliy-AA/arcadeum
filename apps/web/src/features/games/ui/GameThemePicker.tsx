'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import {
  SHARED_THEMES,
  type GameTheme,
} from '@/features/games/lib/shared-themes';

export interface GameThemePickerOption {
  id: string;
  /** i18n key or plain label */
  nameKey?: string;
  /** Plain label (fallback when no i18n key) */
  name?: string;
  /** i18n key or plain label */
  descriptionKey?: string;
  /** Plain description (fallback when no i18n key) */
  description?: string;
  emoji?: string;
  gradient?: string;
  disabled?: boolean;
  /** Renders a "Coming soon" badge and disables the option. */
  comingSoon?: boolean;
}

export interface GameThemePickerProps {
  selectedTheme?: string;
  onSelect: (themeId: string) => void;
  /** Restrict the visible themes to this set (defaults to SHARED_THEMES ids). */
  allowedThemes?: string[];
  /** Render themes outside `allowedThemes` as disabled ("coming soon"). */
  showComingSoon?: boolean;
  disabled?: boolean;
  options?: GameThemePickerOption[];
  className?: string;
  /** Optional custom thumbnail renderer (falls back to emoji + gradient). */
  renderThumbnail?: (theme: GameTheme) => ReactNode;
  label?: string;
  /** Display layout: 'grid' (default, multi-column wrap) or 'scroll' (horizontal scroll) */
  layout?: 'grid' | 'scroll';
}

const THEME_INDEX = new Map<string, GameTheme>(
  SHARED_THEMES.map((t) => [t.id, t]),
);

/**
 * Shared Visual Theme Picker.
 *
 * Single set of buttons with responsive CSS:
 * - Desktop: compact grid with short cards.
 * - Mobile: horizontal scroll strip with circular thumbnails.
 */
export function GameThemePicker({
  selectedTheme = 'adventure',
  onSelect,
  allowedThemes,
  showComingSoon = false,
  disabled: overallDisabled = false,
  options,
  className,
  renderThumbnail,
  label,
  layout = 'grid',
}: GameThemePickerProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const pickerOptions: GameThemePickerOption[] = options ?? [
    ...SHARED_THEMES.map<GameThemePickerOption>((theme) => ({
      id: theme.id,
      nameKey: theme.nameKey,
      descriptionKey: theme.descriptionKey,
      emoji: theme.emoji,
      gradient: theme.gradient,
    })),
  ];

  const visible = allowedThemes
    ? pickerOptions.filter((o) => allowedThemes.includes(o.id))
    : pickerOptions;

  const resolveName = (option: GameThemePickerOption): string => {
    if (option.nameKey) {
      if (option.nameKey.startsWith('games.')) {
        return t(option.nameKey as TranslationKey) || option.nameKey;
      }
      return option.nameKey;
    }
    return option.name ?? option.id;
  };

  return (
    <div className={cx('flex flex-col gap-2 w-full min-w-0', className)}>
      {label ? (
        <span className="text-[13px] font-semibold text-[var(--foreground)]">
          {label}
        </span>
      ) : null}

      {/* Single responsive container — grid on desktop, snap scroll on mobile */}
      <div
        ref={scrollRef}
        className={cx(
          'w-full max-w-full min-w-0',
          layout === 'grid'
            ? 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-[800px]:flex max-[800px]:grid-cols-none max-[800px]:gap-2 max-[800px]:overflow-x-auto max-[800px]:snap-x max-[800px]:scroll-smooth'
            : 'flex gap-2 overflow-x-auto pb-1 scroll-smooth',
        )}
        style={
          {
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          } as React.CSSProperties
        }
        role="radiogroup"
        aria-label={label ?? 'Theme'}
      >
        {visible.map((option) => {
          const theme = THEME_INDEX.get(option.id);
          const active = selectedTheme === option.id;
          const comingSoon = option.comingSoon || false;
          const disabled =
            overallDisabled ||
            option.disabled ||
            comingSoon ||
            (showComingSoon && !theme) ||
            false;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={resolveName(option)}
              aria-disabled={disabled || undefined}
              disabled={disabled}
              data-testid={`theme-${option.id}`}
              onClick={() => onSelect(option.id)}
              className={cx(
                'relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all duration-200 min-w-0',
                'max-[800px]:w-auto max-[800px]:min-w-[30%] max-[800px]:max-w-[33%] max-[800px]:snap-start max-[800px]:shrink-0 max-[800px]:rounded-2xl max-[800px]:border-0 max-[800px]:bg-transparent max-[800px]:p-2 max-[800px]:gap-1.5',
                layout === 'scroll'
                  ? 'min-w-[90px] max-w-[100px] shrink-0'
                  : '',
                active
                  ? 'border-[var(--primary)] bg-[var(--primary)]/8 ring-1 ring-[var(--primary)]/30 max-[800px]:ring-0'
                  : 'border-[var(--borderColor)] bg-[var(--glassBg)] hover:border-[var(--primary)]/50 max-[800px]:hover:bg-transparent',
                disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
              )}
            >
              {comingSoon ? (
                <span
                  data-testid="coming-soon-badge"
                  className="absolute -top-1.5 -right-1.5 z-10 rounded-full bg-[var(--foreground)]/90 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-[var(--background)] max-[800px]:-top-0.5 max-[800px]:-right-0.5 max-[800px]:px-1 max-[800px]:py-px max-[800px]:text-[7px]"
                >
                  {t('games.create.comingSoon') || 'Soon'}
                </span>
              ) : null}

              {/* Thumbnail — larger on mobile */}
              <div
                className={cx(
                  'flex h-10 w-full items-center justify-center overflow-hidden rounded-lg text-2xl transition-all duration-200 border-2',
                  'max-[800px]:w-14 max-[800px]:h-14 max-[800px]:rounded-xl max-[800px]:border-0',
                  active
                    ? 'max-[800px]:ring-2 max-[800px]:ring-[var(--primary)]/40 max-[800px]:scale-105'
                    : '',
                )}
                style={{
                  background: option.gradient ?? theme?.gradient ?? '#1a1030',
                }}
              >
                {renderThumbnail && theme ? (
                  renderThumbnail(theme)
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background:
                        option.gradient ?? theme?.gradient ?? '#1a1030',
                    }}
                  >
                    {option.emoji ?? theme?.emoji ?? '🎲'}
                  </span>
                )}
              </div>

              {/* Name — always visible */}
              <span
                className={cx(
                  'text-[11px] font-medium text-[var(--foreground)] leading-tight truncate w-full',
                  'max-[800px]:text-[13px] max-[800px]:font-semibold max-[800px]:whitespace-nowrap max-[800px]:text-center max-[800px]:leading-tight max-[800px]:!overflow-visible',
                  active && 'max-[800px]:text-[var(--primary)]',
                )}
              >
                {resolveName(option)}
              </span>

              {/* Active checkmark — desktop only */}
              {active ? (
                <span
                  className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[9px] font-bold text-[var(--primaryForeground,white)] max-[800px]:hidden"
                  aria-hidden="true"
                >
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
