'use client';

import { useState, useRef, useEffect } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import type { GamesParticipationFilter } from '../types';
import { UsersIcon, CrownIcon, GamepadIcon, EyeIcon } from './FilterIcons';
import { cx } from '@arcadeum/ui/utils/cx';

export interface ParticipationMenuProps {
  value: GamesParticipationFilter;
  onChange: (value: GamesParticipationFilter) => void;
  canFilter: boolean;
}

const PARTICIPATION_OPTIONS = [
  {
    id: 'all' as const,
    key: 'games.lounge.filters.participation.all',
    icon: UsersIcon,
  },
  {
    id: 'hosting' as const,
    key: 'games.lounge.filters.participation.hosting',
    icon: CrownIcon,
  },
  {
    id: 'joined' as const,
    key: 'games.lounge.filters.participation.joined',
    icon: GamepadIcon,
  },
  {
    id: 'not_joined' as const,
    key: 'games.lounge.filters.participation.not_joined',
    icon: EyeIcon,
  },
];

export function ParticipationMenu({
  value,
  onChange,
  canFilter,
}: ParticipationMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isFiltered = value !== 'all';

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const selectedOption = PARTICIPATION_OPTIONS.find((opt) => opt.id === value);
  const selectedLabel = selectedOption
    ? t(selectedOption.key as TranslationKey) || selectedOption.id
    : t('games.lounge.filters.participationLabel');

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        data-testid="rooms-filter-toggle-advanced"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('games.lounge.filters.participationLabel')}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cx(
          'inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all select-none cursor-pointer',
          isFiltered
            ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--color)] shadow-sm'
            : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--color)]',
        )}
      >
        <UsersIcon className="h-3.5 w-3.5 text-[var(--textSecondary)]" />
        <span>{t('games.lounge.filters.participationLabel')}</span>
        {isFiltered && (
          <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.2 text-[10px] font-bold text-white">
            {selectedLabel}
          </span>
        )}
        <svg
          className={cx(
            'h-3.5 w-3.5 text-[var(--textSecondary)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[60] mt-1.5 w-56 rounded-2xl border border-[var(--glassBorderStrong)] bg-[var(--background)] p-1.5 shadow-2xl backdrop-blur-xl animate-[fadeInUp_0.15s_ease-out]">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('games.lounge.filters.participationLabel')}
          </div>
          <div className="flex flex-col gap-1">
            {PARTICIPATION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const label = t(opt.key as TranslationKey) || opt.id;
              const active = value === opt.id;
              const disabled = opt.id !== 'all' && !canFilter;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  aria-label={`Filter by participation: ${label}`}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={cx(
                    'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all select-none',
                    disabled
                      ? 'cursor-not-allowed opacity-40'
                      : active
                        ? 'bg-[var(--primary)] text-white shadow-sm cursor-pointer'
                        : 'text-[var(--color)] hover:bg-[var(--glassBgHover)] cursor-pointer',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </div>
                  {active && (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {!canFilter && (
            <div className="border-t border-[var(--glassBorder)] mt-1.5 pt-1.5 px-2 py-1 text-[10px] text-[var(--textSecondary)]">
              {t('games.create.loginRequired')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
