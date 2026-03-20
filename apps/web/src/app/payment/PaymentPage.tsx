'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { isValidPaymentUrl, parseAmount } from '@/shared/config/payment-config';
import { paymentApi } from '@/features/payment/api';
import { Button, XStack, YStack, Typography } from '@arcadeum/ui';
import {
  PageLayout,
  Container,
  Section,
  FormGroup,
  GlassCard,
} from '@/shared/ui';
import { PaymentHeader, PaymentPresets, AmountDisplay } from './ui';
import { StyledTextArea, StatusMessage } from './styles';

const backgroundStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
  .payment-bg {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    overflow: hidden;
    z-index: -1;
    background: radial-gradient(circle at 50% 0%, #1a1a2e 0%, #000000 100%);
  }
  .payment-bg::before {
    content: '';
    position: absolute;
    top: -20%; left: -10%;
    width: 60%; height: 60%;
    background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
    filter: blur(60px);
    animation: float 10s ease-in-out infinite;
  }
  .payment-bg::after {
    content: '';
    position: absolute;
    bottom: -10%; right: -10%;
    width: 50%; height: 50%;
    background: radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%);
    filter: blur(60px);
    animation: float 8s ease-in-out infinite reverse;
  }
`;

export function PaymentPage() {
  const { snapshot } = useSessionTokens();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showName, setShowName] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const queryMode = searchParams?.get('mode');
  const initialMode = queryMode === 'subscription' ? 'subscription' : 'payment';
  const [localMode, setLocalMode] = useState<'payment' | 'subscription' | null>(null);
  const mode = localMode ?? initialMode;
  const [interval, setInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const currency = 'USD';

  const { mutate: createSession, isPending: loading } = useMutation({
    mutationFn: async (params: { amount: number; currency: string; description?: string }) => {
      if (mode === 'subscription') {
        return paymentApi.createSubscription(
          { amount: params.amount, currency: params.currency, interval, description: params.description, returnUrl: undefined, cancelUrl: undefined },
          { token: snapshot.accessToken || undefined },
        );
      }
      return paymentApi.createSession(params, { token: snapshot.accessToken || undefined });
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        if (!isValidPaymentUrl(data.paymentUrl)) {
          throw new Error(t('payments.errors.invalidUrl') || 'Invalid payment URL received');
        }
        const normalizedAmount = parseAmount(amount);
        if (note.trim()) {
          localStorage.setItem('pending_payment_note', JSON.stringify({
            note: note.trim(),
            amount: normalizedAmount,
            currency,
            displayName: snapshot.userId && showName ? snapshot.displayName : null,
          }));
        }
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
        setSuccess(true);
        setAmount('');
        setNote('');
      } else {
        throw new Error(t('payments.errors.noUrl') || 'No payment URL received');
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : t('payments.errors.failed') || 'Payment failed');
    },
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedAmount = parseAmount(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setError(t('payments.errors.invalidAmount') || 'Please enter a valid amount');
      return;
    }
    if (normalizedAmount > 1000000) {
      setError(t('payments.errors.amountTooLarge') || 'Amount is too large. Maximum is 1,000,000');
      return;
    }
    setError(null);
    setSuccess(false);
    createSession({ amount: normalizedAmount, currency, description: note.trim() || undefined });
  }, [amount, currency, note, t, createSession]);

  const handleAmountChange = useCallback((val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length <= 2) setAmount(cleaned);
  }, []);

  return (
    <PageLayout>
      <style>{backgroundStyles}</style>
      <div className="payment-bg" />
      <Container size="sm">
        <Section>
          <PaymentHeader />

          <XStack jc="center" mb="$6" gap="$4">
            <Button variant={mode === 'payment' ? 'primary' : 'secondary'} onClick={() => setLocalMode('payment')}>
              {t('payments.modes.oneTime') || 'One-time'}
            </Button>
            <Button variant={mode === 'subscription' ? 'primary' : 'secondary'} onClick={() => setLocalMode('subscription')}>
              {t('payments.modes.recurring') || 'Recurring'}
            </Button>
          </XStack>

          <GlassCard>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {mode === 'subscription' && (
                <XStack jc="center" mb="$4" gap="$2">
                  <Button variant={interval === 'MONTHLY' ? 'secondary' : 'ghost'} size="sm" onClick={(e: React.MouseEvent) => { e.preventDefault(); setInterval('MONTHLY'); }}>
                    {t('payments.intervals.monthly') || 'Monthly'}
                  </Button>
                  <Button variant={interval === 'YEARLY' ? 'secondary' : 'ghost'} size="sm" onClick={(e: React.MouseEvent) => { e.preventDefault(); setInterval('YEARLY'); }}>
                    {t('payments.intervals.yearly') || 'Yearly'}
                  </Button>
                </XStack>
              )}

              <FormGroup label={t('payments.amountLabel') || 'Select Amount'} htmlFor="payment-amount" required>
                <PaymentPresets amount={amount} onSelect={setAmount} />
                <AmountDisplay amount={amount} onChange={handleAmountChange} />
              </FormGroup>

              <FormGroup label={t('payments.noteLabel') || 'Leave a message (optional)'} htmlFor="payment-note">
                <StyledTextArea
                  id="payment-note"
                  placeholder={t('payments.notePlaceholder') || 'Say something nice...'}
                  value={note}
                  onChangeText={setNote}
                  aria-label={t('payments.noteAria') || 'Payment note or description'}
                  fullWidth
                  rows={3}
                  {...({} as any)}
                />
              </FormGroup>

              {!!snapshot.userId && !!note.trim() && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <input
                    type="checkbox"
                    id="show-name"
                    checked={showName}
                    onChange={(e) => setShowName(e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6', cursor: 'pointer' }}
                  />
                  <Typography uiSize="sm" color="rgba(255,255,255,0.8)">
                    {t('payments.showNameLabel') || 'Show my name with this note'}
                  </Typography>
                </label>
              )}

              {error && (
                <StatusMessage messageType="error">
                  <span role="img" aria-label="error">⚠️</span>
                  <Typography uiSize="sm" color="#fca5a5">{error}</Typography>
                </StatusMessage>
              )}
              {success && (
                <StatusMessage messageType="success">
                  <span role="img" aria-label="success">✅</span>
                  <Typography uiSize="sm" color="#86efac">
                    {t('payments.status.success') || 'Payment session created successfully!'}
                  </Typography>
                </StatusMessage>
              )}

              <Button variant="primary" type="submit" disabled={loading} size="lg" fullWidth>
                {loading ? t('payments.submitting') || 'Processing...' : t('payments.submit') || 'Continue to Checkout'}
              </Button>
            </form>
          </GlassCard>

          <XStack jc="center" ai="center" gap="$2" opacity={0.5} mt="$8">
            <span role="img" aria-label="secure">🔒</span>
            <Typography uiSize="sm">
              {t('payments.secureInfo') || 'Payments are 256-bit encrypted and secure.'}
            </Typography>
          </XStack>
        </Section>
      </Container>
    </PageLayout>
  );
}
