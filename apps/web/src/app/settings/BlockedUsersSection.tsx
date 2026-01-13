'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useLanguage } from '@/app/i18n/LanguageProvider';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getMessages, DEFAULT_LOCALE } from '@/shared/i18n';
import { authApi } from '@/features/auth/api';
import {
  Section,
  SectionTitle,
  SectionDescription,
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
  const queryClient = useQueryClient();

  const { data: blockedUsers = [], isLoading: loading } = useQuery({
    queryKey: ['auth', 'blocked'],
    queryFn: async () => {
      return authApi.getBlockedUsers({
        token: snapshot.accessToken || undefined,
      });
    },
    enabled: !!hydrated && !!snapshot.accessToken,
  });

  const { mutate: unblock } = useMutation({
    mutationFn: async (userId: string) => {
      return authApi.unblockUser(userId, {
        token: snapshot.accessToken || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'blocked'] });
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

  return (
    <Section>
      <SectionTitle>
        {t.blockedUsersTitle ?? d.blockedUsersTitle ?? 'Blocked Users'}
      </SectionTitle>
      <SectionDescription>
        {t.blockedUsersDescription ??
          d.blockedUsersDescription ??
          'Users you have blocked will not be able to send you game invitations.'}
      </SectionDescription>
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
