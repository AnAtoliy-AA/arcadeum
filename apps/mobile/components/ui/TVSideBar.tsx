import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Focusable } from '@/components/ui/Focusable';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

type IconSymbolName = 'house.fill' | 'gamecontroller.fill' | 'gearshape.fill';

interface MenuItem {
  name: string;
  icon: IconSymbolName;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { name: 'Home', icon: 'house.fill', route: '/(tv)/home' },
  { name: 'Games', icon: 'gamecontroller.fill', route: '/(tv)/games' },
  { name: 'Settings', icon: 'gearshape.fill', route: '/(tv)/settings' },
];

export function TVSideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <IconSymbol name="gamecontroller.fill" size={40} color={textColor} />
      </View>
      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.route);
          return (
            <Focusable
              key={item.route}
              onPress={() =>
                router.push(item.route as Parameters<typeof router.push>[0])
              }
              style={styles.menuItem}
              focusStyle={styles.menuItemFocused}
            >
              <IconSymbol
                name={item.icon}
                size={24}
                color={isActive ? '#EAB308' : textColor}
              />
              <Text
                style={[
                  styles.menuText,
                  { color: isActive ? '#EAB308' : textColor },
                ]}
              >
                {item.name}
              </Text>
            </Focusable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: '100%',
    padding: 24,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  menu: {
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
  },
  menuItemFocused: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
