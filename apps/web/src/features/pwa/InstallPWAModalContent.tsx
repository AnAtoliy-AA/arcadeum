'use client';

import { XStack, Paragraph } from 'tamagui';
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
          <XStack justifyContent="center" marginBottom="$5">
            <Avatar src="/icon-192x192.png" name="Arcadeum" size="xl" alt="" />
          </XStack>
          <Paragraph
            textAlign="center"
            color="$color"
            opacity={0.7}
            fontSize="1rem"
            lineHeight="$multiplier16"
            margin={0}
          >
            {t('pwa.install.description')}
          </Paragraph>

          <PWAFeaturesList>
            <PWAFeatureItem>
              <PWAFeatureIcon>⚡</PWAFeatureIcon>
              {t('pwa.install.features.fast')}
            </PWAFeatureItem>
            <PWAFeatureItem>
              <PWAFeatureIcon>🔔</PWAFeatureIcon>
              {t('pwa.install.features.notifications')}
            </PWAFeatureItem>
          </PWAFeaturesList>

          {!isPromptAvailable && (
            <PWAManualInstructions>
              <Paragraph
                textAlign="left"
                color="$color"
                opacity={0.7}
                fontSize="0.85rem"
                lineHeight="$normal"
                margin={0}
              >
                <strong>{t('pwa.install.manual.title')}:</strong>
                <br />
                {isIos
                  ? t('pwa.install.manual.ios', { icon: '⎙', plus: '⊞' })
                  : t('pwa.install.manual.generic')}
              </Paragraph>
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
