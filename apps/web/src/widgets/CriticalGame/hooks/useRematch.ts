import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useSocket } from '@/shared/lib/socket';
import { rematchApi } from '@/features/rematch/api';
import type { GameOptions } from '@/shared/types/games';

interface UseRematchOptions {
  roomId: string;
  gameOptions?: GameOptions;
}

export interface RematchInvitation {
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
  handleReinvite: (userIds: string[]) => void;
  handleBlockRematch: (roomId: string) => void;
  handleBlockUser: (userId: string) => void;
}

export function useRematch({
  roomId,
  gameOptions,
}: UseRematchOptions): UseRematchResult {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const [rematchError, setRematchError] = useState<string | null>(null);
  const [showRematchModal, setShowRematchModal] = useState(false);

  // Invitation state
  const [invitation, setInvitation] = useState<RematchInvitation | null>(null);
  const [invitationTimeLeft, setInvitationTimeLeft] = useState(0);
  const [isAcceptingInvitation, setIsAcceptingInvitation] = useState(false);

  // Use ref to track current invitation for timer callback
  const invitationRef = useRef(invitation);
  useEffect(() => {
    invitationRef.current = invitation;
  }, [invitation]);

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

      if (data?.oldRoomId === roomId) {
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

  // Mutation for creating a rematch
  const { mutateAsync: createRematchMutate, isPending: rematchLoading } =
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
        if (newRoomId) {
          setShowRematchModal(false);
          router.push(`/games/rooms/${newRoomId}`);
        }
      },
      onError: (err) => {
        setRematchError(err instanceof Error ? err.message : String(err));
      },
    });

  // Mutation for declining invitation
  const { mutate: declineInvitationMutate } = useMutation({
    mutationFn: async (targetRoomId: string) => {
      return rematchApi.declineInvitation(targetRoomId, {
        token: snapshot.accessToken || undefined,
      });
    },
    onError: () => {},
  });

  // Mutation for reinviting users
  const { mutate: reinviteMutate } = useMutation({
    mutationFn: async (userIds: string[]) => {
      return rematchApi.reinvite(roomId, userIds, {
        token: snapshot.accessToken || undefined,
      });
    },
    onError: (_err) => {},
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
    onError: (_err) => {},
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
    onError: (_err) => {},
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

          if (snapshot.accessToken && currentInvitation?.newRoomId) {
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
    snapshot.accessToken,
    declineInvitationMutate,
    invitationTimeLeft,
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
      if (!snapshot.accessToken) {
        setRematchError('Authentication required');
        return;
      }
      setRematchError(null);
      await createRematchMutate({ participantIds, message });
    },
    [snapshot.accessToken, createRematchMutate],
  );

  const handleAcceptInvitation = useCallback(() => {
    if (invitation) {
      setIsAcceptingInvitation(true);
      router.push(`/games/rooms/${invitation.newRoomId}`);
    }
  }, [invitation, router]);

  const handleDeclineInvitation = useCallback(() => {
    if (!invitation?.newRoomId) return;

    const targetRoomId = invitation.newRoomId;
    setInvitation(null);

    if (snapshot.accessToken) {
      declineInvitationMutate(targetRoomId);
    }
  }, [invitation, snapshot.accessToken, declineInvitationMutate]);

  const handleReinvite = useCallback(
    (userIds: string[]) => {
      if (snapshot.accessToken) {
        reinviteMutate(userIds);
      }
    },
    [snapshot.accessToken, reinviteMutate],
  );

  const handleBlockUser = useCallback(
    (userId: string) => {
      if (snapshot.accessToken) {
        blockUserMutate(userId);
      }
    },
    [snapshot.accessToken, blockUserMutate],
  );

  const handleBlockRematch = useCallback(
    (targetRoomId: string) => {
      if (snapshot.accessToken) {
        blockRematchMutate(targetRoomId);
      }
    },
    [snapshot.accessToken, blockRematchMutate],
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
