import React from 'react';
import {
  DownloadButtons as SharedDownloadButtons,
  DownloadButtonsProps as SharedProps,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

export type DownloadButtonsProps = Omit<SharedProps, 'labels'>;

export const DownloadButtons: React.FC<DownloadButtonsProps> = (props) => {
  const { t } = useTranslation();

  const labels = {
    iosStore: { small: 'Download on the', large: 'App Store' },
    googlePlay: { small: 'GET IT ON', large: 'Google Play' },
    pwaInstall: {
      small: t('pwa.install.installAs'),
      large: t('pwa.install.webApp'),
    },
    pwaGuide: {
      small: t('pwa.install.getThe'),
      large: t('pwa.install.appGuide'),
    },
    installAs: t('pwa.install.installAs'),
    getThe: t('pwa.install.getThe'),
    webApp: t('pwa.install.webApp'),
    appGuide: t('pwa.install.appGuide'),
  };

  return <SharedDownloadButtons {...props} labels={labels} />;
};
