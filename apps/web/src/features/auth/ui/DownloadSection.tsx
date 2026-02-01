import {
  DownloadSectionWrapper,
  DownloadTitle,
  DownloadDescription,
  DownloadButtons,
  DownloadButton,
  DownloadIcon,
} from './styles';
import { usePlatform } from '@/shared/hooks/usePlatform';

interface DownloadSectionProps {
  title: string;
  description: string;
  iosLabel: string;
  androidLabel: string;
  iosHref: string | null | undefined;
  androidHref: string | null | undefined;
}

export function DownloadSection({
  title,
  description,
  iosLabel,
  iosHref,
  androidHref,
}: DownloadSectionProps) {
  const hasLinks = Boolean(iosHref || androidHref);
  const { isIos: _isIos, isAndroid } = usePlatform();

  if (!hasLinks) {
    return null;
  }

  return (
    <DownloadSectionWrapper>
      <DownloadTitle>{title}</DownloadTitle>
      <DownloadDescription>{description}</DownloadDescription>
      <DownloadButtons>
        {iosHref && !isAndroid ? (
          <DownloadButton
            href={iosHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon aria-hidden="true">↓</DownloadIcon>
            <span>{iosLabel}</span>
          </DownloadButton>
        ) : null}
        {/* {androidHref && !isIos ? (
          <DownloadButton
            href={androidHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon aria-hidden="true">↓</DownloadIcon>
            <span>{androidLabel}</span>
          </DownloadButton>
        ) : null} */}
      </DownloadButtons>
    </DownloadSectionWrapper>
  );
}
