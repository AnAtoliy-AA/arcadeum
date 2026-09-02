'use client';

import React, { useState } from 'react';
import type { GameRoomSummary } from '@/shared/types/games';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import {
  HostControls,
  HostLabel,
  BotCountSelector,
  BotCountLabel,
  BotCountButtons,
  BotCountButton,
} from './lobbyStyles';
import { LobbySidebar } from './LobbySidebar';
import { HouseRulesSection } from './HouseRulesSection';

interface LobbyMobileSidebarProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  minPlayers: number;
  maxPlayers: number;
  isFastMode?: boolean;
  showReorderControls: boolean;
  showInvitedPlayers: boolean;
  members: Required<GameRoomSummary>['members'];
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onLeaveRoom?: () => void;
  deleteRoomLabel: string;
  extraPlayersCardSlot?: React.ReactNode;
  onRefresh?: () => void;
  optionsSlot?: React.ReactNode;
  ruleComingSoon?: Map<string, boolean>;
  onRuleComingSoonChange?: (map: Map<string, boolean>) => void;
  enableBots?: boolean;
  showDifficulty?: boolean;
  botCount: number;
  setBotCount: (count: number) => void;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  setDifficulty: (d: 'easy' | 'medium' | 'hard' | 'expert') => void;
  labels: {
    hostControlsLabel?: string;
    botCountLabel?: string;
    difficultyLabel?: string;
    difficultyEasyLabel?: string;
    difficultyMediumLabel?: string;
    difficultyHardLabel?: string;
    difficultyExpertLabel?: string;
    playersLabel?: string;
    invitedPlayersLabel?: string;
    declinedLabel?: string;
    reinviteLabel?: string;
    roomInfoLabel?: string;
    statusLabel?: string;
    visibilityLabel?: string;
    visibilityPublicLabel?: string;
    visibilityPrivateLabel?: string;
    inviteCodeLabel?: string;
    waitingForPlayerLabel?: string;
    fastRoomLabel?: string;
    deleteRoomLabel?: string;
    kickPlayerLabel?: string;
    leaveRoomLabel?: string;
    notesLabel?: string;
  };
}

export function LobbyMobileSidebar({
  room,
  userId,
  isHost,
  minPlayers,
  maxPlayers,
  isFastMode,
  showReorderControls,
  showInvitedPlayers,
  members,
  onReorderPlayers,
  onReinvite,
  onDeleteRoom,
  onKickPlayer,
  onLeaveRoom,
  deleteRoomLabel,
  extraPlayersCardSlot,
  onRefresh,
  optionsSlot,
  ruleComingSoon,
  enableBots = false,
  showDifficulty = true,
  botCount,
  setBotCount,
  difficulty,
  setDifficulty,
  labels,
}: LobbyMobileSidebarProps) {
  const { setOption } = useRoomOptions({ roomId: room.id, userId });
  const [showOptions, setShowOptions] = useState(false);

  const {
    hostControlsLabel = 'Host Controls',
    botCountLabel = 'Number of bots',
    difficultyLabel = 'AI Difficulty',
    difficultyEasyLabel = 'Easy',
    difficultyMediumLabel = 'Medium',
    difficultyHardLabel = 'Hard',
    difficultyExpertLabel = 'Expert',
  } = labels;

  return (
    <div className="hidden max-[1023px]:flex flex-col gap-3 w-full min-w-0 order-1">
      {/* Compact status bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[rgba(99,102,241,0.08)] rounded-xl border border-[rgba(99,102,241,0.12)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] text-[var(--textSecondary)]">
            {room.playerCount}/{maxPlayers} players
          </span>
          {room.playerCount < minPlayers && (
            <span className="text-[11px] text-[#f59e0b] font-medium">
              Need {minPlayers - room.playerCount} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isHost && room.status === 'lobby' && (
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-[var(--glassBg)] border border-[var(--borderColor)] text-[var(--color)] hover:border-[var(--primary)]/50 transition-colors"
            >
              <span>⚙</span>
              <span>{showOptions ? 'Hide' : 'Settings'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Player list (most important info first on mobile) */}
      <LobbySidebar
        room={room}
        isHost={isHost}
        minPlayers={minPlayers}
        isFastMode={isFastMode}
        showReorderControls={showReorderControls}
        showInvitedPlayers={showInvitedPlayers}
        members={members}
        onReorderPlayers={onReorderPlayers}
        onReinvite={onReinvite}
        onDeleteRoom={isHost ? onDeleteRoom : undefined}
        onKickPlayer={isHost ? onKickPlayer : undefined}
        onLeaveRoom={!isHost ? onLeaveRoom : undefined}
        deleteRoomLabel={deleteRoomLabel}
        extraPlayersCardSlot={extraPlayersCardSlot}
        onRefresh={onRefresh}
        labels={labels}
      />

      {/* Collapsible options on mobile */}
      {showOptions && isHost && room.status === 'lobby' && (
        <div className="flex flex-col gap-3 px-1">
          {enableBots && room.playerCount === 1 && (
            <HostControls className="max-[800px]:p-3 max-[800px]:gap-3">
              <HostLabel>{hostControlsLabel}</HostLabel>
              <BotCountSelector className="max-[800px]:mb-1">
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
              {showDifficulty && (
                <BotCountSelector className="max-[800px]:mb-0">
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
                        { key: 'hard', label: difficultyHardLabel || 'Hard' },
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
            </HostControls>
          )}
          {optionsSlot}
          <HouseRulesSection
            room={room}
            ruleComingSoon={ruleComingSoon ?? new Map()}
            onSetOption={setOption}
          />
        </div>
      )}

      {/* Host controls without options (non-host or bots not enabled) */}
      {!showOptions &&
        isHost &&
        room.status === 'lobby' &&
        enableBots &&
        room.playerCount === 1 && (
          <HostControls className="max-[800px]:p-3 max-[800px]:gap-3">
            <HostLabel>{hostControlsLabel}</HostLabel>
            <BotCountSelector className="max-[800px]:mb-1">
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
            {showDifficulty && (
              <BotCountSelector className="max-[800px]:mb-0">
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
                      { key: 'hard', label: difficultyHardLabel || 'Hard' },
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
          </HostControls>
        )}
    </div>
  );
}
