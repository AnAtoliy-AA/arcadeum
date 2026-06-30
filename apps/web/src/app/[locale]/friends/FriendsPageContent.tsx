'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  YStack,
  XStack,
  Text,
  Input,
  Separator,
  ScrollView,
} from 'tamagui';
import { Button } from '@arcadeum/ui';
import { useSession } from '@/shared/lib/useTranslation';
import { connectFriendsSocket, useFriendsSocket } from '@/shared/lib/socket';
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
};

export default function FriendsPageContent({
  t,
  accessToken,
}: {
  t?: PageTranslations;
  accessToken?: string;
}) {
  const tt = (t ?? {}) as FriendsTranslations;
  const { user } = useSession();
  const token = user?.accessToken ?? accessToken;

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<{
    incoming: FriendRequest[];
    outgoing: FriendRequest[];
  }>({ incoming: [], outgoing: [] });
  const [username, setUsername] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [friendsData, pendingData] = await Promise.all([
        getFriends(token),
        getPendingRequests(token),
      ]);
      setFriends(friendsData);
      setPending(pendingData);
    } catch {
      setError('Failed to load friends');
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
    void loadData();
  };

  return (
    <ScrollView padding="$4" maxWidth={600} mx="auto" width="100%">
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="700">
          {tt.title ?? 'Friends'}
        </Text>

        <XStack gap="$2" alignItems="center">
          <Input
            flex={1}
            placeholder={tt.addFriend?.placeholder ?? 'Enter username'}
            value={username}
            onChangeText={setUsername}
            testID="add-friend-input"
          />
          <Button
            variant="primary"
            onClick={handleSendRequest}
            disabled={sending || !username.trim()}
            testID="add-friend-button"
          >
            {sending
              ? (tt.addFriend?.sending ?? 'Sending…')
              : (tt.addFriend?.button ?? 'Add Friend')}
          </Button>
        </XStack>

        {error ? (
          <Text color="$red10" fontSize="$3">
            {error}
          </Text>
        ) : null}

        {pending.incoming.length > 0 && (
          <YStack gap="$2">
            <Text fontSize="$4" fontWeight="600">
              {tt.requests?.incoming ?? 'Incoming Requests'}
            </Text>
            {pending.incoming.map((req) => (
              <XStack
                key={req.id}
                gap="$3"
                alignItems="center"
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <EquippedPlayerAvatar
                  equippedAvatarId={req.equippedAvatarId}
                  size={32}
                />
                <Text flex={1} fontSize="$3">
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
            ))}
          </YStack>
        )}

        {pending.outgoing.length > 0 && (
          <YStack gap="$2">
            <Text fontSize="$4" fontWeight="600">
              {tt.requests?.outgoing ?? 'Outgoing Requests'}
            </Text>
            {pending.outgoing.map((req) => (
              <XStack
                key={req.id}
                gap="$3"
                alignItems="center"
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <EquippedPlayerAvatar
                  equippedAvatarId={req.equippedAvatarId}
                  size={32}
                />
                <Text flex={1} fontSize="$3">
                  {req.displayName ?? req.username}
                </Text>
                <Text fontSize="$2" color="$gray10">
                  {tt.requests?.pending ?? 'Pending'}
                </Text>
              </XStack>
            ))}
          </YStack>
        )}

        <Separator />

        <Text fontSize="$4" fontWeight="600">
          {tt.title ?? 'Friends'}
        </Text>

        {friends.length === 0 ? (
          <Text color="$gray10" fontSize="$3" textAlign="center" padding="$4">
            {tt.emptyState ?? 'No friends yet. Add friends to see them here.'}
          </Text>
        ) : (
          <YStack gap="$2">
            {friends.map((friend) => (
              <XStack
                key={friend.id}
                gap="$3"
                alignItems="center"
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <EquippedPlayerAvatar
                  equippedAvatarId={friend.equippedAvatarId}
                  size={32}
                />
                <YStack flex={1}>
                  <Text fontSize="$3" fontWeight="500">
                    {friend.displayName ?? friend.username}
                  </Text>
                  <Text fontSize="$2" color={friend.online ? '$green10' : '$gray10'}>
                    {friend.online
                      ? (tt.online ?? 'Online')
                      : (tt.offline ?? 'Offline')}
                  </Text>
                </YStack>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(friend.userId)}
                  testID={`remove-${friend.userId}`}
                >
                  {tt.removeFriend ?? 'Remove'}
                </Button>
              </XStack>
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
