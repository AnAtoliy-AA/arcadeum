'use client';

import {
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { appConfig } from '@/shared/config/app-config';
import { usePWAOptional } from './context';
import {
  PWAFeaturesList,
  PWAFeatureItem,
  PWAFeatureIcon,
  PWAManualInstructions,
} from './styles';

export function InstallPWAModalContent() {
  const { t } = useTranslation();
  const pwa = usePWAOptional();

  if (!pwa) return null;
  const isIos =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const { isModalOpen, closeModal, install, isPromptAvailable } = pwa;

  return (
    <Modal open={isModalOpen} onClose={closeModal}>
      <ModalContent maxWidth="400px">
        <ModalHeader onClose={closeModal}>
          <ModalTitle>
            {t('pwa.install.title', { appName: appConfig.appName })}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="mb-5 flex justify-center">
            <Avatar
              src="/icon-192x192.png"
              name={appConfig.appName}
              size="xl"
              alt={`${appConfig.appName} app icon`}
            />
          </div>
          <p className="m-0 text-center text-base leading-8 text-[var(--color)] opacity-70">
            {t('pwa.install.description', { appName: appConfig.appName })}
          </p>

          <PWAFeaturesList>
            <PWAFeatureItem>
              <PWAFeatureIcon>⚡</PWAFeatureIcon>
              <span>{t('pwa.install.features.fast')}</span>
            </PWAFeatureItem>
            <PWAFeatureItem>
              <PWAFeatureIcon>🔔</PWAFeatureIcon>
              <span>{t('pwa.install.features.notifications')}</span>
            </PWAFeatureItem>
          </PWAFeaturesList>

          {!isPromptAvailable && (
            <PWAManualInstructions>
              <p className="m-0 text-left text-[0.85rem] leading-[22px] text-[var(--color)] opacity-70">
                <strong>{t('pwa.install.manual.title')}:</strong>
                <br />
                {isIos
                  ? t('pwa.install.manual.ios', { icon: '⎙', plus: '⊞' })
                  : t('pwa.install.manual.generic')}
              </p>
            </PWAManualInstructions>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={closeModal}>
            {isPromptAvailable
              ? t('pwa.install.notNow')
              : t('common.actions.close')}
          </Button>
          {isPromptAvailable && (
            <Button onClick={install} data-testid="install-pwa-button">
              {t('pwa.install.button')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
