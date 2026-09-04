'use client';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  EmptyState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Badge,
  Spinner,
  LinkButton,
} from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { connectFriendsSocket, useFriendsSocket } from '@/shared/lib/socket';
import { useRoutes } from '@/shared/config/useRoutes';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import {
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  type Friend,
  type FriendRequest,
} from '@/shared/api/friends';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import { UserIcon } from '@arcadeum/ui/components/Icons/index';
import { chatApi } from '@/features/chat/api';
import { AddFriendCard } from './AddFriendCard';

const GamePickerModal = lazy(() =>
  import('@/features/games/ui/GamePickerModal').then((m) => ({
    default: m.GamePickerModal,
  })),
);

type FriendsTranslations = {
  title?: string;
  emptyState?: string;
  addFriend?: {
    label?: string;
    placeholder?: string;
    button?: string;
    sending?: string;
    noResults?: string;
  };
  requests?: {
    incoming?: string;
    outgoing?: string;
    accept?: string;
    decline?: string;
    cancel?: string;
    pending?: string;
    empty?: string;
  };
  online?: string;
  offline?: string;
  removeFriend?: string;
  removeConfirm?: string;
  inviteToGame?: string;
  inviteGameTitle?: string;
  chat?: string;
  loginPrompt?: string;
  loginButton?: string;
  loading?: string;
  cancel?: string;
};

