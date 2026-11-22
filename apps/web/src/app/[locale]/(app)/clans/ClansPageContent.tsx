'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useClansStore } from '@/features/clans/store/clansStore';
import { clansApi } from '@/features/clans/api';
import { ClanCard } from '@/features/clans/ui/ClanCard';
import { ClanMembers } from '@/features/clans/ui/ClanMembers';
import { CreateClanModal } from '@/features/clans/ui/CreateClanModal';
import { JoinClanModal } from '@/features/clans/ui/JoinClanModal';
import { InviteModal } from '@/features/clans/ui/InviteModal';
import { ClanLeaderboardTable } from '@/features/clans/ui/ClanLeaderboardTable';
import { CommunityChallengesList } from '@/features/clans/ui/CommunityChallengesList';
import { ClanMvpBoard } from '@/features/clans/ui/ClanMvpBoard';
import { ClanWarsHub } from '@/features/clans/ui/ClanWarsHub';
import { Button, CosmeticSprite } from '@arcadeum/ui';
import { useClanSocket } from '@/features/clans/hooks/useClanSocket';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import type { ClanLeaderboardSort } from '@/features/clans/model/types';

interface ClansTranslations {
  title?: string;
  tabOverview?: string;
  tabLeaderboard?: string;
  tabChallenges?: string;
  tabWars?: string;
  createClan?: string;
  joinClan?: string;
  leaveClan?: string;
  invitePlayers?: string;
  members?: string;
  wins?: string;
  loginPrompt?: string;
  loginToJoin?: string;
  popularClans?: string;
  confirmLeave?: string;
  confirmRemove?: string;
  mvpTitle?: string;
  mvpSubtitle?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  noChallenges?: string;
  goal?: string;
  participants?: string;
  reward?: string;
  contribute?: string;
  contributed?: string;
  completed?: string;
  rank?: string;
  clan?: string;
  player?: string;
  winRate?: string;
  sortByWins?: string;
  sortByWinRate?: string;
  sortByMembers?: string;
  noClansFound?: string;
  noMvps?: string;
  [key: string]: string | undefined;
}

