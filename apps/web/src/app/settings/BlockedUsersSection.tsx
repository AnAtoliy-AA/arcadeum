'use client';

import { useCallback, useEffect, useState } from 'react';

import { useLanguage } from '@/app/i18n/LanguageProvider';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getMessages, DEFAULT_LOCALE } from '@/shared/i18n';
import { resolveApiUrl } from '@/shared/lib/api-base';
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

interface BlockedUser {
  id: string;
  displayName: string;
  username: string;
}

export function BlockedUsersSection() {
  const { messages } = useLanguage();
  const defaultMessages = getMessages(DEFAULT_LOCALE);
  const t = messages.settings ?? {};
  const d = defaultMessages.settings ?? {};

  const { snapshot, hydrated } = useSessionTokens();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlockedUsers = useCallback(async () => {
    if (!snapshot.accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(resolveApiUrl('/auth/blocked'), {
        headers: { Authorization: `Bearer ${snapshot.accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data);
      }
    } catch {
      // silently handle errors
    } finally {
      setLoading(false);
    }
  }, [snapshot.accessToken]);

  useEffect(() => {
    if (hydrated && snapshot.accessToken) {
      fetchBlockedUsers();
    }
  }, [hydrated, snapshot.accessToken, fetchBlockedUsers]);

  const handleUnblock = useCallback(
    async (userId: string) => {
      if (!snapshot.accessToken) return;
      try {
        await fetch(
          resolveApiUrl(`/auth/block/${encodeURIComponent(userId)}`),
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${snapshot.accessToken}` },
          },
        );
        setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch {
        // silently handle errors
      }
    },
    [snapshot.accessToken],
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
