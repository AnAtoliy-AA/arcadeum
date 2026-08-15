'use client';
import { useCallback, useEffect, useState } from 'react';
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
  Input,
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
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  type Friend,
  type FriendRequest,
} from '@/shared/api/friends';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import { UserIcon } from '@arcadeum/ui/components/Icons/index';

type FriendsTranslations = {
  title?: string;
  emptyState?: string;
  addFriend?: { placeholder?: string; button?: string; sending?: string };
  requests?: {
    incoming?: string;
    outgoing?: string;
    accept?: string;
    decline?: string;
    pending?: string;
    empty?: string;
  };
  online?: string;
  offline?: string;
  removeFriend?: string;
  inviteToGame?: string;
  loginPrompt?: string;
  loginButton?: string;
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
  const [username, setUsername] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);

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

  useFriendsSocket('presence:update', () => {
    void loadData();
  });

  const handleSendRequest = async () => {
    if (!token || !username.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendFriendRequest(token, username.trim());
      setUsername('');
      void loadData();
    } catch {
      setError('Could not send friend request');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (id: string) => {
    if (!token) return;
    await acceptFriendRequest(token, id);
    void loadData();
  };

  const handleDecline = async (id: string) => {
    if (!token) return;
    await declineFriendRequest(token, id);
    void loadData();
  };

  const handleRemove = async (id: string) => {
    if (!token) return;
    await removeFriend(token, id);
    setRemoveTarget(null);
    void loadData();
  };

  const handleInviteToGame = useCallback(() => {
    router.push(routes.gameCreate);
  }, [router, routes.gameCreate]);

  const hasAnyContent =
    friends.length > 0 ||
    pending.incoming.length > 0 ||
    pending.outgoing.length > 0;

  return (
    <div className="box-border overflow-auto p-4 max-w-[640px] w-full">
      <div className="box-border flex flex-col items-stretch gap-5">
        <div className="box-border flex flex-row justify-space-between items-center">
          <span className="box-border text-[28px] font-extrabold">
            {tt.title ?? 'Friends'}
          </span>
          {friends.length > 0 && (
            <Badge variant="neutral" size="sm">
              {friends.length}
            </Badge>
          )}
        </div>

        <Card variant="elevated">
          <div className="box-border flex flex-col items-stretch gap-3">
            <span className="box-border text-[16px] font-semibold text-[#94a3b8]">
              Add Friend
            </span>
            <div className="box-border flex flex-row gap-2 items-center">
              <Input
                className="flex-1"
                size="md"
                placeholder={tt.addFriend?.placeholder ?? 'Enter username'}
                value={username}
                onChangeText={setUsername}
                onSubmitEditing={handleSendRequest}
                data-testid="add-friend-input"
              />
              <Button
                variant="primary"
                onClick={handleSendRequest}
                disabled={sending || !username.trim()}
                icon={<UserIcon size={16} />}
                data-testid="add-friend-button"
              >
                {sending
                  ? (tt.addFriend?.sending ?? 'Sending…')
                  : (tt.addFriend?.button ?? 'Add Friend')}
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Card variant="error">
            <span className="box-border text-[var(--danger)] text-[16px]">
              {error}
            </span>
          </Card>
        )}

        {loading ? (
          <div className="box-border flex flex-col items-center p-8 gap-3">
            <Spinner size="md" />
            <span className="box-border text-[#6b7280] text-[16px]">
              Loading friends...
            </span>
          </div>
        ) : !token ? (
          <div className="box-border flex flex-col items-center p-8 gap-4">
            <span className="box-border text-[#6b7280] text-[16px] text-center">
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
              <div className="box-border flex flex-col items-stretch gap-3">
                <div className="box-border flex flex-row items-center gap-2">
                  <span className="box-border text-[18px] font-bold">
                    {tt.requests?.incoming ?? 'Incoming Requests'}
                  </span>
                  <Badge variant="info" size="sm">
                    {pending.incoming.length}
                  </Badge>
                </div>
                {pending.incoming.map((req) => (
                  <Card key={req.id} variant="default">
                    <div className="box-border flex flex-row gap-3 items-center">
                      <EquippedPlayerAvatar
                        name={req.displayName ?? req.username}
                        equippedAvatarId={req.equippedAvatarId}
                        equippedBadgeId={null}
                        size="sm"
                      />
                      <span className="box-border flex-1 text-[16px] font-medium">
                        {req.displayName ?? req.username}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(req.id)}
                        data-testid={`accept-${req.id}`}
                      >
                        {tt.requests?.accept ?? 'Accept'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDecline(req.id)}
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
              <div className="box-border flex flex-col items-stretch gap-3">
                <div className="box-border flex flex-row items-center gap-2">
                  <span className="box-border text-[18px] font-bold">
                    {tt.requests?.outgoing ?? 'Outgoing Requests'}
                  </span>
                  <Badge variant="warning" size="sm">
                    {pending.outgoing.length}
                  </Badge>
                </div>
                {pending.outgoing.map((req) => (
                  <Card key={req.id} variant="default">
                    <div className="box-border flex flex-row gap-3 items-center">
                      <EquippedPlayerAvatar
                        name={req.displayName ?? req.username}
                        equippedAvatarId={req.equippedAvatarId}
                        equippedBadgeId={null}
                        size="sm"
                      />
                      <span className="box-border flex-1 text-[16px] font-medium">
                        {req.displayName ?? req.username}
                      </span>
                      <Badge variant="warning" size="sm">
                        {tt.requests?.pending ?? 'Pending'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {friends.length > 0 && (
              <div className="box-border flex flex-col items-stretch gap-3">
                <span className="box-border text-[18px] font-bold">
                  {tt.title ?? 'Friends'}
                </span>
                {friends.map((friend) => (
                  <Card key={friend.id} variant="default">
                    <div className="box-border flex flex-row gap-3 items-center">
                      <EquippedPlayerAvatar
                        name={friend.displayName ?? friend.username}
                        equippedAvatarId={friend.equippedAvatarId}
                        equippedBadgeId={null}
                        size="sm"
                      />
                      <div className="box-border flex flex-col items-stretch flex-1 gap-1">
                        <span className="box-border text-[16px] font-semibold">
                          {friend.displayName ?? friend.username}
                        </span>
                        <div className="box-border flex flex-row items-center gap-2">
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
                        onClick={handleInviteToGame}
                        data-testid={`invite-${friend.userId}`}
                      >
                        {tt.inviteToGame ?? 'Invite'}
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
            <span className="box-border text-[16px]">
              Remove {removeTarget?.displayName ?? removeTarget?.username} from
              your friends?
            </span>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => removeTarget && handleRemove(removeTarget.userId)}
              data-testid="confirm-remove-friend"
            >
              {tt.removeFriend ?? 'Remove'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
