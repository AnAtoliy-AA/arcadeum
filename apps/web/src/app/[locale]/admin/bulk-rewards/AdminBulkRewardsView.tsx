'use client';

import { useState, useTransition } from 'react';
import { Button, GlassCard, Input, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { sendBulkRewardsAction } from '@/features/admin-bulk-rewards/server/admin-bulk-rewards.actions';
import type { BulkRewardResult } from '@/features/admin-bulk-rewards/server/admin-bulk-rewards.actions';
import type { adminBulkRewardsEn } from '@/shared/i18n/messages/pages/admin-bulk-rewards/en';

type Labels = typeof adminBulkRewardsEn;

interface Props {
  labels: Labels;
}

type RewardType = 'coins' | 'gems' | 'arcadeum' | 'item';

export function AdminBulkRewardsView({ labels }: Props) {
  const [rewardType, setRewardType] = useState<RewardType>('coins');
  const [amount, setAmount] = useState('');
  const [itemId, setItemId] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<BulkRewardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const validate = (): boolean => {
    const numAmount = parseInt(amount, 10);
    if (!amount || isNaN(numAmount) || numAmount < 1 || numAmount > 1_000_000) {
      setError(labels.validation.invalidAmount);
      return false;
    }
    if (rewardType === 'item' && !itemId.trim()) {
      setError(labels.validation.itemIdRequired);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    setConfirmOpen(false);
    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await sendBulkRewardsAction({
        type: rewardType,
        amount: parseInt(amount, 10),
        itemId: rewardType === 'item' ? itemId.trim() : undefined,
        reason: reason.trim() || undefined,
      });

      if (response.ok) {
        setResult(response.data);
      } else {
        setError(labels.result.failed);
      }
    });
  };

  return (
    <YStack gap="$4">
      {confirmOpen && (
        <GlassCard
          padding="$4"
          borderWidth={1}
          borderColor="$warning"
          backgroundColor="$warningBg"
        >
          <Text fontWeight="600" marginBottom="$2">
            {labels.confirm.title}
          </Text>
          <Text marginBottom="$4">
            {labels.confirm.message
              .replace('{amount}', amount)
              .replace('{type}', rewardType)}
          </Text>
          <XStack gap="$2">
            <Button onPress={confirmSubmit} theme="primary">
              {labels.confirm.confirm}
            </Button>
            <Button onPress={() => setConfirmOpen(false)} variant="outline">
              {labels.confirm.cancel}
            </Button>
          </XStack>
        </GlassCard>
      )}

      <YStack gap="$3">
        <YStack gap="$1">
          <Text fontWeight="600">{labels.form.type.label}</Text>
          <select
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value as RewardType)}
            style={{
              padding: '8px 10px',
              background: 'var(--backgroundFocus)',
              border: '1px solid var(--borderColor)',
              borderRadius: 6,
              color: 'inherit',
              fontSize: 14,
            }}
          >
            <option value="coins">{labels.form.type.coinsLabel}</option>
            <option value="gems">{labels.form.type.gemsLabel}</option>
            <option value="arcadeum">{labels.form.type.arcadeumLabel}</option>
            <option value="item">{labels.form.type.itemLabel}</option>
          </select>
        </YStack>

        <YStack gap="$1">
          <Text fontWeight="600">{labels.form.amount.label}</Text>
          <Input
            type="number"
            value={amount}
            onChangeText={setAmount}
            placeholder={labels.form.amount.placeholder}
            min={1}
            max={1000000}
          />
        </YStack>

        {rewardType === 'item' && (
          <YStack gap="$1">
            <Text fontWeight="600">{labels.form.itemId.label}</Text>
            <Input
              value={itemId}
              onChangeText={setItemId}
              placeholder={labels.form.itemId.placeholder}
            />
          </YStack>
        )}

        <YStack gap="$1">
          <Text fontWeight="600">{labels.form.reason.label}</Text>
          <Input
            value={reason}
            onChangeText={setReason}
            placeholder={labels.form.reason.placeholder}
          />
        </YStack>

        {error && (
          <Text color="$error" fontSize="$2">
            {error}
          </Text>
        )}

        <Button
          onPress={handleSubmit}
          disabled={isPending}
          theme="primary"
          width="100%"
        >
          {isPending ? labels.form.submitting : labels.form.submit}
        </Button>
      </YStack>

      {result && (
        <GlassCard
          padding="$4"
          borderWidth={1}
          borderColor={result.failedRewards > 0 ? '$warning' : '$success'}
          backgroundColor={
            result.failedRewards > 0 ? '$warningBg' : '$successBg'
          }
        >
          <Text fontWeight="600" marginBottom="$2">
            {result.failedRewards > 0
              ? labels.result.partial
              : labels.result.success}
          </Text>
          <YStack gap="$1">
            <Text>
              {labels.result.total}: {result.totalUsers}
            </Text>
            <Text color="$success">
              {labels.result.successful}: {result.successfulRewards}
            </Text>
            {result.failedRewards > 0 && (
              <Text color="$warning">
                {labels.result.failed}: {result.failedRewards}
              </Text>
            )}
            {result.errors.length > 0 && (
              <YStack gap="$1" marginTop="$2">
                <Text fontWeight="600">{labels.result.errors}:</Text>
                {result.errors.slice(0, 5).map((err, i) => (
                  <Text key={i} fontSize="$2" color="$gray11">
                    {err}
                  </Text>
                ))}
                {result.errors.length > 5 && (
                  <Text fontSize="$2" color="$gray11">
                    ...and {result.errors.length - 5} more
                  </Text>
                )}
              </YStack>
            )}
          </YStack>
        </GlassCard>
      )}
    </YStack>
  );
}
