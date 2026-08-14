import { Typography, YStack, XStack, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface PaymentPresetsProps {
  amount: string;
  onSelect: (value: string) => void;
}

export function PaymentPresets({ amount, onSelect }: PaymentPresetsProps) {
  const { t } = useTranslation();

  const presets = [
    {
      value: '5',
      label: t('payments.presets.coffee') || 'Coffee',
      emoji: '☕️',
    },
    { value: '10', label: t('payments.presets.lunch') || 'Lunch', emoji: '🍕' },
    { value: '25', label: t('payments.presets.gift') || 'Gift', emoji: '🎁' },
    { value: '50', label: t('payments.presets.boost') || 'Boost', emoji: '🚀' },
  ];

  return (
    <XStack
      gap="$4"
      {...({
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        $gtXs: {
          gridTemplateColumns: 'repeat(4, 1fr)',
        },
      } as unknown as Record<string, unknown>)}
    >
      {presets.map((preset) => {
        const isActive = amount === preset.value;
        return (
          <Button
            key={preset.value}
            type="button"
            variant="glass"
            size="lg"
            active={isActive}
            className={`h-auto min-h-[130px] p-4 flex-col gap-3 border-[1.5px] hover:-translate-y-[5px] hover:scale-[1.02] hover:bg-[var(--glassBgHover)] ${
              isActive
                ? 'border-[var(--primary)] bg-[var(--glassBgHover)] hover:border-[var(--accent)]'
                : 'border-[var(--glassBorder)] bg-[var(--glassBg)] hover:border-[var(--glassBorderHover)]'
            }`}
            onClick={() => onSelect(preset.value)}
          >
            <Typography fontSize={38} marginBottom="$1">
              {preset.emoji}
            </Typography>
            <YStack ai="center" gap="$1">
              <Typography variant="label" uiSize="xs" alpha="medium" textCenter>
                {preset.label}
              </Typography>
              <Typography
                variant="heading"
                uiSize="xl"
                fontWeight="800"
                textCenter
              >
                ${preset.value}
              </Typography>
            </YStack>
          </Button>
        );
      })}
    </XStack>
  );
}
