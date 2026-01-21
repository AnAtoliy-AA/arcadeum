'use client';

import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { isValidPaymentUrl, parseAmount } from '@/shared/config/payment-config';
import { paymentApi } from '@/features/payment/api';
import {
  PageLayout,
  Container,
  PageTitle,
  Section,
  Button,
  Input,
  TextArea,
  FormGroup,
  Card,
} from '@/shared/ui';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const Chip = styled.button<{ $active?: boolean }>`
  background: ${(props) =>
    props.$active
      ? 'var(--primary-color, #3b82f6)'
      : 'rgba(255, 255, 255, 0.05)'};
  color: ${(props) => (props.$active ? '#ffffff' : 'inherit')};
  border: 1px solid
    ${(props) => (props.$active ? 'transparent' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props) =>
      props.$active
        ? 'var(--primary-color, #3b82f6)'
        : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CurrencyBadge = styled.span`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  font-size: 0.875rem;
  pointer-events: none;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const ErrorCard = styled(Card)`
  border-color: #dc2626;
  color: #ef4444;
  background: rgba(220, 38, 38, 0.05);
`;

const SuccessCard = styled(Card)`
  border-color: #22c55e;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.05);
`;

export function PaymentPage() {
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Currency is strictly USD now, no interaction needed
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
      <Container size="sm">
        <PageTitle size="lg">{t('payments.title') || 'Payment'}</PageTitle>

        <Section>
          <Form onSubmit={handleSubmit}>
            <FormGroup
              label={t('payments.amountLabel') || 'Amount'}
              htmlFor="payment-amount"
              required
            >
              <InputWrapper>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  aria-required="true"
                  aria-label={t('payments.amountAria') || 'Payment amount'}
                  fullWidth
                  style={{ paddingRight: '3rem' }}
                />
                <CurrencyBadge>USD</CurrencyBadge>
              </InputWrapper>

              <ChipContainer>
                {[
                  {
                    value: '5',
                    label: t('payments.presets.coffee') || '☕️ Coffee',
                  },
                  {
                    value: '10',
                    label: t('payments.presets.lunch') || '🍕 Lunch',
                  },
                  {
                    value: '25',
                    label: t('payments.presets.gift') || '🎁 Gift',
                  },
                  {
                    value: '50',
                    label: t('payments.presets.boost') || '🚀 Boost',
                  },
                ].map((preset) => (
                  <Chip
                    key={preset.value}
                    type="button"
                    $active={amount === preset.value}
                    onClick={() => setAmount(preset.value)}
                  >
                    {preset.label} <span>${preset.value}</span>
                  </Chip>
                ))}
              </ChipContainer>
            </FormGroup>

            <FormGroup
              label={t('payments.noteLabel') || 'Note (optional)'}
              htmlFor="payment-note"
            >
              <TextArea
                id="payment-note"
                placeholder={t('payments.notePlaceholder') || 'Add a note...'}
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
              <ErrorCard variant="outlined" padding="sm">
                {error}
              </ErrorCard>
            )}
            {success && (
              <SuccessCard variant="outlined" padding="sm">
                {t('payments.status.success') ||
                  'Payment session created successfully!'}
              </SuccessCard>
            )}

            <Button type="submit" disabled={loading} size="lg" fullWidth>
              {loading
                ? t('payments.submitting') || 'Processing...'
                : t('payments.submit') || 'Create Payment'}
            </Button>
          </Form>
        </Section>
      </Container>
    </PageLayout>
  );
}
