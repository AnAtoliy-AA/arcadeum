import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

const ICON_SIZE = 24;
const SHADOW_PROP_KEYS: readonly (keyof ViewStyle)[] = [
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'elevation',
];

function stripShadowProps(style: ViewStyle | undefined): ViewStyle | undefined {
  if (!style) {
    return undefined;
  }

  const sanitized = { ...style } as ViewStyle;
  for (const key of SHADOW_PROP_KEYS) {
    if (key in sanitized) {
      delete sanitized[key];
    }
  }
  return sanitized;
}

function WebBottomTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme];
  const styles = useThemedStyles(createStyles);
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const backgroundElement = focusedOptions.tabBarBackground?.();
  const flattenedTabBarStyle = StyleSheet.flatten(
    focusedOptions.tabBarStyle,
  ) as ViewStyle | undefined;

  return (
    <View
      style={[
        styles.container,
        stripShadowProps(flattenedTabBarStyle),
        { paddingBottom: insets.bottom },
      ]}
      role="tablist"
    >
      {backgroundElement ? (
        <View
          {...(Platform.OS === 'web' ? {} : { pointerEvents: 'none' as const })}
          style={[
            styles.backgroundOverlay,
            Platform.OS === 'web'
              ? ({ pointerEvents: 'none' } as ViewStyle)
              : null,
          ]}
        >
          {backgroundElement}
        </View>
      ) : null}
      {state.routes.map((route, index) => {
        const focused = index === state.index;
        const descriptor = descriptors[route.key];
        const options = descriptor.options;
        const labelFromOptions =
          options.tabBarLabel ?? options.title ?? route.name;
        const label =
          typeof labelFromOptions === 'function'
            ? labelFromOptions({
                focused,
                color: focused ? palette.tint : palette.icon,
                position: 'below-icon',
                children: route.name,
              })
            : labelFromOptions;

        const activeTintColor = options.tabBarActiveTintColor ?? palette.tint;
        const inactiveTintColor =
          options.tabBarInactiveTintColor ?? palette.icon;
        const activeBackgroundColor =
          options.tabBarActiveBackgroundColor ?? 'transparent';
        const inactiveBackgroundColor =
          options.tabBarInactiveBackgroundColor ?? 'transparent';
        const tintColor = focused ? activeTintColor : inactiveTintColor;
        const backgroundColor = focused
          ? activeBackgroundColor
          : inactiveBackgroundColor;

        const icon = options.tabBarIcon?.({
          focused,
          color: tintColor,
          size: ICON_SIZE,
        });
        const badge = options.tabBarBadge;
        const showLabel = options.tabBarShowLabel ?? true;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.dispatch({
              ...CommonActions.navigate(route.name),
              target: state.key,
            });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const labelNode =
          typeof label === 'string' ? (
            <Text
              style={[
                styles.label,
                options.tabBarLabelStyle as TextStyle,
                { color: tintColor },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          ) : (
            label
          );

        const flattenedItemStyle = StyleSheet.flatten(
          options.tabBarItemStyle,
        ) as ViewStyle | undefined;
        const flattenedIconStyle = StyleSheet.flatten(
          options.tabBarIconStyle,
        ) as ViewStyle | undefined;
        const flattenedBadgeStyle = StyleSheet.flatten(
          options.tabBarBadgeStyle,
        ) as ViewStyle | undefined;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              styles.item,
              stripShadowProps(flattenedItemStyle),
              {
                backgroundColor,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View style={styles.iconLabelRow}>
              {icon ? (
                <View
                  style={[
                    styles.iconContainer,
                    stripShadowProps(flattenedIconStyle),
                  ]}
                >
                  {icon}
                </View>
              ) : null}
              {showLabel ? labelNode : null}
            </View>
            {badge != null ? (
              <View
                style={[styles.badge, stripShadowProps(flattenedBadgeStyle)]}
              >
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function AdaptiveBottomTabBar(props: BottomTabBarProps) {
  if (Platform.OS === 'web') {
    return <WebBottomTabBar {...props} />;
  }

  return <BottomTabBar {...props} />;
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      backgroundColor: palette.cardBackground ?? palette.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.cardBorder ?? 'rgba(148, 163, 184, 0.24)',
      paddingHorizontal: 12,
      paddingTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      position: 'relative',
    },
    item: {
      flex: 1,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    iconLabelRow: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
    },
    badge: {
      minWidth: 18,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: '#EF4444',
      position: 'absolute',
      top: 4,
      right: 12,
    },
    badgeText: {
      fontSize: 11,
      lineHeight: 14,
      color: '#fff',
      textAlign: 'center',
      fontWeight: '700',
    },
    backgroundOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
  });
