'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@arcadeum/ui';
import { shareLink } from '@/shared/lib/share';
import { useLocale } from '@/shared/config/useRoutes';

interface AchievementShareButtonProps {
  achievementId: string;
  name: string;
  rarity: string;
  gameName?: string;
  size?: 'sm' | 'md';
}

export function AchievementShareButton({
  achievementId,
  name,
  rarity,
  gameName,
  size = 'sm',
}: AchievementShareButtonProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShare = useCallback(async () => {
    const params = new URLSearchParams({
      achievement: achievementId,
      name,
      rarity,
      ...(gameName ? { game: gameName } : {}),
    });
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
  }, [achievementId, name, rarity, gameName, locale]);

  return (
    <Button
      variant="glass"
      size={size}
      onClick={handleShare}
      data-testid="share-achievement-button"
    >
      {copied ? '✓ Copied!' : '🔗 Share'}
    </Button>
  );
}
