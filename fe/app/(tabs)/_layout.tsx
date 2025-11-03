import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { AdaptiveBottomTabBar } from '@/components/ui/AdaptiveBottomTabBar';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { platform } from '@/constants/platform';
import { platformShadow } from '@/lib/platformShadow';
import { useTranslation } from '@/lib/i18n';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const screenOptions = useMemo<BottomTabNavigationOptions>(() => {
    const palette = Colors[colorScheme ?? 'light'];
    const tabShadowColor = colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(15, 23, 42, 0.12)';
    const nativeShadowOpacity = colorScheme === 'dark' ? 0.45 : 0.2;
    const baseTabBarStyle = {
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
    } as const;

    const base: BottomTabNavigationOptions = {
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarBackground: TabBarBackground,
    };

    base.tabBarStyle = platform.isIos
      ? {
          ...baseTabBarStyle,
          position: 'absolute' as const,
        }
      : baseTabBarStyle;

    if (!platform.isWeb) {
      base.tabBarButton = HapticTab;
    }

    return base;
  }, [colorScheme]);

  return (
    <Tabs
      screenOptions={screenOptions}
      tabBar={(props) => <AdaptiveBottomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.homeTab'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: t('navigation.gamesTab'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gamecontroller.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: t('navigation.chatsTab'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('navigation.historyTab'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock" color={color} />,
        }}
      />
    </Tabs>
  );
}
