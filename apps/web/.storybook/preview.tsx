'use client';

import React from 'react';
import type { Preview, Decorator } from '@storybook/nextjs-vite';
import { ThemeName } from '../src/shared/config/theme';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../src/shared/config/tamagui.config';

const withThemeProvider: Decorator = (Story, context) => {
  const theme = (context.globals.theme || 'neonDark') as ThemeName;
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
      <Story />
    </TamaguiProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disabled: true },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'neonDark', title: 'Neon Dark' },
          { value: 'neonLight', title: 'Neon Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'neonDark',
  },
  decorators: [withThemeProvider],
};

export default preview;
