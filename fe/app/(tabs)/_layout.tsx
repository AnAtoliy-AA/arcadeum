import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Tabs, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { AppHeader } from '@/components/ui/AppHeader';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { AdaptiveBottomTabBar } from '@/components/ui/AdaptiveBottomTabBar';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppName } from '@/hooks/useAppName';
import { platform } from '@/constants/platform';
import { platformShadow } from '@/lib/platformShadow';
import { useTranslation } from '@/lib/i18n';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const router = useRouter();
  const appName = useAppName();

  const palette = Colors[colorScheme ?? 'light'];

  const tabShadowColor = useMemo(
    () =>
      colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(15, 23, 42, 0.12)',
    [colorScheme],
  );

  const nativeShadowOpacity = useMemo(
    () => (colorScheme === 'dark' ? 0.45 : 0.2),
    [colorScheme],
  );

  const baseTabBarStyle = useMemo(
    () => ({
      backgroundColor: palette.cardBackground ?? palette.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.cardBorder ?? 'rgba(148, 163, 184, 0.24)',
      ...platformShadow({
        color: tabShadowColor,
        opacity: nativeShadowOpacity,
        radius: 10,
        offset: { width: 0, height: -4 },
        elevation: 6,
        webShadow: `0px -6px 24px ${tabShadowColor}`,
      }),
    }),
    [nativeShadowOpacity, palette, tabShadowColor],
  );

  const tabBarStyle = useMemo(
    () =>
      platform.isIos
        ? { ...baseTabBarStyle, position: 'absolute' as const }
        : baseTabBarStyle,
    [baseTabBarStyle],
  );

  const getTitleForRoute = useCallback(
    (routeName: string): string => {
      switch (routeName) {
        case 'index':
          return t('navigation.homeTab');
        case 'games':
          return t('navigation.gamesTab');
        case 'chats':
          return t('navigation.chatsTab');
        case 'history':
          return t('navigation.historyTab');
        default:
          return appName;
      }
    },
    [appName, t],
  );

  const handleSettingsPress = useCallback(() => {
    router.push('/settings' as never);
  }, [router]);

  return (
    <Tabs
      screenOptions={({ route, navigation }) => {
        const canGoBack = navigation.canGoBack();
        const options: BottomTabNavigationOptions = {
          tabBarActiveTintColor: palette.tint,
          tabBarBackground: TabBarBackground,
          tabBarStyle,
          headerShown: true,
          header: () => (
            <AppHeader
              title={getTitleForRoute(route.name)}
              canGoBack={canGoBack}
              onBack={canGoBack ? () => navigation.goBack() : undefined}
              onSettingsPress={handleSettingsPress}
            />
          ),
        };

        if (!platform.isWeb) {
          options.tabBarButton = HapticTab;
        }

        return options;
      }}
      tabBar={(props) => <AdaptiveBottomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.homeTab'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: t('navigation.gamesTab'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gamecontroller.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: t('navigation.chatsTab'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('navigation.historyTab'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
