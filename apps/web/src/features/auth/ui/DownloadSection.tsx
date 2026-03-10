import {
  DownloadSectionWrapper,
  DownloadTitle,
  DownloadDescription,
} from './styles';
import { DownloadButtons } from '@/shared/ui';
import { usePWAInstallProps } from '@/features/pwa';

export interface DownloadSectionLabels {
  downloadsTitle: string;
  downloadsDescription: string;
  downloadsIosLabel: string;
  downloadsAndroidLabel: string;
}

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
    <DownloadSectionWrapper>
      <DownloadTitle>{downloadsTitle}</DownloadTitle>
      <DownloadDescription>{downloadsDescription}</DownloadDescription>
      <div style={{ marginTop: '1.5rem', width: '100%' }}>
        <DownloadButtons
          onInstall={onInstall}
          onShowInstructions={onShowInstructions}
        />
      </div>
    </DownloadSectionWrapper>
  );
}
