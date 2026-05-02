import { Typography, YStack, XStack } from '@arcadeum/ui';
import { Button } from '@arcadeum/ui';
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
            height="auto"
            minHeight={130}
            isActive={isActive}
            padding="$4"
            flexDirection="column"
            gap="$3"
            borderWidth={1.5}
            borderColor={isActive ? '$primary' : '$glassBorder'}
            backgroundColor={isActive ? '$glassBgHover' : '$glassBg'}
            hoverStyle={{
              y: -5,
              borderColor: isActive ? '$accent' : '$glassBorderHover',
              backgroundColor: '$glassBgHover',
              scale: 1.02,
            }}
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
