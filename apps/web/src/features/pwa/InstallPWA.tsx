'use client';

import { InstallPWAModalContent } from './InstallPWAModalContent';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { usePWAOptional } from './context';

export function InstallPWAModal() {
  return <InstallPWAModalContent />;
}

export function InstallPWAButton() {
  const pwa = usePWAOptional();

  if (!pwa || !pwa.canInstall) return null;

  return (
    <Button
      variant="icon"
      size="md"
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
