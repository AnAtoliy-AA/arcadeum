'use client';

import { Suspense } from 'react';

import styled from 'styled-components';
import { ChatPage } from './ChatPage';

const LoadingWrapper = styled.div`
  padding: 2rem;
  text-align: center;
`;

export default function ChatRoute() {
  return (
    <Suspense fallback={<LoadingWrapper>Loading...</LoadingWrapper>}>
      <ChatPage />
    </Suspense>
  );
}
