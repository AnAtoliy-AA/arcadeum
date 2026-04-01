import { styled, XStack } from 'tamagui';
import { Typography } from '@arcadeum/ui';
import type { ComponentProps } from 'react';

export const ParticipantRow = styled(XStack, {
  name: 'ParticipantRow',
  jc: 'space-between',
  ai: 'center',
  padding: '$4',
  paddingHorizontal: '$5',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
  hoverStyle: {
    borderColor: '$primary',
    backgroundColor: '$backgroundStrong',
  },
} as Record<string, unknown>);

export const ParticipantInfo = styled(XStack, {
  ai: 'center',
  gap: '$3',
  flex: 1,
});

export const ParticipantName = styled(Typography, {
  weight: '500',
  flex: 1,
} as Record<string, unknown>);

// Native checkbox — appearance:none + pseudo-selectors cannot be expressed in Tamagui.
// Styles injected via a <style> block rendered alongside the component.
const checkboxStyles = `
  .history-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    background: transparent;
    flex-shrink: 0;
  }
  .history-checkbox:checked {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-color: #6366f1;
  }
  .history-checkbox:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 0.875rem;
    font-weight: bold;
  }
  .history-checkbox:hover {
    border-color: #6366f1;
  }
  .history-checkbox:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
`;

export function Checkbox(props: ComponentProps<'input'>) {
  return (
    <>
      <style>{checkboxStyles}</style>
      <input {...props} type="checkbox" className="history-checkbox" />
    </>
  );
}
