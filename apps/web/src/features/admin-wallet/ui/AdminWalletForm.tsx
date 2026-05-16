'use client';

import { useState, useTransition } from 'react';
import { Button, GlassCard } from '@arcadeum/ui';
import { XStack, YStack, Text } from 'tamagui';
import {
  grantWalletAction,
  deductWalletAction,
  type WalletCurrencyInput,
} from '../server/wallet.actions';

const INPUT_STYLE = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #555',
  background: 'transparent',
  color: 'inherit' as const,
  width: '100%',
  fontFamily: 'inherit',
};

export interface AdminWalletFormLabels {
  currencyLabel: string;
  amountLabel: string;
  noteLabel: string;
  grant: string;
  deduct: string;
  submitting: string;
  success: string;
  errors: {
    insufficient: string;
    generic: string;
  };
}

export interface AdminWalletFormProps {
  userId: string;
  onChanged: () => void;
  labels: AdminWalletFormLabels;
}

type ActionKind = 'grant' | 'deduct';

interface FormFeedback {
  kind: 'success' | 'insufficient' | 'generic';
  action: ActionKind;
}

export function AdminWalletForm({
  userId,
  onChanged,
  labels,
}: AdminWalletFormProps) {
  const [currency, setCurrency] = useState<WalletCurrencyInput>('coins');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (action: ActionKind) => {
    const parsedAmount = parseInt(amount, 10);
    setFeedback(null);

    startTransition(async () => {
      const fn = action === 'grant' ? grantWalletAction : deductWalletAction;
      const result = await fn({
        userId,
        currency,
        amount: parsedAmount,
        note: note.trim() || undefined,
      });

      if (result.ok) {
        setFeedback({ kind: 'success', action });
        setAmount('');
        setNote('');
        onChanged();
      } else if (result.error === 'insufficient') {
        setFeedback({ kind: 'insufficient', action });
      } else {
        setFeedback({ kind: 'generic', action });
      }
    });
  };

  const parsedAmount = parseInt(amount, 10);
  const canSubmit =
    !isPending && Number.isInteger(parsedAmount) && parsedAmount > 0;

  return (
    <GlassCard p="$3" gap="$3" data-testid="admin-wallet-form">
      <YStack gap="$1">
        <Text fontSize="$1" opacity={0.7}>
          {labels.currencyLabel}
        </Text>
        <select
          data-testid="wallet-form-currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as WalletCurrencyInput)}
          style={{ ...INPUT_STYLE, width: 'auto' }}
        >
          <option value="coins">Coins</option>
          <option value="gems">Gems</option>
        </select>
      </YStack>

      <YStack gap="$1">
        <Text fontSize="$1" opacity={0.7}>
          {labels.amountLabel}
        </Text>
        <input
          type="number"
          data-testid="wallet-form-amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={1}
          max={1_000_000}
          step={1}
          style={INPUT_STYLE}
        />
      </YStack>

      <YStack gap="$1">
        <Text fontSize="$1" opacity={0.7}>
          {labels.noteLabel}
        </Text>
        <textarea
          data-testid="wallet-form-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          style={INPUT_STYLE}
        />
      </YStack>

      {feedback?.kind === 'insufficient' && (
        <Text
          fontSize="$1"
          color="$errorText"
          data-testid="wallet-form-error-insufficient"
        >
          {labels.errors.insufficient}
        </Text>
      )}
      {feedback?.kind === 'generic' && (
        <Text
          fontSize="$1"
          color="$errorText"
          data-testid="wallet-form-error-generic"
        >
          {labels.errors.generic}
        </Text>
      )}
      {feedback?.kind === 'success' && (
        <Text
          fontSize="$1"
          color="$color"
          opacity={0.7}
          data-testid="wallet-form-success"
        >
          {labels.success}
        </Text>
      )}

      <XStack gap="$2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canSubmit}
          onPress={() => handleSubmit('grant')}
          data-testid="wallet-form-grant"
        >
          {isPending ? labels.submitting : labels.grant}
        </Button>
        <Button
          size="sm"
          disabled={!canSubmit}
          onPress={() => handleSubmit('deduct')}
          data-testid="wallet-form-deduct"
        >
          {isPending ? labels.submitting : labels.deduct}
        </Button>
      </XStack>
    </GlassCard>
  );
}
