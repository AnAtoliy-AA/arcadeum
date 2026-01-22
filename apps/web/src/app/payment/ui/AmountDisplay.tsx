import styled from 'styled-components';
import { useTranslation } from '@/shared/lib/useTranslation';

const AmountInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
`;

const CurrencySymbol = styled.span`
  font-size: 2.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  margin-right: 0.5rem;
  position: absolute;
  left: 2rem;
  pointer-events: none;
`;

const LargeAmountInput = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #fff;
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  padding: 1.5rem 1rem;
  outline: none;
  transition: all 0.3s ease;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;

  &::placeholder {
    color: rgba(255, 255, 255, 0.1);
  }

  &:focus {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  /* Remove arrows from number input */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

interface AmountDisplayProps {
  amount: string;
  onChange: (value: string) => void;
}

export function AmountDisplay({ amount, onChange }: AmountDisplayProps) {
  const { t } = useTranslation();

  return (
    <AmountInputWrapper>
      <CurrencySymbol>$</CurrencySymbol>
      <LargeAmountInput
        id="payment-amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => onChange(e.target.value)}
        required
        aria-required="true"
        aria-label={t('payments.amountAria') || 'Payment amount'}
      />
    </AmountInputWrapper>
  );
}
