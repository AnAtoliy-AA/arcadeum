'use client';

import {
  PageLayout,
  Container,
  GlassCard,
  Typography,
  XStack,
  YStack,
} from '@arcadeum/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { ADMIN_SIDEBAR_ITEMS } from './_components/sidebarItems';

interface AdminLayoutClientProps {
  username: string;
  children: ReactNode;
}

interface AdminNavTranslations {
  dashboard?: string;
  users?: string;
  payments?: string;
  announcements?: string;
  tournaments?: string;
  comingSoon?: string;
}

interface AdminTranslations {
  signedInAs?: string;
  nav?: AdminNavTranslations;
}

export default function AdminLayoutClient({
  username,
  children,
}: AdminLayoutClientProps) {
  const { messages } = useLanguage();
  const t = messages.pages?.admin as AdminTranslations | undefined;
  const navT = t?.nav;

  return (
    <PageLayout>
      <Container size="lg">
        <GlassCard p="$3" mb="$3">
          <Typography variant="caption" alpha="medium">
            {(t?.signedInAs ?? 'Signed in as {username}').replace(
              '{username}',
              username,
            )}
          </Typography>
        </GlassCard>

        <XStack gap="$4" flexWrap="wrap">
          <YStack
            gap="$2"
            width={220}
            minWidth={200}
            data-testid="admin-sidebar"
          >
            {ADMIN_SIDEBAR_ITEMS.map((item) => {
              const card = (
                <GlassCard
                  p="$3"
                  opacity={item.enabled ? 1 : 0.5}
                  data-testid={`admin-nav-${item.id}`}
                >
                  <Typography variant="label" uiSize="md" fontWeight="700">
                    {navT?.[item.id] ?? item.id}
                  </Typography>
                  {!item.enabled && (
                    <Typography variant="caption" alpha="low">
                      {navT?.comingSoon ?? 'Coming soon'}
                    </Typography>
                  )}
                </GlassCard>
              );
              if (item.enabled && item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {card}
                  </Link>
                );
              }
              return <div key={item.id}>{card}</div>;
            })}
          </YStack>

          <YStack flex={1} minWidth={280}>
            {children}
          </YStack>
        </XStack>
      </Container>
    </PageLayout>
  );
}
