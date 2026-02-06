'use client';

import styled from 'styled-components';
import { Button } from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background: ${({ theme }) => theme.background.base};
`;

const Icon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 1rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text.muted};
  margin: 0 0 2rem;
  max-width: 400px;
  line-height: 1.6;
`;

export default function OfflinePage() {
  const { t } = useTranslation();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Container>
      <Icon>📡</Icon>
      <Title>{t('pwa.offline.title')}</Title>
      <Description>{t('pwa.offline.description')}</Description>
      <Button onClick={handleRetry} size="lg">
        {t('pwa.offline.retry')}
      </Button>
    </Container>
  );
}
