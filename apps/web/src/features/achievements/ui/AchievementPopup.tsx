'use client';

import { useEffect, useState } from 'react';
import { TrophyIcon } from '@arcadeum/ui';
import type { AchievementPopupLabels } from '@/shared/i18n/messages/pages/achievements/en';
import { getRarityStyle } from '../lib/rarity';
import {
  useAchievementsPopupStore,
  type PopupAchievement,
} from '../store/achievementsPopupStore';

const AUTO_DISMISS_MS = 6000;

interface PopupCardProps {
  item: PopupAchievement;
  labels: AchievementPopupLabels;
}

function PopupCard({ item, labels }: PopupCardProps) {
  const dismiss = useAchievementsPopupStore((s) => s.dismiss);
  const [entered, setEntered] = useState(false);
  const rarity = getRarityStyle(item.rarity);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const timer = setTimeout(
      () => dismiss(item.achievementId),
      AUTO_DISMISS_MS,
    );
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [item.achievementId, dismiss]);

  return (
    <div
      data-testid={`achievement-popup-${item.achievementId}`}
      className={`pointer-events-auto flex w-[320px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border bg-[var(--glassBg)] p-4 backdrop-blur-md transition-all duration-300 ease-out ${
        entered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      style={{
        borderColor: rarity.border,
        boxShadow: `0 8px 32px ${rarity.glow}`,
      }}
    >
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: rarity.glow, color: rarity.text }}
      >
        <TrophyIcon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[11px] font-semibold uppercase tracking-[2px]"
          style={{ color: rarity.text }}
        >
          {labels.title}
        </p>
        <p className="truncate text-[15px] font-semibold">{item.name}</p>
        <p className="text-[13px] opacity-70">
          +{item.xpReward} {labels.xp}
        </p>
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.achievementId)}
        aria-label={labels.dismiss}
        data-testid={`achievement-popup-dismiss-${item.achievementId}`}
        className="shrink-0 rounded-lg px-1.5 py-0.5 text-[18px] leading-none opacity-60 transition-opacity hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

interface AchievementPopupProps {
  labels: AchievementPopupLabels;
}

export function AchievementPopup({ labels }: AchievementPopupProps) {
  const queue = useAchievementsPopupStore((s) => s.queue);
  if (queue.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[900] flex flex-col gap-3"
    >
      {queue.map((item) => (
        <PopupCard key={item.achievementId} item={item} labels={labels} />
      ))}
    </div>
  );
}
