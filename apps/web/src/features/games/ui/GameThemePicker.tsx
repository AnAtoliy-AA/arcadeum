'use client';

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
  /** i18n key or plain label */
  descriptionKey?: string;
  emoji?: string;
  gradient?: string;
  disabled?: boolean;
}

export interface GameThemePickerProps {
  selectedTheme: string;
  onSelect: (themeId: string) => void;
  /** Restrict the visible themes to this set (defaults to SHARED_THEMES ids). */
  allowedThemes?: string[];
  /** Render themes outside `allowedThemes` as disabled ("coming soon"). */
  showComingSoon?: boolean;
  options?: GameThemePickerOption[];
  className?: string;
  /** Optional custom thumbnail renderer (falls back to emoji + gradient). */
  renderThumbnail?: (theme: GameTheme) => ReactNode;
  label?: string;
}

const THEME_INDEX = new Map<string, GameTheme>(
  SHARED_THEMES.map((t) => [t.id, t]),
);

/**
 * Shared visual-theme picker. Renders a horizontal strip of theme cards
 * driven by `SHARED_THEMES` (plus optional game-specific extra options).
 * New games get a theme picker for free by passing `allowedThemes`.
 */
export function GameThemePicker({
  selectedTheme,
  onSelect,
  allowedThemes,
  showComingSoon = false,
  options,
  className,
  renderThumbnail,
  label,
}: GameThemePickerProps) {
  const { t } = useTranslation();

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
    if (option.nameKey?.startsWith('games.')) {
      return t(option.nameKey as TranslationKey) || option.nameKey;
    }
    return option.nameKey ?? option.id;
  };

  const resolveDescription = (
    option: GameThemePickerOption,
  ): string | undefined => {
    if (!option.descriptionKey) return undefined;
    if (option.descriptionKey.startsWith('games.')) {
      return (
        t(option.descriptionKey as TranslationKey) || option.descriptionKey
      );
    }
    return option.descriptionKey;
  };

  return (
    <div className={cx('flex flex-col gap-3', className)}>
      {label ? (
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {label}
        </span>
      ) : null}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        role="radiogroup"
        aria-label={label ?? 'Theme'}
      >
        {visible.map((option) => {
          const theme = THEME_INDEX.get(option.id);
          const active = selectedTheme === option.id;
          const disabled =
            option.disabled || (showComingSoon && !theme) || false;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              data-testid={`theme-${option.id}`}
              onClick={() => onSelect(option.id)}
              className={cx(
                'relative flex min-w-[120px] flex-col gap-2 rounded-2xl border p-3 text-left transition-all duration-200',
                active
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]/40'
                  : 'border-[var(--borderColor)] bg-[var(--glassBg)] hover:border-[var(--primary)]/60',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              )}
            >
              <div className="flex h-16 w-full items-center justify-center overflow-hidden rounded-xl text-3xl">
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
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {resolveName(option)}
                </span>
                {resolveDescription(option) ? (
                  <span className="text-xs text-[var(--textSecondary)]">
                    {resolveDescription(option)}
                  </span>
                ) : null}
              </div>
              {active ? (
                <span
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primaryForeground,white)]"
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
