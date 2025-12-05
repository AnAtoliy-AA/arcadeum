import {
  DownloadSectionWrapper,
  DownloadTitle,
  DownloadDescription,
  DownloadButtons,
  DownloadButton,
  DownloadIcon,
} from "./styles";

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
  androidLabel,
  iosHref,
  androidHref,
}: DownloadSectionProps) {
  const hasLinks = Boolean(iosHref || androidHref);

  if (!hasLinks) {
    return null;
  }

  return (
    <DownloadSectionWrapper>
      <DownloadTitle>{title}</DownloadTitle>
      <DownloadDescription>{description}</DownloadDescription>
      <DownloadButtons>
        {iosHref ? (
          <DownloadButton
            href={iosHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon aria-hidden="true">↓</DownloadIcon>
            <span>{iosLabel}</span>
          </DownloadButton>
        ) : null}
        {androidHref ? (
          <DownloadButton
            href={androidHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon aria-hidden="true">↓</DownloadIcon>
            <span>{androidLabel}</span>
          </DownloadButton>
        ) : null}
      </DownloadButtons>
    </DownloadSectionWrapper>
  );
}