export default function FriendsPageContent({
  t,
  accessToken,
}: {
  t?: PageTranslations;
  accessToken?: string;
}) {
  const tt = (t ?? {}) as FriendsTranslations;
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? accessToken;
  const router = useRouter();
  const routes = useRoutes();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<{
    incoming: FriendRequest[];
    outgoing: FriendRequest[];
  }>({ incoming: [], outgoing: [] });
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [friendsData, pendingData] = await Promise.all([
        getFriends(token),
        getPendingRequests(token),
      ]);
      setFriends(friendsData);
      setPending(pendingData);
      setError(null);
    } catch {
      setError('Failed to load friends');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching in effect
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!token) return;
    const disconnect = connectFriendsSocket(token);
    return disconnect;
  }, [token]);

  useFriendsSocket('friend:request', () => {
    void loadData();
  });

  useFriendsSocket('friend:accepted', () => {
    void loadData();
  });

  useFriendsSocket('friend:removed', () => {
    void loadData();
  });

  useFriendsSocket('friend:declined', () => {
    void loadData();
  });

  useFriendsSocket('friend:cancelled', () => {
    void loadData();
  });

  useFriendsSocket('presence:update', () => {
    void loadData();
  });

  const handleAccept = async (id: string) => {
    if (!token) return;
    setActingId(id);
    setError(null);
    try {
      await acceptFriendRequest(token, id);
      void loadData();
    } catch {
      setError('Could not accept friend request');
    } finally {
      setActingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    if (!token) return;
    setActingId(id);
    setError(null);
    try {
      await declineFriendRequest(token, id);
      void loadData();
    } catch {
      setError('Could not decline friend request');
    } finally {
      setActingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!token) return;
    setActingId(id);
    setError(null);
    try {
      await cancelFriendRequest(token, id);
      void loadData();
    } catch {
      setError('Could not cancel friend request');
    } finally {
      setActingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!token) return;
    setActingId(id);
    setError(null);
    try {
      await removeFriend(token, id);
      setRemoveTarget(null);
      void loadData();
    } catch {
      setError('Could not remove friend');
    } finally {
      setActingId(null);
    }
  };

  const [inviteUserId, setInviteUserId] = useState<string | null>(null);

  const handleInviteToGame = useCallback((friendUserId: string) => {
    setInviteUserId(friendUserId);
  }, []);

  const handleStartChat = useCallback(
    async (friend: Friend) => {
      if (!token || !snapshot.userId) return;
      try {
        const response = await chatApi.createChat(
          { users: [snapshot.userId, friend.userId] },
          { token },
        );
        router.push(
          `/chat?chatId=${response.chatId}&receiverIds=${friend.userId}&title=${encodeURIComponent(friend.displayName || friend.username)}`,
        );
      } catch {
        router.push(
          `/chat?receiverIds=${friend.userId}&title=${encodeURIComponent(friend.displayName || friend.username)}`,
        );
      }
    },
    [token, snapshot.userId, router],
  );

  const hasAnyContent =
    friends.length > 0 ||
    pending.incoming.length > 0 ||
    pending.outgoing.length > 0;

  return (
    <div className="p-4 max-w-[640px] w-full">
      <div className="flex flex-col items-stretch gap-5">
        <div className="flex flex-row justify-between items-center">
          <span className="text-[28px] font-extrabold">
            {tt.title ?? 'Friends'}
          </span>
          {friends.length > 0 && (
            <Badge variant="neutral" size="sm">
              {friends.length}
            </Badge>
          )}
        </div>

        <AddFriendCard tt={tt.addFriend} onSent={() => void loadData()} />

        {error && (
          <Card variant="error">
            <span className="text-[var(--danger)] text-[16px]">{error}</span>
          </Card>
        )}

        {loading ? (
          <div className="flex flex-col items-center p-8 gap-3">
            <Spinner size="md" />
            <span className="text-[#6b7280] text-[16px]">
              {tt.loading ?? 'Loading friends...'}
            </span>
          </div>
        ) : !token ? (
          <div className="flex flex-col items-center p-8 gap-4">
            <span className="text-[#6b7280] text-[16px] text-center">
              {tt.loginPrompt ?? 'Log in to manage your friends list.'}
            </span>
            <LinkButton variant="primary" href={routes.auth}>
              {tt.loginButton ?? 'Log In'}
            </LinkButton>
          </div>
        ) : !hasAnyContent ? (
          <EmptyState
            message={
              tt.emptyState ?? 'No friends yet. Add friends to see them here.'
            }
            icon={<UserIcon size={32} />}
          />
        ) : (
          <>
            {pending.incoming.length > 0 && (
              <div className="flex flex-col items-stretch gap-3">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-[18px] font-bold">
                    {tt.requests?.incoming ?? 'Incoming Requests'}
                  </span>
                  <Badge variant="info" size="sm">
                    {pending.incoming.length}
                  </Badge>
                </div>
                {pending.incoming.map((req) => (
                  <Card key={req.id} variant="default">
                    <div className="flex flex-row gap-3 items-center">
                      <EquippedPlayerAvatar
                        name={req.displayName ?? req.username}
                        equippedAvatarId={req.equippedAvatarId}
                        equippedBadgeId={null}
                        size="sm"
                      />
                      <button
                        type="button"
                        className="flex-1 text-left text-[16px] font-medium hover:underline cursor-pointer"
                        onClick={() => router.push(routes.profile(req.userId))}
                      >
                        {req.displayName ?? req.username}
                      </button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(req.id)}
                        disabled={actingId === req.id}
                        data-testid={`accept-${req.id}`}
                      >
                        {tt.requests?.accept ?? 'Accept'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDecline(req.id)}
                        disabled={actingId === req.id}
                        data-testid={`decline-${req.id}`}
                      >
                        {tt.requests?.decline ?? 'Decline'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {pending.outgoing.length > 0 && (
              <div className="flex flex-col items-stretch gap-3">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-[18px] font-bold">
                    {tt.requests?.outgoing ?? 'Outgoing Requests'}
                  </span>
                  <Badge variant="warning" size="sm">
                    {pending.outgoing.length}
                  </Badge>
                </div>
                {pending.outgoing.map((req) => (
                  <Card key={req.id} variant="default">
                    <div className="flex flex-row gap-3 items-center">
                      <EquippedPlayerAvatar
                        name={req.displayName ?? req.username}
                        equippedAvatarId={req.equippedAvatarId}
                        equippedBadgeId={null}
                        size="sm"
                      />
                      <button
                        type="button"
                        className="flex-1 text-left text-[16px] font-medium hover:underline cursor-pointer"
                        onClick={() => router.push(routes.profile(req.userId))}
                      >
                        {req.displayName ?? req.username}
                      </button>
                      <Badge variant="warning" size="sm">
                        {tt.requests?.pending ?? 'Pending'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(req.id)}
                        disabled={actingId === req.id}
                        data-testid={`cancel-${req.id}`}
                      >
                        {tt.requests?.cancel ?? 'Cancel'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {friends.length > 0 && (
              <div className="flex flex-col items-stretch gap-3">
                <span className="text-[18px] font-bold">
                  {tt.title ?? 'Friends'}
                </span>
                {friends.map((friend) => (
                  <Card key={friend.id} variant="default">
                    <div className="flex flex-row gap-3 items-center">
                      <EquippedPlayerAvatar
                        name={friend.displayName ?? friend.username}
                        equippedAvatarId={friend.equippedAvatarId}
                        equippedBadgeId={null}
                        size="sm"
                      />
                      <div
                        className="flex flex-col items-stretch flex-1 gap-1 cursor-pointer"
                        onClick={() =>
                          router.push(routes.profile(friend.userId))
                        }
                      >
                        <span className="text-[16px] font-semibold hover:underline">
                          {friend.displayName ?? friend.username}
                        </span>
                        <div className="flex flex-row items-center gap-2">
                          <Badge
                            variant={friend.online ? 'success' : 'neutral'}
                            size="sm"
                          >
                            {friend.online
                              ? (tt.online ?? 'Online')
                              : (tt.offline ?? 'Offline')}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleInviteToGame(friend.userId)}
                        data-testid={`invite-${friend.userId}`}
                      >
                        {tt.inviteToGame ?? 'Invite'}
                      </Button>
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => handleStartChat(friend)}
                        data-testid={`chat-${friend.userId}`}
                      >
                        {tt.chat ?? 'Chat'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemoveTarget(friend)}
                        data-testid={`remove-${friend.userId}`}
                      >
                        {tt.removeFriend ?? 'Remove'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={!!removeTarget} onClose={() => setRemoveTarget(null)}>
        <ModalContent maxWidth={400}>
          <ModalHeader onClose={() => setRemoveTarget(null)}>
            <ModalTitle>{tt.removeFriend ?? 'Remove Friend'}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <span className="text-[16px]">
              {(tt.removeConfirm ?? 'Remove {name} from your friends?').replace(
                '{name}',
                removeTarget?.displayName ?? removeTarget?.username ?? '',
              )}
            </span>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
              {tt.cancel ?? 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={() => removeTarget && handleRemove(removeTarget.userId)}
              disabled={actingId === removeTarget?.userId}
              data-testid="confirm-remove-friend"
            >
              {tt.removeFriend ?? 'Remove'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Suspense fallback={null}>
        <GamePickerModal
          open={!!inviteUserId}
          onClose={() => setInviteUserId(null)}
          inviteUserId={inviteUserId ?? undefined}
          title={tt.inviteGameTitle ?? 'Pick a game to invite a friend'}
        />
      </Suspense>
    </div>
  );
}
