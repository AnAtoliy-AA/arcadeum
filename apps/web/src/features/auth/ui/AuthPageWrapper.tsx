'use client';

import dynamic from 'next/dynamic';
import React, { useSyncExternalStore } from 'react';

const AuthPageContent = dynamic(
  () => import('./AuthPageContent').then((mod) => mod.AuthPageContent),
  {
    ssr: false,
    loading: () => null,
  },
);

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function AuthPageWrapper() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!isMounted) {
    return null;
  }

  return <AuthPageContent />;
}
