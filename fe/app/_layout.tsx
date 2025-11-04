import React, { useCallback } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppHeader } from '@/components/ui/AppHeader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppName } from '@/hooks/useAppName';
import { SessionTokensProvider } from '@/stores/sessionTokens';
import { SettingsProvider } from '@/stores/settings';
import { ErrorToastProvider } from '@/components/ui/ErrorToastProvider';
import { useTranslation } from '@/lib/i18n';

export default function RootLayout() {
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
        <ErrorToastProvider>
          <NavigationRoot />
        </ErrorToastProvider>
      </SettingsProvider>
    </SessionTokensProvider>
  );
}

function NavigationRoot() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const router = useRouter();
  const appName = useAppName();

  const getTitleForRoute = useCallback(
    (routeName: string): string => {
      switch (routeName) {
        case 'index':
          return t('navigation.welcomeTitle');
        case 'auth':
          return t('navigation.authTitle');
        case 'auth/callback':
          return t('navigation.authCallbackTitle');
        case 'chat':
          return t('navigation.chatTitle');
        case 'settings':
          return t('navigation.settingsTitle');
        case 'payment':
          return t('navigation.paymentTitle');
        case 'support':
          return t('navigation.supportTitle');
        case 'games/create':
          return t('navigation.gameCreateTitle');
        case 'games/[id]':
          return t('navigation.gameDetailsTitle');
        case 'games/rooms/[id]':
          return t('navigation.gameRoomTitle');
        case '+not-found':
          return t('navigation.notFoundTitle');
        default:
          if (routeName.startsWith('games/rooms/')) {
            return t('navigation.gameRoomTitle');
          }
          if (routeName.startsWith('games/')) {
            return t('navigation.gamesTitle');
          }
          if (routeName.startsWith('chat/')) {
            return t('navigation.chatTitle');
          }
          return appName;
      }
    },
    [appName, t],
  );

  const handleSettingsPress = useCallback(() => {
    router.push('/settings' as never);
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={({ route, navigation }) => {
          if (route.name === '(tabs)') {
            return { headerShown: false };
          }

          const canGoBack = navigation.canGoBack();
          const title = getTitleForRoute(route.name);

          return {
            header: () => (
              <AppHeader
                title={title}
                canGoBack={canGoBack}
                onBack={canGoBack ? () => navigation.goBack() : undefined}
                onSettingsPress={handleSettingsPress}
                settingsDisabled={route.name === 'settings'}
              />
            ),
          };
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="games/create" />
        <Stack.Screen name="games/[id]" />
        <Stack.Screen name="games/rooms/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="support" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
