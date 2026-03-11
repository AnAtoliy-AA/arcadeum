import { YStack, Text, styled, Circle } from 'tamagui';
import { memo } from 'react';
import { Spinner } from '../Spinner/Spinner';
import { WifiOffIcon } from '../Icons';

export type ConnectionOverlayProps = {
  visible: boolean;
  reconnecting?: boolean;
  onReconnect?: () => void;
  title?: string;
  message?: string;
  reconnectingText?: string;
  testId?: string;
};

const Backdrop = styled(YStack, {
  name: 'ConnectionOverlay',
  position: 'absolute',
  inset: 0,
  zIndex: 1000,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$5',
  backgroundColor: '$overlayBg',
  backdropFilter: 'blur(10px)',
});

const IconWrapper = styled(Circle, {
  name: 'IconWrapper',
  size: 60,
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$glassBorder',
  alignItems: 'center',
  justifyContent: 'center',
});


export const ConnectionOverlay = memo(function ConnectionOverlay({
  visible,
  reconnecting = false,
  onReconnect,
  title = 'Connection Lost',
  message = 'Tap anywhere or move your mouse to reconnect',
  reconnectingText = 'Reconnecting...',
  testId,
}: ConnectionOverlayProps) {
  if (!visible) return null;

  return (
    <Backdrop onPress={onReconnect} testID={testId}>
      {reconnecting ? (
        <Spinner size="lg" />
      ) : (
        <IconWrapper>
          <WifiOffIcon size={28} />
        </IconWrapper>
      )}
      <YStack alignItems="center" gap="$2">
        <Text fontSize="$5" fontWeight="600" color="white">
          {reconnecting ? reconnectingText : title}
        </Text>
        {!reconnecting && (
          <Text fontSize="$3" color="white" opacity={0.6} textAlign="center" maxWidth={280}>
            {message}
          </Text>
        )}
      </YStack>
    </Backdrop>
  );
});
