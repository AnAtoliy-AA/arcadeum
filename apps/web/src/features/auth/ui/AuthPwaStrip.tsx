'use client';

import { XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { usePWAInstallProps } from '@/features/pwa/context';
import type { AuthPwaLabels } from '../types';
import { PhoneGlyph } from './AuthProviderIcons';

interface AuthPwaStripProps {
  pwa: AuthPwaLabels;
  maxWidth?: number;
}

export function AuthPwaStrip({ pwa, maxWidth = 432 }: AuthPwaStripProps) {
  const { onInstall, onShowInstructions } = usePWAInstallProps();
  const handleClick = onInstall ?? onShowInstructions;
  if (!handleClick) return null;

  return (
    <XStack
      width="100%"
      maxWidth={maxWidth}
      alignItems="center"
      gap="$3"
      paddingHorizontal="$4"
      paddingVertical="$3"
      borderRadius={16}
      borderWidth={1}
      borderColor="$glassBorder"
      backgroundColor="$glassBg"
      data-testid="auth-pwa-strip"
    >
      <YStack
        width={40}
        height={40}
        borderRadius={10}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundHover"
        borderWidth={1}
        borderColor="$glassBorder"
      >
        <PhoneGlyph size={22} />
      </YStack>
      <YStack flex={1} gap="$0.5">
        <Typography variant="body" uiSize="sm" weight="700">
          {pwa.title}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {pwa.body}
        </Typography>
      </YStack>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleClick()}
        pill
        data-testid="auth-pwa-install"
      >
        {pwa.cta} →
      </Button>
    </XStack>
  );
}
