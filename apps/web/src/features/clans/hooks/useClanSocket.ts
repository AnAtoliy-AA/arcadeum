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
    (payload: unknown) => {
      const data = payload as ClanMemberJoinedPayload;
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
      removeMemberById(data.userId);
    },
    [removeMemberById],
  );

  useFriendsSocket('clan:member-joined', handleMemberJoined);
  useFriendsSocket('clan:member-left', handleMemberLeft);

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
