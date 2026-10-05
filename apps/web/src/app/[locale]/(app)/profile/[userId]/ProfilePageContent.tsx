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
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { xpProgress, toRoman } from '@/shared/lib/xp-level';
import {
  getUserProfile,
  getUserFriends,
  getUserAchievements,
  getUserStats,
  getUserTrends,
  getUserHistory,
  getHeadToHeadWithUser,
  type PublicUserProfile,
} from '@/shared/api/profile';
import {
  sendFriendRequestByUserId,
  getFriends,
  getPendingRequests,
} from '@/shared/api/friends';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import { UserIcon } from '@arcadeum/ui/components/Icons/index';
import { GiftDialog } from '@/features/shop/ui/GiftDialog';
import type { Friend, FriendRequest } from '@/shared/api/friends';
import type { Achievement } from '@/features/achievements/server/achievements.types';
import type {
  PlayerStats,
  TrendsResponse,
  HeadToHeadResponse,
} from '@/features/history/api';
import type { HistorySummary } from '@/app/[locale]/(app)/history/types';
import { HeadToHeadCard } from '@/features/profile/ui/HeadToHeadCard';
import { ProfileStatsShowcase } from '@/features/profile/ui/ProfileStatsShowcase';
import { MatchHistoryFeed } from '@/features/profile/ui/MatchHistoryFeed';
import { ProfileAchievementsShowcase } from '@/features/profile/ui/ProfileAchievementsShowcase';
import { ProfileFriendsList } from '@/features/profile/ui/ProfileFriendsList';
import { ShareProfileButton } from '@/features/profile/ui/ShareProfileButton';

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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [matches, setMatches] = useState<HistorySummary[]>([]);
  const [headToHead, setHeadToHead] = useState<HeadToHeadResponse | null>(null);

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

        try {
          const statsData = await getUserStats(userId, {
            token: snapshot.accessToken || undefined,
          });
          if (!cancelled) setStats(statsData);
        } catch {}

        try {
          const trendsData = await getUserTrends(userId, {
            token: snapshot.accessToken || undefined,
            limit: 10,
          });
          if (!cancelled) setTrends(trendsData);
        } catch {}

        try {
          const historyData = await getUserHistory(userId, {
            token: snapshot.accessToken || undefined,
            limit: 6,
          });
          if (!cancelled) setMatches(historyData.entries);
        } catch {}

        if (
          snapshot.accessToken &&
          snapshot.userId &&
          snapshot.userId !== userId
        ) {
          try {
            const h2h = await getHeadToHeadWithUser(userId, {
              token: snapshot.accessToken,
            });
            if (!cancelled) setHeadToHead(h2h);
          } catch {}
        }

        try {
          const achievementData = await getUserAchievements(userId);
          if (!cancelled) setAchievements(achievementData);
        } catch {}
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
  }, [userId, snapshot.accessToken, snapshot.userId]);

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

  const { level } = xpProgress(profile.xp ?? 0);

  return (
    <PageLayout>
      <Container size="md">
        <div className="flex flex-col items-stretch gap-5 p-4">
          <Card variant="elevated">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-row gap-4 items-center min-w-0">
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
                <div className="flex flex-col items-start min-w-0 gap-1">
                  <span className="text-[20px] font-bold truncate text-[var(--color)]">
                    {profile.displayName || profile.username}
                  </span>
                  <span className="text-[14px] text-[var(--textSecondary)] truncate">
                    @{profile.username}
                  </span>
                  <div className="flex flex-row flex-wrap items-center gap-1.5 mt-1">
                    <Badge variant="info" size="sm">
                      {profile.role}
                    </Badge>
                    {profile.prestige > 0 && (
                      <Badge variant="warning" size="sm">
                        P{toRoman(profile.prestige)}
                      </Badge>
                    )}
                    <Badge variant="info" size="sm">
                      Lv. {level}
                    </Badge>
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
                        Joined{' '}
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row flex-wrap items-center gap-2">
                <ShareProfileButton
                  userId={userId}
                  displayName={profile.displayName || profile.username}
                />
                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      router.push(`${routes.shopInventory}#row-badges`)
                    }
                    data-testid="profile-customize-badges"
                  >
                    ✨{' '}
                    {t('pages.shop.topBar.nav.inventory' as TranslationKey) ||
                      'Inventory'}
                  </Button>
                )}
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
            </div>
          </Card>

          {headToHead && (
            <HeadToHeadCard
              data={headToHead}
              myDisplayName="You"
              rivalDisplayName={profile.displayName || profile.username}
            />
          )}

          {stats && <ProfileStatsShowcase stats={stats} trends={trends} />}

          <MatchHistoryFeed userId={userId} matches={matches} />

          <ProfileAchievementsShowcase achievements={achievements} />

          <ProfileFriendsList friends={friends} />
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
