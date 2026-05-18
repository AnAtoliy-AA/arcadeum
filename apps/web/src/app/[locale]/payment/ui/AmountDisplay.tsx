import { XStack } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface AmountDisplayProps {
  amount: string;
  onChange: (value: string) => void;
}

const amountInputStyles = `
  .amount-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: inherit;
    font-size: 3rem;
    font-weight: 700;
    text-align: center;
    padding: 1.5rem 1rem;
    outline: none;
    transition: all 0.3s ease;
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
    -moz-appearance: textfield;
  }
  .amount-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  .amount-input:focus {
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
  .amount-input::-webkit-outer-spin-button,
  .amount-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export function AmountDisplay({ amount, onChange }: AmountDisplayProps) {
  const { t } = useTranslation();

  return (
    <>
      <style>{amountInputStyles}</style>
      <XStack ai="center" jc="center" position="relative" my="$4">
        <span
          style={{
            fontSize: '2.5rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.3)',
            position: 'absolute',
            left: '2rem',
            pointerEvents: 'none',
          }}
        >
          $
        </span>
        <input
          id="payment-amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          required
          aria-required="true"
          aria-label={t('payments.amountAria') || 'Payment amount'}
          className="amount-input"
        />
      </XStack>
    </>
  );
}