export default function ClansPageContent({
  t: tProp,
  accessToken,
}: {
  t?: PageTranslations;
  accessToken?: string;
}) {
  const tt = useMemo(() => (tProp ?? {}) as ClansTranslations, [tProp]);
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? accessToken;
  const myClan = useClansStore((s) => s.myClan);
  const myClanMembers = useClansStore((s) => s.myClanMembers);
  const popularClans = useClansStore((s) => s.popularClans);
  const activeTab = useClansStore((s) => s.activeTab);
  const setActiveTab = useClansStore((s) => s.setActiveTab);
  const leaderboardEntries = useClansStore((s) => s.leaderboardEntries);
  const leaderboardSort = useClansStore((s) => s.leaderboardSort);
  const setLeaderboardSort = useClansStore((s) => s.setLeaderboardSort);
  const communityChallenges = useClansStore((s) => s.communityChallenges);
  const clanMvps = useClansStore((s) => s.clanMvps);
  const clanWars = useClansStore((s) => s.clanWars);
  const fetchMyClan = useClansStore((s) => s.fetchMyClan);
  const fetchPopularClans = useClansStore((s) => s.fetchPopularClans);
  const fetchLeaderboard = useClansStore((s) => s.fetchLeaderboard);
  const fetchCommunityChallenges = useClansStore(
    (s) => s.fetchCommunityChallenges,
  );
  const fetchActiveWars = useClansStore((s) => s.fetchActiveWars);
  const recordWarVictory = useClansStore((s) => s.recordWarVictory);
  const contributeToChallenge = useClansStore((s) => s.contributeToChallenge);
  const leaveClan = useClansStore((s) => s.leaveClan);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useClanSocket();

  useEffect(() => {
    if (token) {
      fetchMyClan(token);
      fetchPopularClans(token);
      fetchLeaderboard(leaderboardSort, token);
      fetchCommunityChallenges(token);
      fetchActiveWars(undefined, token);
    } else {
      fetchPopularClans();
      fetchLeaderboard(leaderboardSort);
      fetchCommunityChallenges();
      fetchActiveWars();
    }
  }, [
    token,
    fetchMyClan,
    fetchPopularClans,
    fetchLeaderboard,
    fetchCommunityChallenges,
    fetchActiveWars,
    leaderboardSort,
  ]);

  const handleLeaveClan = useCallback(async () => {
    if (!myClan || !token) return;
    if (
      window.confirm(
        tt.confirmLeave ?? 'Are you sure you want to leave this clan?',
      )
    ) {
      await leaveClan(myClan.id, token);
    }
  }, [myClan, token, leaveClan, tt]);

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (!myClan || !token) return;
      if (
        window.confirm(
          tt.confirmRemove ?? 'Are you sure you want to remove this member?',
        )
      ) {
        try {
          await clansApi.removeMember(myClan.id, userId, { token });
          const { removeMemberById } = useClansStore.getState();
          removeMemberById(userId);
        } catch {
          // error handled
        }
      }
    },
    [myClan, token, tt],
  );

  const handleSortChange = useCallback(
    (sort: ClanLeaderboardSort) => {
      setLeaderboardSort(sort);
      fetchLeaderboard(sort, token);
    },
    [setLeaderboardSort, fetchLeaderboard, token],
  );

  const handleContribute = useCallback(
    async (challengeId: string) => {
      await contributeToChallenge(challengeId, 1, token);
    },
    [contributeToChallenge, token],
  );

  const handleRecordWarVictory = useCallback(
    async (warId: string, winningClanId: string) => {
      if (!snapshot.userId) return;
      const winnerName = snapshot.username ?? 'Champion';
      await recordWarVictory(
        warId,
        winningClanId,
        winnerName,
        'rival-clan',
        'Contender',
        'sea-battle',
        token,
      );
    },
    [snapshot.userId, snapshot.username, recordWarVictory, token],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {tt.title ?? 'Clans'}
          </h1>
        </div>
        <div className="flex gap-2">
          {snapshot.userId && !myClan && (
            <>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                {tt.createClan ?? 'Create Clan'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowJoinModal(true)}
              >
                {tt.joinClan ?? 'Join Clan'}
              </Button>
            </>
          )}
          {snapshot.userId && myClan && (
            <Button
              variant="secondary"
              onClick={() => setShowInviteModal(true)}
            >
              {tt.invitePlayers ?? 'Invite Players'}
            </Button>
          )}
        </div>
      </div>

      <div
        className="mb-8 flex items-center gap-2 border-b border-[var(--border)] pb-2"
        role="tablist"
        aria-label="Clans Navigation"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          data-testid="tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-2.5 ${
            activeTab === 'overview'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
          }`}
        >
          {tt.tabOverview ?? 'Overview'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'leaderboard'}
          data-testid="tab-leaderboard"
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-2.5 ${
            activeTab === 'leaderboard'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
          }`}
        >
          {tt.tabLeaderboard ?? 'Clan Ladder'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'challenges'}
          data-testid="tab-challenges"
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-2.5 ${
            activeTab === 'challenges'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
          }`}
        >
          {tt.tabChallenges ?? 'Community Challenges'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'wars'}
          data-testid="tab-wars"
          onClick={() => setActiveTab('wars')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-2.5 ${
            activeTab === 'wars'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
          }`}
        >
          {tt.tabWars ?? 'Clan Wars'}
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {!snapshot.userId && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-8 text-center my-6">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {tt.title ?? 'Clans'}
              </h2>
              <p className="text-sm text-[var(--foreground)]/60 max-w-md">
                {tt.loginPrompt ?? 'Log in to create or join a clan.'}
              </p>
            </div>
          )}

          {snapshot.userId && myClan && (
            <section className="mb-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xl font-bold text-[var(--color)]">
                  {myClan.avatarUrl ? (
                    <CosmeticSprite
                      src={myClan.avatarUrl}
                      alt={myClan.name}
                      size={56}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    myClan.tag.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--foreground)]">
                    {myClan.name}
                  </h2>
                  <p className="text-sm text-[var(--foreground)]/60">
                    [{myClan.tag}] · {myClan.memberCount}{' '}
                    {tt.members ?? 'members'} · {myClan.totalWins}{' '}
                    {tt.wins ?? 'wins'}
                  </p>
                </div>
                {myClan.description && (
                  <p className="ml-auto max-w-xs text-sm text-[var(--foreground)]/60">
                    {myClan.description}
                  </p>
                )}
              </div>

              <ClanMvpBoard mvps={clanMvps} labels={tt} />

              <ClanMembers
                members={myClanMembers}
                currentUserId={snapshot.userId}
                onRemove={handleRemoveMember}
              />

              <div>
                <Button variant="danger" size="sm" onClick={handleLeaveClan}>
                  {tt.leaveClan ?? 'Leave Clan'}
                </Button>
              </div>
            </section>
          )}

          {(!snapshot.userId || !myClan) && popularClans.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                {tt.popularClans ?? 'Popular Clans'}
              </h2>
              <div className="flex flex-col gap-3">
                {popularClans.map((clan) => (
                  <ClanCard
                    key={clan.id}
                    clan={clan}
                    onJoin={async (clanId) => {
                      if (!token) return;
                      try {
                        const { joinClan } = useClansStore.getState();
                        await joinClan(clanId, token);
                      } catch {
                        // error handled
                      }
                    }}
                    showJoin={!!token}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {activeTab === 'leaderboard' && (
        <section>
          <ClanLeaderboardTable
            entries={leaderboardEntries}
            currentSort={leaderboardSort}
            onSortChange={handleSortChange}
            labels={tt}
          />
        </section>
      )}

      {activeTab === 'challenges' && (
        <section>
          <CommunityChallengesList
            challenges={communityChallenges}
            onContribute={handleContribute}
            labels={tt}
          />
        </section>
      )}

      {activeTab === 'wars' && (
        <section>
          <ClanWarsHub
            wars={clanWars}
            myClan={myClan}
            popularClans={popularClans}
            onRecordVictory={handleRecordWarVictory}
            labels={tt}
          />
        </section>
      )}

      <CreateClanModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <JoinClanModal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
      {myClan && (
        <InviteModal
          open={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          clanId={myClan.id}
        />
      )}
    </div>
  );
}
