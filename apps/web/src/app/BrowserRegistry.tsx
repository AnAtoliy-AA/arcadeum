'use client';

import { ReactNode, useEffect } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { disconnectSockets } from '@/shared/lib/socket';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import {
  config as tamaguiConfig,
  setupTamagui,
} from '@/shared/config/tamagui.config';

// Prime config immediately for SSR and Client environments

interface BrowserRegistryProps {
  children: ReactNode;
}

export default function BrowserRegistry({ children }: BrowserRegistryProps) {
  useServerInsertedHTML(() => {
    try {
      if (!tamaguiConfig) {
        console.warn(
          'tamaguiConfig is missing during useServerInsertedHTML evaluation',
        );
        // Try fallback initialization
        setupTamagui();
        if (!tamaguiConfig) {
          console.error(
            'CRITICAL: tamaguiConfig is still missing after setupTamagui()',
          );
          return null;
        }
      }
      if (typeof tamaguiConfig.getCSS !== 'function') {
        console.error(
          'tamaguiConfig.getCSS is not a function. Current config:',
          Object.keys(tamaguiConfig || {}),
        );
        throw new Error('tamaguiConfig.getCSS is not a function');
      }
      const code = tamaguiConfig.getCSS();
      if (!code) {
        return null;
      }
      return (
        <style
          dangerouslySetInnerHTML={{
            __html: code,
          }}
        />
      );
    } catch (error) {
      console.error('Failed to generate Tamagui CSS during SSR:', error);
      return null;
    }
  });

  useEffect(() => {
    const handlePageHide = () => {
      disconnectSockets();
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  useEffect(() => {
    useSessionStore.getState().setHydrated(true);
  }, []);

  return <>{children}</>;
}
