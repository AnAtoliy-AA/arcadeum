'use client';

import { useState, useMemo } from 'react';
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
import { BOT_PERSONALITIES } from '@arcadeum/games-core/games/chess/chess-bot-personalities';

function getPersonalityName(id?: string): string | null {
  if (!id) return null;
  const p = BOT_PERSONALITIES.find((bp) => bp.id === id);
  return p ? `${p.name} (${p.rating})` : null;
}

interface Props {
  gameId: string;
  variant?: string;
  theme?: string;
  buttonVariant?: ButtonProps['variant'];
  disabled?: boolean;
}

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
  const [whiteBot, setWhiteBot] = useState<string>('');
  const [blackBot, setBlackBot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  const isChess = gameId === 'chess_v1';
  const personalities = useMemo(
    () =>
      BOT_PERSONALITIES.map((p) => ({
        id: p.id,
        name: p.name,
        rating: p.rating,
        style: p.style,
      })),
    [],
  );

  const handleClick = async () => {
    if (disabled) return;
    setErrored(false);
    setLoading(true);
    try {
      const { room } = await gamesApi.createAiVsAi(
        gameId,
        {
          variant,
          theme,
          aiMoveDelayMs: delay,
          botPersonalityWhite: isChess ? whiteBot || undefined : undefined,
          botPersonalityBlack: isChess ? blackBot || undefined : undefined,
        },
        { token: snapshot.accessToken || undefined },
      );
      // Show which bots were selected (server resolves random picks)
      const opts = room.gameOptions as Record<string, unknown> | undefined;
      const wName = getPersonalityName(opts?.botPersonalityWhite as string);
      const bName = getPersonalityName(opts?.botPersonalityBlack as string);
      if (wName || bName) {
        console.log(`AI vs AI: ${wName ?? 'Random'} (white) vs ${bName ?? 'Random'} (black)`);
      }
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
    <div className="box-border flex flex-col gap-3">
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

      {isChess && personalities.length > 0 && (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
          <div className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider">
            Bot Personalities
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] text-[var(--textSecondary)]">
                White ♔
              </label>
              <select
                value={whiteBot}
                onChange={(e) => setWhiteBot(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--glassBorder)] text-[var(--color)] text-xs"
              >
                <option value="">Random</option>
                {personalities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.rating}) — {p.style}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] text-[var(--textSecondary)]">
                Black ♚
              </label>
              <select
                value={blackBot}
                onChange={(e) => setBlackBot(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--glassBorder)] text-[var(--color)] text-xs"
              >
                <option value="">Random</option>
                {personalities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.rating}) — {p.style}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
