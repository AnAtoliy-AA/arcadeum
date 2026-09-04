'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Spinner,
  Button,
  EmptyState,
  PageLayout,
  Container,
} from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useRoutes } from '@/shared/config/useRoutes';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  getUserProfile,
  getUserFriends,
  type PublicUserProfile,
} from '@/shared/api/profile';
import {
  sendFriendRequestByUserId,
  getFriends,
  getPendingRequests,
} from '@/shared/api/friends';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import { UserIcon } from '@arcadeum/ui/components/Icons/index';
import type { Friend, FriendRequest } from '@/shared/api/friends';

export default function ProfilePageContent() {
  const params = useParams();
  const userId = params?.userId as string;
  const { snapshot } = useSessionTokens();
  const router = useRouter();
  const routes = useRoutes();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [myPending, setMyPending] = useState<{
    incoming: FriendRequest[];
    outgoing: FriendRequest[];
  }>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [friendSent, setFriendSent] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);

  const isOwnProfile = snapshot.userId === userId;
  const isAlreadyFriend = myFriends.some((f) => f.userId === userId);
  const hasPendingIncoming = myPending.incoming.some(
    (r) => r.userId === userId,
  );
  const hasPendingOutgoing = myPending.outgoing.some(
    (r) => r.userId === userId,
  );

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [profileData, friendsData] = await Promise.all([
          getUserProfile(userId),
          getUserFriends(userId, { token: snapshot.accessToken || undefined }),
        ]);
        if (cancelled) return;
        setProfile(profileData);
        setFriends(friendsData);

        if (snapshot.accessToken) {
          const [myFriendsData, myPendingData] = await Promise.all([
            getFriends(snapshot.accessToken),
            getPendingRequests(snapshot.accessToken),
          ]);
          if (!cancelled) {
            setMyFriends(myFriendsData);
            setMyPending(myPendingData);
          }
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, snapshot.accessToken]);

  const handleAddFriend = async () => {
    if (!snapshot.accessToken || !userId) return;
    setFriendLoading(true);
    try {
      await sendFriendRequestByUserId(snapshot.accessToken, userId);
      setFriendSent(true);
    } catch {
      setFriendSent(true);
    } finally {
      setFriendLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Container size="md">
          <div className="flex flex-col items-center p-12 gap-3">
            <Spinner size="md" />
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (error || !profile) {
    return (
      <PageLayout>
        <Container size="md">
          <div className="flex flex-col items-center p-12 gap-3">
            <EmptyState
              message="User not found"
              icon={<UserIcon size={32} />}
            />
          </div>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container size="md">
        <div className="flex flex-col items-stretch gap-5 p-4">
          <Card variant="elevated">
            <div className="flex flex-row gap-4 items-center">
              <EquippedPlayerAvatar
                name={profile.displayName || profile.username}
                size="lg"
                equippedAvatarId={profile.equippedAvatarId}
                equippedBadgeId={profile.equippedBadgeId}
                equippedNameColorId={profile.equippedNameColorId}
                equippedFrameId={profile.equippedFrameId}
                equippedAuraId={profile.equippedAuraId}
                equippedBannerId={profile.equippedBannerId}
              />
              <div className="flex flex-col items-stretch flex-1 gap-1">
                <span className="text-[20px] font-bold">
                  {profile.displayName || profile.username}
                </span>
                <span className="text-[14px] text-[var(--textSecondary)]">
                  @{profile.username}
                </span>
                <div className="flex flex-row items-center gap-2 mt-1">
                  <Badge variant="info" size="sm">
                    {profile.role}
                  </Badge>
                  {profile.countryCode && (
                    <Badge variant="neutral" size="sm">
                      {profile.countryCode}
                    </Badge>
                  )}
                  {profile.createdAt && (
                    <span className="text-[12px] text-[var(--textSecondary)]">
                      Joined {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {!isOwnProfile && snapshot.accessToken && (
                <>
                  {isAlreadyFriend ? (
                    <Badge variant="success" size="sm">
                      Friends
                    </Badge>
                  ) : hasPendingOutgoing || friendSent ? (
                    <Badge variant="warning" size="sm">
                      Request Sent
                    </Badge>
                  ) : hasPendingIncoming ? (
                    <Badge variant="info" size="sm">
                      Request Received
                    </Badge>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddFriend}
                      disabled={friendLoading}
                      data-testid="profile-add-friend"
                    >
                      Add Friend
                    </Button>
                  )}
                </>
              )}
              {!isOwnProfile && !snapshot.accessToken && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(routes.auth)}
                >
                  {t('common.actions.login') || 'Log In'}
                </Button>
              )}
            </div>
          </Card>

          <div className="flex flex-col items-stretch gap-3">
            <div className="flex flex-row items-center gap-2">
              <span className="text-[18px] font-bold">
                {t('navigation.friendsTab') || 'Friends'}
              </span>
              {friends.length > 0 && (
                <Badge variant="neutral" size="sm">
                  {friends.length}
                </Badge>
              )}
            </div>
            {friends.length === 0 ? (
              <EmptyState
                message="No friends yet."
                icon={<UserIcon size={24} />}
              />
            ) : (
              friends.map((friend) => (
                <Card
                  key={friend.id}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => router.push(routes.profile(friend.userId))}
                >
                  <div className="flex flex-row gap-3 items-center">
                    <EquippedPlayerAvatar
                      name={friend.displayName ?? friend.username}
                      equippedAvatarId={friend.equippedAvatarId}
                      equippedBadgeId={null}
                      size="sm"
                    />
                    <div className="flex flex-col items-stretch flex-1 gap-1">
                      <span className="text-[16px] font-semibold">
                        {friend.displayName ?? friend.username}
                      </span>
                      <span className="text-[12px] text-[var(--textSecondary)]">
                        @{friend.username}
                      </span>
                    </div>
                    <Badge
                      variant={friend.online ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {friend.online ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
