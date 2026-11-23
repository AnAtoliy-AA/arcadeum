'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  PageLayout,
  Container,
} from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useRoutes } from '@/shared/config/useRoutes';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { ApiError } from '@/shared/lib/api-client';
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
import { ProfileHeroCard } from '@/features/profile/ui/ProfileHeroCard';
import { ProfileSkeleton } from '@/features/profile/ui/ProfileSkeleton';

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
  const [error, setError] = useState<'notFound' | 'failed' | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [friendSent, setFriendSent] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [matches, setMatches] = useState<HistorySummary[]>([]);
  const [headToHead, setHeadToHead] = useState<HeadToHeadResponse | null>(null);

  const isOwnProfile = snapshot.userId === userId;
  const isAlreadyFriend = (myFriends ?? []).some((f) => f.userId === userId);
  const hasPendingIncoming = (myPending?.incoming ?? []).some(
    (r) => r.userId === userId,
  );
  const hasPendingOutgoing = (myPending?.outgoing ?? []).some(
    (r) => r.userId === userId,
  );

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileData, friendsData] = await Promise.all([
          getUserProfile(userId),
          getUserFriends(userId, { token: snapshot.accessToken || undefined }),
        ]);
        if (cancelled) return;
        setProfile(profileData);
        setFriends(Array.isArray(friendsData) ? friendsData : []);

        if (snapshot.accessToken) {
          const [myFriendsData, myPendingData] = await Promise.all([
            getFriends(snapshot.accessToken),
            getPendingRequests(snapshot.accessToken),
          ]);
          if (!cancelled) {
            setMyFriends(Array.isArray(myFriendsData) ? myFriendsData : []);
            setMyPending(
              myPendingData &&
                Array.isArray(myPendingData.incoming) &&
                Array.isArray(myPendingData.outgoing)
                ? myPendingData
                : { incoming: [], outgoing: [] },
            );
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
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.status === 404
              ? 'notFound'
              : 'failed',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, snapshot.accessToken, snapshot.userId, reloadKey]);

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
          <ProfileSkeleton />
        </Container>
      </PageLayout>
    );
  }

  if (error === 'failed') {
    return (
      <PageLayout>
        <Container size="md">
          <ErrorState
            data-testid="profile-error"
            title={t('games.common.profile.loadError')}
            message={t('games.common.profile.loadErrorHint')}
            retryLabel={t('games.common.profile.retry')}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </Container>
      </PageLayout>
    );
  }

  if (!profile) {
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
          <ProfileHeroCard
            profile={profile}
            actions={
              <>
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
              </>
            }
          />

          {headToHead && (
            <HeadToHeadCard
              data={headToHead}
              myDisplayName={t('games.common.profile.you')}
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
