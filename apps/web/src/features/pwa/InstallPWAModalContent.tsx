'use client';

import styled from 'styled-components';
import {
  Avatar,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { usePWAOptional } from './PWAContext';

const AppIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Description = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.9rem;
`;

const FeatureIcon = styled.span`
  font-size: 1.25rem;
`;

const ManualSection = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
`;

const ManualText = styled(Description)`
  font-size: 0.85rem;
  text-align: left;
  line-height: 1.4;
`;

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
          <AppIconWrapper>
            <Avatar src="/icon-192x192.png" name="Arcadeum" size="xl" alt="" />
          </AppIconWrapper>
          <Description>{t('pwa.install.description')}</Description>

          <FeatureList>
            <FeatureItem>
              <FeatureIcon>⚡</FeatureIcon>
              {t('pwa.install.features.fast')}
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>🔔</FeatureIcon>
              {t('pwa.install.features.notifications')}
            </FeatureItem>
          </FeatureList>

          {!isPromptAvailable && (
            <ManualSection>
              <ManualText>
                <strong>{t('pwa.install.manual.title')}:</strong>
                <br />
                {isIos
                  ? t('pwa.install.manual.ios', { icon: '⎙', plus: '⊞' })
                  : t('pwa.install.manual.generic')}
              </ManualText>
            </ManualSection>
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
