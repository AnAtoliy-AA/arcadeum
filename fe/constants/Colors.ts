/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    cardBackground: '#F6F8FC',
    cardBorder: '#D8DFEA',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    statusConnected: '#2ecc40',
    statusDisconnected: '#ff4136',
    error: '#ff4136',
    gameTable: {
      surface: '#F6F8FC',
      raised: '#E7EDF7',
      border: '#D8DFEA',
      shadow: 'rgba(15, 23, 42, 0.08)',
      playerSelf: '#ECFEFF',
      playerCurrent: '#FEF3C7',
      destructiveBg: '#FEE2E2',
      destructiveText: '#991B1B',
      playerIcon: '#0F172A',
    },
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    cardBackground: '#1F2228',
  cardBorder: '#32353D',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    statusConnected: '#2ecc40',
    statusDisconnected: '#ff4136',
    error: '#ff4136',
    gameTable: {
      surface: '#1E2229',
      raised: '#262A32',
      border: '#33373E',
      shadow: 'rgba(0, 0, 0, 0.45)',
      playerSelf: '#11252A',
      playerCurrent: '#3B2E11',
      destructiveBg: '#3A2020',
      destructiveText: '#FECACA',
      playerIcon: '#F1F5F9',
    },
  },
};
