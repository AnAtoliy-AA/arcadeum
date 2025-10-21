import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { platform } from '@/constants/platform';
import { useTranslation } from '@/lib/i18n';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const screenOptions = useMemo<BottomTabNavigationOptions>(() => {
    const base: BottomTabNavigationOptions = {
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarBackground: TabBarBackground,
    };

    if (platform.isIos) {
      base.tabBarStyle = { position: 'absolute' as const };
    }

    if (!platform.isWeb) {
      base.tabBarButton = HapticTab;
    }

    return base;
  }, [colorScheme]);

  return (
    <Tabs
      screenOptions={screenOptions}>
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
    </Tabs>
  );
}
