'use client';

import { Button } from '@arcadeum/ui';
import {
  LobbyCard,
  CardTitle,
  PlayerList,
  PlayerItem,
  PlayerInfo,
  LobbyPlayerName,
  InfoLabel,
} from './lobbyStyles';
import { InGameAvatar } from './InGameAvatar';

export interface RematchUser {
  id: string;
  displayName: string;
}

export interface LobbySidebarInvitedProps {
  pendingInvited: RematchUser[];
  pendingDeclined: RematchUser[];
  isHost: boolean;
  invitedPlayersLabel: string;
  declinedLabel: string;
  reinviteLabel: string;
  onReinvite?: (userIds: string[]) => void;
}

export function LobbySidebarInvited({
  pendingInvited,
  pendingDeclined,
  isHost,
  invitedPlayersLabel,
  declinedLabel,
  reinviteLabel,
  onReinvite,
}: LobbySidebarInvitedProps) {
  return (
    <LobbyCard>
      <CardTitle>{invitedPlayersLabel}</CardTitle>
      <PlayerList>
        {pendingInvited.map((u) => (
          <PlayerItem key={u.id} className="opacity-70">
            <InGameAvatar
              playerId={u.id}
              name={u.displayName}
              size="sm"
              className="grayscale"
            />
            <PlayerInfo>
              <LobbyPlayerName>{u.displayName}</LobbyPlayerName>
              <InfoLabel>Waiting...</InfoLabel>
            </PlayerInfo>
          </PlayerItem>
        ))}
        {pendingDeclined.map((u) => (
          <PlayerItem key={u.id} className="opacity-50">
            <div className="flex flex-1 items-center gap-2">
              <InGameAvatar
                playerId={u.id}
                name={u.displayName}
                size="sm"
                className="grayscale"
              />
              <PlayerInfo>
                <LobbyPlayerName className="line-through">
                  {u.displayName}
                </LobbyPlayerName>
                <InfoLabel className="text-[#ef4444]">
                  {declinedLabel}
                </InfoLabel>
              </PlayerInfo>
            </div>
            {isHost && onReinvite && (
              <Button
                className="ml-2"
                variant="ghost"
                size="sm"
                onClick={() => onReinvite?.([u.id])}
              >
                {reinviteLabel}
              </Button>
            )}
          </PlayerItem>
        ))}
      </PlayerList>
    </LobbyCard>
  );
}
