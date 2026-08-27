'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@arcadeum/ui';
import type { ButtonProps } from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useRoutes } from '@/shared/config/useRoutes';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  AI_VS_AI_DEFAULT_DELAY_MS,
  AI_VS_AI_DELAYS,
} from '@/features/games/lib/aiVsAi';

interface Props {
  gameId: string;
  variant?: string;
  theme?: string;
  buttonVariant?: ButtonProps['variant'];
  disabled?: boolean;
}

/**
 * One-click "Watch AI vs AI" entry point. Creates an auto-starting room
 * where two expert bots play each other, then routes the user into it as a
 * spectator (`?mode=watch`).
 */
export function AIvsAIViewer({
  gameId,
  variant,
  theme,
  buttonVariant = 'victory',
  disabled = false,
}: Props) {
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [delay, setDelay] = useState<number>(AI_VS_AI_DEFAULT_DELAY_MS);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleClick = async () => {
    if (disabled) return;
    setErrored(false);
    setLoading(true);
    try {
      const { room } = await gamesApi.createAiVsAi(
        gameId,
        { variant, theme, aiMoveDelayMs: delay },
        { token: snapshot.accessToken || undefined },
      );
      router.push(`${routes.gameRoom(room.id)}?mode=watch`);
    } catch (err) {
      console.warn('AI vs AI create failed:', err);
      setErrored(true);
      setLoading(false);
    }
  };

  const label = errored
    ? t('games.aiVsAi.error') || "Couldn't start — try again"
    : t('games.aiVsAi.watchCta') || 'Watch AI vs AI';

  return (
    <div className="box-border flex flex-wrap items-center gap-3">
      <Button
        variant={errored ? 'danger' : buttonVariant}
        size="lg"
        onClick={handleClick}
        loading={loading}
        disabled={disabled}
        aria-live="polite"
        data-testid="ai-vs-ai-button"
      >
        {label}
      </Button>

      <div
        className="box-border flex items-center gap-1.5"
        role="group"
        aria-label={t('games.aiVsAi.delayLabel') || 'Move delay'}
      >
        {AI_VS_AI_DELAYS.map((d) => {
          const active = delay === d;
          return (
            <Button
              key={d}
              variant={active ? 'primary' : 'outline'}
              size="sm"
              active={active}
              aria-pressed={active}
              onClick={() => setDelay(d)}
              data-testid={`ai-vs-ai-delay-${d}`}
            >
              {d / 1000}s
            </Button>
          );
        })}
      </div>
    </div>
  );
}
