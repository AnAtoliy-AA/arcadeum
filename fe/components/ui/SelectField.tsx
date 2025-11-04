import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

type SelectOption<T> = {
  value: T;
  label: string;
  description?: string;
};

interface SelectFieldProps<T extends string | number> {
  label: string;
  value: T | null;
  options: SelectOption<T>[];
  onSelect: (value: T) => void;
  placeholder?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
}

export function SelectField<T extends string | number>({
  label,
  value,
  options,
  onSelect,
  placeholder,
  helperText,
  style,
}: SelectFieldProps<T>) {
  const styles = useThemedStyles(createStyles);
  const colorScheme = useColorScheme();
  const paletteKey = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = Colors[paletteKey];
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) ?? null;
  }, [options, value]);

  const handleOpen = useCallback(() => {
    if (options.length === 0) {
      return;
    }
    setIsOpen(true);
  }, [options]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (nextValue: T) => {
      setIsOpen(false);
      if (nextValue !== value) {
        onSelect(nextValue);
      }
    },
    [onSelect, value],
  );

  return (
    <View style={[styles.container, style]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleOpen}
        style={styles.trigger}
      >
        <View style={styles.triggerTextWrapper}>
          <ThemedText
            style={[
              styles.triggerLabel,
              selectedOption ? null : styles.placeholder,
            ]}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder ?? label}
          </ThemedText>
          {selectedOption?.description ? (
            <ThemedText style={styles.triggerDescription} numberOfLines={2}>
              {selectedOption.description}
            </ThemedText>
          ) : null}
        </View>
        <IconSymbol
          name={isOpen ? 'chevron.up' : 'chevron.down'}
          size={20}
          color={palette.icon}
        />
      </TouchableOpacity>
      {helperText ? (
        <ThemedText style={styles.helperText}>{helperText}</ThemedText>
      ) : null}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalOverlay} onPress={handleClose} />
          <View style={[styles.modalCard, { borderColor: palette.icon }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{label}</ThemedText>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              style={styles.modalList}
              contentContainerStyle={styles.optionList}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.optionRow,
                      isSelected ? styles.optionRowSelected : null,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <View style={styles.optionTextWrapper}>
                      <ThemedText style={styles.optionLabel}>
                        {item.label}
                      </ThemedText>
                      {item.description ? (
                        <ThemedText style={styles.optionDescription}>
                          {item.description}
                        </ThemedText>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={20}
                        color={palette.tint}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View style={styles.optionSeparator} />
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(palette: Palette) {
  const selectedOverlay =
    palette.tint === '#fff'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(10, 126, 164, 0.12)';

  return StyleSheet.create({
    container: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.icon,
    },
    trigger: {
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      backgroundColor: palette.background,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    triggerTextWrapper: {
      flex: 1,
      paddingRight: 12,
      gap: 4,
    },
    triggerLabel: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '600',
    },
    triggerDescription: {
      color: palette.icon,
      fontSize: 13,
      lineHeight: 18,
    },
    placeholder: {
      color: palette.icon,
      fontWeight: '400',
    },
    helperText: {
      color: palette.icon,
      fontSize: 12,
      marginTop: 4,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    modalCard: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '75%',
      borderRadius: 20,
      backgroundColor: palette.background,
      overflow: 'hidden',
    },
    modalHeader: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.icon,
    },
    modalTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '600',
    },
    modalList: {
      flexGrow: 0,
    },
    optionList: {
      paddingBottom: 16,
    },
    optionRow: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    optionRowSelected: {
      backgroundColor: selectedOverlay,
    },
    optionTextWrapper: {
      flex: 1,
      gap: 4,
    },
    optionLabel: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '600',
    },
    optionDescription: {
      color: palette.icon,
      fontSize: 13,
      lineHeight: 18,
    },
    optionSeparator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: palette.icon,
      opacity: 0.25,
    },
  });
}
