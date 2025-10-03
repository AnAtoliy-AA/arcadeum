import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { platform } from '@/constants/platform';
export default function TabLayout() {
  const colorScheme = useColorScheme();
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
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
