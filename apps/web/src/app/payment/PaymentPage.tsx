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
  gap: 1.5rem;
`;

const ErrorCard = styled(Card)`
  border-color: #dc2626;
  color: #ef4444;
`;

const SuccessCard = styled(Card)`
  border-color: #22c55e;
  color: #22c55e;
`;

export function PaymentPage() {
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('GEL');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        currency: currency.trim().toUpperCase(),
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
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                placeholder={t('payments.amountPlaceholder') || '0.00'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                aria-required="true"
                aria-label={t('payments.amountAria') || 'Payment amount'}
                fullWidth
              />
            </FormGroup>

            <FormGroup
              label={t('payments.currencyLabel') || 'Currency'}
              htmlFor="payment-currency"
              required
            >
              <Input
                id="payment-currency"
                type="text"
                placeholder={t('payments.currencyPlaceholder') || 'GEL'}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                maxLength={8}
                required
                aria-required="true"
                aria-label={t('payments.currencyAria') || 'Currency code'}
                fullWidth
              />
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
