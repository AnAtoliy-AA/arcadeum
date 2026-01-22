import styled from 'styled-components';
import { useTranslation } from '@/shared/lib/useTranslation';

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const PresetCard = styled.button<{ $active?: boolean }>`
  background: ${(props) =>
    props.$active
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))'
      : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid
    ${(props) =>
      props.$active ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    background: ${(props) =>
      props.$active
        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))'
        : 'rgba(255, 255, 255, 0.08)'};
    border-color: ${(props) =>
      props.$active ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255, 255, 255, 0.2)'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Emoji = styled.span`
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

const PresetLabel = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
`;

const PresetValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
`;

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
    <PresetGrid>
      {presets.map((preset) => (
        <PresetCard
          key={preset.value}
          type="button"
          $active={amount === preset.value}
          onClick={() => onSelect(preset.value)}
        >
          <Emoji>{preset.emoji}</Emoji>
          <PresetLabel>{preset.label}</PresetLabel>
          <PresetValue>${preset.value}</PresetValue>
        </PresetCard>
      ))}
    </PresetGrid>
  );
}
