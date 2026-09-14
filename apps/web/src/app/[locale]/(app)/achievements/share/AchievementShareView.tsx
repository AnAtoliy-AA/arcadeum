'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@arcadeum/ui';
import { shareLink } from '@/shared/lib/share';
import { useLocale } from '@/shared/config/useRoutes';
import { getRarityStyle } from '@/features/achievements/lib/rarity';

interface AchievementShareViewProps {
  name: string;
  rarity: string;
  game?: string;
}

export function AchievementShareView({
  name,
  rarity,
  game,
}: AchievementShareViewProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rarityStyle = getRarityStyle(rarity);

  const handleShare = useCallback(async () => {
    const params = new URLSearchParams({ name, rarity });
    if (game) params.set('game', game);
    const url = `${window.location.origin}/${locale}/achievements/share?${params.toString()}`;

    const success = await shareLink({
      title: `${name} — Arcadeum Games`,
      text: `I unlocked the "${name}" achievement (${rarity}) on Arcadeum Games!`,
      url,
      event: 'achievement.shared',
    });

    if (success) {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 3000);
    }
  }, [name, rarity, game, locale]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] p-4">
      <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-8 text-center backdrop-blur-md">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-2xl text-5xl"
          style={{ backgroundColor: rarityStyle.glow }}
        >
          🏆
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--textSecondary)]">
            Achievement Unlocked
          </span>
          <h1 className="text-3xl font-bold">{name}</h1>
          {game && (
            <span className="text-sm text-[var(--textSecondary)]">{game}</span>
          )}
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase"
            style={{
              color: rarityStyle.text,
              border: `1px solid ${rarityStyle.border}`,
            }}
          >
            {rarity}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleShare}
          className="w-full"
        >
          {copied ? '✓ Copied!' : '🔗 Share Achievement'}
        </Button>
      </div>
    </div>
  );
}
