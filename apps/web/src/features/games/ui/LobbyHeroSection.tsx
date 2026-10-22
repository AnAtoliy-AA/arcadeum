'use client';

import React from 'react';
import {
  CenterSection,
  GameIcon,
  LobbyTitle,
  LobbySubtitle,
  ProgressWrapper,
  ProgressLabel,
  ProgressBar,
  ProgressFill,
} from './lobbyStyles';

export interface LobbyHeroSectionProps {
  gameName: string;
  gameIcon?: React.ReactNode;
  variantName?: string;
  waitingLabel: string;
  subtitleText?: string;
  defaultSubtitle: string;
  playersLabel: string;
  playerCount: number;
  maxPlayers: number;
  progress: number;
  roomStatus: string;
  isQueued: boolean;
  onToggleQueue: () => void;
  findOpponentLabel: string;
  cancelQueueLabel: string;
  queueSearchingSubtitle: string;
  findOpponentHint: string;
}

export function LobbyHeroSection({
  gameName,
  gameIcon,
  variantName,
  waitingLabel,
  subtitleText,
  defaultSubtitle,
  playersLabel,
  playerCount,
  maxPlayers,
  progress,
  roomStatus,
  isQueued,
  onToggleQueue,
  findOpponentLabel,
  cancelQueueLabel,
  queueSearchingSubtitle,
  findOpponentHint,
}: LobbyHeroSectionProps) {
  return (
    <CenterSection className="w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--surface)]/70 backdrop-blur-md p-6 shadow-sm [animation:slideIn_0.5s_ease-out_both]">
      <GameIcon className="[animation:float_3s_ease-in-out_infinite]">
        {gameIcon}
      </GameIcon>
      <div
        data-game={gameName}
        data-variant={variantName}
        className="flex flex-col items-center gap-1"
      >
        <LobbyTitle className="[animation:slideIn_0.5s_ease-out_0.15s_both]">
          {waitingLabel}
        </LobbyTitle>
        <LobbySubtitle>{subtitleText || defaultSubtitle}</LobbySubtitle>
      </div>

      <ProgressWrapper className="w-full max-w-sm">
        <ProgressLabel>
          <span className="text-xs font-semibold text-[var(--textSecondary)]">
            {playersLabel}
          </span>
          <span className="text-xs font-bold text-[var(--textPrimary)]">
            {playerCount} / {maxPlayers}
          </span>
        </ProgressLabel>
        <ProgressBar>
          <ProgressFill width={`${progress}%`} />
        </ProgressBar>
      </ProgressWrapper>

      {roomStatus === 'lobby' && playerCount < maxPlayers && (
        <div className="flex flex-col items-center gap-2 pt-1 w-full max-w-xs">
          <button
            type="button"
            onClick={onToggleQueue}
            className={`w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
              isQueued
                ? 'border border-[var(--borderColor)] bg-transparent text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)]'
                : 'bg-[var(--primary)] text-[var(--primaryText)] shadow-md hover:opacity-90'
            }`}
          >
            {isQueued ? cancelQueueLabel : findOpponentLabel}
          </button>
          <span className="text-[11px] text-[var(--textSecondary)] text-center">
            {isQueued ? queueSearchingSubtitle : findOpponentHint}
          </span>
        </div>
      )}
    </CenterSection>
  );
}
