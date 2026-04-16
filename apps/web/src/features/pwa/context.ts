'use client';

import { createContext, useContext } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  install: () => Promise<void>;
  isPromptAvailable: boolean;
}

export const PWAContext = createContext<PWAContextValue | null>(null);

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
}

export function usePWAOptional() {
  return useContext(PWAContext);
}

export function usePWAInstallProps() {
  const pwa = usePWAOptional();

  return {
    onInstall: pwa?.isPromptAvailable ? pwa.openModal : undefined,
    onShowInstructions:
      pwa && !pwa.isPromptAvailable ? pwa.openModal : () => pwa?.openModal(),
  };
}
