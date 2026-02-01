import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';

export type ThemedButtonVariant = 'solid' | 'outline';

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: ThemedButtonVariant;
  textStyle?: StyleProp<TextStyle>;
}

export const ThemedButton: React.FC<Props> = ({
  title,
  variant = 'solid',
  disabled,
  style,
  textStyle,
  ...touchableProps
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      {...touchableProps}
      disabled={disabled}
      style={[
        styles.base,
        variant === 'solid' ? styles.solid : styles.outline,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'solid' ? styles.textSolid : styles.textOutline,
          disabled ? styles.textDisabled : null,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

function createStyles(palette: Palette) {
  return StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    solid: {
      backgroundColor: palette.tint,
    },
    outline: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.tint,
    },
    disabled: {
      opacity: 0.6,
    },
    text: {
      fontWeight: '600',
      fontSize: 15,
    },
    textSolid: {
      color: palette.background,
    },
    textOutline: {
      color: palette.tint,
    },
    textDisabled: {
      color: palette.icon,
    },
  });
}
