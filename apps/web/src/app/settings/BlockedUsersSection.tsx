'use client';

import { useCallback } from 'react';
import { useQuery } from '@/shared/hooks/useQuery';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';

import { useLanguage } from '@/shared/i18n/context';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getMessages, DEFAULT_LOCALE } from '@/shared/i18n';
import { authApi } from '@/features/auth/api';
import { Section } from '@/shared/ui';
import {
  OptionList,
  OptionLabel,
  OptionDescription,
  BlockedUserRow,
  BlockedUserInfo,
  UnblockButton,
} from './styles';

export function BlockedUsersSection() {
  const { messages } = useLanguage();
  const defaultMessages = getMessages(DEFAULT_LOCALE);
  const t = messages.settings ?? {};
  const d = defaultMessages.settings ?? {};

  const { snapshot, hydrated } = useSessionTokens();
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);

  const { data: rawBlockedUsers, isLoading: loading } = useQuery({
    queryKey: ['auth', 'blocked'],
    queryFn: async ({ signal }) => {
      return authApi.getBlockedUsers({
        token: snapshot.accessToken || undefined,
        signal,
      });
    },
    enabled: !!hydrated && !!snapshot.accessToken,
  });

  const blockedUsers = rawBlockedUsers || [];

  const { mutate: unblock } = useMutation({
    mutationFn: async (userId: string) => {
      return authApi.unblockUser(userId, {
        token: snapshot.accessToken || undefined,
      });
    },
    onSuccess: () => {
      triggerRefresh(['auth', 'blocked']);
    },
  });

  const handleUnblock = useCallback(
    (userId: string) => {
      unblock(userId);
    },
    [unblock],
  );

  // Don't render if not authenticated
  if (!hydrated || !snapshot.accessToken) {
    return null;
  }

  const title = t.blockedUsersTitle ?? d.blockedUsersTitle ?? 'Blocked Users';
  const description =
    t.blockedUsersDescription ??
    d.blockedUsersDescription ??
    'Users you have blocked will not be able to send you game invitations.';

  return (
    <Section title={title} description={description}>
      <OptionList>
        {loading ? (
          <OptionDescription>
            {t.blockedUsersLoading ?? d.blockedUsersLoading ?? 'Loading...'}
          </OptionDescription>
        ) : blockedUsers.length === 0 ? (
          <OptionDescription>
            {t.blockedUsersEmpty ?? d.blockedUsersEmpty ?? 'No blocked users'}
          </OptionDescription>
        ) : (
          blockedUsers.map((user) => (
            <BlockedUserRow key={user.id}>
              <BlockedUserInfo>
                <OptionLabel>{user.displayName}</OptionLabel>
                {user.username && (
                  <OptionDescription>@{user.username}</OptionDescription>
                )}
              </BlockedUserInfo>
              <UnblockButton onClick={() => handleUnblock(user.id)}>
                {t.blockedUsersUnblock ?? d.blockedUsersUnblock ?? 'Unblock'}
              </UnblockButton>
            </BlockedUserRow>
          ))
        )}
      </OptionList>
    </Section>
  );
}
