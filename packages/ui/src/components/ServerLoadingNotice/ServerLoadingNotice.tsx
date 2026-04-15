import { YStack, XStack, Text, styled, Progress, Button } from 'tamagui';
import { memo } from 'react';
import { Spinner } from '../Spinner';

export type ServerLoadingNoticeProps = {
  title: string;
  message: string;
  progress: number;
  elapsedSeconds: number;
  supportLabel: string;
  onSupportClick: () => void;
};

const StyledContainer = styled(YStack, {
  name: 'ServerLoadingNotice',
  gap: '$3',
  padding: '$4',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$infoBorder',
  backgroundColor: '$infoBgSoft',
  maxWidth: 420,
  position: 'relative',
  overflow: 'hidden',
  elevation: '$small',
});

export const ServerLoadingNotice = memo(function ServerLoadingNotice({
  title,
  message,
  progress,
  elapsedSeconds,
  supportLabel,
  onSupportClick,
}: ServerLoadingNoticeProps) {
  return (
    <StyledContainer>
      <XStack alignItems="center" gap="$3">
        <Spinner size="sm" color="$primary" />
        <Text fontSize="$3" fontWeight="600" color="$color">
          {title}
        </Text>
      </XStack>
      <YStack paddingLeft="$8" gap="$2">
        <Text fontSize="$2" color="$color" opacity={0.7}>
          {message}
        </Text>
        <YStack marginTop="$2" gap="$1">
          <Progress value={progress} height={6} backgroundColor="$borderColor">
            <Progress.Indicator backgroundColor="$primary" />
          </Progress>
          <XStack justifyContent="space-between">
            <Text fontSize="$1" fontWeight="600" color="$primary">{progress}%</Text>
            <Text fontSize="$1" opacity={0.5}>{elapsedSeconds}s</Text>
          </XStack>
        </YStack>
      </YStack>
      <XStack justifyContent="flex-end" marginTop="$2">
        <Button variant="outlined" size="$2" onPress={onSupportClick}>
          {supportLabel}
        </Button>
      </XStack>
    </StyledContainer>
  );
});
