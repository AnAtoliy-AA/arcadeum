import { YStack, XStack, Text, styled } from 'tamagui';
import { memo } from 'react';
import { Spinner } from '../Spinner';
import { Button } from '../Button';
import { ProgressBar } from '../Progress/Progress';

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
  padding: '$5',
  borderRadius: '$5',
  borderWidth: 1,
  borderColor: '$infoBorder',
  backgroundColor: '$infoBgSoft',
  maxWidth: 480,
  position: 'relative',
  overflow: 'hidden',
  elevation: '$medium',
  shadowColor: '$infoBorder',
  shadowOpacity: 0.2,
  shadowRadius: 10,
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
        <Text fontSize="$4" fontWeight="700" color="$color" letterSpacing={0.5}>
          {title}
        </Text>
      </XStack>
      
      <YStack paddingLeft="$8" gap="$4">
        <Text fontSize="$3" color="$color" opacity={0.8} lineHeight="$4">
          {message}
        </Text>
        
        <YStack gap="$2">
          <ProgressBar 
            value={progress} 
            height={10} 
            color="$primary"
          />
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$3" fontWeight="700" color="$primary">{Math.round(progress)}%</Text>
            <Text fontSize="$2" opacity={0.6} fontWeight="500">{elapsedSeconds}s</Text>
          </XStack>
        </YStack>

        <XStack justifyContent="flex-end" marginTop="$1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSupportClick}
            pill
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            {supportLabel}
          </Button>
        </XStack>
      </YStack>
    </StyledContainer>
  );
});
