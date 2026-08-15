'use client';

import { TamaguiProvider } from 'tamagui';
import { useServerInsertedHTML } from 'next/navigation';
import { useThemeController } from '@/app/theme/ThemeContext';
import tamaguiConfig from '@/shared/config/tamagui.config';
import {
  wasTamaguiCSSInjected,
  markTamaguiCSSInjected,
} from '@/shared/config/tamagui-css-injected';

/**
 * Client half of the (app) route-group layout: provides the Tamagui context
 * that Tamagui-styled components require and injects the SSR CSS payload.
 * The Tamagui config is primed server-side by the parent server layout.
 */
export function TamaguiAppLayout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useThemeController();

  useServerInsertedHTML(() => {
    try {
      if (wasTamaguiCSSInjected()) return null;
      if (typeof tamaguiConfig.getCSS !== 'function') {
        console.error(
          'tamaguiConfig.getCSS is not a function. Current config:',
          Object.keys(tamaguiConfig),
        );
        throw new Error('tamaguiConfig.getCSS is not a function');
      }
      const code = tamaguiConfig.getCSS();
      if (!code) {
        return null;
      }
      markTamaguiCSSInjected();
      return (
        <style
          href="tamagui-css"
          precedence="default"
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

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={resolvedTheme}
      disableInjectCSS={process.env.NODE_ENV === 'production'}
    >
      {children}
    </TamaguiProvider>
  );
}
