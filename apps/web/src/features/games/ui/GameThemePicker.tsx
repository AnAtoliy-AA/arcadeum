'use client';

import { useRef, useState } from 'react';
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
 * Desktop: compact grid with short cards.
 * Mobile: horizontal scroll strip with circular thumbnails + active name below.
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
  const [showAll, setShowAll] = useState(false);

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

  const INITIAL_MOBILE_COUNT = 8;
  const visibleMobile = showAll
    ? visible
    : visible.slice(0, INITIAL_MOBILE_COUNT);
  const hasMore = visible.length > INITIAL_MOBILE_COUNT;

  const resolveName = (option: GameThemePickerOption): string => {
    if (option.nameKey) {
      if (option.nameKey.startsWith('games.')) {
        return t(option.nameKey as TranslationKey) || option.nameKey;
      }
      return option.nameKey;
    }
    return option.name ?? option.id;
  };

  const selectedName = visible.find((o) => o.id === selectedTheme);
  const activeName = selectedName ? resolveName(selectedName) : null;

  return (
    <div className={cx('flex flex-col gap-2 w-full min-w-0', className)}>
      {label ? (
        <span className="text-[13px] font-semibold text-[var(--foreground)]">
          {label}
        </span>
      ) : null}

      {/* Mobile: horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="max-[800px]:flex hidden"
        style={
          {
            gap: 10,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: 4,
          } as React.CSSProperties
        }
        role="radiogroup"
        aria-label={label ?? 'Theme'}
      >
        {visibleMobile.map((option) => {
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
                'relative flex flex-col items-center gap-1 shrink-0 snap-center transition-all duration-200',
                disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
              )}
            >
              <div
                className={cx(
                  'w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all duration-200 border-2',
                  active
                    ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30 scale-110'
                    : 'border-transparent',
                )}
                style={{
                  background: option.gradient ?? theme?.gradient ?? '#1a1030',
                }}
              >
                {renderThumbnail && theme ? (
                  renderThumbnail(theme)
                ) : (
                  <span>{option.emoji ?? theme?.emoji ?? '🎲'}</span>
                )}
              </div>
              {active && activeName ? (
                <span className="text-[11px] font-semibold text-[var(--primary)] max-w-[56px] truncate text-center leading-tight">
                  {activeName}
                </span>
              ) : null}
              {comingSoon ? (
                <span className="absolute -top-1 -right-1 rounded-full bg-[var(--foreground)]/90 px-1 py-px text-[7px] font-bold uppercase tracking-wide text-[var(--background)]">
                  New
                </span>
              ) : null}
            </button>
          );
        })}
        {!showAll && hasMore ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex flex-col items-center justify-center gap-1 shrink-0 snap-center w-11 h-11 rounded-full border border-dashed border-[var(--borderColor)] bg-[var(--glassBg)] cursor-pointer transition-all duration-200 hover:border-[var(--primary)]/50"
            aria-label="Show all themes"
          >
            <span className="text-[14px] text-[var(--textSecondary)]">+</span>
          </button>
        ) : null}
      </div>

      {/* Desktop: compact grid */}
      <div
        className={cx(
          'w-full max-w-full min-w-0',
          layout === 'grid'
            ? 'max-[800px]:hidden grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'
            : 'max-[800px]:hidden flex gap-2 overflow-x-auto pb-1 scroll-smooth',
        )}
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
              aria-disabled={disabled || undefined}
              disabled={disabled}
              data-testid={`theme-${option.id}`}
              onClick={() => onSelect(option.id)}
              className={cx(
                'relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all duration-200',
                layout === 'scroll'
                  ? 'min-w-[90px] max-w-[100px] shrink-0'
                  : 'w-full min-w-0',
                active
                  ? 'border-[var(--primary)] bg-[var(--primary)]/8 ring-1 ring-[var(--primary)]/30'
                  : 'border-[var(--borderColor)] bg-[var(--glassBg)] hover:border-[var(--primary)]/50',
                disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
              )}
            >
              {comingSoon ? (
                <span
                  data-testid="coming-soon-badge"
                  className="absolute -top-1.5 -right-1.5 z-10 rounded-full bg-[var(--foreground)]/90 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-[var(--background)]"
                >
                  {t('games.create.comingSoon') || 'Soon'}
                </span>
              ) : null}
              <div
                className={cx(
                  'flex h-10 w-full items-center justify-center overflow-hidden rounded-lg text-2xl',
                )}
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
              <span className="text-[11px] font-medium text-[var(--foreground)] leading-tight truncate w-full">
                {resolveName(option)}
              </span>
              {active ? (
                <span
                  className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[9px] font-bold text-[var(--primaryForeground,white)]"
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
