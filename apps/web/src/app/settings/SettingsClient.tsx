'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';
import type { SettingsPageProps } from './SettingsPage';

const SettingsPage = dynamic(() => import('./SettingsPage'), {
  loading: () => <PageLoading />,
  ssr: false,
});

export function SettingsClient(props: SettingsPageProps) {
  return <SettingsPage {...props} />;
}
