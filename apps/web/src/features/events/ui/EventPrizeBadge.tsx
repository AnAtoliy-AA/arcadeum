'use client';

import { useMemo } from 'react';
import { getEventPrizeBadge, type BadgeRarity } from '../lib/eventBadges';

function BadgeIcon({ type }: { type: string }) {
  switch (type) {
    case 'anchor':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <circle cx="12" cy="5" r="3" />
          <line x1="12" y1="22" x2="12" y2="8" />
          <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        </svg>
      );
    case 'crown':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z" />
        </svg>
      );
    case 'dice':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'crest':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'stone':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <circle cx="12" cy="12" r="10" />
          <path
            d="M12 2a10 10 0 0 0 0 20c2.5 0 4-2 4-5s-1.5-5 0-5 6-2 6-5a5 5 0 0 0-10-5z"
            fill="currentColor"
            opacity="0.3"
          />
        </svg>
      );
    case 'spade':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M12 2C9 6 4 10 4 14a6 6 0 0 0 11 3.5v2.5H9v2h6v-2h-1v-2.5A6 6 0 0 0 20 14c0-4-5-8-8-12z" />
        </svg>
      );
    case 'heart':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case 'lightning':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'fang':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.5 9 8 9.8V14l-3-3 3-3V2zm2 0v6l3 3-3 3v7.8c4.5-.8 8-4.8 8-9.8 0-5.5-4.5-10-8-10z" />
        </svg>
      );
    case 'gem':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <polygon points="6 3 18 3 22 9 12 22 2 9" />
          <line x1="2" y1="9" x2="22" y2="9" />
          <line x1="12" y1="22" x2="6" y2="9" />
          <line x1="12" y1="22" x2="18" y2="9" />
        </svg>
      );
    case 'bomb':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <circle cx="11" cy="13" r="8" />
          <path d="M14.5 9.5L19 5" />
          <path d="M17 3l4 4" />
          <circle cx="8.5" cy="11.5" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'ace':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <polygon points="12 8 9 14 15 14" />
        </svg>
      );
    case 'grid':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <circle cx="12" cy="12" r="9" />
          <polygon
            points="12 6 14 10 18 10 15 13 16 17 12 14 8 17 9 13 6 10 10 10"
            fill="currentColor"
          />
        </svg>
      );
  }
}

function getRarityStyle(rarity: BadgeRarity): {
  badgeClass: string;
  textClass: string;
} {
  switch (rarity) {
    case 'legendary':
      return {
        badgeClass: 'bg-amber-400/20 border-amber-400/50 text-amber-300',
        textClass: 'text-amber-300',
      };
    case 'epic':
      return {
        badgeClass: 'bg-purple-400/20 border-purple-400/50 text-purple-300',
        textClass: 'text-purple-300',
      };
    case 'rare':
      return {
        badgeClass: 'bg-cyan-400/20 border-cyan-400/50 text-cyan-300',
        textClass: 'text-cyan-300',
      };
    default:
      return {
        badgeClass: 'bg-slate-400/20 border-slate-400/40 text-slate-300',
        textClass: 'text-slate-300',
      };
  }
}

export function EventPrizeBadge({
  badgeId,
  variant = 'showcase',
  className = '',
}: {
  badgeId: string | null | undefined;
  variant?: 'showcase' | 'chip' | 'medallion';
  className?: string;
}) {
  const badge = useMemo(() => getEventPrizeBadge(badgeId), [badgeId]);

  if (!badgeId) return null;

  const fallbackName = badgeId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const displayName = badge?.name ?? fallbackName;
  const description =
    badge?.description ?? 'Exclusive community event reward badge.';
  const rarity: BadgeRarity = badge?.rarity ?? 'rare';
  const rarityStyle = getRarityStyle(rarity);
  const gradient =
    badge?.gradient ?? 'from-amber-400 via-yellow-500 to-amber-600';
  const iconType = badge?.iconType ?? 'medallion';

  if (variant === 'medallion') {
    return (
      <div
        className={`relative group flex items-center justify-center ${className}`}
        data-testid={`badge-medallion-${badgeId}`}
      >
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 shadow-lg flex items-center justify-center transform transition-transform group-hover:scale-110 duration-200`}
        >
          <div className="w-full h-full rounded-[14px] bg-[var(--glassBg)] flex items-center justify-center p-2 text-color">
            <BadgeIcon type={iconType} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'chip') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] text-xs font-bold text-color shadow-sm ${className}`}
        data-testid={`badge-chip-${badgeId}`}
      >
        <span className={`w-4 h-4 text-amber-400 shrink-0`}>
          <BadgeIcon type={iconType} />
        </span>
        <span className="truncate">{displayName}</span>
        <span
          className={`px-1.5 py-0.2 rounded-md text-[10px] uppercase font-extrabold border ${rarityStyle.badgeClass}`}
        >
          {rarity}
        </span>
      </span>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-4 md:p-5 backdrop-blur-md shadow-md flex items-center gap-4 transition-all duration-300 hover:border-[var(--primary)]/50 ${className}`}
      data-testid={`badge-showcase-${badgeId}`}
    >
      <div className="relative shrink-0">
        <div
          className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 shadow-xl flex items-center justify-center`}
        >
          <div className="w-full h-full rounded-[14px] bg-[var(--glassBg)] flex items-center justify-center p-3 text-color">
            <BadgeIcon type={iconType} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm md:text-base font-extrabold text-color m-0 truncate">
            {displayName}
          </h4>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${rarityStyle.badgeClass}`}
          >
            {rarity}
          </span>
        </div>
        <p className="text-xs text-[var(--textSecondary)] m-0 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
