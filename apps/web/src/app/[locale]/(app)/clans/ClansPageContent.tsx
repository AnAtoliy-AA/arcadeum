'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useClansStore } from '@/features/clans/store/clansStore';
import { clansApi } from '@/features/clans/api';
import { ClanCard } from '@/features/clans/ui/ClanCard';
import { ClanMembers } from '@/features/clans/ui/ClanMembers';
import { CreateClanModal } from '@/features/clans/ui/CreateClanModal';
import { JoinClanModal } from '@/features/clans/ui/JoinClanModal';
import { InviteModal } from '@/features/clans/ui/InviteModal';
import { Button } from '@arcadeum/ui';
import { useClanSocket } from '@/features/clans/hooks/useClanSocket';
import type { PageTranslations } from '@/shared/i18n/page-translations';

interface ClansTranslations {
  title?: string;
  createClan?: string;
  joinClan?: string;
  leaveClan?: string;
  invitePlayers?: string;
  members?: string;
  wins?: string;
  loginPrompt?: string;
  popularClans?: string;
  confirmLeave?: string;
  confirmRemove?: string;
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
  const fetchMyClan = useClansStore((s) => s.fetchMyClan);
  const fetchPopularClans = useClansStore((s) => s.fetchPopularClans);
  const leaveClan = useClansStore((s) => s.leaveClan);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useClanSocket();

  useEffect(() => {
    if (token) {
      fetchMyClan(token);
      fetchPopularClans(token);
    } else {
      fetchPopularClans();
    }
  }, [token, fetchMyClan, fetchPopularClans]);

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
          // error handled in API
        }
      }
    },
    [myClan, token, tt],
  );

  if (!snapshot.userId) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <h1 className="text-2xl font-bold">{tt.title ?? 'Clans'}</h1>
        <p className="text-[var(--foreground)]/60">
          {tt.loginPrompt ?? 'Log in to create or join a clan.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tt.title ?? 'Clans'}</h1>
        <div className="flex gap-2">
          {!myClan && (
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
          {myClan && (
            <Button
              variant="secondary"
              onClick={() => setShowInviteModal(true)}
            >
              {tt.invitePlayers ?? 'Invite Players'}
            </Button>
          )}
        </div>
      </div>

      {myClan && (
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xl font-bold text-[var(--primary)]">
              {myClan.avatarUrl ? (
                <Image
                  src={myClan.avatarUrl}
                  alt={myClan.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                myClan.tag.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{myClan.name}</h2>
              <p className="text-sm text-[var(--foreground)]/60">
                [{myClan.tag}] · {myClan.memberCount} {tt.members ?? 'members'}{' '}
                · {myClan.totalWins} {tt.wins ?? 'wins'}
              </p>
            </div>
            {myClan.description && (
              <p className="ml-auto max-w-xs text-sm text-[var(--foreground)]/60">
                {myClan.description}
              </p>
            )}
          </div>

          <ClanMembers
            members={myClanMembers}
            currentUserId={snapshot.userId}
            onRemove={handleRemoveMember}
          />

          <div className="mt-4">
            <Button variant="danger" size="sm" onClick={handleLeaveClan}>
              {tt.leaveClan ?? 'Leave Clan'}
            </Button>
          </div>
        </section>
      )}

      {!myClan && popularClans.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">
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
                    // error handled in store
                  }
                }}
                showJoin={!!token}
              />
            ))}
          </div>
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
