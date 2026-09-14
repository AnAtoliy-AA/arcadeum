'use client';

import { memo } from 'react';
import { Card, Button, Badge } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import type { Friend } from '@/shared/api/friends';

export interface FriendCardLabels {
  online?: string;
  offline?: string;
  inviteToGame?: string;
  chat?: string;
  removeFriend?: string;
  gift?: {
    button?: string;
  };
}

interface FriendCardProps {
  friend: Friend;
  labels: FriendCardLabels;
  onProfile: (userId: string) => void;
  onInvite: (userId: string) => void;
  onChat: (friend: Friend) => void;
  onGift: (friend: Friend) => void;
  onRemove: (friend: Friend) => void;
}

export const FriendCard = memo(function FriendCard({
  friend,
  labels,
  onProfile,
  onInvite,
  onChat,
  onGift,
  onRemove,
}: FriendCardProps) {
  return (
    <Card variant="default">
      <div className="flex flex-row gap-3 items-center">
        <EquippedPlayerAvatar
          name={friend.displayName ?? friend.username}
          equippedAvatarId={friend.equippedAvatarId}
          equippedBadgeId={null}
          size="sm"
        />
        <div
          className="flex flex-col items-stretch flex-1 gap-1 cursor-pointer"
          onClick={() => onProfile(friend.userId)}
        >
          <span className="text-[16px] font-semibold hover:underline">
            {friend.displayName ?? friend.username}
          </span>
          <div className="flex flex-row items-center gap-2">
            <Badge variant={friend.online ? 'success' : 'neutral'} size="sm">
              {friend.online
                ? (labels.online ?? 'Online')
                : (labels.offline ?? 'Offline')}
            </Badge>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onInvite(friend.userId)}
          data-testid={`invite-${friend.userId}`}
        >
          {labels.inviteToGame ?? 'Invite'}
        </Button>
        <Button
          variant="glass"
          size="sm"
          onClick={() => onGift(friend)}
          data-testid={`gift-${friend.userId}`}
        >
          {labels.gift?.button ?? '🎁 Gift'}
        </Button>
        <Button
          variant="glass"
          size="sm"
          onClick={() => onChat(friend)}
          data-testid={`chat-${friend.userId}`}
        >
          {labels.chat ?? 'Chat'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(friend)}
          data-testid={`remove-${friend.userId}`}
        >
          {labels.removeFriend ?? 'Remove'}
        </Button>
      </div>
    </Card>
  );
});
