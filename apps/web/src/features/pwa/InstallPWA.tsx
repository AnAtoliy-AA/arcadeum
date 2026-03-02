'use client';

import { InstallPWAModalContent } from './InstallPWAModalContent';
import { Button } from '@/shared/ui';
import { usePWAOptional } from './PWAContext';

export function InstallPWAModal() {
  return <InstallPWAModalContent />;
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
