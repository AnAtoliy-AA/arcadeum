'use client';

import { XStack, YStack } from 'tamagui';
import {
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { usePWAOptional } from './PWAContext';
import { Button } from '@arcadeum/ui';

export function InstallPWAModalContent() {
  const { t } = useTranslation();
  const pwa = usePWAOptional();

  if (!pwa) return null;
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const { isModalOpen, closeModal, install, isPromptAvailable } = pwa;

  return (
    <Modal open={isModalOpen} onClose={closeModal}>
      <ModalContent maxWidth="400px">
        <ModalHeader onClose={closeModal}>
          <ModalTitle>{t('pwa.install.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <XStack justifyContent="center" marginBottom="$5">
            <Avatar src="/icon-192x192.png" name="Arcadeum" size="xl" alt="" />
          </XStack>
          <p style={{ textAlign: 'center', color: 'rgba(236,239,238,0.7)', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
            {t('pwa.install.description')}
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(236,239,238,0.7)', fontSize: '0.9rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚡</span>
              {t('pwa.install.features.fast')}
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(236,239,238,0.7)', fontSize: '0.9rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔔</span>
              {t('pwa.install.features.notifications')}
            </li>
          </ul>

          {!isPromptAvailable && (
            <YStack marginTop="$5" padding="$4" backgroundColor="$background" borderRadius={12} borderWidth={1} borderColor="$borderColor">
              <p style={{ textAlign: 'left', color: 'rgba(236,239,238,0.7)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
                <strong>{t('pwa.install.manual.title')}:</strong>
                <br />
                {isIos
                  ? t('pwa.install.manual.ios', { icon: '⎙', plus: '⊞' })
                  : t('pwa.install.manual.generic')}
              </p>
            </YStack>
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
