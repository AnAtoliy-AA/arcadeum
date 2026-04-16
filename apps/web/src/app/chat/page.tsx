'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { YStack, Typography } from '@arcadeum/ui';

const ChatPage = dynamic(() => import('./ChatPage'));

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
