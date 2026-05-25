'use client';

import Link from 'next/link';
import { Button, XStack, YStack } from '@arcadeum/ui';
import { Text } from 'tamagui';

export interface ShopSignInBannerLabels {
  title: string;
  body: string;
  cta: string;
}

export interface ShopSignInBannerProps {
  labels: ShopSignInBannerLabels;
}

export function ShopSignInBanner({ labels }: ShopSignInBannerProps) {
  return (
    <YStack
      gap={6}
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
      borderColor="rgba(96,165,250,0.35)"
      backgroundColor="rgba(59,130,246,0.08)"
      data-testid="shop-signin-banner"
    >
      <Text fontSize="$5" fontWeight="700">
        {labels.title}
      </Text>
      <Text fontSize="$3" color="$gray11">
        {labels.body}
      </Text>
      <XStack>
        <Link href="/auth">
          <Button variant="primary" data-testid="shop-signin-cta">
            {labels.cta}
          </Button>
        </Link>
      </XStack>
    </YStack>
  );
}
