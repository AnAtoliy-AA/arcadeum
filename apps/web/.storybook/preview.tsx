'use client';

import React from 'react';
import type { Preview, Decorator } from '@storybook/nextjs-vite';
import { ThemeProvider } from 'styled-components';
import { themeTokens, ThemeName } from '../src/shared/config/theme';

// Global styles for Storybook
const StorybookGlobalStyle = ({ theme }: { theme: ThemeName }) => (
  <style>{`
    body {
      margin: 0;
      padding: 1rem;
      background: ${themeTokens[theme].background.base};
      color: ${themeTokens[theme].text.primary};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  `}</style>
);

const withThemeProvider: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'neonDark';
  return (
    <ThemeProvider theme={themeTokens[theme]}>
      <StorybookGlobalStyle theme={theme} />
      <Story />
    </ThemeProvider>
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
    backgrounds: { disable: true },
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
