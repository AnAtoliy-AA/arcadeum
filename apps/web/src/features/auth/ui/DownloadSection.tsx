import { GlassCard, Typography, YStack } from '@arcadeum/ui';
import { DownloadButtons } from '@/shared/ui';
import { usePWAInstallProps } from '@/features/pwa';

import type { DownloadSectionLabels } from '../types';

export interface DownloadSectionConfig {
  iosHref: string | null | undefined;
  androidHref: string | null | undefined;
}

interface DownloadSectionProps {
  labels: DownloadSectionLabels;
  config?: DownloadSectionConfig;
}

export function DownloadSection({ labels }: DownloadSectionProps) {
  const { downloadsTitle, downloadsDescription } = labels;

  const { onInstall, onShowInstructions } = usePWAInstallProps();

  return (
    <GlassCard marginTop="$8" gap="$4" padding="$5">
      <YStack gap="$1">
        <Typography variant="heading" uiSize="lg">
          {downloadsTitle}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {downloadsDescription}
        </Typography>
      </YStack>
      <YStack marginTop="$4" width="100%">
        <DownloadButtons
          onInstall={onInstall}
          onShowInstructions={onShowInstructions}
        />
      </YStack>
    </GlassCard>
  );
}
