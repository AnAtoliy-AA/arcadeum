import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import type { CriticalRoomStyles } from '../Critical/CriticalRoom';
import type { TexasHoldemRoomStyles } from '../TexasHoldem/TexasHoldemRoom';

type Props = {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  value: string;
  styles: CriticalRoomStyles | TexasHoldemRoomStyles;
};

export function CriticalRoomMetaItem({ icon, label, value, styles }: Props) {
  return (
    <View style={styles.metaItem}>
      <IconSymbol
        name={icon}
        size={18}
        color={styles.metaItemIcon.color as string}
      />
      <View style={styles.metaItemCopy}>
        <ThemedText style={styles.metaItemLabel}>{label}</ThemedText>
        <ThemedText style={styles.metaItemValue}>{value}</ThemedText>
      </View>
    </View>
  );
}
