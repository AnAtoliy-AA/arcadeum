import { useCallback, useEffect } from 'react';
import { getClansSocketRef, useFriendsSocket } from '@/shared/lib/socket';
import { useClansStore } from '../store/clansStore';

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
  // Actions are stable references; myClan is the only reactive slice.
  const addMember = useClansStore((s) => s.addMember);
  const removeMemberById = useClansStore((s) => s.removeMemberById);
  const myClan = useClansStore((s) => s.myClan);

  const handleMemberJoined = useCallback(
    (payload: ClanMemberJoinedPayload) => {
      addMember({
        id: payload.userId,
        userId: payload.userId,
        username: payload.username,
        displayName: payload.displayName,
        equippedAvatarId: payload.equippedAvatarId,
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
    (payload: ClanMemberLeftPayload) => {
      removeMemberById(payload.userId);
    },
    [removeMemberById],
  );

  useFriendsSocket(
    'clan:member-joined',
    handleMemberJoined as (...args: unknown[]) => void,
  );
  useFriendsSocket(
    'clan:member-left',
    handleMemberLeft as (...args: unknown[]) => void,
  );

  const connectToClanRoom = useCallback(() => {
    if (myClan) {
      const socket = getClansSocketRef();
      socket.emit('clans.join-room', { clanId: myClan.id });
    }
  }, [myClan]);

  useEffect(() => {
    if (myClan) {
      connectToClanRoom();
    }
  }, [myClan, connectToClanRoom]);
}
