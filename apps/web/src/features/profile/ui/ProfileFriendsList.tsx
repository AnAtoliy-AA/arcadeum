'use client';

import { useRouter } from 'next/navigation';
import { Card, Badge, EmptyState } from '@arcadeum/ui';
import { UserIcon } from '@arcadeum/ui/components/Icons/index';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import type { Friend } from '@/shared/api/friends';

interface ProfileFriendsListProps {
  friends: Friend[];
}

export function ProfileFriendsList({ friends }: ProfileFriendsListProps) {
  const router = useRouter();
  const routes = useRoutes();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-stretch gap-3">
      <div className="flex flex-row items-center gap-2">
        <span className="text-[18px] font-bold">
          👥 {t('games.common.profile.friends')}
        </span>
        {friends.length > 0 && (
          <Badge variant="neutral" size="sm">
            {friends.length}
          </Badge>
        )}
      </div>

      {friends.length === 0 ? (
        <EmptyState
          message={t('games.common.profile.noFriends')}
          icon={<UserIcon size={24} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {friends.map((friend) => (
            <Card
              key={friend.id}
              variant="default"
              className="cursor-pointer transition-colors hover:border-[var(--primary)]"
              onClick={() => router.push(routes.profile(friend.userId))}
            >
              <div className="flex flex-row gap-3 items-center">
                <EquippedPlayerAvatar
                  name={friend.displayName ?? friend.username}
                  equippedAvatarId={friend.equippedAvatarId}
                  equippedBadgeId={null}
                  size="sm"
                />
                <div className="flex flex-col items-stretch flex-1 min-w-0">
                  <span className="text-[15px] font-semibold truncate text-[var(--color)]">
                    {friend.displayName ?? friend.username}
                  </span>
                  <span className="text-[12px] text-[var(--textSecondary)] truncate">
                    @{friend.username}
                  </span>
                </div>
                <Badge
                  variant={friend.online ? 'success' : 'neutral'}
                  size="sm"
                >
                  {friend.online
                    ? t('games.common.profile.online')
                    : t('games.common.profile.offline')}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
