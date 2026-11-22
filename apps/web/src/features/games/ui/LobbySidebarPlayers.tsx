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
import { Button, Badge, RefreshIcon } from '@arcadeum/ui';
import {
  LobbyCard,
  CardTitle,
  PlayerList,
  PlayerItem,
  PlayerInfo,
  LobbyPlayerName,
  EmptySlot,
  EmptyAvatar,
  EmptyAvatarText,
  InfoLabel,
  CardHeader,
  RefreshButton,
} from './lobbyStyles';
import { SortablePlayerItem } from './SortablePlayerItem';
import { InGameAvatar } from './InGameAvatar';

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
}: LobbySidebarPlayersProps) {
  const maxPlayers = room.maxPlayers ?? 5;
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
          {canAddBots && onAddBot && (
            <Button
              className="py-1 px-2 min-w-[auto] text-[11px] font-semibold"
              variant="ghost"
              size="sm"
              onClick={onAddBot}
              data-testid="add-bot-button"
            >
              + 🤖
            </Button>
          )}
          {onRefresh && (
            <RefreshButton
              onClick={onRefresh}
              title="Refresh Room"
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
                    {isRoomHost && (
                      <Badge variant="info" className="shrink-0">
                        HOST
                      </Badge>
                    )}
                    {isBot && (
                      <span className="text-[11px]" title="AI Bot">
                        🤖
                      </span>
                    )}
                  </div>
                </PlayerInfo>
                {isBot && canRemoveBots && onRemoveBot ? (
                  <Button
                    className="py-1 px-2 min-w-[auto] shrink-0 ml-auto"
                    variant="danger"
                    ghost
                    size="sm"
                    onClick={() => onRemoveBot(member.id)}
                    data-testid={`remove-bot-${member.id}`}
                  >
                    ✕
                  </Button>
                ) : onKickPlayer && !isRoomHost ? (
                  <Button
                    className="py-1 px-2 min-w-[auto] shrink-0 ml-auto"
                    variant="danger"
                    ghost
                    size="sm"
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
        {Array.from({ length: Math.max(0, minPlayers - members.length) }).map(
          (_, i) => (
            <EmptySlot key={`empty-${i}`}>
              <EmptyAvatar>
                <EmptyAvatarText>?</EmptyAvatarText>
              </EmptyAvatar>
              <InfoLabel>{waitingForPlayerLabel}</InfoLabel>
            </EmptySlot>
          ),
        )}
      </PlayerList>
    </LobbyCard>
  );
}
