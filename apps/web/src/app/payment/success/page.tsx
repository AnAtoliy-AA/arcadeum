'use client';

import { Suspense } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageLayout, Container, PageTitle, Button, Card } from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { particles } from './confetti-particles';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const confettiFall = keyframes`
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`;

const SuccessContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2.5rem;
  padding-top: 6rem;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  z-index: 10;
`;

const ConfettiContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
`;

const Particle = styled.div<{
  $delay: number;
  $left: number;
  $duration: number;
  $color: string;
}>`
  position: absolute;
  top: -20px;
  left: ${(props) => props.$left}%;
  width: 10px;
  height: 10px;
  background-color: ${(props) => props.$color};
  animation: ${confettiFall} ${(props) => props.$duration}s linear infinite;
  animation-delay: ${(props) => props.$delay}s;
  border-radius: 50%;
`;

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.2),
    rgba(34, 197, 94, 0.1)
  );
  color: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 0 40px rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  animation:
    ${popIn} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s backwards,
    ${float} 3s ease-in-out infinite 0.7s;
`;

const Title = styled(PageTitle)`
  font-size: 2.5rem;
  background: linear-gradient(to right, #ffffff, #86efac);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: var(--text-secondary, rgba(255, 255, 255, 0.8));
  font-size: 1.125rem;
  max-width: 480px;
  line-height: 1.7;
  margin: 0 auto;
`;

const DetailCard = styled(Card)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out 0.3s backwards;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 2000px 100%;
    animation: ${shimmer} 3s linear infinite;
    pointer-events: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  animation: ${fadeIn} 0.6s ease-out 0.4s backwards;
`;

function SuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const paymentId = searchParams?.get('paymentId');
  const token = searchParams?.get('token');

  return (
    <>
      <ConfettiContainer>
        {particles.map((p) => (
          <Particle
            key={p.id}
            $left={p.left}
            $delay={p.delay}
            $duration={p.duration}
            $color={p.color}
          />
        ))}
      </ConfettiContainer>

      <SuccessContainer size="sm">
        <IconWrapper>🎉</IconWrapper>

        <div>
          <Title size="lg">
            {t('payments.successPage.title') || 'Payment Successful!'}
          </Title>
          <Message>
            {t('payments.successPage.message') ||
              'Thank you for your generous support! Your contribution helps us keep the servers running, the coffee brewing, and the updates coming.'}
          </Message>
        </div>

        {(paymentId || token) && (
          <DetailCard padding="md">
            <p
              style={{
                opacity: 0.7,
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {t('payments.successPage.referenceLabel') ||
                'Transaction Reference'}
            </p>
            <code
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: '#86efac',
                display: 'block',
                wordBreak: 'break-all',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {paymentId || token}
            </code>
          </DetailCard>
        )}

        <ButtonGroup>
          <Link href="/" passHref legacyBehavior>
            <Button size="lg" variant="primary">
              {t('payments.successPage.returnHome') || 'Return Home'}
            </Button>
          </Link>
          <Link href="/payment" passHref legacyBehavior>
            <Button size="lg" variant="ghost">
              {t('payments.successPage.supportAgain') || 'Support Again'}
            </Button>
          </Link>
        </ButtonGroup>
      </SuccessContainer>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <PageLayout>
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </PageLayout>
  );
}
