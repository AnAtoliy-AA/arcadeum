import { styled, XStack } from 'tamagui';
import { TextArea } from '@arcadeum/ui';

export const StyledTextArea = styled(TextArea, {
  name: 'PaymentTextArea',
  borderWidth: 1,
  borderRadius: 16,
  padding: '$4',
  fontSize: '$4',
} as any);

export const StatusMessage = styled(XStack, {
  name: 'StatusMessage',
  padding: '$4',
  borderRadius: '$4',
  borderWidth: 1,
  ai: 'center',
  gap: '$2',

  variants: {
    messageType: {
      error: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
      },
      success: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 0.2)',
      },
    },
  } as const,
});
