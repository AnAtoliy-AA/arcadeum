import React, { forwardRef } from 'react';
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  View,
  ViewStyle,
  Platform,
  StyleProp,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface FocusableProps extends PressableProps {
  /**
   * Style to apply when the component is focused on TV.
   */
  focusStyle?: StyleProp<ViewStyle>;
  /**
   * Scale factor when focused (default: 1.1)
   */
  focusScale?: number;
}

/**
 * A wrapper around Pressable that provides automatic focus styling for TV.
 */
export const Focusable = forwardRef<View, FocusableProps>(function Focusable(
  { style, focusStyle, focusScale = 1.05, ...props },
  ref,
) {
  const focusColor = useThemeColor({}, 'tint');

  return (
    <Pressable
      ref={ref}
      {...props}
      style={(state: PressableStateCallbackType) => {
        const { focused } = state as PressableStateCallbackType & {
          focused?: boolean;
        };
        const isFocused = Platform.isTV && focused;

        const baseStyle = typeof style === 'function' ? style(state) : style;

        const tvStyle: ViewStyle = isFocused
          ? {
              borderColor: focusColor,
              borderWidth: 2,
              transform: [{ scale: focusScale }],
              ...(focusStyle as object),
            }
          : {};

        return [baseStyle, tvStyle];
      }}
    />
  );
});
