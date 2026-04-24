'use client';

import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { AppleIcon, AndroidIcon, SmartphoneIcon } from '@arcadeum/ui';
import './styles/download-stable.css';

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
    <div className="download-buttons-container">
      <a
        href="#"
        className="download-btn-static"
        aria-label="Download on the App Store"
      >
        <div className="download-btn-icon">
          <AppleIcon size={24} />
        </div>
        <div className="download-btn-text">
          <span className="download-btn-small">Download on the</span>
          <span className="download-btn-large">App Store</span>
        </div>
      </a>

      <a
        href="#"
        className="download-btn-static"
        aria-label="Get it on Google Play"
      >
        <div className="download-btn-icon">
          <AndroidIcon size={24} />
        </div>
        <div className="download-btn-text">
          <span className="download-btn-small">GET IT ON</span>
          <span className="download-btn-large">Google Play</span>
        </div>
      </a>

      {(onInstall || onShowInstructions) && (
        <button
          className="download-btn-static"
          data-testid="install-pwa-button"
          onClick={onInstall || onShowInstructions}
          aria-label={
            onInstall
              ? t('pwa.install.installAs') + ' ' + t('pwa.install.webApp')
              : t('pwa.install.getThe') + ' ' + t('pwa.install.appGuide')
          }
        >
          <div className="download-btn-icon">
            <SmartphoneIcon size={24} />
          </div>
          <div className="download-btn-text">
            <span className="download-btn-small">
              {onInstall ? t('pwa.install.installAs') : t('pwa.install.getThe')}
            </span>
            <span className="download-btn-large">
              {onInstall ? t('pwa.install.webApp') : t('pwa.install.appGuide')}
            </span>
          </div>
        </button>
      )}
    </div>
  );
};
