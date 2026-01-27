'use client';

import { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { isValidPaymentUrl, parseAmount } from '@/shared/config/payment-config';
import { paymentApi } from '@/features/payment/api';
import {
  PageLayout,
  Container,
  Section,
  Button,
  TextArea,
  FormGroup,
  GlassCard,
} from '@/shared/ui';
import { PaymentHeader, PaymentPresets, AmountDisplay } from './ui';

// --- Animations ---
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

// --- Styled Components ---

const BackgroundWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: -1;
  background: radial-gradient(circle at 50% 0%, #1a1a2e 0%, #000000 100%);

  &::before {
    content: '';
    position: absolute;
    top: -20%;
    left: -10%;
    width: 60%;
    height: 60%;
    background: radial-gradient(
      circle,
      rgba(59, 130, 246, 0.15) 0%,
      transparent 70%
    );
    filter: blur(60px);
    animation: ${float} 10s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 50%;
    height: 50%;
    background: radial-gradient(
      circle,
      rgba(147, 51, 234, 0.15) 0%,
      transparent 70%
    );
    filter: blur(60px);
    animation: ${float} 8s ease-in-out infinite reverse;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StyledTextArea = styled(TextArea)`
  background: rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  padding: 1rem !important;
  font-size: 1rem !important;

  &:focus {
    border-color: rgba(59, 130, 246, 0.5) !important;
    background: rgba(0, 0, 0, 0.3) !important;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StatusMessage = styled.div<{ $type: 'error' | 'success' }>`
  padding: 1rem;
  border-radius: 12px;
  background: ${(props) =>
    props.$type === 'error'
      ? 'rgba(239, 68, 68, 0.1)'
      : 'rgba(34, 197, 94, 0.1)'};
  border: 1px solid
    ${(props) =>
      props.$type === 'error'
        ? 'rgba(239, 68, 68, 0.2)'
        : 'rgba(34, 197, 94, 0.2)'};
  color: ${(props) => (props.$type === 'error' ? '#fca5a5' : '#86efac')};
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SecureInfoWrapper = styled.div`
  text-align: center;
  margin-top: 2rem;
  opacity: 0.5;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

// --- Main Component ---

export function PaymentPage() {
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Currency is strictly USD now
  const currency = 'USD';

  const { mutate: createSession, isPending: loading } = useMutation({
    mutationFn: async (params: {
      amount: number;
      currency: string;
      description?: string;
    }) => {
      return paymentApi.createSession(params, {
        token: snapshot.accessToken || undefined,
      });
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        if (!isValidPaymentUrl(data.paymentUrl)) {
          throw new Error(
            t('payments.errors.invalidUrl') || 'Invalid payment URL received',
          );
        }
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
        setSuccess(true);
        setAmount('');
        setNote('');
      } else {
        throw new Error(
          t('payments.errors.noUrl') || 'No payment URL received',
        );
      }
    },
    onError: (err) => {
      setError(
        err instanceof Error
          ? err.message
          : t('payments.errors.failed') || 'Payment failed',
      );
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const normalizedAmount = parseAmount(amount);
      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        setError(
          t('payments.errors.invalidAmount') || 'Please enter a valid amount',
        );
        return;
      }

      if (normalizedAmount > 1000000) {
        setError(
          t('payments.errors.amountTooLarge') ||
            'Amount is too large. Maximum is 1,000,000',
        );
        return;
      }

      setError(null);
      setSuccess(false);

      createSession({
        amount: normalizedAmount,
        currency,
        description: note.trim() || undefined,
      });
    },
    [amount, currency, note, t, createSession],
  );

  return (
    <PageLayout>
      <BackgroundWrapper />
      <Container size="sm">
        <Section>
          <PaymentHeader />

          <GlassCard>
            <StyledForm onSubmit={handleSubmit}>
              <FormGroup
                label={t('payments.amountLabel') || 'Select Amount'}
                htmlFor="payment-amount"
                required
              >
                <PaymentPresets amount={amount} onSelect={setAmount} />
                <AmountDisplay amount={amount} onChange={setAmount} />
              </FormGroup>

              <FormGroup
                label={t('payments.noteLabel') || 'Leave a message (optional)'}
                htmlFor="payment-note"
              >
                <StyledTextArea
                  id="payment-note"
                  placeholder={
                    t('payments.notePlaceholder') || 'Say something nice...'
                  }
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  aria-label={
                    t('payments.noteAria') || 'Payment note or description'
                  }
                  fullWidth
                  rows={3}
                />
              </FormGroup>

              {error && (
                <StatusMessage $type="error">
                  <span role="img" aria-label="error">
                    ⚠️
                  </span>{' '}
                  {error}
                </StatusMessage>
              )}
              {success && (
                <StatusMessage $type="success">
                  <span role="img" aria-label="success">
                    ✅
                  </span>
                  {t('payments.status.success') ||
                    'Payment session created successfully!'}
                </StatusMessage>
              )}

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                size="lg"
                fullWidth
              >
                {loading
                  ? t('payments.submitting') || 'Processing...'
                  : t('payments.submit') || 'Continue to Checkout'}
              </Button>
            </StyledForm>
          </GlassCard>

          <SecureInfoWrapper>
            <span role="img" aria-label="secure">
              🔒
            </span>
            {t('payments.secureInfo') ||
              'Payments are 256-bit encrypted and secure.'}
          </SecureInfoWrapper>
        </Section>
      </Container>
    </PageLayout>
  );
}
