'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@arcadeum/ui';

const ProfilePageContent = dynamic(() => import('./ProfilePageContent'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center p-12 gap-3">
      <Spinner size="md" />
    </div>
  ),
});

export default function ProfileClient() {
  return <ProfilePageContent />;
}
