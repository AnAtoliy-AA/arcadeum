'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/shared/ui';
import { usePWAOptional } from './PWAContext';

const InstallPWAModalDynamic = dynamic(
  () =>
    import('./InstallPWAModalContent').then(
      (mod) => mod.InstallPWAModalContent,
    ),
  { ssr: false },
);

export function InstallPWAModal() {
  return <InstallPWAModalDynamic />;
}

export function InstallPWAButton() {
  const pwa = usePWAOptional();

  if (!pwa || !pwa.canInstall) return null;

  return (
    <Button
      variant="icon"
      size="sm"
      onClick={pwa.openModal}
      aria-label="Install App"
      data-testid="install-pwa-header-button"
    >
      📲
    </Button>
  );
}

export function InstallPWA() {
  return (
    <>
      <InstallPWAButton />
      <InstallPWAModal />
    </>
  );
}
