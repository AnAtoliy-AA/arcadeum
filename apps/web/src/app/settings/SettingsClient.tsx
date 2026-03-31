'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

export const SettingsClient = dynamic(
  () => import('@/app/settings/SettingsPage'),
  {
    loading: () => <PageLoading />,
    ssr: false,
  },
);
