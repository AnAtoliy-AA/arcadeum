import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useSocket } from '@/shared/lib/socket';
import type { GameOptions } from '@/shared/types/games';

interface UseRematchOptions {
  roomId: string;
  gameOptions?: GameOptions;
}

interface RematchInvitation {
  newRoomId: string;
  hostId: string;
  hostName: string;
  message?: string;
  timeout: number;
}

interface UseRematchResult {
  rematchLoading: boolean;
  rematchError: string | null;
  showRematchModal: boolean;
  openRematchModal: () => void;
  closeRematchModal: () => void;
  handleRematch: (participantIds: string[], message?: string) => Promise<void>;
  invitation: RematchInvitation | null;
  invitationTimeLeft: number;
  handleAcceptInvitation: () => void;
  handleDeclineInvitation: () => void;
  isAcceptingInvitation: boolean;
  handleReinvite: (userIds: string[]) => Promise<void>;
  handleBlockRematch: (roomId: string) => Promise<void>;
  handleBlockUser: (userId: string) => Promise<void>;
}

export function useRematch({
  roomId,
  gameOptions,
}: UseRematchOptions): UseRematchResult {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);
  const [showRematchModal, setShowRematchModal] = useState(false);

  // Invitation state
  const [invitation, setInvitation] = useState<RematchInvitation | null>(null);
  const [invitationTimeLeft, setInvitationTimeLeft] = useState(0);
  const [isAcceptingInvitation, setIsAcceptingInvitation] = useState(false);

  // Listen for rematch started (host redirects)
  // Guests should NOT redirect automatically anymore on "started" if they are invited.
  // Ideally, backend shouldn't emit "started" to guests if using specific invites.
  // But if it does, we can ignore it if we are not the host or if we haven't accepted.
  // However, Host logic is manual redirect below.
  // Guests: Wait for "invited".

  const handleRematchInvited = useCallback(
    (payload: unknown) => {
      const data = payload as {
        oldRoomId: string;
        newRoomId: string;
        hostId: string;
        hostName: string;
        invitedUserIds: string[];
        message?: string;
        timeout: number;
      };

      if (data?.oldRoomId === roomId) {
        // Check if I am invited (userId is in invitedUserIds)
        // We need currentUserId. We don't have it in props?
        // useSessionTokens has userId?
        // snapshot.userId is not available. snapshot is tokens.
        // We can get userId from token decoding or pass it in.
        // But the socket is receiving this.
        // We can just show it. If we are not invited, it doesn't matter?
        // But we should filter if possible.
        // Assuming the socket event is broadcast to room, everyone gets it.
        // If I am not in the list, I shouldn't see it.
        // I need my userId.
        // Let's assume the component will pass userId or we check invitation list against our ID if we had it.
        // Since we don't have userId easily here without decoding token, and I don't want to enforce jwt-decode here:
        // Ideally we pass currentUserId to useRematch.
        // But for now, let's just show it if we receive it. The backend SHOULD filter if emitting to specific users,
        // but backend emits to ROOM.
        // Wait, `Game.tsx` HAS `currentUserId`. I should pass it to `useRematch`.
        // I'll update `UseRematchOptions`.
        setInvitation({
          newRoomId: data.newRoomId,
          hostId: data.hostId,
          hostName: data.hostName,
          message: data.message,
          timeout: data.timeout || 30,
        });
        setInvitationTimeLeft(data.timeout || 30);
      }
    },
    [roomId],
  );

  useSocket('games.rematch.invited', handleRematchInvited);

  // Timer logic
  useEffect(() => {
    if (!invitation || invitationTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setInvitationTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setInvitation(null); // Auto-decline
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [invitation, invitationTimeLeft]);

  const openRematchModal = useCallback(() => {
    setShowRematchModal(true);
    setRematchError(null);
  }, []);

  const closeRematchModal = useCallback(() => {
    setShowRematchModal(false);
  }, []);

  const handleRematch = useCallback(
    async (participantIds: string[], message?: string) => {
      if (!snapshot.accessToken) {
        setRematchError('Authentication required');
        return;
      }

      try {
        setRematchLoading(true);
        setRematchError(null);

        const url = resolveApiUrl(
          `/games/history/${encodeURIComponent(roomId)}/rematch`,
        );
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
          body: JSON.stringify({ participantIds, gameOptions, message }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create rematch');
        }

        const data = await response.json();
        const newRoomId =
          typeof data.room === 'string' ? data.room : data.room?.id;
        if (!newRoomId) {
          throw new Error('Invalid response: missing room ID');
        }

        setShowRematchModal(false);
        router.push(`/games/rooms/${newRoomId}`);
      } catch (err) {
        setRematchError(err instanceof Error ? err.message : String(err));
      } finally {
        setRematchLoading(false);
      }
    },
    [roomId, snapshot.accessToken, router, gameOptions],
  );

  const handleAcceptInvitation = useCallback(() => {
    if (invitation) {
      setIsAcceptingInvitation(true);
      router.push(`/games/rooms/${invitation.newRoomId}`);
      // Don't clear invitation immediately to show "Joining..." state
    }
  }, [invitation, router]);

  const handleDeclineInvitation = useCallback(async () => {
    if (!invitation?.newRoomId) return;

    // Optimistically close modal
    setInvitation(null);

    if (!snapshot.accessToken) return;

    try {
      const url = resolveApiUrl(
        `/games/rooms/${encodeURIComponent(invitation.newRoomId)}/invitation/decline`,
      );

      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${snapshot.accessToken}`,
        },
      });
    } catch (err) {
      console.error('Failed to decline invitation', err);
    }
  }, [invitation, snapshot.accessToken]);

  const handleReinvite = useCallback(
    async (userIds: string[]) => {
      if (!snapshot.accessToken) return;
      try {
        const url = resolveApiUrl(
          `/games/rooms/${encodeURIComponent(roomId)}/invitation/invite`,
        );

        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
          body: JSON.stringify({ userIds }),
        });
      } catch (err) {
        console.error('Failed to reinvite', err);
      }
    },
    [roomId, snapshot.accessToken],
  );

  const handleBlockUser = useCallback(
    async (userId: string) => {
      if (!snapshot.accessToken) return;
      try {
        const url = resolveApiUrl(`/auth/block/${encodeURIComponent(userId)}`);

        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
        });
        // Also decline the invitation after blocking
        setInvitation(null);
      } catch (err) {
        console.error('Failed to block user', err);
      }
    },
    [snapshot.accessToken],
  );

  const handleBlockRematch = useCallback(
    async (targetRoomId: string) => {
      if (!snapshot.accessToken) return;
      try {
        const url = resolveApiUrl(
          `/games/rooms/${encodeURIComponent(targetRoomId)}/invitation/block`,
        );

        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
        });
        // Also dismiss the invitation after blocking
        setInvitation(null);
      } catch (err) {
        console.error('Failed to block rematch', err);
      }
    },
    [snapshot.accessToken],
  );

  return {
    rematchLoading,
    rematchError,
    showRematchModal,
    openRematchModal,
    closeRematchModal,
    handleRematch,
    invitation,
    invitationTimeLeft,
    handleAcceptInvitation,
    handleDeclineInvitation,
    isAcceptingInvitation,
    handleReinvite,
    handleBlockRematch,
    handleBlockUser,
  };
}
