'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { GameRoomSummary } from '@/shared/types/games';
import { Button, RefreshIcon } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  LobbyCard,
  CardTitle,
  PlayerList,
  PlayerItem,
  PlayerInfo,
  LobbyPlayerName,
  CardHeader,
  RefreshButton,
} from './lobbyStyles';
import { SortablePlayerItem } from './SortablePlayerItem';
import { InGameAvatar } from './InGameAvatar';
import { LobbyMemberChips } from './LobbyChips';

export interface LobbySidebarPlayersProps {
  room: GameRoomSummary;
  isHost: boolean;
  minPlayers: number;
  members: Required<GameRoomSummary>['members'];
  showReorderControls: boolean;
  canAddBots: boolean;
  canRemoveBots: boolean;
  playersLabel: string;
  waitingForPlayerLabel: string;
  onReorderPlayers?: (newOrder: string[]) => void;
  onKickPlayer?: (userId: string) => void;
  onRequestKick: (target: { id: string; name: string }) => void;
  onRefresh?: () => void;
  onAddBot?: () => void;
  onRemoveBot?: (botId: string) => void;
  userId?: string;
  /** Host-only: jump to the invite picker from an empty seat. */
  onInvite?: () => void;
}

export function LobbySidebarPlayers({
  room,
  isHost,
  minPlayers,
  members,
  showReorderControls,
  canAddBots,
  canRemoveBots,
  playersLabel,
  waitingForPlayerLabel,
  onReorderPlayers,
  onKickPlayer,
  onRequestKick,
  onRefresh,
  onAddBot,
  onRemoveBot,
  userId,
  onInvite,
}: LobbySidebarPlayersProps) {
  const { t } = useTranslation();
  const maxPlayers = room.maxPlayers ?? 5;
  const emptySeats = Math.min(
    Math.max(0, maxPlayers - members.length),
    Math.max(0, Math.max(minPlayers, 8) - members.length),
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = members.findIndex((m) => m.id === active.id);
      const newIndex = members.findIndex((m) => m.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(members, oldIndex, newIndex).map(
          (m) => m.id,
        );
        onReorderPlayers?.(newOrder);
      }
    }
  };

  return (
    <LobbyCard>
      <CardHeader>
        <CardTitle data-testid="player-count-heading">
          {playersLabel} ({room.playerCount}/{maxPlayers})
        </CardTitle>
        <div className="flex items-center gap-1.5">
          {onRefresh && (
            <RefreshButton
              onClick={onRefresh}
              title={t('games.lobby.refreshRoom')}
              aria-label={t('games.lobby.refreshRoom')}
              data-testid="refresh-room-button"
            >
              <RefreshIcon size={16} />
            </RefreshButton>
          )}
        </div>
      </CardHeader>
      <PlayerList>
        {showReorderControls && isHost ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={members.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {members.map((member, index) => {
                const isBot = member.id.startsWith('bot-');
                return (
                  <SortablePlayerItem
                    key={member.id}
                    member={member}
                    isHost={isHost}
                    isRoomHost={member.id === room.hostId}
                    index={index}
                    totalCount={members.length}
                    onMoveUp={() => {
                      const newOrder = arrayMove(members, index, index - 1).map(
                        (m) => m.id,
                      );
                      onReorderPlayers?.(newOrder);
                    }}
                    onMoveDown={() => {
                      const newOrder = arrayMove(members, index, index + 1).map(
                        (m) => m.id,
                      );
                      onReorderPlayers?.(newOrder);
                    }}
                    onKick={
                      isBot && canRemoveBots && onRemoveBot
                        ? () => onRemoveBot(member.id)
                        : onKickPlayer && member.id !== room.hostId
                          ? () =>
                              onRequestKick({
                                id: member.id,
                                name: member.displayName,
                              })
                          : undefined
                    }
                    isBot={isBot}
                    isYou={!!userId && member.id === userId}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        ) : (
          members.map((member) => {
            const isRoomHost = member.id === room.hostId;
            const isBot = member.id.startsWith('bot-');
            return (
              <PlayerItem key={member.id} isHost={isRoomHost}>
                <InGameAvatar
                  playerId={member.id}
                  name={member.displayName}
                  size="sm"
                />
                <PlayerInfo>
                  <div className="flex flex-row flex-wrap items-center gap-1.5 min-w-0">
                    <LobbyPlayerName
                      className="break-words"
                      title={member.displayName}
                    >
                      {member.displayName}
                    </LobbyPlayerName>
                    <LobbyMemberChips
                      isRoomHost={isRoomHost}
                      isBot={isBot}
                      isYou={!!userId && member.id === userId}
                    />
                  </div>
                </PlayerInfo>
                {isBot && canRemoveBots && onRemoveBot ? (
                  <Button
                    className="min-h-[44px] min-w-[44px] shrink-0 ml-auto"
                    variant="danger"
                    ghost
                    size="sm"
                    onClick={() => onRemoveBot(member.id)}
                    aria-label={t('games.lobby.removeBot')}
                    data-testid={`remove-bot-${member.id}`}
                  >
                    ✕
                  </Button>
                ) : onKickPlayer && !isRoomHost ? (
                  <Button
                    className="min-h-[44px] min-w-[44px] shrink-0 ml-auto"
                    variant="danger"
                    ghost
                    size="sm"
                    aria-label={`${t('games.lobby.kickPlayer')}: ${member.displayName}`}
                    onClick={() =>
                      onRequestKick({
                        id: member.id,
                        name: member.displayName,
                      })
                    }
                  >
                    ✕
                  </Button>
                ) : null}
              </PlayerItem>
            );
          })
        )}
        {Array.from({ length: emptySeats }).map((_, i) => (
          <div
            key={`empty-${i}`}
            data-testid="lobby-empty-slot"
            className="flex flex-row flex-wrap items-center gap-2.5 rounded-[10px] border border-dashed border-[var(--borderColor)] p-2"
          >
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--borderColor)] text-sm text-[var(--textSecondary)]"
            >
              +
            </span>
            <span className="min-w-0 flex-1 text-sm text-[var(--textSecondary)]">
              {i === 0 && waitingForPlayerLabel
                ? waitingForPlayerLabel
                : t('games.lobby.emptySlot')}
            </span>
            {isHost && (onInvite || (canAddBots && onAddBot)) && (
              <div className="flex shrink-0 items-center gap-1.5">
                {canAddBots && onAddBot && (
                  <Button
                    className="min-h-[44px] px-3 text-xs font-semibold"
                    variant="outline"
                    size="sm"
                    onClick={onAddBot}
                    data-testid={
                      i === 0 ? 'add-bot-button' : `add-bot-slot-${i}`
                    }
                  >
                    🤖 {t('games.lobby.addBot')}
                  </Button>
                )}
                {onInvite && (
                  <Button
                    className="min-h-[44px] px-3 text-xs font-semibold"
                    variant="outline"
                    size="sm"
                    onClick={onInvite}
                    data-testid={i === 0 ? 'invite-slot-button' : undefined}
                  >
                    ✉️ {t('games.lobby.invitePlayer')}
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </PlayerList>
    </LobbyCard>
  );
}
