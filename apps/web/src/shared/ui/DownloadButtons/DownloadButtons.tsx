import React from 'react';
import { AppleIcon, AndroidIcon, SmartphoneIcon } from '@/shared/ui';
import * as S from './styles';
import { useTranslation } from '@/shared/lib/useTranslation';

// Tamagui XStack types don't expose `tag`/`href`/`target`/`rel` even though
// they work at runtime when tag="a". This typed alias adds those props.
const DownloadLinkAnchor = S.DownloadLink as React.ComponentType<
  React.ComponentProps<typeof S.DownloadLink> & {
    tag?: string;
    href?: string;
    target?: string;
    rel?: string;
  }
>;

export interface DownloadButtonsProps {
  iosHref?: string;
  androidHref?: string;
  onInstall?: () => void;
  onShowInstructions?: () => void;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  iosHref,
  androidHref,
  onInstall,
  onShowInstructions,
}) => {
  const { t } = useTranslation();
  if (!iosHref && !androidHref && !onInstall && !onShowInstructions) {
    return null;
  }

  return (
    <S.Container>
      {iosHref && (
        <DownloadLinkAnchor
          tag="a"
          href={iosHref}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="download-ios-button"
          style={{ textDecoration: 'none' }}
        >
          <S.IconWrapper>
            <AppleIcon size={32} color="white" />
          </S.IconWrapper>
          <S.TextWrapper>
            <S.SmallText>Download on the</S.SmallText>
            <S.LargeText>App Store</S.LargeText>
          </S.TextWrapper>
        </DownloadLinkAnchor>
      )}

      {androidHref && (
        <DownloadLinkAnchor
          tag="a"
          href={androidHref}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="download-android-button"
          style={{ textDecoration: 'none' }}
        >
          <S.IconWrapper>
            <AndroidIcon size={32} color="white" />
          </S.IconWrapper>
          <S.TextWrapper>
            <S.SmallText>GET IT ON</S.SmallText>
            <S.LargeText>Google Play</S.LargeText>
          </S.TextWrapper>
        </DownloadLinkAnchor>
      )}

      {(onInstall || onShowInstructions) && (
        <DownloadLinkAnchor
          tag="button"
          onPress={onInstall || onShowInstructions}
          data-testid="install-pwa-button"
          isButton
        >
          <S.IconWrapper>
            <SmartphoneIcon size={32} color="white" />
          </S.IconWrapper>
          <S.TextWrapper>
            <S.SmallText>
              {onInstall ? t('pwa.install.installAs') : t('pwa.install.getThe')}
            </S.SmallText>
            <S.LargeText>
              {onInstall ? t('pwa.install.webApp') : t('pwa.install.appGuide')}
            </S.LargeText>
          </S.TextWrapper>
        </DownloadLinkAnchor>
      )}
    </S.Container>
  );
};
