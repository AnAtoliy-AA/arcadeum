'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { YStack, XStack, Text, ScrollView } from 'tamagui';
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
    <ScrollView padding="$4" maxWidth={640} mx="auto" width="100%">
      <YStack gap="$5">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$7" fontWeight="800">
            {tt.title ?? 'Friends'}
          </Text>
          {friends.length > 0 && (
            <Badge variant="neutral" size="sm">
              {friends.length}
            </Badge>
          )}
        </XStack>

        <Card variant="elevated" padding="md">
          <YStack gap="$3">
            <Text fontSize="$3" fontWeight="600" color="$gray11">
              Add Friend
            </Text>
            <XStack gap="$2" alignItems="center">
              <Input
                flex={1}
                size="md"
                placeholder={tt.addFriend?.placeholder ?? 'Enter username'}
                value={username}
                onChangeText={setUsername}
                onSubmitEditing={handleSendRequest}
                testID="add-friend-input"
              />
              <Button
                variant="primary"
                onClick={handleSendRequest}
                disabled={sending || !username.trim()}
                icon={<UserIcon size={16} />}
                testID="add-friend-button"
              >
                {sending
                  ? (tt.addFriend?.sending ?? 'Sending…')
                  : (tt.addFriend?.button ?? 'Add Friend')}
              </Button>
            </XStack>
          </YStack>
        </Card>

        {error && (
          <Card variant="error" padding="sm">
            <Text color="$danger" fontSize="$3">
              {error}
            </Text>
          </Card>
        )}

        {loading ? (
          <YStack alignItems="center" padding="$8" gap="$3">
            <Spinner size="md" />
            <Text color="$gray10" fontSize="$3">
              Loading friends...
            </Text>
          </YStack>
        ) : !token ? (
          <YStack alignItems="center" padding="$8" gap="$4">
            <Text color="$gray10" fontSize="$3" textAlign="center">
              {tt.loginPrompt ?? 'Log in to manage your friends list.'}
            </Text>
            <LinkButton variant="primary" href={routes.auth}>
              {tt.loginButton ?? 'Log In'}
            </LinkButton>
          </YStack>
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
              <YStack gap="$3">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize="$4" fontWeight="700">
                    {tt.requests?.incoming ?? 'Incoming Requests'}
                  </Text>
                  <Badge variant="info" size="sm">
                    {pending.incoming.length}
                  </Badge>
                </XStack>
                {pending.incoming.map((req) => (
                  <Card key={req.id} variant="default" padding="md">
                    <XStack gap="$3" alignItems="center">
                      <EquippedPlayerAvatar
                        name={req.displayName ?? req.username}
                        equippedAvatarId={req.equippedAvatarId}
                        equippedBadgeId={null}
                        size="sm"
                      />
                      <Text flex={1} fontSize="$3" fontWeight="500">
                        {req.displayName ?? req.username}
                      </Text>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(req.id)}
                        testID={`accept-${req.id}`}
                      >
                        {tt.requests?.accept ?? 'Accept'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDecline(req.id)}
                        testID={`decline-${req.id}`}
                      >
                        {tt.requests?.decline ?? 'Decline'}
                      </Button>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            )}

            {pending.outgoing.length > 0 && (
              <YStack gap="$3">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize="$4" fontWeight="700">
                    {tt.requests?.outgoing ?? 'Outgoing Requests'}
                  </Text>
                  <Badge variant="warning" size="sm">
                    {pending.outgoing.length}
                  </Badge>
                </XStack>
                {pending.outgoing.map((req) => (
                  <Card key={req.id} variant="default" padding="md">
                    <XStack gap="$3" alignItems="center">
                      <EquippedPlayerAvatar
                        name={req.displayName ?? req.username}
                        equippedAvatarId={req.equippedAvatarId}
                        equippedBadgeId={null}
                        size="sm"
                      />
                      <Text flex={1} fontSize="$3" fontWeight="500">
                        {req.displayName ?? req.username}
                      </Text>
                      <Badge variant="warning" size="sm">
                        {tt.requests?.pending ?? 'Pending'}
                      </Badge>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            )}

            {friends.length > 0 && (
              <YStack gap="$3">
                <Text fontSize="$4" fontWeight="700">
                  {tt.title ?? 'Friends'}
                </Text>
                {friends.map((friend) => (
                  <Card key={friend.id} variant="default" padding="md">
                    <XStack gap="$3" alignItems="center">
                      <EquippedPlayerAvatar
                        name={friend.displayName ?? friend.username}
                        equippedAvatarId={friend.equippedAvatarId}
                        equippedBadgeId={null}
                        size="sm"
                      />
                      <YStack flex={1} gap="$1">
                        <Text fontSize="$3" fontWeight="600">
                          {friend.displayName ?? friend.username}
                        </Text>
                        <XStack alignItems="center" gap="$2">
                          <Badge
                            variant={friend.online ? 'success' : 'neutral'}
                            size="sm"
                          >
                            {friend.online
                              ? (tt.online ?? 'Online')
                              : (tt.offline ?? 'Offline')}
                          </Badge>
                        </XStack>
                      </YStack>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleInviteToGame}
                        testID={`invite-${friend.userId}`}
                      >
                        {tt.inviteToGame ?? 'Invite'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemoveTarget(friend)}
                        testID={`remove-${friend.userId}`}
                      >
                        {tt.removeFriend ?? 'Remove'}
                      </Button>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            )}
          </>
        )}
      </YStack>

      <Modal open={!!removeTarget} onClose={() => setRemoveTarget(null)}>
        <ModalContent maxWidth={400}>
          <ModalHeader onClose={() => setRemoveTarget(null)}>
            <ModalTitle>{tt.removeFriend ?? 'Remove Friend'}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Text fontSize="$3">
              Remove {removeTarget?.displayName ?? removeTarget?.username} from
              your friends?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => removeTarget && handleRemove(removeTarget.userId)}
              testID="confirm-remove-friend"
            >
              {tt.removeFriend ?? 'Remove'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScrollView>
  );
}
