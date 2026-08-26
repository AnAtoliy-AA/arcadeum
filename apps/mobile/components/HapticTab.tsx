import { BottomTabBarButtonProps } from 'expo-router/js-tabs';
import { PlatformPressable } from 'expo-router/react-navigation';
import * as Haptics from 'expo-haptics';

export function HapticTab({
  href,
  children,
  style,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  disabled,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
}: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      href={href}
      style={style}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
      onPressOut={onPressOut}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
    >
      {children}
    </PlatformPressable>
  );
}
