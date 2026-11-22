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
    <CenterSection className="w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--surface)]/70 backdrop-blur-md p-5 shadow-sm motion-safe:[animation:slideIn_0.4s_ease-out_both]">
      <GameIcon className="motion-safe:[animation:float_3s_ease-in-out_infinite] !text-[56px] !leading-[64px] max-[800px]:!text-[40px] max-[800px]:!leading-[48px]">
        {gameIcon}
      </GameIcon>
      <div
        data-game={gameName}
        data-variant={variantName}
        className="flex flex-col items-center gap-1"
      >
        <LobbyTitle className="!text-[22px] max-[800px]:!text-[18px]">
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
        <div
          role="progressbar"
          aria-label={playersLabel}
          aria-valuemin={0}
          aria-valuemax={maxPlayers}
          aria-valuenow={playerCount}
        >
          <ProgressBar>
            <ProgressFill width={`${progress}%`} />
          </ProgressBar>
        </div>
      </ProgressWrapper>

      {roomStatus === 'lobby' && playerCount < maxPlayers && (
        <div className="flex flex-col items-center gap-2 pt-1 w-full max-w-xs">
          <button
            type="button"
            onClick={onToggleQueue}
            className={`w-full min-h-[44px] rounded-xl px-5 py-3 text-sm font-semibold transition-all motion-reduce:transition-none active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] ${
              isQueued
                ? 'border border-[var(--borderColor)] bg-transparent text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)]'
                : 'bg-[var(--primary)] text-[var(--primaryText)] shadow-md hover:opacity-90'
            }`}
          >
            {isQueued ? cancelQueueLabel : findOpponentLabel}
          </button>
          <span className="text-xs text-[var(--textSecondary)] text-center">
            {isQueued ? queueSearchingSubtitle : findOpponentHint}
          </span>
        </div>
      )}
    </CenterSection>
  );
}
