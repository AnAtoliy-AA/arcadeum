import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@/shared/hooks/useMutation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useSocket } from '@/shared/lib/socket';
import { rematchApi } from '@/features/rematch/api';
import { useRoutes } from '@/shared/config/useRoutes';
import { useGameRematchStore } from '@/features/games/store/gameRematchStore';
import { useSound } from '@/shared/lib/sound';
import {
  setRematchTabAlert,
  clearRematchTabAlert,
} from '@/features/games/lib/rematchTabAlert';

export type {
  UseRematchOptions,
  RematchInvitation,
  RematchWaitingState,
  UseRematchResult,
} from './useRematch.types';
import type {
  UseRematchOptions,
  RematchInvitation,
  RematchWaitingState,
  UseRematchResult,
} from './useRematch.types';

export function useRematch({
  roomId,
  gameOptions,
}: UseRematchOptions): UseRematchResult {
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const { play } = useSound();
  const [rematchError, setRematchError] = useState<string | null>(null);
  const [showRematchModal, setShowRematchModal] = useState(false);

  // Invitation state
  const [invitation, setInvitation] = useState<RematchInvitation | null>(null);
  const [invitationTimeLeft, setInvitationTimeLeft] = useState(0);
  const [isAcceptingInvitation, setIsAcceptingInvitation] = useState(false);
  const [waiting, setWaiting] = useState<RematchWaitingState | null>(null);
  const [waitingTimeLeft, setWaitingTimeLeft] = useState(30);

  // Use ref to track current invitation for timer callback
  const invitationRef = useRef(invitation);
  useEffect(() => {
    invitationRef.current = invitation;
  }, [invitation]);

  const waitingRef = useRef(waiting);
  useEffect(() => {
    waitingRef.current = waiting;
  }, [waiting]);

  // Countdown timer for rematch waiting state with auto-cancellation
  useEffect(() => {
    if (!waiting || waiting.status !== 'waiting' || waitingTimeLeft <= 0)
      return;

    const timer = setInterval(() => {
      setWaitingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const currentWaiting = waitingRef.current;
          if (currentWaiting?.newRoomId && snapshot.userId) {
            void rematchApi
              .cancelInvitation(currentWaiting.newRoomId, {
                token: snapshot.accessToken || undefined,
              })
              .catch(() => {});
          }
          setWaiting((current) =>
            current ? { ...current, status: 'expired' } : null,
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [waiting, waitingTimeLeft, snapshot.userId, snapshot.accessToken]);

  // Socket handler for rematch invitations
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

      if (
        data?.oldRoomId === roomId &&
        data.hostId !== snapshot.userId &&
        data.invitedUserIds?.includes(snapshot.userId || '')
      ) {
        setInvitation({
          newRoomId: data.newRoomId,
          hostId: data.hostId,
          hostName: data.hostName,
          message: data.message,
          timeout: data.timeout || 30,
        });
        setInvitationTimeLeft(data.timeout || 30);
        play('notification');
        setRematchTabAlert('⚔️ Rematch Invited!');
      }
    },
    [roomId, snapshot.userId, play],
  );

  useSocket('games.rematch.invited', handleRematchInvited);

  const handleRematchStatus = useCallback(
    (payload: unknown) => {
      const data = payload as {
        oldRoomId?: string;
        newRoomId?: string;
        status?: RematchWaitingState['status'] | 'accepted';
        userId?: string;
        pendingUserIds?: string[];
        acceptedUserIds?: string[];
        declinedUserIds?: string[];
        rematchNumber?: number;
      };
      if (
        (data.oldRoomId !== roomId &&
          data.newRoomId !== waitingRef.current?.newRoomId) ||
        !data.newRoomId
      ) {
        return;
      }

      if (data.status === 'cancelled' || data.status === 'expired') {
        clearRematchTabAlert();
        setWaiting({
          newRoomId: data.newRoomId,
          pendingUserIds: [],
          acceptedUserIds: data.acceptedUserIds || [],
          declinedUserIds: data.declinedUserIds || [],
          status: data.status,
          rematchNumber: data.rematchNumber,
        });
        return;
      }

      const pending = data.pendingUserIds || [];
      const accepted = data.acceptedUserIds || [];
      const declined = data.declinedUserIds || [];

      if (
        data.status === 'declined' &&
        pending.length === 0 &&
        accepted.length <= 1
      ) {
        clearRematchTabAlert();
        play('rematchDeclined');
        setWaiting({
          newRoomId: data.newRoomId,
          pendingUserIds: [],
          acceptedUserIds: accepted,
          declinedUserIds: declined,
          status: 'declined',
          rematchNumber: data.rematchNumber,
        });
        return;
      }

      if (accepted.length > 1 && (declined.length > 0 || pending.length > 0)) {
        setWaiting({
          newRoomId: data.newRoomId,
          pendingUserIds: pending,
          acceptedUserIds: accepted,
          declinedUserIds: declined,
          status: pending.length === 0 ? 'partial' : 'waiting',
          rematchNumber: data.rematchNumber,
        });
        return;
      }

      if (data.status === 'accepted' && pending.length === 0) {
        clearRematchTabAlert();
        play('rematchAccepted');
        setWaiting({
          newRoomId: data.newRoomId,
          pendingUserIds: [],
          acceptedUserIds: accepted,
          declinedUserIds: declined,
          status: 'accepted',
          rematchNumber: data.rematchNumber,
        });
        router.push(routes.gameRoom(data.newRoomId));
        return;
      }

      setWaiting({
        newRoomId: data.newRoomId,
        pendingUserIds: pending,
        acceptedUserIds: accepted,
        declinedUserIds: declined,
        status: data.status === 'declined' ? 'declined' : 'waiting',
        rematchNumber: data.rematchNumber,
      });
    },
    [roomId, router, routes, play],
  );

  useSocket('games.rematch.status', handleRematchStatus);

  // Mutation for creating a rematch
  const { mutateAsync: createRematchMutate, isLoading: rematchLoading } =
    useMutation({
      mutationFn: async (params: {
        participantIds: string[];
        message?: string;
      }) => {
        return rematchApi.createRematch(
          roomId,
          {
            participantIds: params.participantIds,
            gameOptions,
            message: params.message,
          },
          { token: snapshot.accessToken || undefined },
        );
      },
      onSuccess: (data) => {
        const newRoomId =
          typeof data.room === 'string' ? data.room : data.room?.id;
        if (newRoomId && !data.pending) {
          setShowRematchModal(false);
          router.push(routes.gameRoom(newRoomId));
        } else if (data.pending) {
          setShowRematchModal(false);
          setWaitingTimeLeft(30);
          setWaiting({
            newRoomId: newRoomId || '',
            pendingUserIds: data.pendingUserIds || [],
            acceptedUserIds: [snapshot.userId || ''],
            declinedUserIds: [],
            status: 'waiting',
          });
        }
      },
      onError: (err) => {
        setRematchError(err instanceof Error ? err.message : String(err));
      },
    });

  useEffect(() => {
    useGameRematchStore.setState({ rematchLoading });
  }, [rematchLoading]);

  // Mutation for declining invitation
  const { mutate: declineInvitationMutate } = useMutation({
    mutationFn: async (targetRoomId: string) => {
      return rematchApi.declineInvitation(targetRoomId, {
        token: snapshot.accessToken || undefined,
      });
    },
  });

  // Mutation for reinviting users
  const { mutate: reinviteMutate } = useMutation({
    mutationFn: async (userIds: string[]) => {
      return rematchApi.reinvite(roomId, userIds, {
        token: snapshot.accessToken || undefined,
      });
    },
  });

  // Mutation for blocking rematch
  const { mutate: blockRematchMutate } = useMutation({
    mutationFn: async (targetRoomId: string) => {
      return rematchApi.blockRematch(targetRoomId, {
        token: snapshot.accessToken || undefined,
      });
    },
    onSuccess: () => {
      setInvitation(null);
    },
  });

  // Mutation for blocking user
  const { mutate: blockUserMutate } = useMutation({
    mutationFn: async (userId: string) => {
      return rematchApi.blockUser(userId, {
        token: snapshot.accessToken || undefined,
      });
    },
    onSuccess: () => {
      setInvitation(null);
    },
  });

  // Timer logic - auto-decline when time expires
  useEffect(() => {
    if (!invitation || invitationTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setInvitationTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const currentInvitation = invitationRef.current;
          setInvitation(null);

          if (snapshot.userId && currentInvitation?.newRoomId) {
            declineInvitationMutate(currentInvitation.newRoomId);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    invitation,
    invitationTimeLeft,
    snapshot.userId,
    declineInvitationMutate,
  ]);

  const openRematchModal = useCallback(() => {
    setShowRematchModal(true);
    setRematchError(null);
  }, []);

  const closeRematchModal = useCallback(() => {
    setShowRematchModal(false);
  }, []);

  const handleRematch = useCallback(
    async (participantIds: string[], message?: string) => {
      if (!snapshot.userId) {
        setRematchError('Authentication required');
        return;
      }
      setRematchError(null);
      await createRematchMutate({ participantIds, message });
    },
    [snapshot.userId, createRematchMutate],
  );

  useEffect(() => {
    const handleFocus = () => {
      clearRematchTabAlert();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearRematchTabAlert();
    };
  }, []);

  const handleAcceptInvitation = useCallback(() => {
    if (invitation) {
      clearRematchTabAlert();
      setIsAcceptingInvitation(true);
      void rematchApi
        .acceptInvitation(invitation.newRoomId, {
          token: snapshot.accessToken || undefined,
        })
        .then(() => router.push(routes.gameRoom(invitation.newRoomId)))
        .catch(() => setIsAcceptingInvitation(false));
    }
  }, [invitation, router, routes, snapshot.accessToken]);

  const handleDeclineInvitation = useCallback(() => {
    if (!invitation?.newRoomId) return;

    clearRematchTabAlert();
    const targetRoomId = invitation.newRoomId;
    setInvitation(null);

    if (snapshot.userId) {
      declineInvitationMutate(targetRoomId);
    }
  }, [invitation, snapshot.userId, declineInvitationMutate]);

  const handleReinvite = useCallback(
    (userIds: string[]) => {
      if (snapshot.userId) {
        reinviteMutate(userIds);
      }
    },
    [snapshot.userId, reinviteMutate],
  );

  const handleBlockUser = useCallback(
    (userId: string) => {
      if (snapshot.userId) {
        blockUserMutate(userId);
      }
    },
    [snapshot.userId, blockUserMutate],
  );

  const handleBlockRematch = useCallback(
    (targetRoomId: string) => {
      if (snapshot.userId) {
        blockRematchMutate(targetRoomId);
      }
    },
    [snapshot.userId, blockRematchMutate],
  );

  const cancelRematch = useCallback(() => {
    if (!waiting?.newRoomId || !snapshot.userId) return;
    clearRematchTabAlert();
    void rematchApi
      .cancelInvitation(waiting.newRoomId, {
        token: snapshot.accessToken || undefined,
      })
      .then(() => {
        setWaiting((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      });
  }, [snapshot.accessToken, snapshot.userId, waiting]);

  const joinRematchRoom = useCallback(() => {
    if (waiting?.newRoomId) {
      clearRematchTabAlert();
      router.push(routes.gameRoom(waiting.newRoomId));
    }
  }, [waiting, router, routes]);

  const dismissWaiting = useCallback(() => {
    clearRematchTabAlert();
    setWaiting(null);
  }, []);

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
    waiting,
    waitingTimeLeft,
    cancelRematch,
    joinRematchRoom,
    dismissWaiting,
  };
}
