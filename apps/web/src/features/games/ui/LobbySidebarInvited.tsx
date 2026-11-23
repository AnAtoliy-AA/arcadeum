'use client';

import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
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
  /** Host-only: cancel a pending invitation. */
  onCancelInvite?: (userIds: string[]) => void;
  /** Users with an invite action in flight (buttons disabled). */
  busyIds?: ReadonlySet<string>;
}

export function LobbySidebarInvited({
  pendingInvited,
  pendingDeclined,
  isHost,
  invitedPlayersLabel,
  declinedLabel,
  reinviteLabel,
  onReinvite,
  onCancelInvite,
  busyIds,
}: LobbySidebarInvitedProps) {
  const { t } = useTranslation();
  return (
    <LobbyCard>
      <CardTitle>{invitedPlayersLabel}</CardTitle>
      <PlayerList>
        {pendingInvited.map((u) => (
          <PlayerItem key={u.id}>
            <div
              className="flex flex-1 items-center gap-2 opacity-80"
              data-testid={`lobby-invited-${u.id}`}
            >
              <InGameAvatar
                playerId={u.id}
                name={u.displayName}
                size="sm"
                className="grayscale"
              />
              <PlayerInfo>
                <LobbyPlayerName>{u.displayName}</LobbyPlayerName>
                <InfoLabel>{t('games.lobby.invitedAwaitingReply')}</InfoLabel>
              </PlayerInfo>
            </div>
            {isHost && (
              <div className="ml-2 flex shrink-0 gap-1">
                {onReinvite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyIds?.has(u.id)}
                    onClick={() => onReinvite([u.id])}
                    data-testid={`lobby-invite-resend-${u.id}`}
                  >
                    {t('games.lobby.resendInviteLabel')}
                  </Button>
                )}
                {onCancelInvite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyIds?.has(u.id)}
                    onClick={() => onCancelInvite([u.id])}
                    data-testid={`lobby-invite-cancel-${u.id}`}
                  >
                    {t('games.lobby.cancelInviteLabel')}
                  </Button>
                )}
              </div>
            )}
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
                disabled={busyIds?.has(u.id)}
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
