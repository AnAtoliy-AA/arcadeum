import { Suspense } from 'react';
import { YStack, Typography } from '@arcadeum/ui';
import { ChatPage } from './ChatPage';

export default function ChatRoute() {
  return (
    <Suspense
      fallback={
        <YStack p="$7" ai="center">
          <Typography uiSize="md" alpha="medium">
            Loading...
          </Typography>
        </YStack>
      }
    >
      <ChatPage />
    </Suspense>
  );
}
