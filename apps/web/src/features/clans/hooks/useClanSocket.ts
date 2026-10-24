import { useCallback, useEffect } from 'react';
import {
  getClansSocketRef,
  useClansSocket,
  useFriendsSocket,
} from '@/shared/lib/socket';
import { useClansStore } from '../store/clansStore';
import type { ClanWar } from '../model/types';

interface ClanMemberJoinedPayload {
  userId: string;
  username: string;
  displayName: string | null;
  equippedAvatarId: string | null;
}

interface ClanMemberLeftPayload {
  userId: string;
}

export function useClanSocket() {
  const addMember = useClansStore((s) => s.addMember);
  const removeMemberById = useClansStore((s) => s.removeMemberById);
  const updateClanWar = useClansStore((s) => s.updateClanWar);
  const myClan = useClansStore((s) => s.myClan);

  const handleMemberJoined = useCallback(
    (payload: unknown) => {
      const data = payload as ClanMemberJoinedPayload;
      if (!data?.userId) return;
      addMember({
        id: data.userId,
        userId: data.userId,
        username: data.username,
        displayName: data.displayName,
        equippedAvatarId: data.equippedAvatarId,
        role: 'member',
        wins: 0,
        gamesPlayed: 0,
        online: true,
        joinedAt: new Date().toISOString(),
      });
    },
    [addMember],
  );

  const handleMemberLeft = useCallback(
    (payload: unknown) => {
      const data = payload as ClanMemberLeftPayload;
      if (data?.userId) {
        removeMemberById(data.userId);
      }
    },
    [removeMemberById],
  );

  const handleWarUpdated = useCallback(
    (payload: unknown) => {
      const data = payload as ClanWar;
      if (data?.id) {
        updateClanWar(data);
      }
    },
    [updateClanWar],
  );

  useClansSocket('clan:member-joined', handleMemberJoined);
  useClansSocket('clan:member-left', handleMemberLeft);
  useClansSocket('clan:war-updated', handleWarUpdated);

  useFriendsSocket('clan:member-joined', handleMemberJoined);
  useFriendsSocket('clan:member-left', handleMemberLeft);
  useFriendsSocket('clan:war-updated', handleWarUpdated);

  useEffect(() => {
    if (!myClan?.id) return;
    const socket = getClansSocketRef();
    socket.emit('clans.join-room', { clanId: myClan.id });

    return () => {
      socket.emit('clans.leave-room', { clanId: myClan.id });
    };
  }, [myClan?.id]);
}
