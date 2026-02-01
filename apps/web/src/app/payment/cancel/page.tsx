'use client';

import styled, { keyframes } from 'styled-components';
import { PageLayout, Container, PageTitle, LinkButton } from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const CancelContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2.5rem;
  padding-top: 6rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const IconWrapper = styled.div`
  width: 90px;
  height: 90px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  animation: ${pulse} 2s infinite;
`;

const Message = styled.p`
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 1.125rem;
  max-width: 420px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  animation: ${fadeIn} 0.6s ease-out 0.2s backwards;
`;

export default function PaymentCancelPage() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <CancelContainer size="sm">
        <IconWrapper>✕</IconWrapper>

        <div>
          <PageTitle size="lg">
            {t('payments.cancelPage.title') || 'Payment Cancelled'}
          </PageTitle>
          <Message>
            {t('payments.cancelPage.message') ||
              "No worries! No charges were made to your account. You can always try again when you're ready—we'll be here."}
          </Message>
        </div>

        <ButtonGroup>
          <LinkButton href="/payment" size="lg" variant="primary">
            {t('payments.cancelPage.tryAgain') || 'Try Again'}
          </LinkButton>
          <LinkButton href="/" size="lg" variant="ghost">
            {t('payments.cancelPage.returnHome') || 'Return Home'}
          </LinkButton>
        </ButtonGroup>
      </CancelContainer>
    </PageLayout>
  );
}
