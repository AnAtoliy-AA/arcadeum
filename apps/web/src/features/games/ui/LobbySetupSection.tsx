'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';
import { HouseRulesSection } from './HouseRulesSection';
import { LobbyCardShell } from './LobbyCardShell';
import { LobbySegmented } from './LobbySegmented';
import type { LobbyBotDifficulty } from './ReusableGameLobby.types';

export interface LobbySetupSectionProps {
  room: GameRoomSummary;
  isHost: boolean;
  optionsSlot?: React.ReactNode;
  enableBots: boolean;
  showDifficulty: boolean;
  showHostBots: boolean;
  maxPlayers: number;
  botCount: number;
  setBotCount: (count: number) => void;
  difficulty: LobbyBotDifficulty;
  setDifficulty: (diff: LobbyBotDifficulty) => void;
  ruleComingSoon: Map<string, boolean>;
  setOption: (options: Record<string, unknown>) => void;
  /** @deprecated No longer rendered; kept so existing callers compile. */
  hostControlsLabel?: string;
  botCountLabel: string;
  difficultyLabel?: string;
  difficultyEasyLabel: string;
  difficultyMediumLabel: string;
  difficultyHardLabel: string;
  difficultyExpertLabel: string;
}

export function LobbySetupSection({
  room,
  isHost,
  optionsSlot,
  enableBots,
  showDifficulty,
  showHostBots,
  maxPlayers,
  botCount,
  setBotCount,
  difficulty,
  setDifficulty,
  ruleComingSoon,
  setOption,
  botCountLabel,
  difficultyLabel,
  difficultyEasyLabel,
  difficultyMediumLabel,
  difficultyHardLabel,
  difficultyExpertLabel,
}: LobbySetupSectionProps) {
  const { t } = useTranslation();
  const hasOptions = Boolean(optionsSlot);
  const hostInLobby = isHost && room.status === 'lobby';

  if (!hasOptions && !hostInLobby) return null;

  const difficultyItems = [
    { id: 'easy', label: difficultyEasyLabel || 'Easy' },
    { id: 'medium', label: difficultyMediumLabel || 'Medium' },
    { id: 'hard', label: difficultyHardLabel || 'Hard' },
    { id: 'expert', label: difficultyExpertLabel || 'Expert' },
  ].map((d) => ({ ...d, testId: `difficulty-${d.id}` }));
  const currentDifficultyLabel =
    difficultyItems.find((d) => d.id === difficulty)?.label ?? difficulty;
  const botItems = Array.from({ length: maxPlayers - 1 }, (_, i) => i + 1).map(
    (count) => ({
      id: String(count),
      label: String(count),
      testId: `bot-count-${count}`,
    }),
  );
  const resolvedDifficultyLabel = difficultyLabel || 'AI Difficulty';

  return (
    <div className="flex w-full flex-col items-stretch gap-4">
      {(hasOptions || hostInLobby) && (
        <LobbyCardShell
          data-testid="lobby-game-settings-card"
          icon="⚙️"
          title={t('games.lobby.gameSettings')}
        >
          {optionsSlot}
          {hostInLobby && (
            <details
              data-testid="lobby-advanced-settings"
              className="group rounded-xl border border-[var(--borderColor)] bg-[var(--backgroundHover)]"
            >
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-semibold text-[var(--textPrimary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] [&::-webkit-details-marker]:hidden">
                {t('games.lobby.advancedSettings')}
                <span
                  aria-hidden
                  className="text-xs transition-transform motion-reduce:transition-none group-open:rotate-180"
                >
                  ▼
                </span>
              </summary>
              <div className="px-4 pb-4">
                <HouseRulesSection
                  room={room}
                  ruleComingSoon={ruleComingSoon}
                  onSetOption={setOption}
                />
              </div>
            </details>
          )}
        </LobbyCardShell>
      )}

      {hostInLobby && enableBots && (
        <LobbyCardShell
          data-testid="lobby-bots-card"
          icon="🤖"
          title={t('games.lobby.botsTitle')}
          description={t('games.lobby.botsHint')}
        >
          {showHostBots && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--textSecondary)]">
                {botCountLabel}
              </span>
              <LobbySegmented
                aria-label={botCountLabel}
                items={botItems}
                value={String(botCount)}
                onChange={(id) => setBotCount(Number(id))}
              />
            </div>
          )}
          {showDifficulty && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--textSecondary)]">
                  {resolvedDifficultyLabel}
                </span>
                <span
                  data-testid="difficulty-badge"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--textPrimary)]"
                >
                  🤖 {currentDifficultyLabel}
                </span>
              </div>
              {showHostBots && (
                <LobbySegmented
                  aria-label={resolvedDifficultyLabel}
                  items={difficultyItems}
                  value={difficulty}
                  onChange={(id) => setDifficulty(id as LobbyBotDifficulty)}
                />
              )}
            </div>
          )}
        </LobbyCardShell>
      )}
    </div>
  );
}
