import React from 'react';
import { AppleIcon, AndroidIcon, SmartphoneIcon } from '../Icons';
import * as S from './styles';
import { useTranslation } from '@/shared/lib/useTranslation';

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
        <S.DownloadLink
          href={iosHref}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="download-ios-button"
        >
          <S.IconWrapper>
            <AppleIcon size={32} />
          </S.IconWrapper>
          <S.TextWrapper>
            <S.SmallText>Download on the</S.SmallText>
            <S.LargeText>App Store</S.LargeText>
          </S.TextWrapper>
        </S.DownloadLink>
      )}

      {androidHref && (
        <S.DownloadLink
          href={androidHref}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="download-android-button"
        >
          <S.IconWrapper>
            <AndroidIcon size={32} />
          </S.IconWrapper>
          <S.TextWrapper>
            <S.SmallText>GET IT ON</S.SmallText>
            <S.LargeText>Google Play</S.LargeText>
          </S.TextWrapper>
        </S.DownloadLink>
      )}

      {(onInstall || onShowInstructions) && (
        <S.DownloadLink
          as="button"
          onClick={onInstall || onShowInstructions}
          data-testid="install-pwa-button"
          style={{ cursor: 'pointer', textAlign: 'left' }}
        >
          <S.IconWrapper>
            <SmartphoneIcon size={32} />
          </S.IconWrapper>
          <S.TextWrapper>
            <S.SmallText>
              {onInstall ? t('pwa.install.installAs') : t('pwa.install.getThe')}
            </S.SmallText>
            <S.LargeText>
              {onInstall ? t('pwa.install.webApp') : t('pwa.install.appGuide')}
            </S.LargeText>
          </S.TextWrapper>
        </S.DownloadLink>
      )}
    </S.Container>
  );
};
