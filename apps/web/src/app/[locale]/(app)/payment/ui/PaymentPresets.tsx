import { Typography, Button } from '@arcadeum/ui';
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
    <div
      className="box-border flex flex-row items-stretch gap-4"
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
            className={`h-auto min-h-[130px] p-4 flex-col gap-3 border-[1.5px] hover:-translate-y-[5px] hover:scale-[1.02] hover:bg-[var(--glassBgHover)] ${
              isActive
                ? 'border-[var(--primary)] bg-[var(--glassBgHover)] hover:border-[var(--accent)]'
                : 'border-[var(--glassBorder)] bg-[var(--glassBg)] hover:border-[var(--glassBorderHover)]'
            }`}
            key={preset.value}
            type="button"
            variant="glass"
            size="lg"
            active={isActive}
            onClick={() => onSelect(preset.value)}
          >
            <Typography className="text-[38px] -mb-1">
              {preset.emoji}
            </Typography>
            <div className="box-border flex flex-col items-center gap-1">
              <Typography variant="label" uiSize="xs" alpha="medium" textCenter>
                {preset.label}
              </Typography>
              <Typography
                className="font-extrabold"
                variant="heading"
                uiSize="xl"
                textCenter
              >
                ${preset.value}
              </Typography>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
