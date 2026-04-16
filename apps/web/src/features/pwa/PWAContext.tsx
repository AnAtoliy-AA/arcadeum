'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import {
  BeforeInstallPromptEvent,
  PWAContextValue,
  PWAContext,
} from './context';
import { InstallPWAModal } from './InstallPWA';

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsModalOpen(false);
    };

    const checkIfInstalled = () => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone
      ) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const openModal = useCallback(() => {
    if (!isInstalled) {
      setIsModalOpen(true);
    }
  }, [isInstalled]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsModalOpen(false);
    }
  }, [deferredPrompt]);

  const value: PWAContextValue = {
    canInstall: !isInstalled,
    isInstalled,
    isModalOpen,
    openModal,
    closeModal,
    install,
    isPromptAvailable: deferredPrompt !== null,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
      <InstallPWAModal />
    </PWAContext.Provider>
  );
}
