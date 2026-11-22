'use client';

import React from 'react';
import type { GameRoomSummary } from '@/shared/types/games';
import {
  HostControls,
  HostLabel,
  BotCountSelector,
  BotCountLabel,
  BotCountButtons,
  BotCountButton,
} from './lobbyStyles';
import { HouseRulesSection } from './HouseRulesSection';

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
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  setDifficulty: (diff: 'easy' | 'medium' | 'hard' | 'expert') => void;
  ruleComingSoon: Map<string, boolean>;
  setOption: (options: Record<string, unknown>) => void;
  hostControlsLabel: string;
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
  hostControlsLabel,
  botCountLabel,
  difficultyLabel,
  difficultyEasyLabel,
  difficultyMediumLabel,
  difficultyHardLabel,
  difficultyExpertLabel,
}: LobbySetupSectionProps) {
  const hasOptions = Boolean(optionsSlot);
  const showBotsSection = isHost && room.status === 'lobby' && showHostBots;

  if (!hasOptions && !showBotsSection && !(isHost && room.status === 'lobby')) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch gap-4 w-full">
      {hasOptions && (
        <div
          data-testid="lobby-game-settings-card"
          className="rounded-2xl border border-[var(--glassBorder)] bg-[var(--surface)]/70 backdrop-blur-md p-5 shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--borderColor)]">
            <span className="text-base">⚙️</span>
            <span className="text-sm font-bold uppercase tracking-wider text-[var(--textPrimary)]">
              Game Setup
            </span>
          </div>
          {optionsSlot}
        </div>
      )}

      {isHost && room.status === 'lobby' && (
        <HostControls className="w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--surface)]/70 backdrop-blur-md p-5">
          <HostLabel>{hostControlsLabel}</HostLabel>
          {showHostBots && (
            <BotCountSelector>
              <BotCountLabel>{botCountLabel}</BotCountLabel>
              <BotCountButtons>
                {Array.from({ length: maxPlayers - 1 }, (_, i) => i + 1).map(
                  (count) => (
                    <BotCountButton
                      key={count}
                      data-testid={`bot-count-${count}`}
                      active={botCount === count}
                      onClick={() => setBotCount(count)}
                    >
                      {count}
                    </BotCountButton>
                  ),
                )}
              </BotCountButtons>
            </BotCountSelector>
          )}
          {showHostBots && showDifficulty && (
            <BotCountSelector>
              <BotCountLabel>
                {difficultyLabel || 'AI Difficulty'}
              </BotCountLabel>
              <BotCountButtons>
                {(
                  [
                    { key: 'easy', label: difficultyEasyLabel || 'Easy' },
                    {
                      key: 'medium',
                      label: difficultyMediumLabel || 'Medium',
                    },
                    {
                      key: 'hard',
                      label: difficultyHardLabel || 'Hard',
                    },
                    {
                      key: 'expert',
                      label: difficultyExpertLabel || 'Expert',
                    },
                  ] as const
                ).map((d) => (
                  <BotCountButton
                    key={d.key}
                    data-testid={`difficulty-${d.key}`}
                    active={difficulty === d.key}
                    onClick={() => setDifficulty(d.key)}
                  >
                    {d.label}
                  </BotCountButton>
                ))}
              </BotCountButtons>
            </BotCountSelector>
          )}
          {enableBots && showDifficulty && (
            <span
              data-testid="difficulty-badge"
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.12)] px-3 py-1 text-[12px] font-semibold text-[#a5b4fc]"
            >
              🤖{' '}
              {difficulty === 'easy'
                ? difficultyEasyLabel || 'Easy'
                : difficulty === 'hard'
                  ? difficultyHardLabel || 'Hard'
                  : difficulty === 'expert'
                    ? difficultyExpertLabel || 'Expert'
                    : difficultyMediumLabel || 'Medium'}
            </span>
          )}
        </HostControls>
      )}

      {isHost && room.status === 'lobby' && (
        <div className="w-full">
          <HouseRulesSection
            room={room}
            ruleComingSoon={ruleComingSoon}
            onSetOption={setOption}
          />
        </div>
      )}
    </div>
  );
}
