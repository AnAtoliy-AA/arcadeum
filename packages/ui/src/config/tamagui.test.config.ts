import { createTamagui, TamaguiInternalConfig } from 'tamagui';
import { shorthands } from '@tamagui/shorthands';
import { createInterFont } from '@tamagui/font-inter';
import { createAnimations } from '@tamagui/animations-css';
import { themes, tokens } from '@tamagui/config/v3';

const headingFont = createInterFont();
const bodyFont = createInterFont();

export const uiTestConfig: TamaguiInternalConfig = createTamagui({
  animations: createAnimations({
    fast: 'transform 200ms ease-in, opacity 200ms ease-in',
    medium: 'transform 300ms ease-in, opacity 300ms ease-in',
    slow: 'transform 400ms ease-in, opacity 400ms ease-in',
  }),
  defaultFont: 'body',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes,
  tokens,
});

export default uiTestConfig;
