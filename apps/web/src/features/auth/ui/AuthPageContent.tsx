'use client';

import { XStack, YStack } from 'tamagui';
import { useAuthForm } from '../hooks/useAuthForm';
import { useAuthLabels } from '../hooks/useAuthLabels';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AuthFormPanel } from './AuthFormPanel';
import { AuthPwaStrip } from './AuthPwaStrip';
import { AuthPageBackground } from './AuthPageBackground';
import './auth.css';

export default function AuthPageContent() {
  const auth = useAuthForm();
  const labels = useAuthLabels(auth.isRegisterMode);

  return (
    <XStack
      minHeight="100vh"
      width="100%"
      position="relative"
      overflow="hidden"
      $md={{ flexDirection: 'column' }}
      data-testid="auth-page-root"
    >
      <AuthPageBackground />
      <AuthBrandPanel brand={labels.brand} flex={1.05} />
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="$8"
        paddingVertical="$8"
        gap="$5"
        $md={{
          paddingHorizontal: '$5',
          paddingVertical: '$6',
        }}
      >
        <AuthFormPanel labels={labels} auth={auth} />
        <AuthPwaStrip pwa={labels.pwa} />
      </YStack>
    </XStack>
  );
}
