'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { XStack, YStack, Typography } from '@arcadeum/ui';
import {
  PageLayout,
  Container,
  PageTitle,
  Card,
  LinkButton,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { paymentApi } from '@/features/payment/api';
import { particles } from './confetti-particles';

const successStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    0%   { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes shimmer {
    0%   { background-position: -1000px 0; }
    100% { background-position:  1000px 0; }
  }
  @keyframes confettiFall {
    0%   { transform: translateY(-10vh) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  .detail-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);
    background-size: 2000px 100%;
    animation: shimmer 3s linear infinite;
    pointer-events: none;
    z-index: 0;
  }
`;

interface PendingNote {
  note: string;
  amount: number;
  currency: string;
  displayName?: string | null;
}

function SuccessContent() {
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();
  const searchParams = useSearchParams();
  const paymentId = searchParams?.get('paymentId');
  const token = searchParams?.get('token');
  const hasSavedNoteRef = useRef(false);

  useEffect(() => {
    if (hasSavedNoteRef.current) return;
    const transactionId = paymentId || token;
    if (!transactionId) return;
    const pendingNoteStr = localStorage.getItem('pending_payment_note');
    if (!pendingNoteStr) return;
    hasSavedNoteRef.current = true;
    localStorage.removeItem('pending_payment_note');
    try {
      const pendingNote: PendingNote = JSON.parse(pendingNoteStr);
      paymentApi
        .createNote(
          {
            note: pendingNote.note,
            amount: pendingNote.amount,
            currency: pendingNote.currency,
            transactionId,
            displayName: pendingNote.displayName || undefined,
          },
          { token: snapshot.accessToken || undefined },
        )
        .catch(() => {});
    } catch {}
  }, [paymentId, token, snapshot.accessToken]);

  return (
    <>
      <style>{successStyles}</style>

      {/* Confetti */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: -20,
              left: `${p.left}%`,
              width: 10,
              height: 10,
              backgroundColor: p.color,
              borderRadius: '50%',
              animation: `confettiFall ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <Container
        size="sm"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '2.5rem',
          paddingTop: '6rem',
          position: 'relative',
          zIndex: 10,
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 100,
            height: 100,
            background:
              'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
            color: '#22c55e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.5rem',
            marginBottom: '0.5rem',
            boxShadow: '0 0 40px rgba(34,197,94,0.2)',
            border: '1px solid rgba(34,197,94,0.3)',
            animation:
              'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s backwards, float 3s ease-in-out infinite 0.7s',
          }}
        >
          🎉
        </div>

        <div>
          <YStack mb="$4">
            <PageTitle size="lg" gradient>
              {t('payments.successPage.title') || 'Payment Successful!'}
            </PageTitle>
          </YStack>
          <Typography
            uiSize="lg"
            maxWidth={480}
            lineHeight="$6"
            textCenter
            alpha="high"
          >
            {t('payments.successPage.message') ||
              'Thank you for your generous support! Your contribution helps us keep the servers running, the coffee brewing, and the updates coming.'}
          </Typography>
        </div>

        {(paymentId || token) && (
          <Card
            padding="md"
            className="detail-card"
            backgroundColor="rgba(255,255,255,0.03)"
            borderColor="rgba(255,255,255,0.08)"
            maxWidth={420}
            width="100%"
            style={{
              margin: '0 auto',
              animation: 'fadeIn 0.6s ease-out 0.3s backwards',
            }}
          >
            <p
              style={{
                opacity: 0.7,
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
                letterSpacing: '0.05em',
              }}
            >
              {t('payments.successPage.referenceLabel') ||
                'Transaction Reference'}
            </p>
            <code
              style={{
                background: 'rgba(0,0,0,0.3)',
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
          </Card>
        )}

        <XStack
          gap="$6"
          mt="$6"
          style={{ animation: 'fadeIn 0.6s ease-out 0.4s backwards' }}
        >
          <LinkButton href="/" size="lg" variant="primary">
            {t('payments.successPage.returnHome') || 'Return Home'}
          </LinkButton>
          <LinkButton href="/payment" size="lg" variant="ghost">
            {t('payments.successPage.supportAgain') || 'Support Again'}
          </LinkButton>
        </XStack>
      </Container>
    </>
  );
}

export function PaymentSuccessView() {
  return (
    <PageLayout>
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </PageLayout>
  );
}
