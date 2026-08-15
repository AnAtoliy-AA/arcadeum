'use client';

import {
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { usePWAOptional } from './context';
import { Button } from '@arcadeum/ui';
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
          <ModalTitle>{t('pwa.install.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Avatar
              src="/icon-192x192.png"
              name="Arcadeum"
              size="xl"
              alt="Arcadeum app icon"
            />
          </div>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color)',
              opacity: 0.7,
              fontSize: '1rem',
              lineHeight: 32,
              margin: 0,
            }}
          >
            {t('pwa.install.description')}
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
              <p
                style={{
                  textAlign: 'left',
                  color: 'var(--color)',
                  opacity: 0.7,
                  fontSize: '0.85rem',
                  lineHeight: 22,
                  margin: 0,
                }}
              >
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
