import { Typography } from '@arcadeum/ui';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface PaymentPresetsProps {
  amount: string;
  onSelect: (value: string) => void;
}

export function PaymentPresets({ amount, onSelect }: PaymentPresetsProps) {
  const { t } = useTranslation();

  const presets = [
    { value: '5',  label: t('payments.presets.coffee') || 'Coffee', emoji: '☕️' },
    { value: '10', label: t('payments.presets.lunch')  || 'Lunch',  emoji: '🍕' },
    { value: '25', label: t('payments.presets.gift')   || 'Gift',   emoji: '🎁' },
    { value: '50', label: t('payments.presets.boost')  || 'Boost',  emoji: '🚀' },
  ];

  return (
    <>
      <style>{`
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .preset-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
      <div className="preset-grid">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant="secondary"
            size="md"
            isActive={amount === preset.value}
            bg={
              amount === preset.value
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))'
                : 'rgba(255, 255, 255, 0.03)'
            }
            borderWidth={1}
            borderColor={
              amount === preset.value
                ? 'rgba(59, 130, 246, 0.5)'
                : 'rgba(255, 255, 255, 0.08)'
            }
            borderRadius={16}
            padding="$4"
            flexDirection="column"
            gap="$2"
            hoverStyle={{
              y: -2,
              borderColor: amount === preset.value
                ? 'rgba(59, 130, 246, 0.6)'
                : 'rgba(255, 255, 255, 0.2)',
            }}
            onClick={() => onSelect(preset.value)}
          >
            <Typography fontSize={32}>{preset.emoji}</Typography>
            <Typography uiSize="sm" alpha="high" weight="500">{preset.label}</Typography>
            <Typography uiSize="md" weight="600">${preset.value}</Typography>
          </Button>
        ))}
      </div>
    </>
  );
}
