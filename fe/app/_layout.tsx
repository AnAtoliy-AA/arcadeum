import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import '../sentry';
import * as Sentry from '@sentry/react-native';
import { SessionTokensProvider } from '@/stores/sessionTokens';
import { SettingsProvider } from '@/stores/settings';
import { SettingsLauncher } from '@/components/ui/SettingsLauncher';

export default Sentry.wrap(function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SessionTokensProvider>
      <SettingsProvider>
        <NavigationRoot />
      </SettingsProvider>
    </SessionTokensProvider>
  );
});

function NavigationRoot() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>

        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <SettingsLauncher />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}