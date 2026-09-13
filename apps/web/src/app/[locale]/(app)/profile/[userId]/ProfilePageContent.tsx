'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { useTranslation } from '@/shared/i18n/useTranslation';
import { xpProgress, toRoman } from '@/shared/lib/xp-level';
import {
  getUserProfile,
  getUserFriends,
  getUserAchievements,
  type PublicUserProfile,
} from '@/shared/api/profile';
import {
  sendFriendRequestByUserId,
  getFriends,
  getPendingRequests,
} from '@/shared/api/friends';
import { replayApi } from '@/features/replay/api';
import type { ReplaySummary } from '@/features/replay/lib/types';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import { UserIcon } from '@arcadeum/ui/components/Icons/index';
import { GiftDialog } from '@/features/shop/ui/GiftDialog';
import type { Friend, FriendRequest } from '@/shared/api/friends';
import type { Achievement } from '@/features/achievements/server/achievements.types';
import { getRarityStyle } from '@/features/achievements/lib/rarity';

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
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [replays, setReplays] = useState<ReplaySummary[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

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

        // Load recent replays for this user
        try {
          const replayData = await replayApi.listReplays({ limit: 6 });
          if (!cancelled) setReplays(replayData.entries);
        } catch {
          // Replays are optional — don't block profile load
        }

        // Load achievements for this user
        try {
          const achievementData = await getUserAchievements(userId);
          if (!cancelled) setAchievements(achievementData);
        } catch {
          // Achievements are optional — don't block profile load
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
              message={t('games.common.profile.notFound')}
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
                  {profile.prestige > 0 && (
                    <Badge variant="warning" size="sm">
                      P{toRoman(profile.prestige)}
                    </Badge>
                  )}
                  {(() => {
                    const { level } = xpProgress(profile.xp ?? 0);
                    return (
                      <Badge variant="info" size="sm">
                        Lv. {level}
                      </Badge>
                    );
                  })()}
                  <Badge variant="neutral" size="sm">
                    XP: {profile.xp?.toLocaleString() ?? '0'}
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
                    <>
                      <Badge variant="success" size="sm">
                        {t('games.common.profile.friends')}
                      </Badge>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setGiftDialogOpen(true)}
                        data-testid="profile-send-gift"
                      >
                        🎁 {t('games.common.profile.gift')}
                      </Button>
                    </>
                  ) : hasPendingOutgoing || friendSent ? (
                    <Badge variant="warning" size="sm">
                      {t('games.common.profile.requestSent')}
                    </Badge>
                  ) : hasPendingIncoming ? (
                    <Badge variant="info" size="sm">
                      {t('games.common.profile.requestReceived')}
                    </Badge>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddFriend}
                      disabled={friendLoading}
                      data-testid="profile-add-friend"
                    >
                      {t('games.common.profile.addFriend')}
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
                {t('games.common.profile.friends')}
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
                      {friend.online
                        ? t('games.common.profile.online')
                        : t('games.common.profile.offline')}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>

          {achievements.length > 0 && (
            <div className="flex flex-col items-stretch gap-3">
              <div className="flex flex-row items-center gap-2">
                <span className="text-[18px] font-bold">
                  {t('pages.achievements.title')}
                </span>
                <Badge variant="neutral" size="sm">
                  {achievements.length}
                </Badge>
              </div>
              <div className="flex flex-row gap-2 overflow-x-auto pb-1">
                {achievements.map((achievement) => {
                  const rarityStyle = getRarityStyle(achievement.rarity);
                  return (
                    <div
                      key={achievement.achievementId}
                      className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-3 backdrop-blur-md"
                      style={{ minWidth: 100 }}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: rarityStyle.glow,
                          color: rarityStyle.text,
                        }}
                      >
                        {achievement.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={achievement.iconUrl}
                            alt=""
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded object-contain"
                            loading="lazy"
                          />
                        ) : (
                          '🏆'
                        )}
                      </span>
                      <span className="truncate text-center text-[11px] font-semibold">
                        {achievement.name}
                      </span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                        style={{
                          color: rarityStyle.text,
                          border: `1px solid ${rarityStyle.border}`,
                        }}
                      >
                        {achievement.rarity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {replays.length > 0 && (
            <div className="flex flex-col items-stretch gap-3">
              <div className="flex flex-row items-center justify-between">
                <span className="text-[18px] font-bold">
                  {t('games.common.profile.replays')}
                </span>
                <Link
                  href="/replays"
                  className="text-[13px] text-[var(--color)] hover:underline"
                >
                  {t('games.common.profile.viewAll')} →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {replays.slice(0, 4).map((replay) => (
                  <Link
                    key={replay.replayId}
                    href={`/replay/${replay.replayId}`}
                    className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] p-3 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                  >
                    <span className="text-[20px]">
                      {replay.gameId.includes('chess')
                        ? '♟️'
                        : replay.gameId.includes('checkers')
                          ? '🔴'
                          : '🎮'}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px] font-medium">
                        {replay.gameId.replace(/_v\d+$/, '').replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-[var(--textSecondary)]">
                        {replay.players.map((p) => p.displayName).join(' vs ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--textSecondary)]">
                      {new Date(replay.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                          day: 'numeric',
                        },
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>

      <GiftDialog
        key={`gift-${giftDialogOpen}`}
        open={giftDialogOpen}
        onClose={() => setGiftDialogOpen(false)}
        recipientId={userId}
        recipientName={profile.displayName || profile.username}
        recipientAvatarId={profile.equippedAvatarId}
      />
    </PageLayout>
  );
}
