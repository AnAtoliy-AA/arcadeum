'use client';

import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { AppleIcon, AndroidIcon, SmartphoneIcon } from '@arcadeum/ui';

export interface StaticDownloadButtonsProps {
  onInstall?: () => void;
  onShowInstructions?: () => void;
}

export const StaticDownloadButtons: React.FC<StaticDownloadButtonsProps> = ({
  onInstall,
  onShowInstructions,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
      <div
        data-testid="download-btn-static"
        className="pointer-events-none flex min-w-[160px] cursor-not-allowed items-center rounded-[12px] border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-2 text-[var(--color)] opacity-40 grayscale-[0.8] transition-transform duration-200"
      >
        <div className="mr-3 flex items-center justify-center">
          <AppleIcon size={24} />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="text-[10px] leading-[1.2] uppercase opacity-80">
            {t('home.comingSoon')?.toUpperCase()}
          </span>
          <span className="text-[16px] font-semibold leading-[1.2]">
            App Store
          </span>
        </div>
      </div>

      <div className="pointer-events-none flex min-w-[160px] cursor-not-allowed items-center rounded-[12px] border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-2 text-[var(--color)] opacity-40 grayscale-[0.8] transition-transform duration-200">
        <div className="mr-3 flex items-center justify-center">
          <AndroidIcon size={24} />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="text-[10px] leading-[1.2] uppercase opacity-80">
            {t('home.comingSoon')?.toUpperCase()}
          </span>
          <span className="text-[16px] font-semibold leading-[1.2]">
            Google Play
          </span>
        </div>
      </div>

      {(onInstall || onShowInstructions) && (
        <button
          className="flex min-w-[160px] cursor-pointer items-center rounded-[12px] border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-2 text-[var(--color)] transition-[transform,background-color] duration-200 hover:-translate-y-[2px] hover:bg-[var(--glassBgHover)] active:translate-y-0"
          data-testid="install-pwa-button"
          onClick={onInstall || onShowInstructions}
        >
          <div className="mr-3 flex items-center justify-center">
            <SmartphoneIcon size={24} />
          </div>
          <div className="flex flex-col items-start justify-center">
            <span className="text-[10px] leading-[1.2] uppercase opacity-80">
              {onInstall ? t('pwa.install.installAs') : t('pwa.install.getThe')}
            </span>
            <span className="text-[16px] font-semibold leading-[1.2]">
              {onInstall ? t('pwa.install.webApp') : t('pwa.install.appGuide')}
            </span>
          </div>
        </button>
      )}
    </div>
  );
};
