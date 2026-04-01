import React from 'react';
import { Theme, useThemeName, useTheme } from 'tamagui';
import { AppleIcon, AndroidIcon, SmartphoneIcon } from '../Icons';
import * as S from './styles';

// Tamagui XStack types don't expose `tag`/`href`/`target`/`rel` even though
// they work at runtime when tag="a". This typed alias adds those props.
const DownloadLinkAnchor = S.DownloadLink as React.ComponentType<
  React.ComponentProps<typeof S.DownloadLink> & {
    tag?: string;
    href?: string;
    target?: string;
    rel?: string;
    animation?: string;
    color?: string;
    fontWeight?: string | number;
    lineHeight?: number;
  }
>;

export interface DownloadButtonsProps {
  iosHref?: string;
  androidHref?: string;
  onInstall?: () => void;
  onShowInstructions?: () => void;
  labels: {
    iosStore: { small: string; large: string };
    googlePlay: { small: string; large: string };
    pwaInstall: { small: string; large: string };
    pwaGuide: { small: string; large: string };
    installAs: string;
    getThe: string;
    webApp: string;
    appGuide: string;
  };
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  iosHref,
  androidHref,
  onInstall,
  onShowInstructions,
  labels,
}) => {
  const themeName = useThemeName();
  const theme = useTheme();
  const iconColor = theme.color.get() as string;
  
  const invertedTheme = themeName.includes('light')
    ? themeName.replace('light', 'dark')
    : themeName.replace('dark', 'light');

  if (!iosHref && !androidHref && !onInstall && !onShowInstructions) {
    return null;
  }

  return (
    <Theme name={invertedTheme as any}>
      <S.Container>
        {iosHref && (
          <DownloadLinkAnchor
            tag="a"
            href={iosHref}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="download-ios-button"
            style={{ textDecoration: 'none' }}
            animation="quick"
          >
            <S.IconWrapper>
              <AppleIcon size={32} color={iconColor} />
            </S.IconWrapper>
            <S.TextWrapper>
              <S.SmallText>{labels.iosStore.small}</S.SmallText>
              <S.LargeText>{labels.iosStore.large}</S.LargeText>
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
            animation="quick"
          >
            <S.IconWrapper>
              <AndroidIcon size={32} color={iconColor} />
            </S.IconWrapper>
            <S.TextWrapper>
              <S.SmallText>{labels.googlePlay.small}</S.SmallText>
              <S.LargeText>{labels.googlePlay.large}</S.LargeText>
            </S.TextWrapper>
          </DownloadLinkAnchor>
        )}

        {(onInstall || onShowInstructions) && (
          <DownloadLinkAnchor
            tag="button"
            onPress={onInstall || onShowInstructions}
            data-testid="install-pwa-button"
            isButton
            animation="quick"
          >
            <S.IconWrapper>
              <SmartphoneIcon size={32} color={iconColor} />
            </S.IconWrapper>
            <S.TextWrapper>
              <S.SmallText>
                {onInstall ? labels.installAs : labels.getThe}
              </S.SmallText>
              <S.LargeText>
                {onInstall ? labels.webApp : labels.appGuide}
              </S.LargeText>
            </S.TextWrapper>
          </DownloadLinkAnchor>
        )}
      </S.Container>
    </Theme>
  );
};
