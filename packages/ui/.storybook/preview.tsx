import React from 'react';
import type { Preview } from "@storybook/nextjs-vite";
import { TamaguiProvider } from 'tamagui';
import config from '../src/tamagui.config';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <TamaguiProvider config={config} defaultTheme="dark">
        <Story />
      </TamaguiProvider>
    ),
  ],
};

export default preview;
