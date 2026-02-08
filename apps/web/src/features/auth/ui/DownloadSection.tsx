import {
  DownloadSectionWrapper,
  DownloadTitle,
  DownloadDescription,
  DownloadButtons,
  DownloadButton,
  DownloadIcon,
} from './styles';
import { usePlatform } from '@/shared/hooks/usePlatform';

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
  config: DownloadSectionConfig;
}

export function DownloadSection({ labels, config }: DownloadSectionProps) {
  const { downloadsTitle, downloadsDescription, downloadsIosLabel } = labels;

  const { iosHref, androidHref } = config;

  const hasLinks = Boolean(iosHref || androidHref);
  const { isIos: _isIos, isAndroid } = usePlatform();

  if (!hasLinks) {
    return null;
  }

  return (
    <DownloadSectionWrapper>
      <DownloadTitle>{downloadsTitle}</DownloadTitle>
      <DownloadDescription>{downloadsDescription}</DownloadDescription>
      <DownloadButtons>
        {iosHref && !isAndroid ? (
          <DownloadButton
            href={iosHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon aria-hidden="true">↓</DownloadIcon>
            <span>{downloadsIosLabel}</span>
          </DownloadButton>
        ) : null}
      </DownloadButtons>
    </DownloadSectionWrapper>
  );
}
