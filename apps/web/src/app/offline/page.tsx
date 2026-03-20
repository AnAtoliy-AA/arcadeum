'use client';

import { YStack, Text } from 'tamagui';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

export default function OfflinePage() {
  const { t } = useTranslation();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding="$6"
      backgroundColor="$background"
      style={{ textAlign: 'center' }}
    >
      <Text fontSize={80} marginBottom="$5" opacity={0.8}>
        📡
      </Text>
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          margin: '0 0 1rem',
          color: 'inherit',
        }}
      >
        {t('pwa.offline.title')}
      </h1>
      <p
        style={{
          fontSize: '1.1rem',
          color: 'rgba(236,239,238,0.45)',
          margin: '0 0 2rem',
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        {t('pwa.offline.description')}
      </p>
      <Button onClick={handleRetry} size="lg">
        {t('pwa.offline.retry')}
      </Button>
    </YStack>
  );
}
